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
  Calendar,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  ShieldCheck,
  Download,
  Calculator,
  HelpCircle
} from 'lucide-react';
import { AIOnboarding } from '@/components/AIOnboarding';



export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [draftFilings, setDraftFilings] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [vehiclesMap, setVehiclesMap] = useState({}); // Map of vehicleId -> vehicle data
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Move dependencies of unconvertedDrafts up
  const activeDrafts = useMemo(() => draftFilings.filter(d => d.status === 'draft' && (d.selectedBusinessId || d.businessId)), [draftFilings]);

  const convertedDraftIds = useMemo(() => {
    const ids = new Set();
    filings.forEach(filing => {
      if (filing.draftId) {
        ids.add(filing.draftId);
      }
    });

    draftFilings.forEach(draft => {
      if (draft.filingId && filings.some(f => f.id === draft.filingId)) {
        ids.add(draft.id || draft.draftId);
      }
    });

    return ids;
  }, [filings, draftFilings]);

  const unconvertedDrafts = useMemo(() => {
    return activeDrafts.filter(draft => {
      if (!draft.selectedBusinessId && !draft.businessId) return false;
      if (convertedDraftIds.has(draft.id || draft.draftId)) return false;
      const hasMatchingFiling = filings.some(filing => {
        const sameTaxYear = filing.taxYear === draft.taxYear;
        const sameBusiness = filing.businessId === draft.selectedBusinessId ||
          filing.businessId === draft.businessId;
        return sameTaxYear && sameBusiness;
      });
      return !hasMatchingFiling;
    });
  }, [activeDrafts, convertedDraftIds, filings]);

  useEffect(() => {
    // Check if we should show onboarding
    const onboardingDismissed = localStorage.getItem('onboarding_dismissed');
    if (!onboardingDismissed && !loading && filings.length === 0 && unconvertedDrafts.length === 0) {
      setShowOnboarding(true);
    }
  }, [loading, filings.length, unconvertedDrafts.length]);

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
    totalVehicles: filings.reduce((sum, f) => sum + (f.vehicleIds?.length || 0) + (Number(f.powerUnits) || 0), 0),
  }), [filings]);

  const incomplete = useMemo(() => getIncompleteFilings(filings), [filings]);
  // Filter drafts to only show those with selectedBusinessId (business selected)

  const allIncompleteFilings = useMemo(() => [
    ...activeDrafts.map(d => ({ ...d, isDraft: true })),
    ...incomplete.all.filter(f => f.status !== 'action_required')
  ], [activeDrafts, incomplete]);

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
      <div className="flex flex-col flex-1 h-full min-h-0">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-navy)] tracking-tight">Dashboard</h1>
            <div className="hidden xs:inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-2 sm:px-3 py-1.5">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white font-semibold text-xs">
                {(userData?.displayName || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 hidden sm:inline">
                {userData?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            {hasFilings && (
              <>
                <button className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-600 touch-manipulation" aria-label="Search">
                  <Search className="w-4 h-4" />
                </button>
                <button className="min-w-[44px] min-h-[44px] rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-600 touch-manipulation" aria-label="Filter">
                  <Filter className="w-4 h-4" />
                </button>
                <Link
                  href="/ucr/file"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] px-3 sm:px-4 py-2 bg-[var(--color-navy)] !text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-navy-soft)] active:scale-95 transition-all whitespace-nowrap touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New UCR Filing</span>
                  <span className="sm:hidden">UCR</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1 bg-slate-50">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-[var(--color-navy)] rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden bg-slate-50/80">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="max-w-6xl mx-auto">
                {/* Welcome Message */}
                <div className="mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-navy)] tracking-tight">
                    Welcome back, {userData?.displayName || user?.email?.split('@')[0] || 'Trucker'}
                  </h2>
                  <p className="text-slate-600 mt-2 text-base">
                    Manage your fleet and stay compliant with your UCR registrations.
                  </p>
                </div>

                {/* UCR Compliance Section */}
                {(() => {
                  const activeUcr = filings.find(f => f.filingType === 'ucr' && f.filingYear === 2026) ||
                    draftFilings.find(d => d.filingType === 'ucr' && d.filingYear === 2026);
                  const status = activeUcr?.status || 'none';
                  const isCompleted = status === 'completed';
                  const isSubmittedOrProcessing = status === 'submitted' || status === 'processing';
                  const historicalFilings = filings.filter(f => f.filingType === 'ucr' && f.filingYear < 2026);

                  return (
                    <div className="space-y-4 mb-8">
                      <div className={`rounded-2xl p-6 sm:p-8 border-2 transition-all shadow-sm ${
                        isCompleted ? 'bg-white border-teal-200' :
                        isSubmittedOrProcessing ? 'bg-gradient-to-br from-white to-blue-50/30 border-blue-200' :
                        'bg-white border-slate-200'
                      }`}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                              isCompleted ? 'bg-teal-100 text-teal-600' :
                              isSubmittedOrProcessing ? 'bg-blue-100 text-blue-600' :
                              'bg-[var(--color-navy)]/10 text-[var(--color-navy)]'
                            }`}>
                              <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-slate-800">UCR Compliance 2026</h3>
                                {activeUcr && (
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                                    isCompleted ? 'bg-teal-100 text-teal-700' :
                                    isSubmittedOrProcessing ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {status === 'draft' ? 'In Progress' : status}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed mt-1">Annual registration required for interstate motor carriers.</p>
                              <div className="flex flex-wrap items-center gap-4 mt-3">
                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Calendar className="w-4 h-4 text-slate-400" /> Year: 2026
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock className="w-4 h-4 text-slate-400" /> Renewal: Dec 31, 2026
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0 lg:w-auto w-full">
                            {isCompleted ? (
                              <button
                                type="button"
                                onClick={() => window.open(activeUcr.certificateUrl || '#', '_blank')}
                                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition active:scale-[0.98] touch-manipulation shadow-sm"
                              >
                                <Download className="w-5 h-5" /> Download Certificate
                              </button>
                            ) : isSubmittedOrProcessing ? (
                              <div className="flex flex-col gap-4 min-w-0 max-w-sm">
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  An agent is processing your filing. You’ll see your certificate here when it’s ready.
                                </p>
                                <Link
                                  href={`/dashboard/filings/${activeUcr.id}`}
                                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[var(--color-navy)] !text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-navy-soft)] transition active:scale-[0.98] touch-manipulation shadow-sm w-full sm:w-auto"
                                >
                                  <Clock className="w-5 h-5" /> View status
                                </Link>
                              </div>
                            ) : (
                              <Link
                                href={status === 'draft' ? `/ucr/file?draft=${activeUcr.id || activeUcr.draftId}` : '/ucr/file'}
                                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[var(--color-navy)] !text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-navy-soft)] transition active:scale-[0.98] touch-manipulation shadow-sm w-full sm:w-auto"
                              >
                                {status === 'draft' ? 'Continue Filing' : 'Start 2026 Filing'}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {historicalFilings.length > 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Historical Records</h4>
                            <span className="text-[10px] text-slate-400">{historicalFilings.length} years</span>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {historicalFilings.map(hist => (
                              <div key={hist.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-semibold text-slate-800">UCR {hist.filingYear}</div>
                                    <div className="text-xs text-slate-500">Completed {hist.completedAt ? new Date(hist.completedAt).toLocaleDateString() : '—'}</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => window.open(hist.certificateUrl || '#', '_blank')}
                                  className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition flex items-center gap-1.5"
                                >
                                  <Download className="w-3.5 h-3.5" /> Certificate
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Stats Row */}
                {(hasFilings || hasIncomplete) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Total Filings', value: stats.total, color: 'slate', icon: FileText },
                      { label: 'Completed', value: stats.completed, color: 'teal', icon: CheckCircle },
                      { label: 'In Progress', value: stats.processing, color: 'amber', icon: Clock },
                      { label: 'Fleet Units', value: stats.totalVehicles, color: 'navy', icon: Truck },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      const colors = {
                        slate: 'text-slate-600 bg-slate-100',
                        teal: 'text-teal-600 bg-teal-100',
                        amber: 'text-amber-600 bg-amber-100',
                        navy: 'text-[var(--color-navy)] bg-[var(--color-navy)]/10',
                      };
                      const valueColors = {
                        slate: 'text-slate-800',
                        teal: 'text-teal-700',
                        amber: 'text-amber-700',
                        navy: 'text-[var(--color-navy)]',
                      };
                      return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300/50 transition-all">
                          <div className={`w-11 h-11 rounded-xl ${colors[stat.color]} flex items-center justify-center mb-3`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className={`text-2xl font-bold ${valueColors[stat.color]}`}>{stat.value}</div>
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Filings List or Empty State */}
                {hasFilings ? (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-base font-bold text-slate-800">Recent Activity</h3>
                      <Link href="/dashboard/filings" className="text-sm font-semibold text-[var(--color-navy)] hover:underline">View History →</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {filings.slice(0, 5).map((filing) => {
                        const statusConfig = getStatusConfig(filing.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <Link key={filing.id} href={`/dashboard/filings/${filing.id}`} className="flex items-center gap-4 p-4 hover:bg-slate-50/80 transition-colors">
                            <div className={`w-11 h-11 rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center shrink-0`}>
                              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-semibold text-slate-800">{filing.filingType === 'ucr' ? `UCR ${filing.filingYear}` : `Form 2290 ${filing.taxYear}`}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                                  {statusConfig.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> {filing.vehicleIds?.length || filing.powerUnits || 0} units</span>
                                <span>·</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {filing.createdAt?.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : !hasIncomplete && (
                  <div className="bg-white border border-dashed border-slate-200 rounded-xl p-10 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-slate-600">
                      <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No filings yet</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">Start your 2026 UCR registration.</p>
                    <Link href="/ucr/file" className="inline-flex items-center gap-2 bg-[var(--color-navy)] !text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition active:scale-95">
                      New UCR Filing <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Quick Actions */}
            <div className="hidden xl:block w-80 bg-slate-50/50 border-l border-slate-200 p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Links</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <Link href="/tools/ucr-calculator" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-[var(--color-navy)]/30 hover:shadow-md transition-all">
                      <Calculator className="w-5 h-5 text-[var(--color-navy)]" />
                      <span className="text-sm font-semibold text-slate-700">Fee Calculator</span>
                    </Link>
                    <Link href="/services/ucr-registration" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all">
                      <HelpCircle className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-semibold text-slate-700">Compliance Info</span>
                    </Link>
                  </div>
                </div>
                <div className="bg-[var(--color-navy)] rounded-2xl p-6 text-white shadow-lg">
                  <h4 className="font-bold text-lg mb-2">Need Help?</h4>
                  <p className="text-sm text-white/90 mb-5">Our compliance team can assist with your registrations.</p>
                  <a href="mailto:support@quicktrucktax.com" className="block w-full bg-white !text-[var(--color-navy)] py-3 rounded-xl text-sm font-semibold text-center hover:bg-slate-100 transition">
                    Contact support
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
