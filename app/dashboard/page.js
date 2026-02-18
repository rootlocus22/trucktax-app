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
  Calendar,
  ChevronRight,
  CreditCard,
  Search,
  Filter,
  MoreVertical,
  ShieldCheck,
  Download,
  Calculator,
  HelpCircle
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
    totalVehicles: filings.reduce((sum, f) => sum + (f.vehicleIds?.length || 0) + (Number(f.powerUnits) || 0), 0),
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
                <button className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-600" aria-label="Search">
                  <Search className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-colors text-slate-600" aria-label="Filter">
                  <Filter className="w-4 h-4" />
                </button>
                <Link
                  href="/dashboard/new-filing"
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[var(--color-navy)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-navy-soft)] active:scale-95 transition-all whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Filing</span>
                  <span className="sm:hidden">New</span>
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
                  <p className="text-slate-600 mt-1">
                    Manage your fleet and stay compliant with your UCR registrations.
                  </p>
                </div>

                {/* UCR Compliance Section */}
                {(() => {
                  const activeUcr = filings.find(f => f.filingType === 'ucr' && f.filingYear === 2026) ||
                    draftFilings.find(d => d.filingType === 'ucr' && d.filingYear === 2026);
                  const status = activeUcr?.status || 'none';
                  const isCompleted = status === 'completed';
                  const historicalFilings = filings.filter(f => f.filingType === 'ucr' && f.filingYear < 2026);

                  return (
                    <div className="space-y-4 mb-8">
                      <div className={`rounded-xl p-5 sm:p-6 border transition-all ${isCompleted ? 'bg-white border-teal-200 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-teal-100 text-teal-600' : 'bg-[var(--color-navy)]/10 text-[var(--color-navy)]'}`}>
                              <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-slate-800">UCR Compliance 2026</h3>
                                {activeUcr && (
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'}`}>
                                    {status === 'draft' ? 'In Progress' : status}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">Annual registration required for interstate motor carriers.</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Calendar className="w-3.5 h-3.5" /> Year: 2026
                                </span>
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Clock className="w-3.5 h-3.5" /> Renewal: Dec 31, 2026
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 flex-shrink-0">
                            {isCompleted ? (
                              <button
                                onClick={() => window.open(activeUcr.certificateUrl || '#', '_blank')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition active:scale-95"
                              >
                                <Download className="w-4 h-4" /> Download Certificate
                              </button>
                            ) : (
                              <>
                                <Link
                                  href={status === 'draft' ? `/ucr/file?draft=${activeUcr.id || activeUcr.draftId}` : "/ucr/file"}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-navy)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-navy-soft)] transition active:scale-95"
                                >
                                  {status === 'draft' ? 'Continue Filing' : 'Start 2026 Filing'}
                                </Link>
                                {(status === 'submitted' || status === 'processing') && (
                                  <div className="flex flex-col gap-2">
                                    <p className="text-xs text-slate-600">An agent is processing your filing. You’ll see your certificate here when it’s ready.</p>
                                    <Link
                                      href={`/dashboard/filings/${activeUcr.id}`}
                                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-200 transition w-fit"
                                    >
                                      <Clock className="w-3.5 h-3.5" /> View status
                                    </Link>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {historicalFilings.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
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
                      return (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
                          <div className={`w-10 h-10 rounded-lg ${colors[stat.color]} flex items-center justify-center mb-3`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Filings List or Empty State */}
                {hasFilings ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                      <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
                      <Link href="/dashboard/filings" className="text-xs font-semibold text-[var(--color-navy)] hover:underline">View History →</Link>
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
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">Start your 2026 UCR registration or Form 2290 filing.</p>
                    <Link href="/dashboard/new-filing" className="inline-flex items-center gap-2 bg-[var(--color-navy)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition active:scale-95">
                      New Filing <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Quick Actions */}
            <div className="hidden xl:block w-72 bg-white border-l border-slate-200 p-5 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Links</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/tools/ucr-calculator" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition">
                      <Calculator className="w-5 h-5 text-[var(--color-navy)]" />
                      <span className="text-sm font-semibold text-slate-700">Fee Calculator</span>
                    </Link>
                    <Link href="/services/ucr-registration" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 hover:border-slate-200 transition">
                      <HelpCircle className="w-5 h-5 text-teal-600" />
                      <span className="text-sm font-semibold text-slate-700">Compliance Info</span>
                    </Link>
                  </div>
                </div>
                <div className="bg-[var(--color-navy)] rounded-xl p-5 text-white">
                  <h4 className="font-bold mb-1">Need Help?</h4>
                  <p className="text-xs text-white/80 mb-4">Our compliance team can assist with your registrations.</p>
                  <a href="mailto:support@quicktrucktax.com" className="block w-full bg-white text-[var(--color-navy)] py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-slate-100 transition">
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
