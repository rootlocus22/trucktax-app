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
  ShieldCheck,
  Calendar,
  Hash,
  Users,
  Search
} from 'lucide-react';

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [draftFilings, setDraftFilings] = useState([]);
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

      // Subscribe to real-time updates for submitted filings
      const unsubscribeFilings = subscribeToUserFilings(user.uid, (userFilings) => {
        setFilings(userFilings);
        setLoading(false);
      });

      // Subscribe to draft filings
      const unsubscribeDrafts = subscribeToDraftFilings(user.uid, (drafts) => {
        setDraftFilings(drafts);
      });

      // Cleanup subscriptions on unmount
      return () => {
        unsubscribeFilings();
        unsubscribeDrafts();
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
        return 'bg-gray-50 text-[var(--color-muted)] border-[var(--color-border)]';
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
    if (!status) return 'Draft';
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  // Calculate filing statistics
  const stats = {
    total: filings.length,
    completed: filings.filter(f => f.status === 'completed').length,
    processing: filings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: filings.filter(f => f.status === 'action_required').length,
  };

  const FilingCard = ({ filing }) => {
    // Determine the type of filing for context-aware display
    const isMcs150 = filing.filingType === 'mcs150';
    const is2290 = !isMcs150; // Default to 2290 if not MCS-150

    return (
      <Link
        href={`/dashboard/filings/${filing.id}`}
        className="group bg-white rounded-xl border border-[var(--color-border)] p-5 hover:border-[var(--color-navy)] hover:shadow-lg transition flex flex-col sm:flex-row gap-4 sm:items-center relative overflow-hidden"
      >
        {/* Type Indicator Stripe */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isMcs150 ? 'bg-teal-500' : 'bg-[var(--color-navy)]'}`} />

        {/* Icon & Type */}
        <div className="flex items-center gap-4 min-w-[180px]">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isMcs150 ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-[var(--color-navy)]'}`}>
            {isMcs150 ? <ShieldCheck className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
          </div>
          <div>
            <div className="font-bold text-[var(--color-text)]">
              {isMcs150 ? 'MCS-150 Update' : 'Form 2290 Filing'}
            </div>
            <div className="text-xs text-[var(--color-muted)] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {filing.createdAt ? new Date(filing.createdAt.seconds * 1000 || filing.createdAt).toLocaleDateString() : 'Unknown Date'}
            </div>
          </div>
        </div>

        {/* Context Stats Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t sm:border-t-0 sm:border-l border-[var(--color-border)] pt-4 sm:pt-0 sm:pl-6">
          {isMcs150 ? (
            <>
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--color-muted)] mb-1">USDOT Number</div>
                <div className="text-sm font-semibold text-[var(--color-text)] flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-teal-500" />
                  {filing.mcs150UsdotNumber || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--color-muted)] mb-1">Update Reason</div>
                <div className="text-sm font-medium text-[var(--color-text)] capitalize truncate">
                  {filing.mcs150Reason?.replace(/_/g, ' ') || 'Biennial'}
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-[var(--color-muted)] mb-1">Operations</div>
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {filing.mcs150Data?.powerUnits || '-'} Power Units
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--color-muted)] mb-1">Tax Year</div>
                <div className="text-sm font-semibold text-[var(--color-text)]">
                  {filing.taxYear || '2024-2025'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-[var(--color-muted)] mb-1">Vehicles</div>
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {filing.vehicleIds?.length || 0} Reported
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] uppercase font-bold text-[var(--color-muted)] mb-1">First Used</div>
                <div className="text-sm font-medium text-[var(--color-text)]">
                  {filing.firstUsedMonth || 'July'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex sm:flex-col items-center justify-between sm:justify-center min-w-[120px] gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(filing.status)}`}>
            {getStatusIcon(filing.status)}
            {getStatusLabel(filing.status)}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-[var(--color-border)] pb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
              Compliance Dashboard
            </h1>
            <p className="text-[var(--color-muted)]">
              Welcome back, <span className="font-semibold text-[var(--color-navy)]">{userData?.displayName || user?.email?.split('@')[0]}</span>. Here is your fleet status.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-muted)] shadow-sm">
              <span className="block text-xs uppercase font-bold text-[var(--color-muted)] mb-1">Total Filings</span>
              <span className="text-xl font-bold text-[var(--color-navy)]">{stats.total}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-muted)] shadow-sm">
              <span className="block text-xs uppercase font-bold text-[var(--color-muted)] mb-1">In Progress</span>
              <span className="text-xl font-bold text-[var(--color-orange)]">{stats.processing + stats.actionRequired}</span>
            </div>
          </div>
        </div>

        {/* Action Suite - "Start New Filing" */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 2290 Card */}
          <div className="group bg-gradient-to-br from-[var(--color-navy)] to-[#0f2647] rounded-2xl p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Truck className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Form 2290 Filing</h2>
                <p className="text-blue-100 text-sm mb-6 max-w-sm">
                  Heavy Highway Vehicle Use Tax Return. File securely for Tax Year 2024-2025 and get your Schedule 1 in minutes.
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/dashboard/new-filing"
                  className="bg-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition flex items-center gap-2"
                  style={{ color: '#0f2647' }}
                >
                  Start 2290 <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/dashboard/upload-schedule1" className="bg-white/10 backdrop-blur text-white border border-white/20 px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/20 transition flex items-center gap-2">
                  Upload PDF
                </Link>
              </div>
            </div>
          </div>

          {/* MCS-150 Card */}
          <div className="group bg-white rounded-2xl p-6 border border-[var(--color-border)] relative overflow-hidden shadow hover:shadow-lg transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck className="w-32 h-32 text-teal-600" />
            </div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-[var(--color-text)]">MCS-150 Update</h2>
                  <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Biennial</span>
                </div>
                <p className="text-[var(--color-muted)] text-sm mb-6 max-w-sm">
                  Update your USDOT number registration. Required every two years or when business details change.
                </p>
              </div>
              <Link href="/dashboard/mcs-150" className="inline-flex w-fit items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-teal-700 transition shadow-sm hover:shadow">
                Update MCS-150 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-navy)] mx-auto"></div>
            <p className="mt-4 text-[var(--color-muted)]">Loading your fleet data...</p>
          </div>
        )}

        {/* Drafts Section (Reused Logic) */}
        {!loading && (draftFilings.length > 0 || getIncompleteFilings(filings).all.length > 0) && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-800">Resume Incomplete Filings</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Simplified draft rendering for brevity, can expand if needed */}
              {draftFilings.slice(0, 3).map(draft => (
                <Link key={draft.id} href={draft.workflowType === 'upload' ? `/dashboard/upload-schedule1?draft=${draft.id}` : `/dashboard/new-filing?draft=${draft.id}`} className="bg-white p-4 rounded-lg border border-amber-200 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded">DRAFT</span>
                    <span className="text-xs text-[var(--color-muted)]">{new Date(draft.updatedAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="font-bold text-[var(--color-text)] mb-1">{draft.filingType || '2290 Filing'}</div>
                  <div className="text-sm text-[var(--color-muted)]">Tax Year: {draft.taxYear || 'Pending'}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        {!loading && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--color-text)]">Recent Activity</h2>
              <Link href="/dashboard/filings" className="text-sm font-bold text-[var(--color-navy)] hover:underline">View All History</Link>
            </div>

            {filings.length === 0 ? (
              <div className="text-center py-16 bg-[var(--color-page-alt)] rounded-xl border border-dashed border-[var(--color-border)]">
                <FileText className="w-12 h-12 text-[var(--color-muted)] mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-[var(--color-text)]">No Filings Yet</h3>
                <p className="text-[var(--color-muted)] max-w-sm mx-auto mt-2">Start a new filing above to ensure your fleet stays compliant.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filings.map(filing => (
                  <FilingCard key={filing.id} filing={filing} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
