'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser } from '@/lib/db';
import {
  Building2,
  Plus,
  ArrowLeft,
  FileText,
  Calendar,
  Phone,
  MapPin,
  User,
  Edit
} from 'lucide-react';

export default function BusinessesPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBusinesses();
    }
  }, [user]);

  const loadBusinesses = async () => {
    if (!user) return;

    try {
      const userBusinesses = await getBusinessesByUser(user.uid);
      setBusinesses(userBusinesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Businesses
            </h1>
            <p className="text-slate-500">
              Manage your business profiles and filing information
            </p>
          </div>
          <Link
            href="/dashboard/new-filing"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Business
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[var(--color-orange)]/30 border-t-[var(--color-orange)] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          /* Premium Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-white to-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <Building2 className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
                <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-lg border border-blue-50">
                  <Plus className="w-6 h-6 text-blue-600" strokeWidth={3} />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Businesses Yet</h2>
            <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              Add your business details to get started with your tax filings. You can manage multiple businesses from here.
            </p>
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
            >
              Add Your First Business
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-[var(--color-orange)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Visual Header */}
                <div className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 group-hover:from-orange-50/30 group-hover:to-white transition-colors">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-[var(--color-orange)] group-hover:shadow-md transition-all duration-300">
                      <Building2 className="w-8 h-8 text-blue-600 group-hover:text-[var(--color-orange)] transition-colors duration-300" strokeWidth={1.5} />
                    </div>
                    <div className="flex gap-2">
                      {/* Optional: Add Edit Button or Menu here later */}
                      <span className="px-3 py-1 bg-white text-slate-600 rounded-lg text-xs font-bold border border-slate-200 uppercase tracking-wide shadow-sm">
                        {business.entityType || 'Business'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-[var(--color-orange)] transition-colors line-clamp-1" title={business.businessName}>
                      {business.businessName || 'Unnamed Business'}
                    </h3>
                    {business.ein && (
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-mono text-xs border border-slate-200">EIN: {business.ein}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-8 pt-6 flex-1 flex flex-col bg-white">
                  <div className="space-y-6 mb-8">
                    {business.address && (
                      <div className="flex items-start gap-4 group/item">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:bg-blue-50 transition-colors border border-slate-100">
                          <MapPin className="w-5 h-5 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                          <p className="text-base text-slate-700 leading-relaxed font-medium">{business.address}</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {business.phone && (
                        <div className="flex items-center gap-4 group/item">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-50 transition-colors">
                            <Phone className="w-4 h-4 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
                            <p className="text-sm text-slate-700 font-medium">{business.phone}</p>
                          </div>
                        </div>
                      )}
                      {business.signingAuthorityName && (
                        <div className="flex items-center gap-4 group/item">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover/item:bg-blue-50 transition-colors">
                            <User className="w-4 h-4 text-slate-400 group-hover/item:text-blue-500 transition-colors" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Signing Authority</p>
                            <p className="text-sm text-slate-700 font-medium">{business.signingAuthorityName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">
                      <Edit className="w-4 h-4" />
                      Edit Details
                    </button>
                    <Link
                      href={`/dashboard/new-filing?businessId=${business.id}`}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-orange)] text-white font-semibold text-sm hover:bg-[var(--color-orange-soft)] shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      Start Filing
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

