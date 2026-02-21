'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToAgentQueue } from '@/lib/db';
import { getAmendmentTypeConfig } from '@/lib/amendmentHelpers';
import {
  ShieldCheck,
  Bell,
  Check,
  Play,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Building2,
  Truck,
  ArrowRight
} from 'lucide-react';

export default function AgentQueuePage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [activeTab, setActiveTab] = useState('eforms');
  const [loading, setLoading] = useState(true);
  const [alarm, setAlarm] = useState(null);

  useEffect(() => {
    if (filings.length > 0) {
      const newHighPriority = filings.find(f => f.priority === 'high' && f.status === 'submitted');
      if (newHighPriority && (!alarm || alarm.id !== newHighPriority.id)) {
        setAlarm(newHighPriority);
        // Reset alarm after 10 seconds
        setTimeout(() => setAlarm(null), 10000);
      }
    }
  }, [filings, alarm]);

  useEffect(() => {
    if (!userData || userData.role !== 'agent') {
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log('Setting up real-time agent queue subscription...');

    // Subscribe to real-time queue updates
    const unsubscribe = subscribeToAgentQueue((queueFilings) => {
      console.log('Agent queue updated:', queueFilings.length, 'filings');
      setFilings(queueFilings);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up agent queue subscription');
      unsubscribe();
    };
  }, [userData]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'submitted':
        return {
          label: 'Submitted',
          icon: FileText,
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
        };
      case 'processing':
        return {
          label: 'Processing',
          icon: Clock,
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
        };
      case 'action_required':
        return {
          label: 'Action Required',
          icon: AlertCircle,
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
        };
      default:
        return {
          label: status || 'Unknown',
          icon: FileText,
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
        };
    }
  };

  const filteredFilings = filings.filter(f => {
    if (activeTab === 'mcs') {
      // Show if standalone MCS filing OR has MCS upsell data
      // And ensure it is not fully completed
      const isMcsRequest = f.filingType === 'mcs150' || (f.mcs150Status && f.mcs150Status !== 'completed');
      return isMcsRequest && f.mcs150Status !== 'completed';
    } else {
      // E-Forms: Show everything NOT standalone MCS-150
      return f.filingType !== 'mcs150';
    }
  });

  return (
    <ProtectedRoute requiredRole="agent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4">
          <Link
            href="/agent/dashboard"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-navy)] inline-flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-2">
            Active Queue
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage Form 2290 filing requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)] mb-6">
          <button
            onClick={() => setActiveTab('eforms')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'eforms'
              ? 'border-[var(--color-navy)] text-[var(--color-navy)]'
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              E-Form Requests
            </div>
          </button>
          <button
            onClick={() => setActiveTab('mcs')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'mcs'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              MCS Requests
            </div>
          </button>
        </div>

        {/* Alarm Notification */}
        {alarm && (
          <div className="mb-6 bg-orange-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <div>
                <div className="font-bold text-lg">URGENT: New UCR Filing</div>
                <div className="text-sm opacity-90">{alarm.business?.businessName || 'New Customer'} - ${alarm.total?.toLocaleString() || '0'}</div>
              </div>
            </div>
            <button
              onClick={() => {
                const { updateFiling } = require('@/lib/db');
                updateFiling(alarm.id, { status: 'processing', priority: 'normal' });
                setAlarm(null);
              }}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold hover:bg-orange-50"
            >
              Take Action
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-sm text-[var(--color-muted)]">Loading queue...</p>
          </div>
        ) : filteredFilings.length === 0 ? (
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-2">
              No {activeTab === 'mcs' ? 'MCS requests' : 'filings'} in queue
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              All {activeTab === 'mcs' ? 'requests' : 'filings'} have been processed.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-page-alt)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                      {activeTab === 'mcs' ? 'Details' : 'Vehicles'}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {filteredFilings.map((filing) => {
                    const statusConfig = activeTab === 'mcs'
                      ? (filing.mcs150Status === 'submitted' ? { label: 'New Request', icon: AlertCircle, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' } : getStatusConfig(filing.mcs150Status))
                      : getStatusConfig(filing.status);
                    const StatusIcon = statusConfig.icon;

                    // Get filing type config
                    const filingTypeConfig = activeTab === 'mcs'
                      ? { label: 'MCS-150', shortLabel: 'MCS', icon: <ShieldCheck className="w-3 h-3" />, color: 'blue' }
                      : (filing.filingType === 'amendment' && filing.amendmentType
                        ? getAmendmentTypeConfig(filing.amendmentType)
                        : filing.filingType === 'refund'
                          ? { label: 'Refund', shortLabel: 'Refund', icon: '💰', color: 'green' }
                          : { label: 'Standard', shortLabel: 'Standard', icon: '✓', color: 'blue' });

                    return (
                      <tr key={filing.id} className="hover:bg-[var(--color-page-alt)] transition">
                        <td className="px-4 py-3">
                          {filing.user ? (
                            <>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-[var(--color-text)] truncate">
                                    {filing.user.displayName || filing.user.email || 'Unknown User'}
                                  </div>
                                  {filing.user.email && filing.user.displayName && (
                                    <div className="text-xs text-[var(--color-muted)] truncate">
                                      {filing.user.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
                              <span className="text-sm text-[var(--color-muted)] italic">
                                Loading...
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {filing.business ? (
                            <>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-[var(--color-text)] truncate">
                                    {filing.business.businessName || 'Unnamed Business'}
                                  </div>
                                  {filing.business.ein && (
                                    <div className="text-xs text-[var(--color-muted)]">
                                      EIN: {filing.business.ein}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          ) : filing.businessId ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
                              <span className="text-sm text-[var(--color-muted)] italic">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0" />
                              <span className="text-sm text-[var(--color-muted)] italic">
                                Not set
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${filingTypeConfig.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                              filingTypeConfig.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                filingTypeConfig.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                  filingTypeConfig.color === 'green' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                              }`}>
                              {filingTypeConfig.icon} {filingTypeConfig.shortLabel}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {activeTab === 'mcs' ? (
                            <div className="flex flex-col items-center gap-1">
                              {filing.mcs150Pin ? (
                                <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                  PIN: {filing.mcs150Pin}
                                </span>
                              ) : filing.needPinService ? (
                                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  Needs Retrieval
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <Truck className="w-4 h-4 text-[var(--color-muted)]" />
                              <span className="text-sm font-medium text-[var(--color-text)]">
                                {filing.vehicleIds?.length || 0}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-[var(--color-text)]">
                            {filing.createdAt
                              ? filing.createdAt.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            {filing.status === 'submitted' && (
                              <button
                                onClick={async () => {
                                  const { updateFiling } = require('@/lib/db');
                                  await updateFiling(filing.id, { status: 'processing' });
                                  fetch('/api/email/filing-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filingId: filing.id, status: 'processing' }) }).catch(() => {});
                                }}
                                className="p-1 px-2 text-[10px] font-bold bg-amber-100 text-amber-700 rounded hover:bg-amber-200 flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" /> Process
                              </button>
                            )}
                            {filing.status === 'processing' && (
                              <button
                                onClick={async () => {
                                  const { updateFiling } = require('@/lib/db');
                                  await updateFiling(filing.id, {
                                    status: 'completed',
                                    certificateUrl: 'https://ucr.gov/mock/cert.pdf',
                                    completedAt: new Date().toISOString()
                                  });
                                  fetch('/api/email/filing-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filingId: filing.id, status: 'completed' }) }).catch(() => {});
                                }}
                                className="p-1 px-2 text-[10px] font-bold bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Complete
                              </button>
                            )}
                            <Link
                              href={`/agent/filings/${filing.id}`}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-orange)] transition"
                            >
                              View
                              <ArrowRight className="w-4 h-4" />
                            </Link>
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
    </ProtectedRoute >
  );
}
