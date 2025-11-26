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

      // Load vehicles
      if (filingData.vehicleIds && filingData.vehicleIds.length > 0) {
        try {
          const vehicleData = await Promise.all(
            filingData.vehicleIds.map(id => getVehicle(id))
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
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-navy)] hover:underline mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)]">
              Filing Details
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} w-fit`}>
              <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.iconColor}`} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Status Alert */}
          {filing.status === 'completed' && filing.finalSchedule1Url && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-green-800 mb-1">Your Schedule 1 is Ready!</h2>
                  <p className="text-xs text-green-700 mb-3">Your Form 2290 filing has been completed.</p>
                  <a
                    href={filing.finalSchedule1Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Schedule 1 PDF
                  </a>
                </div>
              </div>
            </div>
          )}

          {filing.status === 'processing' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-amber-800 mb-1">Processing Your Filing</h2>
                  <p className="text-xs text-amber-700">We are currently preparing your Form 2290 return. You'll be notified when it's ready.</p>
                </div>
              </div>
            </div>
          )}

          {filing.status === 'action_required' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-orange-800 mb-1">Action Required</h2>
                  <p className="text-xs text-orange-700 mb-2">We need additional information to process your filing.</p>
                  {filing.agentNotes && (
                    <div className="mt-3 p-3 bg-white rounded border border-orange-100">
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{filing.agentNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-4">
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
                  <span className="text-[var(--color-muted)] min-w-[120px]">Tax Year:</span>
                  <span className="text-[var(--color-text)] font-medium">{filing.taxYear}</span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[var(--color-muted)] min-w-[120px]">First Used:</span>
                  <span className="text-[var(--color-text)] font-medium">{filing.firstUsedMonth}</span>
                </div>
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

          {/* Vehicles */}
          <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-[var(--color-navy)]" />
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Vehicles ({vehicles.length})
              </h2>
            </div>
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
                  </div>
                </div>
              ))}
            </div>
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
      </div>
    </ProtectedRoute>
  );
}
