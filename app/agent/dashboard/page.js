'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getAllFilings } from '@/lib/db';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  DollarSign,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const EARNINGS_PER_FILING = 5.00; // $5 per completed filing

export default function AgentDashboard() {
  const { userData } = useAuth();
  const [allFilings, setAllFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilings();
  }, []);

  const loadFilings = async () => {
    try {
      const filings = await getAllFilings();
      setAllFilings(filings);
    } catch (error) {
      console.error('Error loading filings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: allFilings.length,
    completed: allFilings.filter(f => f.status === 'completed').length,
    inProgress: allFilings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: allFilings.filter(f => f.status === 'action_required').length,
    totalEarnings: allFilings.filter(f => f.status === 'completed').length * EARNINGS_PER_FILING,
    thisMonth: allFilings.filter(f => {
      if (!f.updatedAt || f.status !== 'completed') return false;
      const filingDate = f.updatedAt instanceof Date ? f.updatedAt : new Date(f.updatedAt);
      const now = new Date();
      return filingDate.getMonth() === now.getMonth() && filingDate.getFullYear() === now.getFullYear();
    }).length * EARNINGS_PER_FILING,
  };

  const completedFilings = allFilings
    .filter(f => f.status === 'completed')
    .sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt || 0);
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          iconColor: 'text-green-600',
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
      case 'submitted':
        return {
          label: 'Submitted',
          icon: FileText,
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          iconColor: 'text-blue-600',
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
      default:
        return {
          label: status || 'Unknown',
          icon: FileText,
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          iconColor: 'text-gray-600',
        };
    }
  };

  return (
    <ProtectedRoute requiredRole="agent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-2">
            Welcome back, {userData?.displayName || 'Agent'}! 👋
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Your filing dashboard and earnings overview
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-sm text-[var(--color-muted)]">Loading dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Earnings Highlight Card */}
            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Total Earnings</p>
                    <p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">This Month</p>
                  <p className="text-2xl font-semibold">${stats.thisMonth.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <Award className="w-4 h-4" />
                <span>{stats.completed} filings completed • ${EARNINGS_PER_FILING.toFixed(2)} per filing</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="text-xl sm:text-2xl font-semibold text-blue-700 mb-1">
                  {stats.total}
                </div>
                <div className="text-xs sm:text-sm text-blue-700 opacity-80">
                  Total Filings
                </div>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="text-xl sm:text-2xl font-semibold text-green-700 mb-1">
                  {stats.completed}
                </div>
                <div className="text-xs sm:text-sm text-green-700 opacity-80">
                  Completed
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div className="text-xl sm:text-2xl font-semibold text-amber-700 mb-1">
                  {stats.inProgress}
                </div>
                <div className="text-xs sm:text-sm text-amber-700 opacity-80">
                  In Progress
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="text-xl sm:text-2xl font-semibold text-orange-700 mb-1">
                  {stats.actionRequired}
                </div>
                <div className="text-xs sm:text-sm text-orange-700 opacity-80">
                  Need Attention
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] rounded-xl p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <Link
                href="/agent"
                className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-navy)] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition shadow-sm"
                style={{ color: '#1b2838' }}
              >
                <Sparkles className="w-4 h-4" />
                View Active Queue
              </Link>
            </div>

            {/* Filing History */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">
                  Filing History ({completedFilings.length})
                </h2>
                {completedFilings.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-600">
                      ${stats.totalEarnings.toFixed(2)} earned
                    </span>
                  </div>
                )}
              </div>
              {completedFilings.length === 0 ? (
                <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-8 text-center">
                  <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-[var(--color-muted)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                    No completed filings yet
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] mb-4">
                    Complete your first filing to start earning!
                  </p>
                  <Link
                    href="/agent"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
                  >
                    Start Working
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3">
                  {completedFilings.map((filing) => {
                    const statusConfig = getStatusConfig(filing.status);
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div
                        key={filing.id}
                        className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4 sm:p-5 hover:border-green-300 hover:shadow-md transition group"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2.5 flex-wrap">
                              <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">
                                Tax Year: {filing.taxYear}
                              </h3>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {statusConfig.label}
                              </span>
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
                                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-xs font-semibold text-green-700">+${EARNINGS_PER_FILING.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="space-y-1 text-xs sm:text-sm text-[var(--color-muted)]">
                              <p>
                                <strong className="text-[var(--color-text)]">{filing.vehicleIds?.length || 0}</strong> vehicle{filing.vehicleIds?.length !== 1 ? 's' : ''} • 
                                First used: <strong className="text-[var(--color-text)]">{filing.firstUsedMonth}</strong>
                              </p>
                              {filing.updatedAt && (
                                <p>
                                  Completed: <strong className="text-[var(--color-text)]">
                                    {filing.updatedAt instanceof Date 
                                      ? filing.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                      : new Date(filing.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </strong>
                                </p>
                              )}
                            </div>
                          </div>
                          <Link
                            href={`/agent/filings/${filing.id}`}
                            className="text-[var(--color-muted)] flex-shrink-0 group-hover:text-[var(--color-navy)] transition"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

