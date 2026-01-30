'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { updateFiling, subscribeToFiling, getBusiness, getVehicle } from '@/lib/db';
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
  Check,
  Send,
  UploadCloud
} from 'lucide-react';
import { REQUIRED_ACTIONS } from '@/lib/rejectionConfig';

export default function FilingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [filing, setFiling] = useState(null);
  const [business, setBusiness] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  // Response State
  const [responseText, setResponseText] = useState('');
  const [responseFile, setResponseFile] = useState(null);
  const [submittingResponse, setSubmittingResponse] = useState(false);

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

  const handleResponseSubmit = async () => {
    if (!responseText && !responseFile) {
      alert('Please provide a response or upload a file.');
      return;
    }

    setSubmittingResponse(true);
    try {
      let fileUrl = null;

      // Upload file if selected
      if (responseFile) {
        const idToken = await user.getIdToken(true);
        const formData = new FormData();
        formData.append('file', responseFile);
        formData.append('filingId', params.id);
        formData.append('type', 'rejection_response');

        const uploadResponse = await fetch('/api/upload-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) throw new Error('File upload failed');
        const result = await uploadResponse.json();
        fileUrl = result.url;
      }

      // Update filing
      await updateFiling(params.id, {
        status: 'processing', // Push back to processing
        customerResponse: {
          text: responseText,
          fileUrl: fileUrl,
          submittedAt: new Date().toISOString()
        },
        // Clear rejection flags so it doesn't stay in action_required
        // We keep the history in customerResponse
      });

      setResponseText('');
      setResponseFile(null);
      alert('Response submitted successfully! We will review your update.');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setSubmittingResponse(false);
    }
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-orange)] mx-auto"></div>
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
            <Link href="/dashboard" className="text-[var(--color-orange)] hover:underline text-sm">
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Compact Header with Status */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Filing Details</h1>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
              <StatusIcon className={`w-3 h-3 ${statusConfig.iconColor}`} />
              {statusConfig.label}
            </span>
            {(filing.status === 'submitted' || filing.status === 'processing') && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
                <span className="font-mono font-semibold">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Compact Status Banner */}
        <div className={`mb-4 rounded-lg border-2 p-4 flex items-start gap-3 ${filing.status === 'action_required'
          ? 'bg-orange-50 border-orange-200'
          : filing.status === 'completed'
            ? 'bg-green-50 border-green-200'
            : 'bg-blue-50 border-blue-200'
          }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${filing.status === 'action_required'
            ? 'bg-orange-100 text-orange-600'
            : filing.status === 'completed'
              ? 'bg-green-100 text-green-600'
              : 'bg-blue-100 text-blue-600'
            }`}>
            {filing.status === 'action_required' ? (
              <AlertCircle className="w-5 h-5" />
            ) : filing.status === 'completed' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-base font-bold mb-1 ${filing.status === 'action_required' ? 'text-orange-900' : filing.status === 'completed' ? 'text-green-900' : 'text-blue-900'
              }`}>
              {filing.status === 'action_required'
                ? 'Action Required'
                : filing.status === 'completed'
                  ? (() => {
                    if (filing.filingType === 'amendment') {
                      if (filing.amendmentType === 'vin_correction') return 'VIN Correction Accepted';
                      if (filing.amendmentType === 'weight_increase') return 'Weight Increase Amendment Accepted';
                      if (filing.amendmentType === 'mileage_exceeded') return 'Mileage Amendment Accepted';
                      return 'Amendment Accepted';
                    }
                    if (filing.filingType === 'refund') return 'Refund Claim Submitted';
                    return 'Filing Accepted';
                  })()
                  : (() => {
                    if (filing.filingType === 'amendment') {
                      if (filing.amendmentType === 'vin_correction') return 'Processing VIN Correction';
                      if (filing.amendmentType === 'weight_increase') return 'Processing Weight Increase Amendment';
                      if (filing.amendmentType === 'mileage_exceeded') return 'Processing Mileage Amendment';
                      return 'Processing Amendment';
                    }
                    if (filing.filingType === 'refund') return 'Processing Refund Claim';
                    return 'Processing Filing';
                  })()}
            </h2>
            <p className={`text-sm ${filing.status === 'action_required' ? 'text-orange-800' : filing.status === 'completed' ? 'text-green-800' : 'text-blue-800'
              }`}>
              {filing.status === 'action_required'
                ? 'We need additional information. Please check the notes below.'
                : filing.status === 'completed'
                  ? (filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction'
                    ? 'Your VIN correction has been accepted. Schedule 1 is ready.'
                    : filing.filingType === 'amendment'
                      ? 'Your amendment has been accepted. Schedule 1 is ready.'
                      : filing.filingType === 'refund'
                        ? 'Refund claim submitted. You will receive updates.'
                        : 'Your Form 2290 has been accepted. Schedule 1 is ready.')
                  : (filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction'
                    ? 'Processing your VIN correction. No additional tax due.'
                    : filing.filingType === 'amendment'
                      ? 'Processing your amendment filing.'
                      : filing.filingType === 'refund'
                        ? 'Processing your refund claim.'
                        : 'Preparing your return for IRS submission.')}
            </p>
            {filing.status === 'completed' && filing.finalSchedule1Url && (
              <a
                href={filing.finalSchedule1Url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Download Schedule 1
              </a>
            )}
          </div>
        </div>

        {/* Main Content Grid - Compact Layout */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Column: Main Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Action Required Panel */}
            {filing.status === 'action_required' && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-orange-900 mb-1">Action Required</h3>
                    {filing.rejectionReasonLabel && (
                      <p className="text-xs font-semibold text-orange-800 mb-1">
                        {filing.rejectionReasonLabel}
                        {filing.rejectionCode && <span className="font-mono ml-1 opacity-75">({filing.rejectionCode})</span>}
                      </p>
                    )}
                    <p className="text-xs text-orange-800 whitespace-pre-wrap">
                      {filing.agentNotes || 'Please review the issues and provide the requested information.'}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-orange-100 p-3 space-y-2">
                  {filing.requiredAction === 'upload_document' && (
                    <input
                      type="file"
                      onChange={(e) => setResponseFile(e.target.files[0])}
                      className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700"
                    />
                  )}
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder={filing.requiredAction === 'correct_info' ? 'Enter correct information...' : 'Type your response...'}
                    rows={2}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleResponseSubmit}
                    disabled={submittingResponse}
                    className="w-full flex items-center justify-center gap-1.5 bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    {submittingResponse ? 'Sending...' : 'Submit Response'}
                  </button>
                </div>
              </div>
            )}

            {/* Business & Filing Details - Combined */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Business Information */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">Business</h2>
                </div>
                {business && (
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Name:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-900 truncate">{business.businessName}</span>
                        <button onClick={() => handleCopy(business.businessName, 'businessName')} className="text-slate-400 hover:text-blue-600">
                          {copied === 'businessName' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">EIN:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-semibold text-slate-900">{business.ein}</span>
                        <button onClick={() => handleCopy(business.ein, 'ein')} className="text-slate-400 hover:text-blue-600">
                          {copied === 'ein' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    {business.phone && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-medium text-slate-900">{business.phone}</span>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Address:</span>
                        <span className="text-slate-700 text-right">{business.address}</span>
                      </div>
                    )}
                    {business.signingAuthorityName && (
                      <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Signing Authority:</span>
                        <span className="font-medium text-slate-900 text-right">
                          {business.signingAuthorityName}
                          {business.signingAuthorityTitle && <span className="text-slate-600"> ({business.signingAuthorityTitle})</span>}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Filing Details with Payment Info */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-900">Filing</h2>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-semibold text-slate-900">
                      {filing.filingType === 'amendment' && filing.amendmentType
                        ? (filing.amendmentType === 'vin_correction' ? 'VIN Correction'
                          : filing.amendmentType === 'weight_increase' ? 'Weight Increase'
                            : filing.amendmentType === 'mileage_exceeded' ? 'Mileage Exceeded'
                              : 'Amendment')
                        : filing.filingType === 'refund' ? 'Refund (Form 8849)'
                          : 'Standard Filing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Tax Year:</span>
                    <span className="font-semibold text-slate-900">{filing.taxYear}</span>
                  </div>
                  {filing.filingType !== 'amendment' && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">First Used:</span>
                      <span className="font-medium text-slate-900">{filing.firstUsedMonth}</span>
                    </div>
                  )}
                  {filing.createdAt && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Submitted:</span>
                      <span className="text-slate-700">{filing.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}
                  {/* Payment Summary for VIN Corrections - Integrated */}
                  {filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction' && (
                    <>
                      <div className="pt-2 mt-2 border-t-2 border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">IRS Tax:</span>
                          <span className="font-bold text-blue-900">$0.00</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Service Fee:</span>
                          <span className="font-bold text-orange-900">
                            ${(filing.pricing?.serviceFee || 10.00).toFixed(2)}
                          </span>
                        </div>
                        {filing.pricing?.salesTax > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500">Sales Tax:</span>
                            <span className="font-medium text-slate-700">
                              ${(filing.pricing?.salesTax || 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                          <span className="text-slate-500 font-semibold">Total Paid:</span>
                          <span className="font-bold text-orange-900">
                            ${((filing.pricing?.serviceFee || 10.00) + (filing.pricing?.salesTax || 0)).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-emerald-700 pt-1">✓ No IRS payment required</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Amendment Details Section */}
            {filing.filingType === 'amendment' && filing.amendmentType && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  {filing.amendmentType === 'vin_correction' && <FileText className="w-4 h-4 text-blue-600" />}
                  {filing.amendmentType === 'weight_increase' && <Truck className="w-4 h-4 text-orange-600" />}
                  {filing.amendmentType === 'mileage_exceeded' && <Clock className="w-4 h-4 text-purple-600" />}
                  <h2 className="text-sm font-bold text-slate-900">Amendment Details</h2>
                </div>

                {filing.amendmentType === 'vin_correction' && (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-xs font-semibold text-red-700 mb-1.5">Original VIN (Incorrect)</div>
                        <div className="font-mono font-bold text-red-900 text-sm line-through break-all">
                          {filing.amendmentDetails?.vinCorrection?.originalVIN || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-xs font-semibold text-green-700 mb-1.5">Corrected VIN</div>
                        <div className="font-mono font-bold text-green-900 text-sm break-all">
                          {filing.amendmentDetails?.vinCorrection?.correctedVIN || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-800">VIN correction completed - No additional tax due</div>
                    </div>
                  </div>
                )}

                {filing.amendmentType === 'weight_increase' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-slate-600 mb-1">Original</div>
                        <div className="text-xl font-bold text-slate-900">
                          {filing.amendmentDetails?.weightIncrease?.originalWeightCategory || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center text-lg text-orange-600">→</div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                        <div className="text-xs text-orange-700 mb-1">New</div>
                        <div className="text-xl font-bold text-orange-900">
                          {filing.amendmentDetails?.weightIncrease?.newWeightCategory || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Month:</span>
                        <span className="font-semibold ml-1">{filing.amendmentDetails?.weightIncrease?.increaseMonth || 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">Tax Paid:</span>
                        <span className="font-bold text-orange-900 ml-1">
                          ${filing.amendmentDetails?.weightIncrease?.additionalTaxDue?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {filing.amendmentType === 'mileage_exceeded' && (
                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500">Type:</span>
                        <span className="font-semibold ml-1">
                          {filing.amendmentDetails?.mileageExceeded?.isAgriculturalVehicle ? 'Agricultural' : 'Standard'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Month:</span>
                        <span className="font-semibold ml-1">{filing.amendmentDetails?.mileageExceeded?.exceededMonth || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Limit:</span>
                        <span className="font-semibold ml-1">
                          {filing.amendmentDetails?.mileageExceeded?.originalMileageLimit?.toLocaleString() || 'N/A'} mi
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Actual:</span>
                        <span className="font-bold text-purple-900 ml-1">
                          {filing.amendmentDetails?.mileageExceeded?.actualMileageUsed?.toLocaleString() || 'N/A'} mi
                        </span>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded p-2 text-xs text-purple-800">
                      ℹ️ Full HVUT tax applied
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vehicles - Only show if NOT VIN correction (VINs already shown above) */}
            {!(filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction') && vehicles.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">Vehicles ({vehicles.length})</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">VIN:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-semibold text-slate-900 break-all">{vehicle.vin}</span>
                            <button onClick={() => handleCopy(vehicle.vin, `vin-${vehicle.id}`)} className="text-slate-400 hover:text-blue-600">
                              {copied === `vin-${vehicle.id}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">Weight:</span>
                          <span className="font-semibold text-slate-900">{vehicle.grossWeightCategory}</span>
                        </div>
                        {vehicle.isSuspended && (
                          <div className="flex items-center gap-1 pt-1 border-t border-slate-200">
                            <AlertCircle className="w-3 h-3 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-600">Suspended</span>
                          </div>
                        )}
                        {/* Show amendment-specific info */}
                        {filing.filingType === 'amendment' && filing.amendmentType === 'weight_increase' &&
                          filing.amendmentDetails?.weightIncrease?.vehicleId === vehicle.id && (
                            <div className="pt-1.5 mt-1.5 border-t border-orange-200 bg-orange-50 rounded p-2 text-xs">
                              <span className="font-semibold text-orange-700">
                                {filing.amendmentDetails.weightIncrease.originalWeightCategory} → {filing.amendmentDetails.weightIncrease.newWeightCategory}
                              </span>
                            </div>
                          )}
                        {filing.filingType === 'amendment' && filing.amendmentType === 'mileage_exceeded' &&
                          filing.amendmentDetails?.mileageExceeded?.vehicleId === vehicle.id && (
                            <div className="pt-1.5 mt-1.5 border-t border-purple-200 bg-purple-50 rounded p-2 text-xs">
                              <span className="font-semibold text-purple-700">
                                {filing.amendmentDetails.mileageExceeded.actualMileageUsed?.toLocaleString()} mi (Exceeded)
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {filing.inputDocuments && filing.inputDocuments.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-900">Documents ({filing.inputDocuments.length})</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {filing.inputDocuments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span className="font-medium text-slate-900 flex-1">Document {index + 1}</span>
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm sticky top-4">
              <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center justify-between">
                <span>Progress</span>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${filing.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {filing.status === 'completed' ? '100%' : 'LIVE'}
                </span>
              </h3>
              <div className="relative flex flex-col gap-4 pl-2">
                <div className={`absolute left-[11px] top-2 bottom-2 w-0.5 rounded-full ${
                  filing.status === 'completed' ? 'bg-green-400' : 
                  filing.status === 'action_required' ? 'bg-orange-400' : 'bg-blue-400'
                }`}></div>
                {['Submitted', 'Processing', 'IRS Acceptance'].map((step, idx) => {
                  const isCompleted = filing.status === 'completed' || (idx === 0 && filing.status !== 'submitted');
                  const isActive = idx === 1 && (filing.status === 'processing' || filing.status === 'action_required');
                  return (
                    <div key={idx} className="flex items-center gap-3 relative">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm ring-2 ring-white z-10 ${
                        isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-orange-500 text-white' : idx === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted ? <Check className="w-3 h-3" /> : isActive ? <AlertCircle className="w-3 h-3" /> : idx === 0 ? <Check className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className={`text-xs font-semibold block ${isCompleted ? 'text-green-900' : isActive ? 'text-orange-900' : idx === 0 ? 'text-blue-900' : 'text-gray-500'}`}>
                          {step}
                        </span>
                        <span className="text-xs text-slate-600">
                          {idx === 0 ? 'Filing received' : idx === 1 ? (filing.status === 'completed' ? 'Validation complete' : filing.status === 'action_required' ? 'Attention needed' : 'Validating...') : (filing.status === 'completed' ? 'Accepted' : 'Pending')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
