'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToUserFilings, getBusinessesByUser, getVehicle, deleteFiling } from '@/lib/db';
import { subscribeToDraftFilings, deleteDraftFiling } from '@/lib/draftHelpers';
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
  FileCheck,
  Trash2
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

  // Helper function to check if a draft/filing can be deleted
  const canDeleteDraft = (filing) => {
    const filingStatus = filing.status || 'submitted';
    
    // Cannot delete if status is 'processing' (Processing) or 'completed' (IRS Acceptance)
    if (filingStatus === 'processing' || filingStatus === 'completed') {
      return false;
    }
    
    // Allow deletion of:
    // 1. Drafts (isDraft: true or status: 'draft')
    // 2. Filings with 'pending_payment' or 'awaiting_schedule_1' status (not yet submitted to IRS)
    const isDraft = filing.isDraft || filingStatus === 'draft';
    const isDeletableFiling = filingStatus === 'pending_payment' || filingStatus === 'awaiting_schedule_1';
    
    return isDraft || isDeletableFiling;
  };

  // Handler for deleting a draft or filing
  const handleDeleteDraft = async (filing) => {
    if (!canDeleteDraft(filing)) {
      return;
    }

    const filingId = filing.id || filing.draftId;
    if (!filingId) {
      console.error('No filing/draft ID found');
      return;
    }

    const isDraft = filing.isDraft || filing.status === 'draft';
    const filingStatus = filing.status || 'submitted';
    const isFiling = filingStatus === 'pending_payment' || filingStatus === 'awaiting_schedule_1';

    // Confirm deletion
    const confirmMessage = isDraft
      ? `Are you sure you want to delete this draft filing? This action cannot be undone.`
      : `Are you sure you want to delete this filing? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      if (isDraft) {
        await deleteDraftFiling(filingId);
        console.log('Draft deleted successfully');
      } else if (isFiling) {
        await deleteFiling(filingId);
        console.log('Filing deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete. Please try again.');
    }
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
        {/* Professional Header */}
        <div className="bg-[#f8fafc] border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex-shrink-0 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/20 to-transparent pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#173b63] text-[10px] font-black mb-2 border border-blue-100 uppercase tracking-widest">
                  Management Console
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-base sm:text-lg text-slate-500 font-medium max-w-xl mt-2 lg:max-w-none mx-auto lg:mx-0">
                  Your central hub for Form 2290 compliance and fleet management.
                </p>
              </div>

              {hasFilings && (
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
                  <Link
                    href="/dashboard/new-filing"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#ff8b3d] hover:bg-[#f07a2d] text-white !text-white rounded-2xl text-sm font-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-orange-500/20"
                  >
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    File New Form 2290
                  </Link>
                  <Link
                    href="/dashboard/filings"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-slate-700 border-2 border-slate-200 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                    View All Filings
                  </Link>
                </div>
              )}
            </div>
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
                {/* Professional Stats Cards */}
                {(hasFilings || hasIncomplete) && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    {[
                      { label: 'Total Filings', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'In Progress', value: stats.processing, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Total Vehicles', value: stats.totalVehicles, icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 hover:shadow-md hover:border-slate-300 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                              <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-tight">{stat.label}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Compact Business Information Card */}
                {primaryBusiness && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow-lg shadow-slate-900/20">
                        {primaryBusiness.businessName?.charAt(0).toUpperCase() || 'B'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-black text-slate-900 truncate">
                            {primaryBusiness.businessName}
                          </h2>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                            {primaryBusiness.ein ? primaryBusiness.ein.replace(/(\d{2})(\d{7})/, '$1-$2') : 'N/A'}
                          </span>
                          <Link
                            href="/dashboard/businesses"
                            className="text-slate-400 hover:text-[#ff8b3d] transition-colors"
                            title="Edit business"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500 font-medium">
                          {primaryBusiness.address && (
                            <p className="truncate max-w-[300px]">{primaryBusiness.address}, {primaryBusiness.city}, {primaryBusiness.state}</p>
                          )}
                          {primaryBusiness.signingAuthorityName && (
                            <p className="border-l border-slate-200 pl-4 hidden md:block">Signatory: <span className="text-slate-700 font-bold">{primaryBusiness.signingAuthorityName}</span></p>
                          )}
                        </div>
                      </div>
                      <Link
                        href="/dashboard/new-filing"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#ff8b3d] hover:bg-[#f07a2d] text-white !text-white rounded-xl text-sm font-black transition-all hover:scale-105 shadow-md shadow-orange-500/10"
                      >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                        New Filing
                      </Link>
                    </div>
                  </div>
                )}

                {/* Professional Returns List - Table (Desktop) & Cards (Mobile) */}
                {allFilingsForTable.length > 0 && (
                  <div className="space-y-4 mb-8">
                    {/* Mobile Card Layout */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 bg-[#ff8b3d] rounded-full" />
                          <h2 className="text-sm font-black text-slate-900">Recent Filings</h2>
                        </div>
                        <Link href="/dashboard/filings" className="text-[10px] text-slate-500 hover:text-[#ff8b3d] font-bold transition-colors">
                          View All
                        </Link>
                      </div>
                      {allFilingsForTable.map((filing) => {
                        const filingStatus = filing.isDraft ? 'draft' : (filing.status || 'submitted');
                        const statusConfig = getStatusConfig(filingStatus);
                        const isIncomplete = filingStatus === 'draft' || filing.isDraft;

                        const resumeUrl = filing.isDraft || filingStatus === 'draft' || filingStatus === 'pending_payment'
                          ? filing.workflowType === 'upload'
                            ? `/dashboard/upload-schedule1?draft=${filing.draftId || filing.id}`
                            : `/dashboard/new-filing?draft=${filing.draftId || filing.id}`
                          : `/dashboard/filings/${filing.id}`;

                        return (
                          <div key={filing.id || filing.draftId} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <Link href={resumeUrl} className="text-sm text-slate-900 hover:text-[#ff8b3d] font-bold block truncate max-w-[200px]">
                                  {getReturnNumber(filing)}
                                </Link>
                                <div className="text-[10px] text-slate-400 mt-0.5">{getFirstUsedMonth(filing)} • {getFilingDate(filing) || 'Draft'}</div>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${statusConfig.bg} ${statusConfig.color} border border-current/10`}>
                                <div className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                                {isIncomplete ? 'Incomplete' : statusConfig.label}
                              </span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-y border-slate-50 text-[11px]">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Tax Due</span>
                                <span className="text-slate-900 font-black">${getTaxAmount(filing).toFixed(2)}</span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Fleet</span>
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="text-slate-700 font-bold">{getVehiclesInfo(filing).length} Vehicle{getVehiclesInfo(filing).length !== 1 ? 's' : ''}</span>
                                  {getVehiclesInfo(filing).length > 0 && getVehiclesInfo(filing).length <= 2 && (
                                    <div className="text-[9px] text-slate-500 font-mono">
                                      {getVehiclesInfo(filing).map((v, i) => (
                                        <span key={i}>{v.vin?.slice(-8) || 'N/A'}{i < getVehiclesInfo(filing).length - 1 ? ', ' : ''}</span>
                                      ))}
                                    </div>
                                  )}
                                  {getVehiclesInfo(filing).length > 2 && (
                                    <div className="text-[9px] text-slate-500 font-mono">
                                      {getVehiclesInfo(filing).slice(0, 2).map((v, i) => (
                                        <span key={i}>{v.vin?.slice(-8) || 'N/A'}{i < 1 ? ', ' : ''}</span>
                                      ))}
                                      <span className="text-slate-400"> +{getVehiclesInfo(filing).length - 2}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Link
                                href={resumeUrl}
                                className={`flex-1 py-2 rounded-lg text-center text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 ${isIncomplete
                                    ? 'bg-[#ff8b3d] text-white hover:bg-[#f07a2d] shadow-orange-500/10'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-200/50'
                                  }`}
                              >
                                {isIncomplete ? 'Continue' : 'View'}
                              </Link>
                              {hasSchedule1(filing) && (
                                <Link
                                  href={filing.schedule1Url}
                                  target="_blank"
                                  className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-lg hover:text-slate-600 hover:border-slate-300 transition-all shadow-sm"
                                >
                                  <FileCheck className="w-4 h-4" />
                                </Link>
                              )}
                              {canDeleteDraft(filing) && (
                                <button
                                  onClick={() => handleDeleteDraft(filing)}
                                  className="w-9 h-9 flex items-center justify-center bg-white border border-red-200 text-red-500 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-sm active:scale-95"
                                  title="Delete draft"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden sm:block bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-[#ff8b3d] rounded-full" />
                            <h2 className="text-base font-black text-slate-900">Recent Filings</h2>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link
                              href="/dashboard/filings"
                              className="text-xs text-slate-500 hover:text-[#ff8b3d] font-bold transition-colors"
                            >
                              View All
                            </Link>
                            <button
                              onClick={() => window.location.reload()}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-white flex items-center justify-center transition-all hover:rotate-180 duration-500"
                              title="Refresh"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50/50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Return</th>
                              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">First Used</th>
                              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest hidden lg:table-cell">Vehicles</th>
                              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Tax Amount</th>
                              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                              <th className="px-6 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {allFilingsForTable.map((filing) => {
                              const filingStatus = filing.isDraft ? 'draft' : (filing.status || 'submitted');
                              const statusConfig = getStatusConfig(filingStatus);
                              const isIncomplete = filingStatus === 'draft' || filing.isDraft;

                              const resumeUrl = filing.isDraft || filingStatus === 'draft' || filingStatus === 'pending_payment'
                                ? filing.workflowType === 'upload'
                                  ? `/dashboard/upload-schedule1?draft=${filing.draftId || filing.id}`
                                  : `/dashboard/new-filing?draft=${filing.draftId || filing.id}`
                                : `/dashboard/filings/${filing.id}`;

                              const vehiclesInfo = getVehiclesInfo(filing);

                              return (
                                <tr key={filing.id || filing.draftId} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-3">
                                    <Link
                                      href={resumeUrl}
                                      className="text-sm text-slate-900 hover:text-[#ff8b3d] font-bold block"
                                    >
                                      {getReturnNumber(filing)}
                                    </Link>
                                    <div className="sm:hidden text-[10px] text-slate-500">{getFirstUsedMonth(filing)}</div>
                                    {getFilingDate(filing) && (
                                      <div className="text-[10px] text-slate-400 mt-0.5">{getFilingDate(filing)}</div>
                                    )}
                                  </td>
                                  <td className="px-6 py-3 text-xs text-slate-600 font-medium hidden md:table-cell">
                                    {getFirstUsedMonth(filing)}
                                  </td>
                                  <td className="px-6 py-3 hidden lg:table-cell">
                                    {vehiclesInfo.length > 0 ? (
                                      <div className="flex flex-col gap-1 max-w-xs">
                                        {vehiclesInfo.slice(0, 2).map((vehicle, idx) => (
                                          <div key={idx} className="flex items-center gap-1.5 group relative">
                                            <span className="text-[10px] font-mono font-bold text-slate-700 truncate max-w-[140px]" title={vehicle.vin || 'Vehicle'}>
                                              {vehicle.vin || `Vehicle ${idx + 1}`}
                                            </span>
                                            {vehicle.vehicleType && (
                                              <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase flex-shrink-0 ${
                                                vehicle.vehicleType === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                                vehicle.vehicleType === 'credit' ? 'bg-blue-100 text-blue-700' :
                                                vehicle.vehicleType === 'priorYearSold' ? 'bg-purple-100 text-purple-700' :
                                                'bg-emerald-100 text-emerald-700'
                                              }`}>
                                                {vehicle.vehicleType === 'suspended' ? 'S' :
                                                 vehicle.vehicleType === 'credit' ? 'C' :
                                                 vehicle.vehicleType === 'priorYearSold' ? 'P' : 'T'}
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                        {vehiclesInfo.length > 2 && (
                                          <div className="text-[10px] text-slate-500 font-medium">
                                            +{vehiclesInfo.length - 2} more vehicle{vehiclesInfo.length - 2 !== 1 ? 's' : ''}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-slate-300 text-xs">-</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-3 text-sm font-black text-slate-900">
                                    ${getTaxAmount(filing).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.color} border border-current/10`}>
                                      <div className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                                      {isIncomplete ? 'Incomplete' : statusConfig.label}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {isIncomplete ? (
                                        <Link
                                          href={resumeUrl}
                                          className="inline-flex items-center justify-center px-4 py-1.5 bg-[#ff8b3d] hover:bg-[#f07a2d] text-white !text-white rounded-lg text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-md shadow-orange-500/10"
                                        >
                                          Continue
                                        </Link>
                                      ) : (
                                        <Link
                                          href={resumeUrl}
                                          className="inline-flex items-center justify-center px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all"
                                        >
                                          View
                                        </Link>
                                      )}
                                      {hasSchedule1(filing) && (
                                        <Link
                                          href={filing.schedule1Url}
                                          target="_blank"
                                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all"
                                          title="View Schedule 1"
                                        >
                                          <FileCheck className="w-3.5 h-3.5" />
                                        </Link>
                                      )}
                                      {canDeleteDraft(filing) && (
                                        <button
                                          onClick={() => handleDeleteDraft(filing)}
                                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                                          title="Delete draft"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
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
                  </div>
                )}

                {/* Professional Empty State */}
                {!hasFilings && !hasIncomplete && (
                  <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                    <div className="max-w-2xl mx-auto">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Get Started with Your First Filing</h2>
                      <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        Choose how you'd like to file your Form 2290. Our expert team will handle the rest.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Link
                          href="/dashboard/upload-schedule1"
                          className="group relative bg-[#fdfdfe] border border-slate-200 rounded-2xl p-8 hover:border-[#ff8b3d]/30 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Upload className="w-20 h-20" />
                          </div>
                          <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-[#ff8b3d] group-hover:text-white transition-all duration-300">
                            <Upload className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3 text-left">Upload Schedule 1</h3>
                          <p className="text-sm text-slate-600 mb-6 text-left leading-relaxed">AI extracts data from your existing Schedule 1 PDF. Fast & Accurate.</p>
                          <div className="inline-flex items-center gap-2 px-0 py-2 text-[#ff8b3d] text-sm font-black group-hover:gap-4 transition-all">
                            Get Started <ArrowRight className="w-5 h-5 stroke-[3px]" />
                          </div>
                        </Link>

                        <Link
                          href="/dashboard/new-filing"
                          className="group relative bg-[#fdfdfe] border border-slate-200 rounded-2xl p-8 hover:border-[#ff8b3d]/30 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Edit className="w-20 h-20" />
                          </div>
                          <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-[#ff8b3d] group-hover:text-white transition-all duration-300">
                            <Edit className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-3 text-left">Manual Entry</h3>
                          <p className="text-sm text-slate-600 mb-6 text-left leading-relaxed">Step-by-step guided filing process. Perfect for new vehicles.</p>
                          <div className="inline-flex items-center gap-2 px-0 py-2 text-[#ff8b3d] text-sm font-black group-hover:gap-4 transition-all">
                            Get Started <ArrowRight className="w-5 h-5 stroke-[3px]" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Required Alert */}
                {hasFilings && stats.actionRequired > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-amber-900 mb-1">Action Required</h3>
                        <p className="text-sm text-amber-800 mb-3">{stats.actionRequired} {stats.actionRequired === 1 ? 'filing requires' : 'filings require'} your attention</p>
                        <Link
                          href="/dashboard/filings?status=action_required"
                          className="text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline"
                        >
                          Review Filings →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Professional */}
            <div className="hidden xl:block w-80 border-l border-slate-200 bg-white overflow-y-auto flex-shrink-0">
              <div className="p-6 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white border border-slate-200 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { href: '/dashboard/new-filing', icon: Plus, label: 'New Filing' },
                      { href: '/dashboard/upload-schedule1', icon: Upload, label: 'Upload PDF' },
                      { href: '/dashboard/new-filing?type=amendment', icon: Edit, label: 'Amendment' },
                    ].map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <Link
                          key={idx}
                          href={action.href}
                          className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-[#173b63]/30 hover:bg-slate-50 hover:shadow-sm transition-all group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-[#173b63] group-hover:text-white transition-all duration-300">
                            <Icon className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-[#173b63] transition-colors">{action.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* View All Filings */}
                {hasFilings && (
                  <Link
                    href="/dashboard/filings"
                    className="block p-5 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-sm transition-all group"
                  >
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">View All Filings</h3>
                    <p className="text-xs text-slate-600 mb-3">Search, filter, and manage all your filings</p>
                    <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 flex items-center gap-2">
                      View All <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                )}

                {/* Help Section */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Need Help?</h3>
                  <p className="text-xs text-slate-600 mb-4">Our support team is here to assist you.</p>
                  <div className="space-y-2">
                    <Link
                      href="/faq"
                      className="block text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      FAQ →
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="block text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      How It Works →
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
