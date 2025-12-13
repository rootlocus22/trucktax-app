'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToUserFilings } from '@/lib/db';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';

export default function FilingsListPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all'); // 'all', '2290', 'mcs150'

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

  // Filter filings
  const filteredFilings = filings.filter((filing) => {
    // Status filter
    if (statusFilter !== 'all' && filing.status !== statusFilter) {
      return false;
    }

    // Search filter (by tax year, status, or filing type)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTaxYear = filing.taxYear?.toLowerCase().includes(searchLower);
      const matchesStatus = getStatusLabel(filing.status).toLowerCase().includes(searchLower);
      const matchesFilingType = filing.filingType?.toLowerCase().includes(searchLower);
      const matchesAmendmentType = filing.amendmentType?.toLowerCase().includes(searchLower);

      return matchesTaxYear || matchesStatus || matchesFilingType || matchesAmendmentType;
    }

    // Filter by Tab
    if (activeTab === '2290' && filing.filingType === 'mcs150') {
      return false;
    }
    if (activeTab === 'mcs150' && filing.filingType !== 'mcs150') {
      return false;
    }

    return true;
  });

  // Calculate statistics
  const stats = {
    total: filings.length,
    completed: filings.filter(f => f.status === 'completed').length,
    processing: filings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: filings.filter(f => f.status === 'action_required').length,
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] mb-2">
            All Filings
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted)]">
            View and manage all your Form 2290 filings
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
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
            >
              <FileText className="w-4 h-4" />
              Create New Filing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Tab Navigation */}
            <div className="flex border-b border-[var(--color-border)] mb-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'all' ? 'border-[var(--color-navy)] text-[var(--color-navy)]' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
              >
                <span className="md:hidden">All</span>
                <span className="hidden md:inline">All Filings</span>
              </button>
              <button
                onClick={() => setActiveTab('2290')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === '2290' ? 'border-[var(--color-navy)] text-[var(--color-navy)]' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
              >
                <span className="md:hidden">2290</span>
                <span className="hidden md:inline">Form 2290</span>
              </button>
              <button
                onClick={() => setActiveTab('mcs150')}
                className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'mcs150' ? 'border-teal-600 text-teal-700' : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'}`}
              >
                <span className="md:hidden">MCS</span>
                <span className="hidden md:inline">MCS-150 Updates</span>
              </button>
            </div>

            {/* Statistics Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-5">
                <div className="text-xl sm:text-2xl font-semibold text-blue-700 mb-1">
                  {stats.total}
                </div>
                <div className="text-xs sm:text-sm text-blue-700 opacity-80">
                  Total Filings
                </div>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4 sm:p-5">
                <div className="text-xl sm:text-2xl font-semibold text-green-700 mb-1">
                  {stats.completed}
                </div>
                <div className="text-xs sm:text-sm text-green-700 opacity-80">
                  Completed
                </div>
              </div>
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4 sm:p-5">
                <div className="text-xl sm:text-2xl font-semibold text-amber-700 mb-1">
                  {stats.processing}
                </div>
                <div className="text-xs sm:text-sm text-amber-700 opacity-80">
                  In Progress
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 sm:p-5">
                <div className="text-xl sm:text-2xl font-semibold text-orange-700 mb-1">
                  {stats.actionRequired}
                </div>
                <div className="text-xs sm:text-sm text-orange-700 opacity-80">
                  Action Required
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <input
                    type="text"
                    placeholder="Search by tax year, status, or filing type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)]"
                  />
                </div>
                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] bg-white appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="action_required">Action Required</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filings List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {filteredFilings.length} Filing{filteredFilings.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredFilings.map((filing) => {
                  const isMcs150 = filing.filingType === 'mcs150';
                  return (
                    <Link
                      key={filing.id}
                      href={`/dashboard/filings/${filing.id}`}
                      className={`rounded-lg border p-4 sm:p-5 hover:shadow-md transition group block ${isMcs150 ? 'bg-white border-[var(--color-border)] hover:border-teal-500' : 'bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-navy)]'}`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2.5 flex-wrap">
                            <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">
                              {isMcs150 ? (
                                <span className='flex items-center gap-2'>
                                  MCS-150 Update
                                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                    {filing.mcs150Reason?.replace(/_/g, ' ') || 'Biennial'}
                                  </span>
                                </span>
                              ) : (
                                `Tax Year: ${filing.taxYear}`
                              )}
                            </h3>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(filing.status)}`}>
                              {getStatusIcon(filing.status)}
                              {getStatusLabel(filing.status)}
                            </span>
                            {filing.filingType === 'amendment' && filing.amendmentType && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                {filing.amendmentType === 'vin_correction' ? '📝 VIN Correction' :
                                  filing.amendmentType === 'weight_increase' ? '⚖️ Weight Increase' :
                                    filing.amendmentType === 'mileage_exceeded' ? '🛣️ Mileage Exceeded' :
                                      'Amendment'}
                              </span>
                            )}
                            {filing.filingType === 'refund' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                Refund (8849)
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-xs sm:text-sm text-[var(--color-muted)]">
                            {isMcs150 ? (
                              <p className="flex items-center gap-4">
                                <span>USDOT: <strong className="text-[var(--color-text)]">{filing.mcs150UsdotNumber || 'N/A'}</strong></span>
                                <span>Power Units: <strong className="text-[var(--color-text)]">{filing.mcs150Data?.powerUnits || '-'}</strong></span>
                              </p>
                            ) : (
                              <p>
                                <strong className="text-[var(--color-text)]">{filing.vehicleIds?.length || 0}</strong> vehicle{filing.vehicleIds?.length !== 1 ? 's' : ''}
                                {filing.filingType !== 'amendment' && (
                                  <> • First used: <strong className="text-[var(--color-text)]">{filing.firstUsedMonth}</strong></>
                                )}
                              </p>
                            )}

                            {filing.createdAt && (
                              <p>
                                Submitted: <strong className="text-[var(--color-text)]">
                                  {filing.createdAt.toLocaleDateString ? filing.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date(filing.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </strong>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={`text-[var(--color-muted)] flex-shrink-0 transition ${isMcs150 ? 'group-hover:text-teal-600' : 'group-hover:text-[var(--color-navy)]'}`}>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {filteredFilings.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-[var(--color-muted)] bg-[var(--color-page-alt)] rounded-lg border border-dashed border-[var(--color-border)]">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No filings found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

