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
  ArrowRight,
  ChevronRight,
  Plus
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Welcome back, {userData?.displayName || user?.email?.split('@')[0] || 'there'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/upload-schedule1"
              className="inline-flex items-center justify-center gap-2 bg-white border border-[var(--color-border)] text-[var(--color-text)] px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload PDF</span>
              <span className="sm:hidden">Upload</span>
            </Link>
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#ff7a20] transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Filing</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
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
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className={`${stat.bg} rounded-xl border ${stat.border} p-4 flex items-center justify-between`}
                  >
                    <div>
                      <p className={`text-xs font-medium ${stat.text} opacity-80 uppercase tracking-wide`}>
                        {stat.label}
                      </p>
                      <p className={`text-2xl font-bold ${stat.text} mt-1`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg bg-white/50 ${stat.text}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filings Table/List */}
            <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <h2 className="font-semibold text-[var(--color-text)]">Recent Filings</h2>
                <Link
                  href="/dashboard/schedule1"
                  className="text-sm text-[var(--color-navy)] hover:text-[var(--color-orange)] font-medium transition-colors"
                >
                  View All Documents
                </Link>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-[var(--color-muted)] uppercase bg-[var(--color-page-alt)] border-b border-[var(--color-border)]">
                    <tr>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Tax Year</th>
                      <th className="px-6 py-3 font-medium">Vehicles</th>
                      <th className="px-6 py-3 font-medium">First Used</th>
                      <th className="px-6 py-3 font-medium">Submitted</th>
                      <th className="px-6 py-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {filings.map((filing) => (
                      <tr key={filing.id} className="hover:bg-[var(--color-page-alt)]/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(filing.status)}`}>
                            {getStatusIcon(filing.status)}
                            {getStatusLabel(filing.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-[var(--color-text)]">
                          {filing.taxYear}
                        </td>
                        <td className="px-6 py-4 text-[var(--color-muted)]">
                          {filing.vehicleIds?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-[var(--color-muted)]">
                          {filing.firstUsedMonth}
                        </td>
                        <td className="px-6 py-4 text-[var(--color-muted)]">
                          {filing.createdAt ? filing.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/filings/${filing.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--color-page-alt)] text-[var(--color-muted)] hover:text-[var(--color-navy)] transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-[var(--color-border)]">
                {filings.map((filing) => (
                  <Link
                    key={filing.id}
                    href={`/dashboard/filings/${filing.id}`}
                    className="block p-4 hover:bg-[var(--color-page-alt)]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(filing.status)}`}>
                        {getStatusIcon(filing.status)}
                        {getStatusLabel(filing.status)}
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">
                        {filing.createdAt ? filing.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--color-text)]">Tax Year {filing.taxYear}</h3>
                        <p className="text-sm text-[var(--color-muted)] mt-0.5">
                          {filing.vehicleIds?.length || 0} Vehicle{filing.vehicleIds?.length !== 1 ? 's' : ''} • {filing.firstUsedMonth}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--color-muted)]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
