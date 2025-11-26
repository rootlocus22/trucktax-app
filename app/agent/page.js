'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getAgentQueue } from '@/lib/db';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  User, 
  Building2,
  Truck,
  ArrowRight
} from 'lucide-react';

export default function AgentQueuePage() {
  const { userData } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      console.log('Loading agent queue...');
      console.log('User role:', userData?.role);
      const queue = await getAgentQueue();
      console.log('Agent queue loaded:', queue.length, 'filings');
      console.log('Queue data:', queue);
      setFilings(queue);
    } catch (error) {
      console.error('Error loading queue:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      // Show error to user
      alert(`Failed to load agent queue: ${error.message}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-sm text-[var(--color-muted)]">Loading queue...</p>
          </div>
        ) : filings.length === 0 ? (
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-2">
              No filings in queue
            </h2>
            <p className="text-sm text-[var(--color-muted)]">
              All filings have been processed.
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
                      Vehicles
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
                  {filings.map((filing) => {
                    const statusConfig = getStatusConfig(filing.status);
                    const StatusIcon = statusConfig.icon;
                    
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
                          <div className="flex items-center justify-center gap-1.5">
                            <Truck className="w-4 h-4 text-[var(--color-muted)]" />
                            <span className="text-sm font-medium text-[var(--color-text)]">
                              {filing.vehicleIds?.length || 0}
                            </span>
                          </div>
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
                          <Link
                            href={`/agent/filings/${filing.id}`}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-orange)] transition"
                          >
                            Work on this
                            <ArrowRight className="w-4 h-4" />
                          </Link>
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
    </ProtectedRoute>
  );
}
