'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToUserFilings } from '@/lib/db';
import {
  Upload,
  Edit,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Truck,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect agents to agent dashboard
    if (!authLoading && userData?.role === 'agent') {
      router.push('/agent/dashboard');
      return;
    }

    // Only subscribe to filings when auth is done loading and user exists
    if (!authLoading && user) {
      setLoading(true);

      // Subscribe to real-time updates
      const unsubscribe = subscribeToUserFilings(user.uid, (userFilings) => {
        setFilings(userFilings);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
      };
    } else if (!authLoading && !user) {
      // Auth is done but no user - stop loading
      setLoading(false);
    }
  }, [user, userData, authLoading, router]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'action_required':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'processing':
      case 'submitted':
        return <Clock className="w-3.5 h-3.5" />;
      case 'action_required':
        return <AlertCircle className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'processing':
        return 'Processing';
      case 'action_required':
        return 'Action Required';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Calculate filing statistics
  const stats = {
    total: filings.length,
    completed: filings.filter(f => f.status === 'completed').length,
    processing: filings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: filings.filter(f => f.status === 'action_required').length,
    totalVehicles: filings.reduce((sum, f) => sum + (f.vehicleIds?.length || 0), 0),
  };

  const statCards = [
    {
      label: 'Total Filings',
      value: stats.total,
      icon: FileText,
      color: 'blue',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'green',
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    {
      label: 'In Progress',
      value: stats.processing,
      icon: Clock,
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
    },
    {
      label: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: Truck,
      color: 'orange',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] mb-2">
            Welcome back, {userData?.displayName || user?.email?.split('@')[0] || 'there'}!
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted)]">
            Here's your Form 2290 filing overview
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-sm text-[var(--color-muted)]">Loading your filings...</p>
          </div>
        ) : filings.length === 0 ? (
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-2">
              No filings yet
            </h2>
            <p className="text-sm text-[var(--color-muted)] mb-8 max-w-md mx-auto">
              Get started by creating your first Form 2290 filing request.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/dashboard/upload-schedule1"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
                style={{ color: '#ffffff' }}
              >
                <Upload className="w-4 h-4" />
                Upload Schedule 1 PDF
              </Link>
              <span className="text-sm text-[var(--color-muted)]">or</span>
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
                style={{ color: '#ffffff' }}
              >
                <Edit className="w-4 h-4" />
                Manual Entry
              </Link>
            </div>
            <p className="mt-6 text-xs text-[var(--color-muted)] max-w-md mx-auto">
              Upload your Schedule 1 PDF to automatically extract business and vehicle information
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filing Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`${stat.bg} rounded-lg border ${stat.border} p-4 sm:p-5`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.text}`} />
                    </div>
                    <div className={`text-xl sm:text-2xl font-semibold ${stat.text} mb-1`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs sm:text-sm ${stat.text} opacity-80`}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] rounded-xl p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard/upload-schedule1"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-navy)] px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-50 transition shadow-sm"
                  style={{ color: '#1b2838' }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Schedule 1 PDF
                </Link>
                <Link
                  href="/dashboard/new-filing"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/20 transition"
                  style={{ color: '#ffffff' }}
                >
                  <Edit className="w-4 h-4" />
                  Manual Entry
                </Link>
              </div>
            </div>

            {/* Filings List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">Your Filings</h2>
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard/schedule1"
                    className="text-sm text-[var(--color-navy)] hover:underline font-medium"
                  >
                    Schedule 1 Documents
                  </Link>
                  {stats.actionRequired > 0 && (
                    <span className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-semibold">
                      {stats.actionRequired} Need Attention
                    </span>
                  )}
                </div>
              </div>
              <div className="grid gap-3">
                {filings.map((filing) => (
                  <Link
                    key={filing.id}
                    href={`/dashboard/filings/${filing.id}`}
                    className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4 sm:p-5 hover:border-[var(--color-navy)] hover:shadow-md transition group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">
                            Tax Year: {filing.taxYear}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(filing.status)}`}>
                            {getStatusIcon(filing.status)}
                            {getStatusLabel(filing.status)}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs sm:text-sm text-[var(--color-muted)]">
                          <p>
                            <strong className="text-[var(--color-text)]">{filing.vehicleIds?.length || 0}</strong> vehicle{filing.vehicleIds?.length !== 1 ? 's' : ''} •
                            First used: <strong className="text-[var(--color-text)]">{filing.firstUsedMonth}</strong>
                          </p>
                          {filing.createdAt && (
                            <p>
                              Submitted: <strong className="text-[var(--color-text)]">{filing.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-[var(--color-muted)] flex-shrink-0 group-hover:text-[var(--color-navy)] transition">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
