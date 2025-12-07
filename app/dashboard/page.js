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
      {/* Viewport layout - flex-1 to fill space between header and footer */}
      <div className="flex flex-col flex-1 h-full min-h-0">
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 bg-[var(--color-page)] border-b border-[var(--color-border)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">Dashboard</h1>
            {/* Compact User Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
                {(userData?.displayName || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-[var(--color-navy)]">
                {userData?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
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
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content Area - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 no-scrollbar">
              <div className="max-w-6xl mx-auto">
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

                {/* Empty State - Beautiful & Engaging */}
                {!hasFilings && !hasIncomplete && (
                  <div className="flex-1 flex items-start justify-center overflow-y-auto py-4">
                    <div className="text-center max-w-4xl px-6 w-full">
                      {/* Hero Illustration - Smaller */}
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-3xl rounded-full"></div>
                        <img
                          src="/dashboard-empty-state.png"
                          alt="Welcome to Dashboard"
                          className="w-40 h-40 mx-auto relative z-10 object-contain animate-[fadeIn_0.6s_ease-out]"
                          style={{ animation: 'fadeIn 0.6s ease-out, float 3s ease-in-out infinite' }}
                        />
                      </div>

                      {/* Welcome Message - More Compact */}
                      <div className="mb-6">
                        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3 bg-gradient-to-r from-[var(--color-navy)] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Welcome to Your Dashboard
                        </h2>
                        <p className="text-base text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
                          Get started with your first Form 2290 filing in minutes. Choose the method that works best for you.
                        </p>
                      </div>

                      {/* Filing Method Cards - More Compact */}
                      <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-3xl mx-auto">
                        <Link
                          href="/dashboard/upload-schedule1"
                          className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {/* Gradient Background on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          <div className="relative z-10">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Upload className="w-8 h-8 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Upload Schedule 1 PDF</h3>
                            <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
                              Let our AI extract vehicle information from your existing Schedule 1 PDF automatically
                            </p>

                            {/* Features */}
                            <div className="space-y-1.5 mb-4">
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span>AI-powered data extraction</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span>Save time on data entry</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span>Instant verification</span>
                              </div>
                            </div>

                            {/* CTA */}
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:gap-3 transition-all">
                              <span>Get Started</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Decorative Elements */}
                          <div className="absolute top-4 right-4 w-12 h-12 bg-blue-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                          <div className="absolute bottom-4 left-4 w-10 h-10 bg-indigo-100 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        </Link>

                        <Link
                          href="/dashboard/new-filing"
                          className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:border-[var(--color-navy)] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          {/* Gradient Background on Hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          <div className="relative z-10">
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-navy)] to-slate-700 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              <Edit className="w-8 h-8 text-white" />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Manual Entry</h3>
                            <p className="text-sm text-[var(--color-muted)] mb-3 leading-relaxed">
                              Fill out your Form 2290 step-by-step with our guided filing process
                            </p>

                            {/* Features */}
                            <div className="space-y-1.5 mb-4">
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-[var(--color-navy)] flex-shrink-0" />
                                <span>Step-by-step guidance</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-[var(--color-navy)] flex-shrink-0" />
                                <span>Real-time validation</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                                <CheckCircle className="w-3.5 h-3.5 text-[var(--color-navy)] flex-shrink-0" />
                                <span>Save progress anytime</span>
                              </div>
                            </div>

                            {/* CTA */}
                            <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-navy)] group-hover:gap-3 transition-all">
                              <span>Get Started</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Decorative Elements */}
                          <div className="absolute top-4 right-4 w-12 h-12 bg-slate-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                          <div className="absolute bottom-4 left-4 w-10 h-10 bg-blue-200 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        </Link>
                      </div>

                      {/* Trust Indicators & Features - More Compact */}
                      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-5">
                        <div className="text-center p-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h4 className="text-xs font-semibold text-[var(--color-text)] mb-0.5">IRS Approved</h4>
                          <p className="text-xs text-[var(--color-muted)]">Authorized e-file provider</p>
                        </div>
                        <div className="text-center p-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="text-xs font-semibold text-[var(--color-text)] mb-0.5">Fast Processing</h4>
                          <p className="text-xs text-[var(--color-muted)]">File in under 10 minutes</p>
                        </div>
                        <div className="text-center p-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="text-xs font-semibold text-[var(--color-text)] mb-0.5">Easy to Use</h4>
                          <p className="text-xs text-[var(--color-muted)]">No tax expertise needed</p>
                        </div>
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
            </div>

            {/* Right Sidebar - Fixed, Scrollable */}
            <div className="hidden xl:block w-80 border-l border-[var(--color-border)] bg-white overflow-y-auto flex-shrink-0 no-scrollbar">
              <div className="p-4 space-y-4">
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
                <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-[var(--color-text)] mb-2">Need Help?</h3>
                  <p className="text-xs text-[var(--color-muted)] mb-3">Our support team is here to help with Form 2290 filing questions.</p>
                  <div className="space-y-2">
                    <Link
                      href="/faq"
                      className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-[var(--color-text)] hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <span>Visit FAQ</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="flex items-center justify-between px-3 py-2 bg-[var(--color-navy)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--color-navy-soft)] transition-all"
                    >
                      <span>How It Works</span>
                      <ArrowRight className="w-3 h-3" />
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
