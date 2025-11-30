'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToFiling, getBusiness, getVehicle } from '@/lib/db';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Truck,
  FileText,
  Calendar,
  Download,
  FileCheck,
  Copy,
  Check
} from 'lucide-react';

export default function FilingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [filing, setFiling] = useState(null);
  const [business, setBusiness] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (params.id && user) {
      subscribeToFilingData();
    }
  }, [params.id, user]);

  const subscribeToFilingData = () => {
    if (!user) return;

    setLoading(true);

    // Subscribe to real-time filing updates
    const unsubscribe = subscribeToFiling(params.id, async (filingData) => {
      if (!filingData) {
        router.push('/dashboard');
        return;
      }

      if (filingData.userId !== user.uid) {
        router.push('/dashboard');
        return;
      }

      setFiling(filingData);

      // Load business
      if (filingData.businessId) {
        try {
          const businessData = await getBusiness(filingData.businessId);
          setBusiness(businessData);
        } catch (error) {
          console.error('Error loading business:', error);
        }
      }

      // Load vehicles - check both vehicleIds and amendment vehicle references
      const vehicleIdsToLoad = [];
      if (filingData.vehicleIds && filingData.vehicleIds.length > 0) {
        vehicleIdsToLoad.push(...filingData.vehicleIds);
      }
      // For amendments, also load the vehicle from amendment details
      if (filingData.filingType === 'amendment' && filingData.amendmentType) {
        if (filingData.amendmentType === 'weight_increase' && filingData.amendmentDetails?.weightIncrease?.vehicleId) {
          vehicleIdsToLoad.push(filingData.amendmentDetails.weightIncrease.vehicleId);
        } else if (filingData.amendmentType === 'mileage_exceeded' && filingData.amendmentDetails?.mileageExceeded?.vehicleId) {
          vehicleIdsToLoad.push(filingData.amendmentDetails.mileageExceeded.vehicleId);
        }
        // For VIN corrections, we don't have a vehicleId in amendment details, but we can show the VINs
      }

      if (vehicleIdsToLoad.length > 0) {
        try {
          // Remove duplicates
          const uniqueVehicleIds = [...new Set(vehicleIdsToLoad)];
          const vehicleData = await Promise.all(
            uniqueVehicleIds.map(id => getVehicle(id))
          );
          setVehicles(vehicleData.filter(v => v !== null));
        } catch (error) {
          console.error('Error loading vehicles:', error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          icon: FileCheck,
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          iconColor: 'text-blue-600',
        };
      case 'processing':
        return {
          label: 'Processing',
          icon: Clock,
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          iconColor: 'text-amber-600',
        };
      case 'action_required':
        return {
          label: 'Action Required',
          icon: AlertCircle,
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          iconColor: 'text-orange-600',
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          iconColor: 'text-green-600',
        };
      default:
        return {
          label: status,
          icon: FileText,
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          iconColor: 'text-gray-600',
        };
    }
  };

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (filing?.status === 'submitted' || filing?.status === 'processing') {
      // Calculate initial elapsed time based on createdAt
      const startTime = filing.createdAt ? new Date(filing.createdAt).getTime() : Date.now();

      const timer = setInterval(() => {
        const now = Date.now();
        const diffInSeconds = Math.floor((now - startTime) / 1000);
        setElapsedTime(diffInSeconds);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [filing?.status, filing?.createdAt]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-sm text-[var(--color-muted)]">Loading filing details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!filing) {
    return (
      <ProtectedRoute>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-12">
            <p className="text-[var(--color-muted)] mb-4">Filing not found</p>
            <Link href="/dashboard" className="text-[var(--color-navy)] hover:underline text-sm">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const statusConfig = getStatusConfig(filing.status);
  const StatusIcon = statusConfig.icon;

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header - Optimized for space */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)]">
            Filing Details
          </h1>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} w-fit`}>
            <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.iconColor}`} />
            {statusConfig.label}
          </span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Unified Dynamic Hero Section - Spans 2 columns on large screens */}
          <div className={`lg:col-span-2 border rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden transition-all duration-500 ${filing.status === 'action_required'
            ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
            : filing.status === 'completed'
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
            }`}>
            {/* Background Effects */}
            <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-50 blur-2xl ${filing.status === 'action_required' ? 'bg-orange-200' : filing.status === 'completed' ? 'bg-green-200' : 'bg-blue-200'
              }`}></div>
            <div className={`absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 rounded-full opacity-50 blur-2xl ${filing.status === 'action_required' ? 'bg-red-200' : filing.status === 'completed' ? 'bg-emerald-200' : 'bg-indigo-200'
              }`}></div>

            {/* Shimmer Effect for Processing */}
            {(filing.status === 'submitted' || filing.status === 'processing') && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
            )}

            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              {/* Dynamic Icon */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 shadow-sm transition-all duration-500 ${filing.status === 'action_required'
                ? 'bg-orange-100 text-orange-600'
                : filing.status === 'completed'
                  ? 'bg-green-100 text-green-600 animate-bounce-subtle'
                  : 'bg-blue-100 text-blue-600 animate-pulse'
                }`}>
                {filing.status === 'action_required' ? (
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                ) : filing.status === 'completed' ? (
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                ) : (
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10" />
                )}
              </div>

              {/* Dynamic Title & Message */}
              <h2 className={`text-2xl sm:text-3xl font-bold mb-3 transition-colors duration-300 ${filing.status === 'action_required' ? 'text-orange-900' : filing.status === 'completed' ? 'text-green-900' : 'text-blue-900'
                }`}>
                {filing.status === 'action_required'
                  ? 'Action Required'
                  : filing.status === 'completed'
                    ? (() => {
                        if (filing.filingType === 'amendment') {
                          if (filing.amendmentType === 'vin_correction') return 'VIN Correction Accepted!';
                          if (filing.amendmentType === 'weight_increase') return 'Weight Increase Amendment Accepted!';
                          if (filing.amendmentType === 'mileage_exceeded') return 'Mileage Amendment Accepted!';
                          return 'Amendment Accepted!';
                        }
                        if (filing.filingType === 'refund') return 'Refund Claim Submitted!';
                        return 'Filing Accepted!';
                      })()
                    : (() => {
                        if (filing.filingType === 'amendment') {
                          if (filing.amendmentType === 'vin_correction') return 'Processing Your VIN Correction';
                          if (filing.amendmentType === 'weight_increase') return 'Processing Your Weight Increase Amendment';
                          if (filing.amendmentType === 'mileage_exceeded') return 'Processing Your Mileage Exceeded Amendment';
                          return 'Processing Your Amendment';
                        }
                        if (filing.filingType === 'refund') return 'Processing Your Refund Claim';
                        return 'Processing Your Filing';
                      })()}
              </h2>

              <p className={`max-w-lg mx-auto text-base sm:text-lg mb-6 transition-colors duration-300 ${filing.status === 'action_required' ? 'text-orange-800' : filing.status === 'completed' ? 'text-green-800' : 'text-blue-800'
                }`}>
                {filing.status === 'action_required'
                  ? 'We need some additional information to proceed. Please check the notes below.'
                  : filing.status === 'completed'
                    ? (() => {
                        if (filing.filingType === 'amendment') {
                          if (filing.amendmentType === 'vin_correction') {
                            return 'Great news! Your VIN correction amendment has been accepted by the IRS. Your corrected Schedule 1 is ready.';
                          }
                          if (filing.amendmentType === 'weight_increase') {
                            return 'Great news! Your weight increase amendment has been accepted by the IRS. Your amended Schedule 1 is ready.';
                          }
                          if (filing.amendmentType === 'mileage_exceeded') {
                            return 'Great news! Your mileage exceeded amendment has been accepted by the IRS. Your amended Schedule 1 is ready.';
                          }
                          return 'Great news! Your amendment has been accepted by the IRS. Your amended Schedule 1 is ready.';
                        }
                        if (filing.filingType === 'refund') {
                          return 'Your refund claim (Form 8849) has been submitted to the IRS. You will receive updates on the status of your refund.';
                        }
                        return 'Great news! Your Form 2290 has been accepted by the IRS. Your Schedule 1 is ready.';
                      })()
                    : (() => {
                        if (filing.filingType === 'amendment') {
                          if (filing.amendmentType === 'vin_correction') {
                            return 'We are processing your VIN correction amendment. No additional tax is due for this correction.';
                          }
                          if (filing.amendmentType === 'weight_increase') {
                            return 'We are processing your weight increase amendment. Additional tax will be calculated and submitted to the IRS.';
                          }
                          if (filing.amendmentType === 'mileage_exceeded') {
                            return 'We are processing your mileage exceeded amendment. Full HVUT tax will be calculated and submitted to the IRS.';
                          }
                          return 'We are processing your amendment filing with the IRS.';
                        }
                        if (filing.filingType === 'refund') {
                          return 'We are processing your refund claim (Form 8849). We will submit it to the IRS for review.';
                        }
                        return 'Sit back and relax. We are preparing your return for IRS submission.';
                      })()}
              </p>

              {/* Dynamic Action Area */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                {filing.status === 'completed' && filing.finalSchedule1Url ? (
                  <a
                    href={filing.finalSchedule1Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 hover:shadow-xl transition transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
                  >
                    <Download className="w-5 h-5" />
                    {filing.filingType === 'amendment' 
                      ? (filing.amendmentType === 'vin_correction' 
                          ? 'Download Corrected Schedule 1'
                          : 'Download Amended Schedule 1')
                      : filing.filingType === 'refund'
                        ? 'Download Schedule 1'
                        : 'Download Schedule 1'}
                  </a>
                ) : filing.status === 'action_required' ? (
                  <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-orange-200 text-orange-800 text-sm font-medium">
                    Please review the notes below
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center gap-3">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
                      <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </div>
                      <span className="text-sm font-mono font-semibold text-blue-900">
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Est. {(() => {
                          if (filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction') {
                            return '~5 mins'; // VIN corrections are faster
                          }
                          if (filing.filingType === 'amendment') {
                            return '~10 mins'; // Other amendments
                          }
                          if (filing.filingType === 'refund') {
                            return '~15 mins'; // Refunds may take longer
                          }
                          return '~15 mins'; // Standard filings
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Timeline & Notes */}
          <div className="space-y-4 lg:col-span-1 h-full flex flex-col">
            {/* Agent Notes for Action Required */}
            {filing.status === 'action_required' && filing.agentNotes && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 animate-in fade-in slide-in-from-top-2 shadow-sm">
                <h3 className="text-sm font-bold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Agent Notes
                </h3>
                <p className="text-sm text-orange-800 whitespace-pre-wrap leading-relaxed">{filing.agentNotes}</p>
              </div>
            )}

            {/* Unified Visual Timeline - Vertical on Desktop for side-by-side */}
            <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 sm:p-6 flex-1 shadow-sm flex flex-col justify-center">
              <h3 className="text-xs font-bold text-[var(--color-muted)] mb-6 uppercase tracking-wider flex items-center justify-between">
                <span>Filing Progress</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${filing.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                  {filing.status === 'completed' ? '100%' : 'Live'}
                </span>
              </h3>

              <div className="relative flex flex-col gap-8 pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100 -z-10"></div>

                {/* Step 1: Submitted */}
                <div className="flex items-center gap-4 relative">
                  <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center shadow-sm ring-4 ring-white z-10 transition-colors duration-300 ${filing.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className={`text-sm font-semibold block ${filing.status === 'completed' ? 'text-green-900' : 'text-blue-900'
                      }`}>Submitted</span>
                    <span className="text-xs text-[var(--color-muted)]">Filing received</span>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="flex items-center gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white z-10 transition-all duration-300 ${filing.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : filing.status === 'action_required'
                      ? 'bg-orange-500 text-white'
                      : 'bg-blue-500 text-white animate-pulse'
                    }`}>
                    {filing.status === 'completed' ? (
                      <Check className="w-3 h-3" />
                    ) : filing.status === 'action_required' ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>
                  <div>
                    <span className={`text-sm font-semibold block ${filing.status === 'completed'
                      ? 'text-green-900'
                      : filing.status === 'action_required'
                        ? 'text-orange-900'
                        : 'text-blue-900'
                      }`}>Processing</span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {filing.status === 'completed'
                        ? 'Validation complete'
                        : filing.status === 'action_required'
                          ? 'Attention needed'
                          : 'Validating details...'}
                    </span>
                  </div>
                </div>

                {/* Step 3: IRS Accepted */}
                <div className="flex items-center gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white z-10 transition-colors duration-300 ${filing.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                    {filing.status === 'completed' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Building2 className="w-3 h-3" />
                    )}
                  </div>
                  <div>
                    <span className={`text-sm font-semibold block ${filing.status === 'completed' ? 'text-green-900' : 'text-gray-500'
                      }`}>IRS Acceptance</span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {filing.status === 'completed' ? 'Officially accepted' : 'Pending IRS response'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {/* Business Information */}
          <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-[var(--color-navy)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Business Information</h2>
            </div>
            {business && (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[var(--color-muted)] min-w-[100px]">Name:</span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-[var(--color-text)] font-medium truncate">{business.businessName}</span>
                    <button
                      onClick={() => handleCopy(business.businessName, 'businessName')}
                      className="flex-shrink-0 text-[var(--color-muted)] hover:text-[var(--color-navy)] transition"
                      title="Copy"
                    >
                      {copied === 'businessName' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[var(--color-muted)] min-w-[100px]">EIN:</span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-[var(--color-text)] font-medium font-mono">{business.ein}</span>
                    <button
                      onClick={() => handleCopy(business.ein, 'ein')}
                      className="flex-shrink-0 text-[var(--color-muted)] hover:text-[var(--color-navy)] transition"
                      title="Copy"
                    >
                      {copied === 'ein' ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                {business.address && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[var(--color-muted)] min-w-[100px]">Address:</span>
                    <span className="text-[var(--color-text)] flex-1 text-right">{business.address}</span>
                  </div>
                )}
                {business.phone && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[var(--color-muted)] min-w-[100px]">Phone:</span>
                    <span className="text-[var(--color-text)] flex-1 text-right">{business.phone}</span>
                  </div>
                )}
                {business.signingAuthorityName && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[var(--color-muted)] min-w-[100px]">Signing Authority:</span>
                    <span className="text-[var(--color-text)] flex-1 text-right">
                      {business.signingAuthorityName}
                      {business.signingAuthorityTitle && ` (${business.signingAuthorityTitle})`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Filing Details */}
          <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[var(--color-navy)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Filing Details</h2>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[var(--color-muted)] min-w-[120px]">Filing Type:</span>
                <span className="text-[var(--color-text)] font-medium capitalize">
                  {filing.filingType === 'amendment' && filing.amendmentType
                    ? (filing.amendmentType === 'vin_correction' ? 'VIN Correction Amendment'
                        : filing.amendmentType === 'weight_increase' ? 'Weight Increase Amendment'
                        : filing.amendmentType === 'mileage_exceeded' ? 'Mileage Exceeded Amendment'
                        : 'Amendment')
                    : filing.filingType === 'refund' ? 'Refund (Form 8849)'
                    : 'Standard Filing'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-[var(--color-muted)] min-w-[120px]">Tax Year:</span>
                <span className="text-[var(--color-text)] font-medium">{filing.taxYear}</span>
              </div>
              {filing.filingType !== 'amendment' && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[var(--color-muted)] min-w-[120px]">First Used:</span>
                  <span className="text-[var(--color-text)] font-medium">{filing.firstUsedMonth}</span>
                </div>
              )}
              {filing.createdAt && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[var(--color-muted)] min-w-[120px]">Submitted:</span>
                  <span className="text-[var(--color-text)]">
                    {filing.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              {filing.updatedAt && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[var(--color-muted)] min-w-[120px]">Last Updated:</span>
                  <span className="text-[var(--color-text)]">
                    {filing.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amendment Details Section (if amendment) */}
        {filing.filingType === 'amendment' && filing.amendmentType && (
          <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              {filing.amendmentType === 'vin_correction' && '📝'}
              {filing.amendmentType === 'weight_increase' && '⚖️'}
              {filing.amendmentType === 'mileage_exceeded' && '🛣️'}
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Amendment Details
              </h2>
            </div>

            {filing.amendmentType === 'vin_correction' && (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="text-xs text-red-600 mb-1">Original VIN (Incorrect)</div>
                    <div className="font-mono font-bold text-red-700 line-through">
                      {filing.amendmentDetails?.vinCorrection?.originalVIN || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <div className="text-xs text-green-600 mb-1">Corrected VIN</div>
                    <div className="font-mono font-bold text-green-700">
                      {filing.amendmentDetails?.vinCorrection?.correctedVIN || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
                  ✓ VIN correction completed - No additional tax was due
                </div>
              </div>
            )}

            {filing.amendmentType === 'weight_increase' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                    <div className="text-xs text-gray-600 mb-1">Original Category</div>
                    <div className="text-xl font-bold text-gray-700">
                      {filing.amendmentDetails?.weightIncrease?.originalWeightCategory || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center text-2xl text-orange-600">→</div>
                  <div className="bg-orange-50 border border-orange-200 rounded p-3 text-center">
                    <div className="text-xs text-orange-600 mb-1">New Category</div>
                    <div className="text-xl font-bold text-orange-700">
                      {filing.amendmentDetails?.weightIncrease?.newWeightCategory || 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--color-muted)]">Month of Increase:</span>
                    <span className="font-medium ml-2">{filing.amendmentDetails?.weightIncrease?.increaseMonth || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Additional Tax Paid:</span>
                    <span className="font-bold text-orange-600 ml-2">
                      ${filing.amendmentDetails?.weightIncrease?.additionalTaxDue?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {filing.amendmentType === 'mileage_exceeded' && (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--color-muted)]">Vehicle Type:</span>
                    <span className="font-medium ml-2">
                      {filing.amendmentDetails?.mileageExceeded?.isAgriculturalVehicle ? 'Agricultural' : 'Standard'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Mileage Limit:</span>
                    <span className="font-medium ml-2">
                      {filing.amendmentDetails?.mileageExceeded?.originalMileageLimit?.toLocaleString() || 'N/A'} miles
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Actual Mileage:</span>
                    <span className="font-bold text-purple-600 ml-2">
                      {filing.amendmentDetails?.mileageExceeded?.actualMileageUsed?.toLocaleString() || 'N/A'} miles
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Month Exceeded:</span>
                    <span className="font-medium ml-2">{filing.amendmentDetails?.mileageExceeded?.exceededMonth || 'N/A'}</span>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs text-purple-700">
                  ℹ️ Full HVUT tax was calculated and paid for this vehicle
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vehicles */}
        <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-4 h-4 text-[var(--color-navy)]" />
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              {filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction'
                ? 'VIN Information'
                : `Vehicles (${vehicles.length})`}
            </h2>
          </div>
          
          {filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction' ? (
            // For VIN corrections, show VINs from amendment details
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="text-xs text-red-600 mb-1">Original VIN (Incorrect)</div>
                <div className="font-mono font-bold text-red-700 line-through">
                  {filing.amendmentDetails?.vinCorrection?.originalVIN || 'N/A'}
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="text-xs text-green-600 mb-1">Corrected VIN</div>
                <div className="font-mono font-bold text-green-700">
                  {filing.amendmentDetails?.vinCorrection?.correctedVIN || 'N/A'}
                </div>
              </div>
            </div>
          ) : vehicles.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-2.5">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-[var(--color-page-alt)] rounded border border-[var(--color-border)] p-3"
                >
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[80px]">VIN:</span>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-[var(--color-text)] font-medium font-mono truncate">{vehicle.vin}</span>
                        <button
                          onClick={() => handleCopy(vehicle.vin, `vin-${vehicle.id}`)}
                          className="flex-shrink-0 text-[var(--color-muted)] hover:text-[var(--color-navy)] transition"
                          title="Copy VIN"
                        >
                          {copied === `vin-${vehicle.id}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[80px]">Weight:</span>
                      <span className="text-[var(--color-text)] font-medium">{vehicle.grossWeightCategory}</span>
                    </div>
                    {vehicle.isSuspended && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-medium text-orange-600">Suspended Vehicle</span>
                      </div>
                    )}
                    {/* Show amendment-specific info for weight increase */}
                    {filing.filingType === 'amendment' && filing.amendmentType === 'weight_increase' && 
                     filing.amendmentDetails?.weightIncrease?.vehicleId === vehicle.id && (
                      <div className="pt-2 mt-2 border-t border-orange-200">
                        <div className="text-xs text-orange-600 font-medium">
                          ⚖️ Weight: {filing.amendmentDetails.weightIncrease.originalWeightCategory} → {filing.amendmentDetails.weightIncrease.newWeightCategory}
                        </div>
                      </div>
                    )}
                    {/* Show amendment-specific info for mileage exceeded */}
                    {filing.filingType === 'amendment' && filing.amendmentType === 'mileage_exceeded' && 
                     filing.amendmentDetails?.mileageExceeded?.vehicleId === vehicle.id && (
                      <div className="pt-2 mt-2 border-t border-purple-200">
                        <div className="text-xs text-purple-600 font-medium">
                          🛣️ Mileage: {filing.amendmentDetails.mileageExceeded.actualMileageUsed?.toLocaleString()} miles (Exceeded limit)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-[var(--color-muted)] italic">
              {filing.filingType === 'amendment' 
                ? 'Vehicle information is shown in Amendment Details above'
                : 'No vehicles found for this filing'}
            </div>
          )}
        </div>

        {/* Input Documents */}
        {filing.inputDocuments && filing.inputDocuments.length > 0 && (
          <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[var(--color-navy)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Uploaded Documents ({filing.inputDocuments.length})
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {filing.inputDocuments.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-[var(--color-page-alt)] rounded border border-[var(--color-border)] hover:border-[var(--color-navy)] hover:bg-[var(--color-page-alt)] transition text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--color-muted)] flex-shrink-0" />
                  <span className="text-[var(--color-text)] font-medium truncate">Document {index + 1}</span>
                  <Download className="w-3 h-3 text-[var(--color-muted)] ml-auto flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
