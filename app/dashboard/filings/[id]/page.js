'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { updateFiling, subscribeToFiling, getBusiness, getVehicle } from '@/lib/db';
import { trackEvent } from '@/lib/analytics';
import DiscountedPrice from '@/components/DiscountedPrice';
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
  UploadCloud,
  Loader2,
  Lock
} from 'lucide-react';
import { REQUIRED_ACTIONS } from '@/lib/rejectionConfig';

export default function FilingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [unlockRedirecting, setUnlockRedirecting] = useState(false);
  const [verifyingUnlock, setVerifyingUnlock] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [verifiedSessionId, setVerifiedSessionId] = useState('');
  const [hasTrackedLockedPreview, setHasTrackedLockedPreview] = useState(false);

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
      const startTime = filing.createdAt
        ? (filing.createdAt.toDate ? filing.createdAt.toDate() : new Date(filing.createdAt)).getTime()
        : Date.now();

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

  const ucrUnlockPrice = Number(filing?.amountDueOnCertificateDownload ?? filing?.servicePrice ?? 79);
  const totalAmountOwed = Number(filing?.total || 0);

  // Under split-payment: amountPaid initially only covers government fee. 
  // Certificate is only paid when amountPaid is >= totalAmountOwed.
  const isUcrCertificatePaid = filing?.paymentStatus === 'paid'
    || Number(filing?.amountPaid || 0) >= totalAmountOwed;

  const isUcrCertificateLocked = filing?.filingType === 'ucr'
    && Boolean(filing?.certificateUrl)
    && !isUcrCertificatePaid;

  useEffect(() => {
    if (!filing?.id || !isUcrCertificateLocked || hasTrackedLockedPreview) return;
    trackEvent('ucr_certificate_locked_preview_seen', {
      filingId: filing.id,
      servicePrice: ucrUnlockPrice,
    });
    setHasTrackedLockedPreview(true);
  }, [filing?.id, isUcrCertificateLocked, hasTrackedLockedPreview, ucrUnlockPrice]);

  useEffect(() => {
    const success = searchParams?.get('pay_success');
    const sessionId = searchParams?.get('session_id');
    if (!user || !params?.id || success !== '1' || !sessionId || verifyingUnlock || verifiedSessionId === sessionId) return;

    setVerifyingUnlock(true);
    fetch('/api/stripe/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        trackEvent('ucr_certificate_unlock_paid', {
          filingId: params.id,
          amount: data.amount || ucrUnlockPrice,
        });
        setVerifiedSessionId(sessionId);
        setUnlockError('');
        setFiling((prev) => (prev ? { ...prev, paymentStatus: 'paid' } : prev));
        router.replace(`/dashboard/filings/${params.id}`, { scroll: false });
      })
      .catch((err) => {
        console.error('Unlock verification failed:', err);
        setUnlockError(err.message || 'Payment verification failed. Please refresh and try again.');
      })
      .finally(() => setVerifyingUnlock(false));
  }, [searchParams, user, params?.id, verifyingUnlock, verifiedSessionId, router]);

  const handlePayAndUnlockCertificate = async () => {
    if (!user || !filing?.certificateUrl || !params?.id) return;
    setUnlockRedirecting(true);
    setUnlockError('');
    try {
      trackEvent('ucr_certificate_unlock_checkout_started', {
        filingId: params.id,
        amount: ucrUnlockPrice,
      });
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'ucr_certificate_unlock',
          userId: user.uid,
          filingId: params.id,
          amountCents: Math.round(ucrUnlockPrice * 100),
          planName: 'UCR Certificate Download Unlock',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.url) throw new Error('No checkout URL returned');
      window.location.href = data.url;
    } catch (err) {
      console.error('Unlock checkout error:', err);
      setUnlockError(err.message || 'Unable to start checkout. Please try again.');
      setUnlockRedirecting(false);
    }
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
                  ? 'Filing Accepted'
                  : 'Processing Filing'}
            </h2>
            <p className={`text-sm ${filing.status === 'action_required' ? 'text-orange-800' : filing.status === 'completed' ? 'text-green-800' : 'text-blue-800'
              }`}>
              {filing.status === 'action_required'
                ? 'We need additional information. Please check the notes below.'
                : filing.status === 'completed'
                  ? (filing.filingType === 'ucr' && isUcrCertificateLocked
                    ? 'Your filing is complete. Preview your certificate below and unlock download when ready.'
                    : 'Your filing has been accepted and documents are available below.')
                  : 'Sit back and relax. We are preparing your return for IRS submission.'}
            </p>
            {filing.status === 'completed' && filing.filingType === 'ucr' && filing.certificateUrl ? (
              isUcrCertificateLocked ? (
                <button
                  type="button"
                  onClick={handlePayAndUnlockCertificate}
                  disabled={unlockRedirecting || verifyingUnlock}
                  className="inline-flex items-center gap-1.5 mt-2 bg-[var(--color-navy)] text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-60"
                >
                  {unlockRedirecting || verifyingUnlock ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {unlockRedirecting || verifyingUnlock ? 'Redirecting...' : ucrUnlockPrice === 79 ? <>Pay <span className="line-through text-white/70">$99</span> $79 & Download</> : `Pay $${ucrUnlockPrice.toFixed(2)} & Download`}
                </button>
              ) : (
                <a
                  href={filing.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                >
                  <Download className="w-4 h-4" />
                  Download UCR Certificate
                </a>
              )
            ) : filing.status === 'completed' && filing.finalSchedule1Url && (
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


            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {/* Business Information */}
              <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-[var(--color-orange)]" />
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">Business Information</h2>
                </div>
                {filing.filingType === 'ucr' ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[120px]">Legal name:</span>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                        <span className="text-[var(--color-text)] font-medium text-right">{filing.legalName || '—'}</span>
                        {filing.legalName && (
                          <button onClick={() => handleCopy(filing.legalName, 'legalName')} className="flex-shrink-0 text-[var(--color-muted)] hover:text-[var(--color-orange)]" title="Copy">
                            {copied === 'legalName' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {(filing.dba != null && filing.dba !== '') && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[var(--color-muted)] min-w-[120px]">DBA:</span>
                        <span className="text-[var(--color-text)] font-medium">{filing.dba}</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[120px]">USDOT:</span>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                        <span className="text-[var(--color-text)] font-medium font-mono">{filing.dotNumber || '—'}</span>
                        {filing.dotNumber && (
                          <button onClick={() => handleCopy(filing.dotNumber, 'dotNumber')} className="flex-shrink-0 text-[var(--color-muted)] hover:text-[var(--color-orange)]" title="Copy">
                            {copied === 'dotNumber' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                    {filing.state && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[var(--color-muted)] min-w-[120px]">State:</span>
                        <span className="text-[var(--color-text)] font-medium">{filing.state}</span>
                      </div>
                    )}
                    {filing.registrantName && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[var(--color-muted)] min-w-[120px]">Registrant:</span>
                        <span className="text-[var(--color-text)] font-medium">{filing.registrantName}</span>
                      </div>
                    )}
                    {filing.email && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[var(--color-muted)] min-w-[120px]">Email:</span>
                        <span className="text-[var(--color-text)] truncate text-right">{filing.email}</span>
                      </div>
                    )}
                    {filing.phone && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[var(--color-muted)] min-w-[120px]">Phone:</span>
                        <span className="text-[var(--color-text)] font-medium">{filing.phone}</span>
                      </div>
                    )}
                  </div>
                ) : business ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[100px]">Name:</span>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-[var(--color-text)] font-medium truncate">{business.businessName}</span>
                        <button onClick={() => handleCopy(business.businessName, 'businessName')} className="flex-shrink-0 text-[var(--color-muted)] hover:text-[var(--color-orange)] transition" title="Copy">
                          {copied === 'businessName' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[100px]">EIN:</span>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-[var(--color-text)] font-medium font-mono">{business.ein}</span>
                        <button onClick={() => handleCopy(business.ein, 'ein')} className="flex-shrink-0 text-[var(--color-muted)] hover:text-[var(--color-orange)] transition" title="Copy">
                          {copied === 'ein' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
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
                ) : (
                  <p className="text-sm text-[var(--color-muted)]">No business information for this filing.</p>
                )}
              </div>

              {/* Filing Details */}
              <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-[var(--color-orange)]" />
                  <h2 className="text-sm font-semibold text-[var(--color-text)]">Filing Details</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[var(--color-muted)] min-w-[120px]">Filing Type:</span>
                    <span className="text-[var(--color-text)] font-medium">
                      {filing.filingType === 'ucr' ? 'UCR Registration' : filing.filingType === 'amendment' && filing.amendmentType
                        ? (filing.amendmentType === 'vin_correction' ? 'VIN Correction Amendment' : filing.amendmentType === 'weight_increase' ? 'Weight Increase Amendment' : filing.amendmentType === 'mileage_exceeded' ? 'Mileage Exceeded Amendment' : 'Amendment')
                        : filing.filingType === 'refund' ? 'Refund (Form 8849)' : 'Standard Filing'}
                    </span>
                  </div>
                  {filing.filingType === 'ucr' ? (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[var(--color-muted)] min-w-[120px]">Filing Year:</span>
                        <span className="text-[var(--color-text)] font-medium">{filing.filingYear ?? 2026}</span>
                      </div>
                      {filing.state && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[var(--color-muted)] min-w-[120px]">State:</span>
                          <span className="text-[var(--color-text)] font-medium">{filing.state}</span>
                        </div>
                      )}
                      {(filing.plan != null && filing.plan !== '') && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[var(--color-muted)] min-w-[120px]">Plan:</span>
                          <span className="text-[var(--color-text)] font-medium capitalize">{String(filing.plan).replace(/_/g, ' ')}</span>
                        </div>
                      )}
                      {(filing.ucrFee != null || filing.servicePrice != null) && (
                        <>
                          {filing.ucrFee != null && (
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[var(--color-muted)] min-w-[120px]">UCR Govt Fee:</span>
                              <span className="text-[var(--color-text)] font-medium">${Number(filing.ucrFee).toLocaleString()}</span>
                            </div>
                          )}
                          {filing.servicePrice != null && (
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[var(--color-muted)] min-w-[120px]">Service fee:</span>
                              <span className="text-[var(--color-text)] font-medium">{Number(filing.servicePrice) === 79 ? <DiscountedPrice price={79} originalPrice={99} /> : `$${Number(filing.servicePrice).toLocaleString()}`}</span>
                            </div>
                          )}
                          {filing.total != null && (
                            <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-100">
                              <span className="text-[var(--color-muted)] min-w-[120px]">Total filing cost:</span>
                              <span className="text-[var(--color-text)] font-bold">${Number(filing.total).toLocaleString()}</span>
                            </div>
                          )}
                          {(filing.amountPaid != null && filing.amountPaid > 0) && (
                            <div className="flex items-start justify-between gap-2 pt-1">
                              <span className="text-emerald-600 min-w-[120px] font-medium mt-1">Amount paid:</span>
                              <div className="text-right">
                                <span className="text-emerald-700 font-bold">${Number(filing.amountPaid).toLocaleString()}</span>
                                <div className="text-[10px] text-emerald-600/80">
                                  {filing.paymentStatus === 'partial' ? 'Govt Fee Only' : 'Fully Paid'}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[var(--color-muted)] min-w-[120px]">Tax Year:</span>
                        <span className="text-[var(--color-text)] font-medium">{filing.taxYear ?? '—'}</span>
                      </div>
                      {filing.filingType !== 'amendment' && (
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[var(--color-muted)] min-w-[120px]">First Used:</span>
                          <span className="text-[var(--color-text)] font-medium">{filing.firstUsedMonth ?? '—'}</span>
                        </div>
                      )}
                    </>
                  )}
                  {filing.createdAt && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[120px]">Submitted:</span>
                      <span className="text-[var(--color-text)]">
                        {(filing.createdAt?.toDate?.() || filing.createdAt).toLocaleDateString?.('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—'}
                      </span>
                    </div>
                  )}
                  {filing.updatedAt && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[120px]">Last Updated:</span>
                      <span className="text-[var(--color-text)]">
                        {(filing.updatedAt?.toDate?.() || filing.updatedAt).toLocaleDateString?.('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '—'}
                      </span>
                    </div>
                  )}
                  {/* Payment Summary for VIN Corrections - Integrated */}
                  {filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction' && (
                    <>
                      <div className="pt-2 mt-2 border-t border-[var(--color-border)] space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[var(--color-muted)] min-w-[120px]">IRS Tax:</span>
                          <span className="font-bold text-[var(--color-text)]">$0.00</span>
                        </div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[var(--color-muted)] min-w-[120px]">Service Fee:</span>
                          <span className="font-bold text-[var(--color-orange)]">
                            ${(filing.pricing?.serviceFee || 10.00).toFixed(2)}
                          </span>
                        </div>
                        {filing.pricing?.salesTax > 0 && (
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[var(--color-muted)] min-w-[120px]">Sales Tax:</span>
                            <span className="font-medium text-[var(--color-text)]">
                              ${(filing.pricing?.salesTax || 0).toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2 pt-1 border-t border-[var(--color-border)]">
                          <span className="text-[var(--color-muted)] font-semibold min-w-[120px]">Total Paid:</span>
                          <span className="font-bold text-[var(--color-orange)]">
                            ${((filing.pricing?.serviceFee || 10.00) + (filing.pricing?.salesTax || 0)).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-green-600 pt-1 font-medium">✓ No IRS payment required</div>
                      </div>
                    </>
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

            {/* Vehicles / Fleet (UCR uses power units) */}
            <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-[var(--color-orange)]" />
                <h2 className="text-sm font-semibold text-[var(--color-text)]">
                  {filing.filingType === 'ucr'
                    ? 'Fleet / Power Units'
                    : filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction'
                      ? 'VIN Information'
                      : `Vehicles (${vehicles.length})`}
                </h2>
              </div>

              {filing.filingType === 'ucr' ? (
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[var(--color-muted)] min-w-[120px]">Power units:</span>
                    <span className="text-[var(--color-text)] font-semibold">{filing.powerUnits != null ? Number(filing.powerUnits) : '—'}</span>
                  </div>
                  {filing.entityType != null && filing.entityType !== '' && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[var(--color-muted)] min-w-[120px]">Entity type:</span>
                      <span className="text-[var(--color-text)] font-medium capitalize">{String(filing.entityType).replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>
              ) : filing.filingType === 'amendment' && filing.amendmentType === 'vin_correction' ? (
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
                              className="flex-shrink-0 text-[var(--color-muted)] hover:text-[var(--color-orange)] transition"
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
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[var(--color-muted)]">Weight:</span>
                          <span className="font-semibold text-[var(--color-text)]">{vehicle.grossWeightCategory}</span>
                        </div>
                        {vehicle.isSuspended && (
                          <div className="flex items-center gap-1 pt-1 border-t border-[var(--color-border)]">
                            <AlertCircle className="w-3 h-3 text-orange-600" />
                            <span className="text-xs font-semibold text-orange-600">Suspended</span>
                          </div>
                        )}
                        {/* Show amendment-specific info */}
                        {filing.filingType === 'amendment' && filing.amendmentType === 'weight_increase' &&
                          filing.amendmentDetails?.weightIncrease?.vehicleId === vehicle.id && (
                            <div className="pt-1.5 mt-1.5 border-t border-[var(--color-border)] bg-orange-50 rounded p-2 text-xs">
                              <span className="font-semibold text-orange-700">
                                {filing.amendmentDetails.weightIncrease.originalWeightCategory} → {filing.amendmentDetails.weightIncrease.newWeightCategory}
                              </span>
                            </div>
                          )}
                        {filing.filingType === 'amendment' && filing.amendmentType === 'mileage_exceeded' &&
                          filing.amendmentDetails?.mileageExceeded?.vehicleId === vehicle.id && (
                            <div className="pt-1.5 mt-1.5 border-t border-[var(--color-border)] bg-purple-50 rounded p-2 text-xs">
                              <span className="font-semibold text-purple-700">
                                {filing.amendmentDetails.mileageExceeded.actualMileageUsed?.toLocaleString()} mi (Exceeded)
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[var(--color-muted)] italic">No vehicles</div>
              )}
            </div>

            {/* UCR Certificate Preview and Unlock */}
            {filing.filingType === 'ucr' && filing.certificateUrl && (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900">UCR Certificate</h2>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${isUcrCertificateLocked ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {isUcrCertificateLocked ? 'Preview locked' : 'Unlocked'}
                  </span>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 h-[420px]">
                  <iframe
                    src={`${filing.certificateUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="UCR Certificate Preview"
                    className="w-full h-full"
                  />
                  {isUcrCertificateLocked && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/35 to-white/95 backdrop-blur-[2px]" />
                  )}
                </div>

                <div className="mt-3">
                  {isUcrCertificateLocked ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700">
                        We file first to earn your trust. Your certificate is ready — unlock full-quality download for {ucrUnlockPrice === 79 ? <strong><span className="text-slate-400 line-through">$99</span> <span className="text-[var(--color-orange)]">$79</span></strong> : <strong>${ucrUnlockPrice.toFixed(2)}</strong>}.
                      </p>
                      <button
                        type="button"
                        onClick={handlePayAndUnlockCertificate}
                        disabled={unlockRedirecting || verifyingUnlock}
                        className="inline-flex items-center gap-2 bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-60"
                      >
                        {unlockRedirecting || verifyingUnlock ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        {unlockRedirecting || verifyingUnlock ? 'Redirecting to secure checkout...' : ucrUnlockPrice === 79 ? <>Pay <span className="line-through text-slate-400">$99</span> $79 & Download</> : `Pay $${ucrUnlockPrice.toFixed(2)} & Download`}
                      </button>
                    </div>
                  ) : (
                    <a
                      href={filing.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      Download UCR Certificate
                    </a>
                  )}
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
            {unlockError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                {unlockError}
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
                <div className={`absolute left-[11px] top-2 bottom-2 w-0.5 rounded-full ${filing.status === 'completed' ? 'bg-green-400' :
                  filing.status === 'action_required' ? 'bg-orange-400' : 'bg-blue-400'
                  }`}></div>
                {['Submitted', 'Processing', 'IRS Acceptance'].map((step, idx) => {
                  const isCompleted = filing.status === 'completed' || (idx === 0 && filing.status !== 'submitted');
                  const isActive = idx === 1 && (filing.status === 'processing' || filing.status === 'action_required');
                  return (
                    <div key={idx} className="flex items-center gap-3 relative">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm ring-2 ring-white z-10 ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-orange-500 text-white' : idx === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
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
      </div >
    </ProtectedRoute >
  );
}
