'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToUserFilings, getBusinessesByUser, getVehicle } from '@/lib/db';
import { subscribeToDraftFilings } from '@/lib/draftHelpers';
import { getIncompleteFilings, formatIncompleteFiling } from '@/lib/filingIntelligence';
import {
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Search,
  Filter,
  Plus,
  Calendar,
  Truck,
  FileCheck,
  ChevronDown,
  RotateCcw,
  Upload,
  Edit,
  RefreshCw,
  Building2
} from 'lucide-react';
import Image from 'next/image';

export default function FilingsListPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [draftFilings, setDraftFilings] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [vehiclesMap, setVehiclesMap] = useState({}); // Map of vehicleId -> vehicle data
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && userData?.role === 'agent') {
      router.push('/agent/dashboard');
      return;
    }

    if (!authLoading && user) {
      setLoading(true);

      const unsubscribeFilings = subscribeToUserFilings(user.uid, (userFilings) => {
        setFilings(userFilings);
        setLoading(false);
      });

      const unsubscribeDrafts = subscribeToDraftFilings(user.uid, (drafts) => {
        setDraftFilings(drafts);
      });

      // Load businesses
      getBusinessesByUser(user.uid).then(businessList => {
        setBusinesses(businessList);
      }).catch(err => {
        console.error('Error loading businesses:', err);
      });

      return () => {
        unsubscribeFilings();
        unsubscribeDrafts();
      };
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, userData, authLoading, router]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'submitted':
        return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, label: 'Submitted' };
      case 'processing':
        return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, label: 'Processing' };
      case 'pending_payment':
        return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: CreditCard, label: 'Awaiting Payment' };
      case 'awaiting_schedule_1':
        return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, label: 'Awaiting Schedule 1' };
      case 'action_required':
        return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, label: 'Action Required' };
      case 'completed':
        return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Completed' };
      default:
        return { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: FileText, label: status };
    }
  };

  const getFilingTypeInfo = (filing) => {
    if (filing.filingType === 'amendment') {
      const type = filing.amendmentType === 'vin_correction' ? 'VIN Correction' :
        filing.amendmentType === 'weight_increase' ? 'Weight Increase' :
          filing.amendmentType === 'mileage_exceeded' ? 'Mileage Exceeded' : 'Amendment';
      return { label: type, image: '/assets/icons/amendment.png', color: 'text-purple-600', bg: 'bg-purple-50' };
    }
    if (filing.filingType === 'refund') {
      return { label: 'Refund (8849)', image: '/assets/icons/refund.png', color: 'text-green-600', bg: 'bg-green-50' };
    }
    return { label: 'Form 2290', image: '/assets/icons/form2290.png', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  const filteredFilings = useMemo(() => {
    return filings.filter((filing) => {
      if (statusFilter !== 'all' && filing.status !== statusFilter) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTaxYear = filing.taxYear?.toLowerCase().includes(searchLower);
        const matchesStatus = filing.status?.toLowerCase().includes(searchLower);
        const matchesBusiness = filing.business?.businessName?.toLowerCase().includes(searchLower);
        const matchesId = filing.id?.toLowerCase().includes(searchLower);
        return matchesTaxYear || matchesStatus || matchesBusiness || matchesId;
      }
      return true;
    });
  }, [filings, statusFilter, searchTerm]);

  const stats = useMemo(() => ({
    total: filings.length,
    completed: filings.filter(f => f.status === 'completed').length,
    processing: filings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: filings.filter(f => f.status === 'action_required').length,
    totalVehicles: filings.reduce((sum, f) => sum + (f.vehicleIds?.length || 0), 0),
  }), [filings]);

  const incomplete = useMemo(() => getIncompleteFilings(filings), [filings]);
  
  // Filter drafts to only show those with selectedBusinessId (business selected)
  const activeDrafts = useMemo(() => draftFilings.filter(d => d.status === 'draft' && (d.selectedBusinessId || d.businessId)), [draftFilings]);
  
  const allIncompleteFilings = useMemo(() => [
    ...activeDrafts.map(d => ({ ...d, isDraft: true })),
    ...incomplete.all.filter(f => f.status !== 'action_required')
  ], [activeDrafts, incomplete]);
  
  const hasIncomplete = allIncompleteFilings.length > 0;

  // Filter out drafts that have been converted to actual filings
  // A draft is considered "converted" if there's a filing with:
  // 1. The same draftId reference, OR
  // 2. The draft has a filingId reference, OR
  // 3. Same tax year, business, and vehicles (likely the same filing)
  const convertedDraftIds = useMemo(() => {
    const ids = new Set();
    filings.forEach(filing => {
      if (filing.draftId) {
        ids.add(filing.draftId);
      }
    });
    
    // Also add drafts that have an explicit filingId reference
    draftFilings.forEach(draft => {
      if (draft.filingId && filings.some(f => f.id === draft.filingId)) {
        ids.add(draft.id || draft.draftId);
      }
    });
    
    return ids;
  }, [filings, draftFilings]);

  // Only include drafts that haven't been converted to filings AND have a business selected
  const unconvertedDrafts = useMemo(() => {
    return activeDrafts.filter(draft => {
      // Only show drafts with selectedBusinessId (business must be selected)
      if (!draft.selectedBusinessId && !draft.businessId) {
        return false;
      }
      
      // Skip if this draft was converted to a filing
      if (convertedDraftIds.has(draft.id || draft.draftId)) {
        return false;
      }
      
      // Also check for duplicates based on tax year and business
      // If there's a filing with same tax year and business, likely the same filing
      const hasMatchingFiling = filings.some(filing => {
        const sameTaxYear = filing.taxYear === draft.taxYear;
        const sameBusiness = filing.businessId === draft.selectedBusinessId || 
                            filing.businessId === draft.businessId;
        // If both match and filing is submitted/completed/pending, skip the draft
        return sameTaxYear && sameBusiness;
      });
      
      return !hasMatchingFiling;
    }).filter(d => {
      // Only include drafts that match search/filter
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTaxYear = d.taxYear?.toLowerCase().includes(searchLower);
        const matchesId = d.id?.toLowerCase().includes(searchLower);
        return matchesTaxYear || matchesId;
      }
      return true;
    });
  }, [activeDrafts, convertedDraftIds, filings, statusFilter, searchTerm]);

  // Combine all filings (completed, incomplete, drafts) for the table
  const allFilingsForTable = useMemo(() => [
    ...filteredFilings,
    ...unconvertedDrafts.map(d => ({ ...d, isDraft: true }))
  ].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    return new Date(dateB) - new Date(dateA);
  }), [filteredFilings, unconvertedDrafts]);

  // Get primary business (first business or business from first filing)
  const primaryBusiness = useMemo(() => businesses.length > 0 
    ? businesses[0] 
    : (filings.length > 0 && filings[0].business ? filings[0].business : null), [businesses, filings]);

  // Helper function to get return number display
  const getReturnNumber = (filing) => {
    if (filing.filingType === 'amendment') {
      const type = filing.amendmentType === 'vin_correction' ? 'VIN Correction Amendment' :
        filing.amendmentType === 'weight_increase' ? 'Weight Increase Amendment' :
        filing.amendmentType === 'mileage_exceeded' ? 'Mileage Exceeded Amendment' : '2290 Amendment';
      return `${type}-${filing.id?.slice(-7) || 'N/A'}`;
    }
    if (filing.filingType === 'refund') {
      return `Refund (8849)-${filing.id?.slice(-7) || 'N/A'}`;
    }
    return `Form 2290-${filing.id?.slice(-7) || 'N/A'}`;
  };

  // Helper function to get first used month
  const getFirstUsedMonth = (filing) => {
    if (filing.firstUsedMonth) {
      const month = filing.firstUsedMonth;
      const year = filing.taxYear?.split('-')[0] || new Date().getFullYear();
      return `${month}-${year}`;
    }
    if (filing.filingData?.firstUsedMonth) {
      const month = filing.filingData.firstUsedMonth;
      const year = filing.taxYear?.split('-')[0] || new Date().getFullYear();
      return `${month}-${year}`;
    }
    // For amendments, check amendment details
    if (filing.amendmentDetails?.weightIncrease?.firstUsedMonth) {
      const month = filing.amendmentDetails.weightIncrease.firstUsedMonth;
      const year = filing.taxYear?.split('-')[0] || new Date().getFullYear();
      return `${month}-${year}`;
    }
    return 'N/A';
  };

  // Helper function to get tax amount
  const getTaxAmount = (filing) => {
    if (filing.pricing?.totalTax) {
      return filing.pricing.totalTax;
    }
    if (filing.amendmentDetails?.weightIncrease?.additionalTaxDue) {
      return filing.amendmentDetails.weightIncrease.additionalTaxDue;
    }
    if (filing.totalTax) {
      return filing.totalTax;
    }
    return 0;
  };

  // Helper function to check if Schedule 1 is available
  const hasSchedule1 = (filing) => {
    return filing.status === 'completed' && filing.schedule1Url;
  };

  // Helper function to get filing date
  const getFilingDate = (filing) => {
    const date = filing.createdAt || filing.updatedAt;
    if (!date) return null;
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper function to get vehicle type label
  const getVehicleTypeLabel = (vehicleType) => {
    const types = {
      'taxable': 'Taxable',
      'suspended': 'Suspended',
      'credit': 'Credit',
      'priorYearSold': 'Prior Year Sold'
    };
    return types[vehicleType] || vehicleType || 'N/A';
  };

  // Helper function to get vehicles info for a filing
  const getVehiclesInfo = (filing) => {
    const vehicleIds = filing.vehicleIds || filing.selectedVehicleIds || [];
    if (vehicleIds.length === 0) {
      // For amendments, check amendment details
      if (filing.filingType === 'amendment') {
        if (filing.amendmentType === 'weight_increase' && filing.amendmentDetails?.weightIncrease?.vehicleId) {
          vehicleIds.push(filing.amendmentDetails.weightIncrease.vehicleId);
        } else if (filing.amendmentType === 'mileage_exceeded' && filing.amendmentDetails?.mileageExceeded?.vehicleId) {
          vehicleIds.push(filing.amendmentDetails.mileageExceeded.vehicleId);
        } else if (filing.amendmentType === 'vin_correction') {
          // For VIN corrections, show the VINs from amendment details
          const vin = filing.amendmentDetails?.vinCorrection?.correctedVIN || filing.amendmentDetails?.vinCorrection?.originalVIN;
          return vin ? [{ vin, vehicleType: 'N/A' }] : [];
        }
      }
    }
    
    if (vehicleIds.length === 0) return [];
    
    return vehicleIds.map(id => vehiclesMap[id] || { id, vin: 'Loading...', vehicleType: null }).filter(v => v);
  };

  // Load vehicles when filings change
  useEffect(() => {
    if (!user || (filteredFilings.length === 0 && unconvertedDrafts.length === 0)) return;

    const loadVehicles = async () => {
      const vehicleIdsSet = new Set();
      
      // Collect all vehicle IDs from filings and drafts
      [...filteredFilings, ...unconvertedDrafts].forEach(filing => {
        const vehicleIds = filing.vehicleIds || filing.selectedVehicleIds || [];
        vehicleIds.forEach(id => vehicleIdsSet.add(id));
        
        // For amendments, also check amendment details
        if (filing.filingType === 'amendment' && filing.amendmentDetails) {
          if (filing.amendmentType === 'weight_increase' && filing.amendmentDetails.weightIncrease?.vehicleId) {
            vehicleIdsSet.add(filing.amendmentDetails.weightIncrease.vehicleId);
          } else if (filing.amendmentType === 'mileage_exceeded' && filing.amendmentDetails.mileageExceeded?.vehicleId) {
            vehicleIdsSet.add(filing.amendmentDetails.mileageExceeded.vehicleId);
          }
        }
      });

      // Load vehicles
      const vehiclesData = {};
      await Promise.all(
        Array.from(vehicleIdsSet).map(async (vehicleId) => {
          try {
            const vehicle = await getVehicle(vehicleId);
            if (vehicle) {
              vehiclesData[vehicleId] = vehicle;
            }
          } catch (error) {
            console.error(`Error loading vehicle ${vehicleId}:`, error);
          }
        })
      );
      
      setVehiclesMap(prev => ({ ...prev, ...vehiclesData }));
    };

    loadVehicles();
  }, [user, filteredFilings, unconvertedDrafts]);

  return (
    <ProtectedRoute>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">All Filings</h1>
              <p className="text-sm text-slate-600 font-light">Track and manage all your Form 2290 submissions</p>
            </div>
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center justify-center gap-2 bg-[#173b63] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1f4f82] transition-colors whitespace-nowrap shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Filing
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[var(--color-orange)]/30 border-t-[var(--color-orange)] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your filings...</p>
          </div>
        ) : filings.length === 0 && !hasIncomplete ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-white to-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Filings Yet</h2>
            <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              Start your first Form 2290 filing today. It only takes a few minutes and we'll guide you through every step.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-hover)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
              >
                Manual Entry <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/upload-schedule1"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-blue-200 text-blue-600 px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                Upload Schedule 1 <Upload className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics Row - Mobile Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Total Filings', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'In Progress', value: stats.processing, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                { label: 'Action Required', value: stats.actionRequired, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.bg} ${stat.border} border flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Professional Filters */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by tax year, business name, or filing ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] text-sm text-slate-900 placeholder-slate-400"
                  />
                </div>
                <div className="relative md:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] text-sm font-medium text-slate-700 cursor-pointer appearance-none bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="action_required">Action Required</option>
                    <option value="completed">Completed</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Business Info Card */}
            {primaryBusiness && (
              <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                    {primaryBusiness.businessName?.charAt(0).toUpperCase() || 'B'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {primaryBusiness.businessName}
                      </h2>
                      <span className="text-sm font-mono text-slate-500">
                        {primaryBusiness.ein ? primaryBusiness.ein.replace(/(\d{2})(\d{7})/, '$1-$2') : 'N/A'}
                      </span>
                      <Link
                        href="/dashboard/businesses"
                        className="ml-auto text-slate-400 hover:text-slate-600 transition-colors"
                        title="Edit business"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      {primaryBusiness.address && (
                        <p>{primaryBusiness.address}{primaryBusiness.city ? `, ${primaryBusiness.city}` : ''}{primaryBusiness.state ? `, ${primaryBusiness.state}` : ''} {primaryBusiness.zip || ''}</p>
                      )}
                      {primaryBusiness.signingAuthorityName && (
                        <p>Signatory: {primaryBusiness.signingAuthorityName}{primaryBusiness.signingAuthorityPhone ? ` • ${primaryBusiness.signingAuthorityPhone}` : ''}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Returns Table */}
            {allFilingsForTable.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No matching filings</h3>
                <p className="text-slate-500">Try adjusting your search or filters.</p>
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                  className="mt-4 text-[var(--color-orange)] font-semibold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Filings</h2>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-white flex items-center justify-center transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Return</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">First Used</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Vehicles</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tax Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allFilingsForTable.map((filing) => {
                        // If it's a draft (has isDraft flag or is from draftFilings collection), use 'draft'
                        // Otherwise, if it's in the filings collection but has no status, default to 'submitted' (not 'draft')
                        // because filings in the filings collection have been submitted
                        const filingStatus = filing.isDraft 
                          ? 'draft' 
                          : (filing.status || 'submitted'); // Default to 'submitted' for actual filings without status
                        const statusConfig = getStatusConfig(filingStatus);
                        const StatusIcon = statusConfig.icon;
                        // A filing is incomplete only if it's a draft
                        // Submitted/processing/completed/action_required/pending_payment/awaiting_schedule_1 are NOT incomplete drafts
                        const isIncomplete = filingStatus === 'draft' || filing.isDraft;
                        
                        const resumeUrl = filing.isDraft || filingStatus === 'draft' || filingStatus === 'pending_payment'
                          ? filing.workflowType === 'upload'
                            ? `/dashboard/upload-schedule1?draft=${filing.draftId || filing.id}`
                            : `/dashboard/new-filing?draft=${filing.draftId || filing.id}`
                          : `/dashboard/filings/${filing.id}`;
                        
                        const vehiclesInfo = getVehiclesInfo(filing);
                        const vehicleTypes = [...new Set(vehiclesInfo.map(v => v.vehicleType).filter(Boolean))];
                        
                        return (
                          <tr key={filing.id || filing.draftId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <Link
                                href={resumeUrl}
                                className="text-slate-900 hover:text-[var(--color-navy)] font-medium"
                              >
                                {getReturnNumber(filing)}
                              </Link>
                              {getFilingDate(filing) && (
                                <div className="text-xs text-slate-500 mt-1">{getFilingDate(filing)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              {getFirstUsedMonth(filing)}
                            </td>
                            <td className="px-6 py-4">
                              {vehiclesInfo.length > 0 ? (
                                <div className="space-y-1">
                                  {vehiclesInfo.slice(0, 2).map((vehicle, idx) => (
                                    <div key={idx} className="font-mono text-xs text-slate-600">
                                      {vehicle.vin || vehicle.id || 'N/A'}
                                    </div>
                                  ))}
                                  {vehiclesInfo.length > 2 && (
                                    <div className="text-xs text-slate-500">+{vehiclesInfo.length - 2} more</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                              ${getTaxAmount(filing).toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {isIncomplete ? 'Incomplete' : statusConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {isIncomplete ? (
                                  <Link
                                    href={resumeUrl}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-[#173b63] text-white rounded-md text-xs font-semibold hover:bg-[#1f4f82] transition-colors shadow-sm"
                                  >
                                    Continue
                                  </Link>
                                ) : (
                                  <Link
                                    href={resumeUrl}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-slate-200 text-slate-900 rounded-md text-xs font-semibold hover:bg-slate-300 transition-colors shadow-sm"
                                  >
                                    View
                                  </Link>
                                )}
                                {hasSchedule1(filing) && (
                                  <Link
                                    href={filing.schedule1Url}
                                    target="_blank"
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                                    title="View Schedule 1"
                                  >
                                    <FileCheck className="w-4 h-4" />
                                  </Link>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
