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
  Upload,
  Edit,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  ArrowRight,
  RotateCcw,
  Plus,
  TrendingUp,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Building2,
  RefreshCw,
  FileCheck
} from 'lucide-react';



export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [draftFilings, setDraftFilings] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [vehiclesMap, setVehiclesMap] = useState({}); // Map of vehicleId -> vehicle data
  const [loading, setLoading] = useState(true);

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
    const configs = {
      submitted: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, label: 'Submitted', dot: 'bg-blue-500' },
      processing: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, label: 'Processing', dot: 'bg-amber-500' },
      pending_payment: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: CreditCard, label: 'Awaiting Payment', dot: 'bg-orange-500' },
      awaiting_schedule_1: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, label: 'Awaiting Schedule 1', dot: 'bg-blue-500' },
      action_required: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, label: 'Action Required', dot: 'bg-orange-500' },
      completed: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Completed', dot: 'bg-emerald-500' }
    };
    return configs[status] || configs.submitted;
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
        // If both match and filing exists (even without status), skip the draft
        // A filing in the filings collection means it was submitted or is in payment flow
        return sameTaxYear && sameBusiness;
      });
      
      return !hasMatchingFiling;
    });
  }, [activeDrafts, convertedDraftIds, filings]);

  // Combine all filings (completed, incomplete, drafts) for the table
  const allFilingsForTable = useMemo(() => [
    ...filings,
    ...unconvertedDrafts.map(d => ({ ...d, isDraft: true }))
  ].sort((a, b) => {
    const dateA = a.updatedAt || a.createdAt;
    const dateB = b.updatedAt || b.createdAt;
    return new Date(dateB) - new Date(dateA);
  }), [filings, unconvertedDrafts]);

  const hasFilings = useMemo(() => filings.length > 0, [filings]);
  const hasIncomplete = useMemo(() => allIncompleteFilings.length > 0, [allIncompleteFilings]);

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

  // Load vehicles when filings change - DEFER to prevent blocking UI
  useEffect(() => {
    if (!user || (filings.length === 0 && unconvertedDrafts.length === 0)) return;

    // Defer vehicle loading to next tick to allow UI to render first
    const timeoutId = setTimeout(() => {
      const loadVehicles = async () => {
        const vehicleIdsSet = new Set();
        
        // Collect all vehicle IDs from filings and drafts
        [...filings, ...unconvertedDrafts].forEach(filing => {
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

        // Limit to prevent blocking - only load first 50 vehicles
        const vehicleIdsArray = Array.from(vehicleIdsSet).slice(0, 50);
        
        // Load vehicles in batches to prevent blocking
        const vehiclesData = {};
        const batchSize = 10;
        for (let i = 0; i < vehicleIdsArray.length; i += batchSize) {
          const batch = vehicleIdsArray.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (vehicleId) => {
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
          
          // Update state after each batch to show progress
          setVehiclesMap(prev => ({ ...prev, ...vehiclesData }));
          
          // Small delay between batches to prevent blocking
          if (i + batchSize < vehicleIdsArray.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      };

      loadVehicles();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [user, filings, unconvertedDrafts]);

  return (
    <ProtectedRoute>
      {/* Viewport layout - flex-1 to fill space between header and footer */}
      <div className="flex flex-col flex-1 h-full min-h-0">
        {/* Compact Header - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-[var(--color-page)] border-b border-[var(--color-border)] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text)] tracking-tight">Dashboard</h1>
            {/* Compact User Badge - Hidden on very small screens */}
            <div className="hidden xs:inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-2 sm:px-3 py-1.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                {(userData?.displayName || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[var(--color-navy)] hidden sm:inline">
                {userData?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            {hasFilings && (
              <>
                <Link
                  href="/dashboard/filings"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center transition-colors touch-manipulation"
                  title="Search all filings"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </Link>
                <Link
                  href="/dashboard/filings"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-slate-200 hover:bg-slate-50 active:bg-slate-100 flex items-center justify-center transition-colors touch-manipulation"
                  title="Filter filings"
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                </Link>
                <Link
                  href="/dashboard/new-filing"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--color-orange)] text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-[var(--color-orange-hover)] active:scale-95 transition-all touch-manipulation whitespace-nowrap min-h-[44px]"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">File 2290</span>
                  <span className="sm:hidden">File 2290</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--color-orangeß)]/10 border-t-[var(--color-orangeß)] rounded-full animate-spin"></div>
              <p className="text-sm text-[var(--color-muted)]">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content Area - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="max-w-6xl mx-auto">
                {/* Stats Row - Compact - Mobile Responsive */}
                {(hasFilings || hasIncomplete) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 flex-shrink-0">
                    {[
                      { label: 'Total', value: stats.total, color: 'slate', icon: FileText },
                      { label: 'Completed', value: stats.completed, color: 'emerald', icon: CheckCircle },
                      { label: 'Active', value: stats.processing, color: 'amber', icon: Clock },
                      { label: 'Vehicles', value: stats.totalVehicles, color: 'blue', icon: Truck },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      const colors = {
                        slate: 'bg-slate-50 border-slate-200 text-slate-700',
                        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                        amber: 'bg-amber-50 border-amber-200 text-amber-700',
                        blue: 'bg-blue-50 border-blue-200 text-blue-700',
                      };
                      return (
                        <div key={idx} className={`bg-white border rounded-lg sm:rounded-xl p-3 sm:p-4 ${colors[stat.color]}`}>
                          <div className="flex items-center justify-between mb-2">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 opacity-60" />
                          </div>
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5">{stat.value}</div>
                          <div className="text-xs sm:text-sm font-medium opacity-70">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Company Information Section - Mobile Optimized */}
                {primaryBusiness && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0">
                        {primaryBusiness.businessName?.charAt(0).toUpperCase() || 'B'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            {primaryBusiness.businessName} ({primaryBusiness.ein ? primaryBusiness.ein.replace(/(\d{2})(\d{7})/, '$1-$2') : 'N/A'})
                          </h2>
                          <Link
                            href="/dashboard/businesses"
                            className="text-slate-400 hover:text-slate-600 transition-colors touch-manipulation w-8 h-8 flex items-center justify-center"
                            title="Edit business information"
                          >
                            <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                          </Link>
                        </div>
                        <div className="flex flex-col sm:flex-wrap sm:flex-row gap-x-6 gap-y-1 text-xs sm:text-sm text-slate-600">
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
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-[var(--color-orange)] text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-[var(--color-orange-hover)] active:scale-95 transition-all whitespace-nowrap touch-manipulation min-h-[44px] w-full sm:w-auto justify-center sm:justify-start"
                      >
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Start New Return
                      </Link>
                    </div>
                  </div>
                )}

                {/* Returns Table */}
                {allFilingsForTable.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
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
                                      onClick={(e) => {
                                        console.log('[CLICK] Continue where you left off clicked', { resumeUrl });
                                        // Don't prevent default - let navigation happen
                                      }}
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

                {/* Empty State - Beautiful & Engaging */}
                {!hasFilings && !hasIncomplete && (
                  <div className="flex items-start justify-center py-8">
                    <div className="text-center max-w-4xl px-6 w-full">
                      {/* Welcome Message */}
                      <div className="mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4 bg-gradient-to-r from-[var(--color-orange)] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Welcome to Your Dashboard
                        </h2>
                        <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
                          Get started with your first Form 2290 filing in minutes. Choose the method that works best for you.
                        </p>
                      </div>

                      {/* Filing Method Cards - Mobile Optimized */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 max-w-3xl mx-auto">
                        <Link
                          href="/dashboard/upload-schedule1"
                          className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Upload Schedule 1 PDF</h3>
                            <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
                              Let our AI extract vehicle information from your existing Schedule 1 PDF automatically
                            </p>
                            <div className="space-y-1.5 mb-4">
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span>AI-powered data extraction</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span>Save time on data entry</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span>Instant verification</span>
                              </div>
                            </div>
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
                              <span>Get Started</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/new-filing"
                          className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 hover:border-[var(--color-orange)] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-orange)] to-slate-700 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Edit className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Manual Entry</h3>
                            <p className="text-sm text-[var(--color-muted)] mb-4 leading-relaxed">
                              Fill out your Form 2290 step-by-step with our guided filing process
                            </p>
                            <div className="space-y-1.5 mb-4">
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-[var(--color-orange)] flex-shrink-0" />
                                <span>Step-by-step guidance</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-[var(--color-orange)] flex-shrink-0" />
                                <span>Real-time validation</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-[var(--color-orange)] flex-shrink-0" />
                                <span>Save progress anytime</span>
                              </div>
                            </div>
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-orange)] group-hover:gap-3 transition-all">
                              <span>Get Started</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Trust Indicators */}
                      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                        <div className="text-center p-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h4 className="text-xs font-semibold text-[var(--color-text)] mb-0.5">IRS Approved</h4>
                          <p className="text-xs text-[var(--color-muted)]">Authorized e-file provider</p>
                        </div>
                        <div className="text-center p-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="text-xs font-semibold text-[var(--color-text)] mb-0.5">Fast Processing</h4>
                          <p className="text-xs text-[var(--color-muted)]">File in under 10 minutes</p>
                        </div>
                        <div className="text-center p-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="text-xs font-semibold text-[var(--color-text)] mb-0.5">Easy to Use</h4>
                          <p className="text-xs text-[var(--color-muted)]">No tax expertise needed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Overview - Action Items */}
                {hasFilings && stats.actionRequired > 0 && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-orange-900">Action Required</h3>
                        <p className="text-sm text-orange-800">{stats.actionRequired} {stats.actionRequired === 1 ? 'filing needs' : 'filings need'} your attention</p>
                      </div>
                      <Link
                        href="/dashboard/filings?status=action_required"
                        className="text-sm font-semibold text-orange-700 hover:text-orange-900 hover:underline"
                      >
                        Review →
                      </Link>
                    </div>
                    <div className="space-y-2">
                      {filings.filter(f => f.status === 'action_required').slice(0, 2).map(filing => {
                        const typeInfo = getFilingTypeInfo(filing);
                          return (
                            <Link
                              key={filing.id}
                              href={`/dashboard/filings/${filing.id}`}
                            className="block bg-white border border-orange-200 rounded-lg p-3 hover:border-orange-300 hover:shadow-sm transition-all"
                            >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-slate-900 truncate">{filing.business?.businessName || 'Unnamed Business'}</span>
                                  <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium">{filing.taxYear}</span>
                                </div>
                                <div className="text-xs text-slate-600">{typeInfo.label}</div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-orange-600 flex-shrink-0 ml-2" />
                            </div>
                            </Link>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Fixed, Scrollable */}
            <div className="hidden xl:block w-80 border-l border-[var(--color-border)] bg-white overflow-y-auto flex-shrink-0">
              <div className="p-4 sm:p-6 space-y-4">
                {/* Quick Actions - Compact Grid */}
                <div className="flex-shrink-0 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-[var(--color-text)] mb-3 uppercase tracking-wide">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { href: '/dashboard/new-filing', icon: Plus, label: 'New Filing', color: 'blue' },
                      { href: '/dashboard/upload-schedule1', icon: Upload, label: 'Upload PDF', color: 'purple' },
                      { href: '/dashboard/new-filing?type=refund', icon: CreditCard, label: 'Refund', color: 'emerald' },
                      { href: '/dashboard/new-filing?type=amendment', icon: Edit, label: 'Amend', color: 'amber' },
                    ].map((action, idx) => {
                      const Icon = action.icon;
                      const colors = {
                        blue: 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
                        purple: 'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100',
                        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100',
                        amber: 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100',
                      };
                      return (
                        <Link
                          key={idx}
                          href={action.href}
                          className={`group border rounded-lg p-3 hover:shadow-sm transition-all ${colors[action.color]}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white border border-current/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-semibold">{action.label}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* View All Filings Link */}
                {hasFilings && (
                  <Link
                    href="/dashboard/filings"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md transition-all group"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-blue-900 mb-1">View All Filings</h3>
                      <p className="text-xs text-blue-700">Search, filter, and manage all your filings</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {/* Help Section - Compact */}
                <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-[var(--color-text)] mb-2">Need Help?</h3>
                  <p className="text-xs text-[var(--color-muted)] mb-3">Our support team is here to help with Form 2290 filing questions.</p>
                  <div className="space-y-2">
                    <Link
                      href="/faq"
                      className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-[var(--color-text)] hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <span>Visit FAQ</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="flex items-center justify-between px-3 py-2 bg-[var(--color-orange)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--color-orange-hover)] transition-all"
                    >
                      <span>How It Works</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
