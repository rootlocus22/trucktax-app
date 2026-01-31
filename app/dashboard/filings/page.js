'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToUserFilings, getBusinessesByUser, getVehicle } from '@/lib/db';
import { subscribeToDraftFilings } from '@/lib/draftHelpers';
import { getIncompleteFilings, formatIncompleteFiling } from '@/lib/filingIntelligence';
import {
  FileText,
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

  const filteredFilings = filings.filter((filing) => {
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

  const stats = {
    total: filings.length,
    completed: filings.filter(f => f.status === 'completed').length,
    processing: filings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: filings.filter(f => f.status === 'action_required').length,
    totalVehicles: filings.reduce((sum, f) => sum + (f.vehicleIds?.length || 0), 0),
  };

  const incomplete = getIncompleteFilings(filings);
  // Filter drafts to only show those with selectedBusinessId (business selected)
  const activeDrafts = draftFilings.filter(d => d.status === 'draft' && (d.selectedBusinessId || d.businessId));
  const allIncompleteFilings = [
    ...activeDrafts.map(d => ({ ...d, isDraft: true })),
    ...incomplete.all.filter(f => f.status !== 'action_required')
  ];
  const hasIncomplete = allIncompleteFilings.length > 0;

  // Filter out drafts that have been converted to actual filings
  // A draft is considered "converted" if there's a filing with:
  // 1. The same draftId reference, OR
  // 2. Same tax year, business, and vehicles (likely the same filing)
  const convertedDraftIds = new Set();
  filings.forEach(filing => {
    if (filing.draftId) {
      convertedDraftIds.add(filing.draftId);
    }
  });

  // Only include drafts that haven't been converted to filings AND have a business selected
  const unconvertedDrafts = activeDrafts.filter(draft => {
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
      // If both match and filing is submitted/completed, skip the draft
      return sameTaxYear && sameBusiness && 
             (filing.status === 'submitted' || filing.status === 'processing' || 
              filing.status === 'completed' || filing.status === 'action_required');
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

  // Combine all filings (completed, incomplete, drafts) for the table
  const allFilingsForTable = [
    ...filteredFilings,
    ...unconvertedDrafts.map(d => ({ ...d, isDraft: true }))
  ].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    return new Date(dateB) - new Date(dateA);
  });

  // Get primary business (first business or business from first filing)
  const primaryBusiness = businesses.length > 0 
    ? businesses[0] 
    : (filings.length > 0 && filings[0].business ? filings[0].business : null);

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
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Your Filings</h1>
            <p className="text-slate-500">Track and manage all your Form 2290 submissions</p>
          </div>
          <Link
            href="/dashboard/new-filing"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-hover)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Filing
          </Link>
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

            {/* Filters Row - Mobile Optimized */}
            <div className="bg-white p-2 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2 sticky top-0 z-30 backdrop-blur-sm bg-white/95">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by tax year, business name, or filing ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-transparent border-none focus:ring-0 text-sm sm:text-base text-slate-900 placeholder-slate-400 font-medium touch-manipulation"
                />
              </div>
              <div className="h-px md:h-auto md:w-px bg-slate-200 mx-0 my-1 md:my-0"></div>
              <div className="relative md:w-64">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-transparent border-none focus:ring-0 text-sm sm:text-base font-medium text-slate-700 cursor-pointer hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors appearance-none touch-manipulation"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="processing">Processing</option>
                  <option value="action_required">Action Required</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Company Information Section */}
            {primaryBusiness && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {primaryBusiness.businessName?.charAt(0).toUpperCase() || 'B'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {primaryBusiness.businessName} ({primaryBusiness.ein ? primaryBusiness.ein.replace(/(\d{2})(\d{7})/, '$1-$2') : 'N/A'})
                      </h2>
                      <Link
                        href="/dashboard/businesses"
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        title="Edit business information"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                      {primaryBusiness.address && (
                        <span>Address: {primaryBusiness.address}{primaryBusiness.city ? `, ${primaryBusiness.city}` : ''}{primaryBusiness.state ? `, ${primaryBusiness.state}` : ''} {primaryBusiness.zip || ''}</span>
                      )}
                      {primaryBusiness.signingAuthorityName && (
                        <span>Signatory: {primaryBusiness.signingAuthorityName}{primaryBusiness.signingAuthorityPhone ? `, (${primaryBusiness.signingAuthorityPhone})` : ''}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href="/dashboard/new-filing"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-orange)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-orange-hover)] transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Start New Return
                  </Link>
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
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Returns</h2>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title="Refresh status"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Return Number</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">First Used Month</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Vehicles</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Vehicle Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Tax Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Schedule 1</th>
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
                        // A filing is incomplete only if it's a draft or has incomplete status
                        // Submitted/processing/completed/action_required are NOT incomplete
                        const isIncomplete = filingStatus === 'draft' || filing.isDraft || 
                          (filingStatus !== 'completed' && filingStatus !== 'action_required' && 
                           filingStatus !== 'submitted' && filingStatus !== 'processing');
                        const resumeUrl = filing.isDraft || filingStatus === 'draft'
                          ? filing.workflowType === 'upload'
                            ? `/dashboard/upload-schedule1?draft=${filing.id || filing.draftId}`
                            : `/dashboard/new-filing?draft=${filing.id || filing.draftId}`
                          : `/dashboard/filings/${filing.id}`;
                        
                        const vehiclesInfo = getVehiclesInfo(filing);
                        const vehicleTypes = [...new Set(vehiclesInfo.map(v => v.vehicleType).filter(Boolean))];
                        
                        return (
                          <tr key={filing.id || filing.draftId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4">
                              <Link
                                href={resumeUrl}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              >
                                {getReturnNumber(filing)}
                              </Link>
                              {getFilingDate(filing) && (
                                <div className="text-xs text-slate-500 mt-1">[{getFilingDate(filing)}]</div>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {getFirstUsedMonth(filing)}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {vehiclesInfo.length > 0 ? (
                                <div className="space-y-1">
                                  {vehiclesInfo.slice(0, 3).map((vehicle, idx) => (
                                    <div key={idx} className="font-mono text-xs">
                                      {vehicle.vin || vehicle.id || 'N/A'}
                                    </div>
                                  ))}
                                  {vehiclesInfo.length > 3 && (
                                    <div className="text-xs text-slate-500">+{vehiclesInfo.length - 3} more</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">
                              {vehicleTypes.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {vehicleTypes.map((type, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                      {getVehicleTypeLabel(type)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                              ${getTaxAmount(filing).toFixed(2)}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                                <StatusIcon className="w-3 h-3" />
                                {isIncomplete ? 'Incomplete' : statusConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {isIncomplete ? (
                                <Link
                                  href={resumeUrl}
                                  className="inline-flex items-center px-3 py-1.5 bg-[var(--color-orange)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--color-orange-hover)] transition-colors"
                                >
                                  Continue where you left off
                                </Link>
                              ) : (
                                <Link
                                  href={resumeUrl}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                                >
                                  View Details
                                </Link>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-500">
                              {hasSchedule1(filing) ? (
                                <Link
                                  href={filing.schedule1Url}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  <FileCheck className="w-4 h-4" />
                                  View
                                </Link>
                              ) : (
                                <span>-</span>
                              )}
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
