'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { subscribeToUserFilings } from '@/lib/db';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  Building2,
  Truck
} from 'lucide-react';

export default function Schedule1ListPage() {
  const { user } = useAuth();
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserFilings(user.uid, (userFilings) => {
      // Filter filings that have finalSchedule1Url
      const schedule1Filings = userFilings.filter(f => f.finalSchedule1Url);
      setFilings(schedule1Filings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Group filings by tax year
  const filingsByYear = filings.reduce((acc, filing) => {
    const year = filing.taxYear || 'Unknown';
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(filing);
    return acc;
  }, {});

  // Sort years descending
  const sortedYears = Object.keys(filingsByYear).sort((a, b) => {
    // Extract year from "2025-2026" format
    const yearA = parseInt(a.split('-')[0]) || 0;
    const yearB = parseInt(b.split('-')[0]) || 0;
    return yearB - yearA;
  });

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
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

  const handleDownload = async (url, taxYear) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Schedule-1-${taxYear || 'filing'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download Schedule 1. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[var(--color-orange)] mb-4 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Schedule 1 Documents
            </h1>
            <p className="text-slate-500">
              Access and download your stamped Schedule 1 forms
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[var(--color-orange)]/30 border-t-[var(--color-orange)] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading documents...</p>
          </div>
        ) : sortedYears.length === 0 ? (
          /* Premium Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-white to-emerald-50 p-8 rounded-[2rem] border border-emerald-100 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-20 h-20 text-emerald-600" strokeWidth={1.5} />
                <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-lg border border-emerald-50">
                  <CheckCircle className="w-6 h-6 text-emerald-600" strokeWidth={3} />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Documents Yet</h2>
            <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              Your stamped Schedule 1 forms will appear here automatically once your filings are approved by the IRS.
            </p>
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-hover)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
            >
              Start New Filing
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedYears.map((year) => {
              const yearFilings = filingsByYear[year];

              return (
                <div key={year} className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-bold text-lg">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Tax Year {year}
                    </h2>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      {yearFilings.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {yearFilings.map((filing) => {
                      const statusConfig = getStatusConfig(filing.status);

                      return (
                        <div
                          key={filing.id}
                          className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-[var(--color-orange)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                <FileText className="w-8 h-8" />
                              </div>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                                {statusConfig.label}
                              </span>
                            </div>

                            <h3 className="font-bold text-slate-900 mb-2 group-hover:text-[var(--color-orange)] transition-colors">
                              Schedule 1 Form
                            </h3>

                            <div className="space-y-2 mb-6">
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Truck className="w-4 h-4" />
                                <span>{filing.vehicleIds?.length || 0} Vehicles</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(filing.updatedAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                            <button
                              onClick={() => handleDownload(filing.finalSchedule1Url, filing.taxYear)}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-orange)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-hover)] transition-colors shadow-sm"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                            <Link
                              href={`/dashboard/filings/${filing.id}`}
                              className="px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

