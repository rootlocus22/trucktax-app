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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Professional Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#173b63] flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                  <FileText className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Schedule 1 Vault
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Link href="/dashboard" className="hover:text-[#14b8a6] transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-slate-400">IRS Compliance Documents</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Document Integrity
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  IRS Stamped & Verified
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Management Context Banner */}
          {!loading && filings.length > 0 && (
            <div className="bg-[#173b63] rounded-[2rem] p-6 shadow-xl shadow-slate-900/10 border border-white/10 relative overflow-hidden group mb-8">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110"></div>
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-teal-500/20">
                    <Download className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/5">
                        Compliance Archive
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {filings.length} Stamped Documents
                    </h2>
                    <p className="text-sm text-white/60 mt-1">
                      Ready for download and verification
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/new-filing"
                  className="px-8 py-3 bg-white text-[#173b63] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-lg"
                >
                  Start New Filing
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-12 h-12 border-4 border-[#14b8a6]/30 border-t-[#14b8a6] rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Securing Archive...</p>
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
                className="inline-flex items-center justify-center gap-2 bg-[#14b8a6] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0d9488] shadow-xl shadow-teal-500/20 transition-all active:scale-95"
              >
                Start New Filing
              </Link>
            </div>
          ) : (
            <div className="space-y-16">
              {sortedYears.map((year) => {
                const yearFilings = filingsByYear[year];

                return (
                  <div key={year} className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-1.5 h-8 bg-[#14b8a6] rounded-full"></div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                          Tax Year {year}
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                          {yearFilings.length} Verified Documents
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {yearFilings.map((filing, index) => {
                        const statusConfig = getStatusConfig(filing.status);

                        return (
                          <div
                            key={filing.id}
                            className="group bg-white rounded-[2rem] border border-slate-200 p-6 hover:border-[#14b8a6]/30 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden"
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animation: 'fadeInUp 0.6s ease-out forwards'
                            }}
                          >
                            <div className="absolute right-0 top-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>

                            <div className="relative mb-6">
                              <div className="flex items-center justify-between gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shadow-sm">
                                  <FileText className="w-6 h-6" />
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${filing.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                                  }`}>
                                  <div className={`w-1 h-1 rounded-full ${filing.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                  {statusConfig.label}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1 group-hover:text-[#173b63] transition-colors">
                                  IRS Stamped Schedule 1
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <Building2 className="w-3 h-3" />
                                  <span className="truncate max-w-[150px]">{filing.businessName || 'Business Record'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="relative grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-50 mb-6">
                              <div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                  Registered Fleet
                                </div>
                                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                                  <Truck className="w-4 h-4 text-[#14b8a6]" />
                                  {filing.vehicleIds?.length || 0}
                                </div>
                              </div>
                              <div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                  Issued On
                                </div>
                                <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
                                  <Calendar className="w-4 h-4 text-[#14b8a6]" />
                                  {formatDate(filing.updatedAt)}
                                </div>
                              </div>
                            </div>

                            <div className="relative flex items-center gap-3">
                              <button
                                onClick={() => handleDownload(filing.finalSchedule1Url, filing.taxYear)}
                                className="flex-1 bg-[#14b8a6] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0d9488] transition-all active:scale-95 shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Download PDF
                              </button>
                              <Link
                                href={`/dashboard/filings/${filing.id}`}
                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
                                title="View Filing Details"
                              >
                                <ArrowLeft className="w-4 h-4 rotate-180" />
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
      </div>
    </ProtectedRoute>
  );
}

