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
        return { color: 'text-indigo-700', bg: 'bg-indigo-50/50', border: 'border-indigo-100', icon: Clock, label: 'Submitted' };
      case 'processing':
        return { color: 'text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-100', icon: RotateCcw, label: 'Processing' };
      case 'pending_payment':
        return { color: 'text-[#ff8b3d]', bg: 'bg-orange-50/50', border: 'border-orange-100', icon: CreditCard, label: 'Pay Now' };
      case 'awaiting_schedule_1':
        return { color: 'text-blue-700', bg: 'bg-blue-50/50', border: 'border-blue-100', icon: FileCheck, label: 'Reviewing' };
      case 'action_required':
        return { color: 'text-rose-700', bg: 'bg-rose-50/50', border: 'border-rose-100', icon: AlertCircle, label: 'Action Needed' };
      case 'completed':
        return { color: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-100', icon: CheckCircle, label: 'Approved' };
      default:
        return { color: 'text-slate-700', bg: 'bg-slate-50/50', border: 'border-slate-100', icon: FileText, label: status };
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
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5 md:py-6 mb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Dashboard</Link>
                  <span className="text-slate-300 text-[10px] font-black">/</span>
                  <span className="text-xs font-bold text-slate-900">Filings</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">All Filings</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Track every Form 2290 submission in one place</p>
              </div>
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-2 bg-[#ff8b3d] text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-[#f07a2d] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg shadow-orange-500/20"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                File Now
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-[#ff8b3d] rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-50 rounded-full"></div>
              </div>
            </div>
            <p className="mt-6 text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Filings...</p>
          </div>
        ) : filings.length === 0 && !hasIncomplete ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-dashed border-slate-200 rounded-[2.5rem] shadow-sm">
            <div className="relative mb-10 group">
              <div className="absolute inset-0 bg-[#ff8b3d]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative bg-gradient-to-br from-white to-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <FileText className="w-20 h-20 text-[#ff8b3d]" strokeWidth={1} />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0f172a] rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-12 transition-transform">
                  <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No Filings Found</h2>
            <p className="text-slate-500 text-center max-w-sm mb-10 font-medium leading-relaxed">
              Start your tax journey. File your Form 2290 manually or upload an existing Schedule 1 to get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-3 bg-[#ff8b3d] text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f07a2d] hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300"
              >
                Manual Entry <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </Link>
              <Link
                href="/dashboard/upload-schedule1"
                className="inline-flex items-center justify-center gap-3 bg-white border-2 border-slate-100 text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 hover:-translate-y-1 transition-all duration-300"
              >
                Upload S1 <Upload className="w-4 h-4" strokeWidth={3} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics Row - High Density */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Submissions', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', accent: 'bg-blue-600' },
                { label: 'Verified & Done', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', accent: 'bg-emerald-600' },
                { label: 'Current Progress', value: stats.processing, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', accent: 'bg-amber-600' },
                { label: 'Requires Action', value: stats.actionRequired, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', accent: 'bg-rose-600' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="group relative bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-1 ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.border} border flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} strokeWidth={2.5} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-slate-900 leading-none mb-1 group-hover:scale-105 transition-transform origin-right">{stat.value}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Unified Search & Filter Hub */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-3 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#ff8b3d] transition-colors pointer-events-none" strokeWidth={3} />
                <input
                  type="text"
                  placeholder="Search by tax year, business, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#ff8b3d]/20 focus:border-[#ff8b3d] focus:bg-white text-sm text-slate-900 placeholder-slate-400 transition-all outline-none font-medium"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative min-w-[160px] flex-1 md:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#ff8b3d]/20 focus:border-[#ff8b3d] focus:bg-white text-sm font-black text-slate-700 cursor-pointer appearance-none transition-all outline-none"
                  >
                    <option value="all">Every Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="action_required">Needs Action</option>
                    <option value="completed">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={3} />
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-[52px] h-[52px] flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-slate-200 active:bg-slate-100 transition-all group"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500 group-hover:rotate-180 transition-transform duration-500" strokeWidth={3} />
                </button>
              </div>
            </div>

            {primaryBusiness && (
              <div className="bg-[#173b63] rounded-[2rem] p-6 shadow-xl shadow-slate-900/10 border border-white/10 relative overflow-hidden group mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff8b3d] to-[#f07a2d] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
                      {primaryBusiness.businessName?.charAt(0).toUpperCase() || 'B'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-base font-black text-white truncate">
                          {primaryBusiness.businessName}
                        </h2>
                        <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-black text-white/50 uppercase tracking-widest">Active Fleet</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-white/40">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          EIN: {primaryBusiness.ein ? primaryBusiness.ein.replace(/(\d{2})(\d{7})/, '$1-$2') : 'N/A'}
                        </span>
                        {primaryBusiness.state && (
                          <span className="flex items-center gap-1 border-l border-white/10 pl-3">
                            <Calendar className="w-3 h-3" />
                            {primaryBusiness.state}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-t border-white/5 pt-4 md:border-0 md:pt-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Signing Authority</div>
                      <div className="text-xs font-bold text-white/80">{primaryBusiness.signingAuthorityName || 'Not Set'}</div>
                    </div>
                    <Link
                      href="/dashboard/businesses"
                      className="ml-auto md:ml-4 flex items-center gap-2 px-4 py-2 bg-[#14b8a6] text-white hover:bg-[#0d9488] rounded-xl transition-all border border-white/20 font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
                    >
                      <Edit className="w-3.5 h-3.5" strokeWidth={3} />
                      Edit Profile
                    </Link>
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
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Returns & Filings</h2>
                  <div className="text-[10px] font-bold text-slate-400">Total Filings: {allFilingsForTable.length}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Return Details</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Usage</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Fleet Info</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tax Due</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allFilingsForTable.map((filing) => {
                        const filingStatus = filing.isDraft ? 'draft' : (filing.status || 'submitted');
                        const statusConfig = getStatusConfig(filingStatus);
                        const StatusIcon = statusConfig.icon;
                        const isIncomplete = filingStatus === 'draft' || filing.isDraft;

                        const resumeUrl = filing.isDraft || filingStatus === 'draft' || filingStatus === 'pending_payment'
                          ? filing.workflowType === 'upload'
                            ? `/dashboard/upload-schedule1?draft=${filing.draftId || filing.id}`
                            : `/dashboard/new-filing?draft=${filing.draftId || filing.id}`
                          : `/dashboard/filings/${filing.id}`;

                        const vehiclesInfo = getVehiclesInfo(filing);
                        const typeInfo = getFilingTypeInfo(filing);

                        return (
                          <tr key={filing.id || filing.draftId} className="group hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className={`hidden sm:flex w-10 h-10 rounded-xl ${typeInfo.bg} items-center justify-center`}>
                                  <Image src={typeInfo.image} alt={typeInfo.label} width={24} height={24} className="opacity-80" />
                                </div>
                                <div>
                                  <Link
                                    href={resumeUrl}
                                    className="text-sm font-black text-slate-900 hover:text-[#ff8b3d] transition-colors block leading-tight"
                                  >
                                    {getReturnNumber(filing)}
                                  </Link>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400">{getFilingDate(filing) || 'Draft'}</span>
                                    {primaryBusiness?.signingAuthorityName && (
                                      <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-[10px] font-bold text-slate-500 italic">By: {primaryBusiness.signingAuthorityName}</span>
                                      </>
                                    )}
                                    {!filing.isDraft && (
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    )}
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${typeInfo.color}`}>{typeInfo.label}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 hidden sm:table-cell">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{getFirstUsedMonth(filing)}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tax Month</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 hidden md:table-cell">
                              {vehiclesInfo.length > 0 ? (
                                <div className="space-y-1">
                                  <div className="flex -space-x-2">
                                    {vehiclesInfo.slice(0, 3).map((_, i) => (
                                      <div key={i} className="w-7 h-7 rounded-lg bg-white border-2 border-slate-50 flex items-center justify-center">
                                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                                      </div>
                                    ))}
                                    {vehiclesInfo.length > 3 && (
                                      <div className="w-7 h-7 rounded-lg bg-slate-100 border-2 border-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500">
                                        +{vehiclesInfo.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {vehiclesInfo.length} {vehiclesInfo.length === 1 ? 'Truck' : 'Fleet'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-slate-300 font-bold text-xs">No Vehicles</span>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">${getTaxAmount(filing).toFixed(2)}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2290 IRS Tax</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                <StatusIcon className="w-3 h-3" strokeWidth={3} />
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isIncomplete ? (
                                  <Link
                                    href={resumeUrl}
                                    className="min-w-[100px] text-center px-4 py-2 bg-[#ff8b3d] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#f07a2d] transition-all shadow-md shadow-orange-500/10 active:scale-95"
                                  >
                                    Continue
                                  </Link>
                                ) : (
                                  <Link
                                    href={resumeUrl}
                                    className="min-w-[100px] text-center px-4 py-2 bg-[#14b8a6] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#0d9488] transition-all active:scale-95 shadow-md shadow-teal-500/10"
                                  >
                                    Review
                                  </Link>
                                )}
                                {hasSchedule1(filing) && (
                                  <Link
                                    href={filing.schedule1Url}
                                    target="_blank"
                                    className="w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                                    title="Download Schedule 1"
                                  >
                                    <Upload className="w-4 h-4 rotate-180" strokeWidth={2.5} />
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
