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
  Filter,
  Plus,
  Calendar,
  Truck,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import Image from 'next/image';

export default function FilingsListPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && userData?.role === 'agent') {
      router.push('/agent/dashboard');
      return;
    }

    if (!authLoading && user) {
      setLoading(true);
      const unsubscribe = subscribeToUserFilings(user.uid, (userFilings) => {
        setFilings(userFilings);
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, userData, authLoading, router]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'submitted':
        return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, label: 'Submitted' };
      case 'processing':
        return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock, label: 'Processing' };
      case 'action_required':
        return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, label: 'Action Required' };
      case 'completed':
        return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Completed' };
      default:
        return { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', icon: FileText, label: status };
    }
  };

  const getFilingTypeInfo = (filing) => {
    if (filing.filingType === 'amendment') {
      const type = filing.amendmentType === 'vin_correction' ? 'VIN Correction' :
        filing.amendmentType === 'weight_increase' ? 'Weight Increase' :
          filing.amendmentType === 'mileage_exceeded' ? 'Mileage Exceeded' : 'Amendment';
      return { label: type, image: '/assets/icons/amendment.png', color: 'text-purple-600', bg: 'bg-purple-50' };
    }
    if (filing.filingType === 'refund') {
      return { label: 'Refund (8849)', image: '/assets/icons/refund.png', color: 'text-green-600', bg: 'bg-green-50' };
    }
    return { label: 'Form 2290', image: '/assets/icons/form2290.png', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  const filteredFilings = filings.filter((filing) => {
    if (statusFilter !== 'all' && filing.status !== statusFilter) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesTaxYear = filing.taxYear?.toLowerCase().includes(searchLower);
      const matchesStatus = filing.status?.toLowerCase().includes(searchLower);
      const matchesBusiness = filing.business?.businessName?.toLowerCase().includes(searchLower);
      const matchesId = filing.id?.toLowerCase().includes(searchLower);
      return matchesTaxYear || matchesStatus || matchesBusiness || matchesId;
    }
    return true;
  });

  const stats = {
    total: filings.length,
    completed: filings.filter(f => f.status === 'completed').length,
    processing: filings.filter(f => f.status === 'processing' || f.status === 'submitted').length,
    actionRequired: filings.filter(f => f.status === 'action_required').length,
  };

  /* Grouping Logic */
  const groupedFilings = filteredFilings.reduce((acc, filing) => {
    const { label } = getFilingTypeInfo(filing);
    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(filing);
    return acc;
  }, {});

  // Define preferred order
  const categoryOrder = [
    'Form 2290',
    'VIN Correction',
    'Weight Increase',
    'Mileage Exceeded',
    'Amendment',
    'Refund (8849)'
  ];

  const sortedCategories = Object.keys(groupedFilings).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const [expandedCategories, setExpandedCategories] = useState({});

  // Initialize all categories as expanded when data loads or filtered
  useEffect(() => {
    const initialExpanded = {};
    sortedCategories.forEach(cat => {
      initialExpanded[cat] = true;
    });
    setExpandedCategories(prev => ({ ...initialExpanded, ...prev }));
  }, [filteredFilings.length]); // Re-expand when list changes significantly, mostly just keep state

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <ProtectedRoute>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">Your Filings</h1>
            <p className="text-slate-500">Track and manage all your Form 2290 submissions</p>
          </div>
          <Link
            href="/dashboard/new-filing"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Filing
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[var(--color-orange)]/30 border-t-[var(--color-orange)] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading your filings...</p>
          </div>
        ) : filings.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-white to-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Filings Yet</h2>
            <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              Start your first Form 2290 filing today. It only takes a few minutes and we'll guide you through every step.
            </p>
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
            >
              Start Your First Filing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics Row - Mobile Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Total Filings', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                { label: 'In Progress', value: stats.processing, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                { label: 'Action Required', value: stats.actionRequired, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.bg} ${stat.border} border flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filters Row - Mobile Optimized */}
            <div className="bg-white p-2 sm:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2 sticky top-0 z-30">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search filings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-transparent border-none focus:ring-0 text-sm sm:text-base text-slate-900 placeholder-slate-400 font-medium touch-manipulation"
                />
              </div>
              <div className="h-px md:h-auto md:w-px bg-slate-200 mx-0 my-1 md:my-0"></div>
              <div className="relative md:w-64">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-3 sm:pl-4 pr-8 sm:pr-10 py-2.5 sm:py-3 bg-transparent border-none focus:ring-0 text-sm sm:text-base font-medium text-slate-700 cursor-pointer hover:bg-slate-50 active:bg-slate-100 rounded-lg transition-colors appearance-none touch-manipulation"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="processing">Processing</option>
                  <option value="action_required">Action Required</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Grouped Filings Accordion */}
            <div className="space-y-6">
              {filteredFilings.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No matching filings</h3>
                  <p className="text-slate-500">Try adjusting your search or filters.</p>
                  <button
                    onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                    className="mt-4 text-[var(--color-orange)] font-semibold hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                sortedCategories.map(category => {
                  const categoryFilings = groupedFilings[category];
                  const isExpanded = expandedCategories[category] !== false; // Default to true if undefined

                  return (
                    <div key={category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer text-left border-b border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                            {category}
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-orange)] text-white shadow-sm">
                              {categoryFilings.length}
                            </span>
                          </h2>
                        </div>
                        <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </button>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div className="p-6 space-y-4">
                          {categoryFilings.map((filing) => {
                            const status = getStatusConfig(filing.status);
                            const typeInfo = getFilingTypeInfo(filing);
                            const StatusIcon = status.icon;
                            const date = filing.createdAt ? new Date(filing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

                            return (
                              <Link
                                key={filing.id}
                                href={`/dashboard/filings/${filing.id}`}
                                className="group block bg-white rounded-xl border border-slate-200 p-5 hover:border-[var(--color-orange)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden"
                              >
                                {/* Status Stripe */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${status.bg.replace('bg-', 'bg-').replace('50', '500')}`}></div>

                                <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 pl-2">
                                  {/* Icon Section - Show on mobile too but smaller */}
                                  <div className="flex md:hidden flex-col items-center gap-2 min-w-[60px] mb-2">
                                    <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 drop-shadow-md">
                                      <Image
                                        src={typeInfo.image}
                                        alt={typeInfo.label}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  </div>
                                  <div className="hidden md:flex flex-col items-center gap-2 min-w-[80px]">
                                    <div className="relative w-16 h-16 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3 drop-shadow-md">
                                      <Image
                                        src={typeInfo.image}
                                        alt={typeInfo.label}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                  </div>

                                  {/* Main Info */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${status.bg} ${status.color} ${status.border}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {status.label}
                                      </span>
                                      <span className="text-xs text-slate-400 font-medium">#{filing.id.slice(0, 8)}</span>
                                    </div>

                                    <div className="flex items-baseline gap-2 mb-1">
                                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-[var(--color-orange)] transition-colors truncate">
                                        {filing.business?.businessName || 'Unnamed Business'}
                                      </h3>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">Tax Year {filing.taxYear}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-400" />
                                        <span>{typeInfo.label}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-slate-400" />
                                        <span>{filing.vehicleIds?.length || 0} Vehicle{filing.vehicleIds?.length !== 1 ? 's' : ''}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                                        <span>Filed {date}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Area - Mobile Optimized */}
                                  <div className="flex items-center gap-3 sm:gap-4 border-t md:border-t-0 border-slate-100 pt-3 sm:pt-4 md:pt-0 mt-3 sm:mt-4 md:mt-0 justify-between md:justify-end">
                                    <div className="md:hidden flex items-center gap-2 text-slate-500 text-xs">
                                      <Clock className="w-3 h-3" />
                                      <span className="truncate">{date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 text-[var(--color-orange)] font-semibold text-xs sm:text-sm group-hover:underline decoration-2 underline-offset-4 touch-manipulation">
                                      <span className="whitespace-nowrap">View Details</span>
                                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
