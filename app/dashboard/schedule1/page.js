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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] mb-2">
            Schedule 1 Documents
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Download your completed Schedule 1 forms organized by tax year
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--color-muted)] animate-pulse" />
            </div>
            <p className="text-[var(--color-muted)]">Loading Schedule 1 documents...</p>
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              No Schedule 1 Documents Yet
            </h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Your completed Schedule 1 forms will appear here once they're ready.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
              style={{ color: '#ffffff' }}
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedYears.map((year) => {
              const yearFilings = filingsByYear[year];
              
              return (
                <div key={year} className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-[var(--color-navy)]" />
                    <h2 className="text-xl font-semibold text-[var(--color-text)]">
                      Tax Year {year}
                    </h2>
                    <span className="text-sm text-[var(--color-muted)]">
                      ({yearFilings.length} {yearFilings.length === 1 ? 'document' : 'documents'})
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {yearFilings.map((filing) => {
                      const statusConfig = getStatusConfig(filing.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div
                          key={filing.id}
                          className="bg-white rounded-lg border border-[var(--color-border)] p-4 hover:border-[var(--color-navy)] hover:shadow-md transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {statusConfig.label}
                                </span>
                                {filing.vehicleIds && filing.vehicleIds.length > 0 && (
                                  <div className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
                                    <Truck className="w-4 h-4" />
                                    <span>{filing.vehicleIds.length} {filing.vehicleIds.length === 1 ? 'vehicle' : 'vehicles'}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-[var(--color-muted)]">
                                <p>Completed: {formatDate(filing.updatedAt)}</p>
                                {filing.firstUsedMonth && (
                                  <p>First used: {filing.firstUsedMonth}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleDownload(filing.finalSchedule1Url, filing.taxYear)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-navy)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-navy-soft)] transition"
                                style={{ color: '#ffffff' }}
                              >
                                <Download className="w-4 h-4" />
                                Download PDF
                              </button>
                              <Link
                                href={`/dashboard/filings/${filing.id}`}
                                className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
                              >
                                View Details
                              </Link>
                            </div>
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

