'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToUserFilings } from '@/lib/db';
import { subscribeToDraftFilings } from '@/lib/draftHelpers';
import { getIncompleteFilings, formatIncompleteFiling } from '@/lib/filingIntelligence';
import {
  Upload,
  Edit,
  FileText,
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
  CreditCard,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [draftFilings, setDraftFilings] = useState([]);
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
      action_required: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, label: 'Action Required', dot: 'bg-orange-500' },
      completed: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Completed', dot: 'bg-emerald-500' }
    };
    return configs[status] || configs.submitted;
  };

  const stats = {
    total: filings.length,
    completed: filings.filter(f => f.status === 'completed').length,
    processing: filings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: filings.filter(f => f.status === 'action_required').length,
    totalVehicles: filings.reduce((sum, f) => sum + (f.vehicleIds?.length || 0), 0),
  };

  const incomplete = getIncompleteFilings(filings);
  const activeDrafts = draftFilings.filter(d => d.status === 'draft');
  const allIncompleteFilings = [
    ...activeDrafts.map(d => ({ ...d, isDraft: true })),
    ...incomplete.all.filter(f => f.status !== 'action_required')
  ];

  const hasFilings = filings.length > 0;
  const hasIncomplete = allIncompleteFilings.length > 0;

  return (
    <ProtectedRoute>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Dashboard</h1>
            <p className="text-sm text-[var(--color-muted)] mt-0.5">{userData?.displayName || user?.email?.split('@')[0] || 'Welcome'}</p>
          </div>
          <div className="flex items-center gap-3">
            {hasFilings && (
              <>
                <button className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
                  <Search className="w-4 h-4 text-slate-600" />
                </button>
                <button className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors">
                  <Filter className="w-4 h-4 text-slate-600" />
                </button>
                <Link
                  href="/dashboard/new-filing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-navy)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-navy-soft)] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Filing
                </Link>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--color-navy)]/10 border-t-[var(--color-navy)] rounded-full animate-spin"></div>
              <p className="text-sm text-[var(--color-muted)]">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
            {/* Main Content Area - Left Side */}
            <div className="col-span-12 xl:col-span-8 flex flex-col gap-4 overflow-hidden">
              {/* Stats Row - Compact */}
              {hasFilings && (
                <div className="grid grid-cols-4 gap-3 flex-shrink-0">
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
                      <div key={idx} className={`bg-white border rounded-xl p-4 ${colors[stat.color]}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Icon className="w-4 h-4 opacity-60" />
                        </div>
                        <div className="text-2xl font-bold mb-0.5">{stat.value}</div>
                        <div className="text-xs font-medium opacity-70">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Incomplete Filings - Compact Banner */}
              {hasIncomplete && (
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[var(--color-text)]">Continue Filing</h3>
                      <p className="text-xs text-[var(--color-muted)]">{allIncompleteFilings.length} in progress</p>
                    </div>
                    <Link href="/dashboard/filings" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {allIncompleteFilings.slice(0, 2).map(filing => {
                      const formatted = formatIncompleteFiling(filing) || {
                        id: filing.id || filing.draftId,
                        description: filing.workflowType === 'upload' ? 'Schedule 1 Upload' : (filing.filingType || 'Standard Filing'),
                        taxYear: filing.taxYear || filing.filingData?.taxYear || 'Unknown',
                        progress: filing.step === 3 ? 75 : filing.step === 2 ? 50 : 25,
                      };
                      const resumeUrl = filing.isDraft || filing.status === 'draft'
                        ? filing.workflowType === 'upload' 
                          ? `/dashboard/upload-schedule1?draft=${filing.id || filing.draftId}`
                          : `/dashboard/new-filing?draft=${filing.id || filing.draftId}`
                        : `/dashboard/filings/${filing.id}`;
                      return (
                        <Link
                          key={filing.id || filing.draftId}
                          href={resumeUrl}
                          className="bg-white border border-blue-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-[var(--color-text)] truncate">{formatted.description}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">{formatted.taxYear}</span>
                          </div>
                          <div className="h-1 bg-blue-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${formatted.progress}%` }} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State - Compact */}
              {!hasFilings && !hasIncomplete && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Start Your First Filing</h2>
                    <p className="text-sm text-[var(--color-muted)] mb-6">Choose your preferred method to file Form 2290</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/dashboard/upload-schedule1"
                        className="group bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                          <Upload className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">Upload PDF</h3>
                        <p className="text-xs text-[var(--color-muted)]">AI extraction</p>
                      </Link>
                      <Link
                        href="/dashboard/new-filing"
                        className="group bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-[var(--color-navy)] hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-slate-100 transition-colors">
                          <Edit className="w-5 h-5 text-[var(--color-navy)]" />
                        </div>
                        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1">Manual Entry</h3>
                        <p className="text-xs text-[var(--color-muted)]">Step-by-step</p>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Filings Table - Scrollable */}
              {hasFilings && (
                <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 flex-shrink-0">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent Filings</h3>
                    <Link href="/dashboard/filings" className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]">
                      View all →
                    </Link>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-slate-100">
                      {filings.slice(0, 10).map((filing) => {
                        const statusConfig = getStatusConfig(filing.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <Link
                            key={filing.id}
                            href={`/dashboard/filings/${filing.id}`}
                            className="group flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div className={`w-10 h-10 rounded-lg ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center flex-shrink-0`}>
                              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-[var(--color-text)]">Tax Year {filing.taxYear}</span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                                  <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`}></span>
                                  {statusConfig.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                                <span className="flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  {filing.vehicleIds?.length || 0}
                                </span>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {filing.createdAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'N/A'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[var(--color-text)] transition-colors flex-shrink-0" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar - Fixed Height */}
            <div className="hidden xl:flex col-span-4 flex-col gap-4 overflow-hidden">
              {/* Action Required - Compact */}
              {stats.actionRequired > 0 && (
                <div className="flex-shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-orange-900">Action Required</h3>
                      <p className="text-xs text-orange-800">{stats.actionRequired} filing{stats.actionRequired !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {filings.filter(f => f.status === 'action_required').slice(0, 2).map(filing => (
                      <Link
                        key={filing.id}
                        href={`/dashboard/filings/${filing.id}`}
                        className="block px-3 py-2 bg-white border border-orange-200 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-50 transition-colors"
                      >
                        Review {filing.taxYear} →
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions - Compact Grid */}
              <div className="flex-shrink-0 bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-[var(--color-text)] mb-3 uppercase tracking-wide">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { href: '/dashboard/new-filing', icon: Plus, label: 'New', color: 'blue' },
                    { href: '/dashboard/upload-schedule1', icon: Upload, label: 'Upload', color: 'purple' },
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

              {/* Help Section - Compact */}
              <div className="flex-1 min-h-0 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-4 flex flex-col">
                <h3 className="text-xs font-semibold text-[var(--color-text)] mb-2">Need Help?</h3>
                <p className="text-xs text-[var(--color-muted)] mb-4 flex-1">Our support team is here to help with Form 2290 filing questions.</p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-navy)] hover:text-[var(--color-navy-soft)]"
                >
                  Visit FAQ
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
