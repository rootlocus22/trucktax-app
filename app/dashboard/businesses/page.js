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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--color-text)] mb-2">
                Businesses
              </h1>
              <p className="text-sm text-[var(--color-muted)]">
                Manage your business information for filings
              </p>
            </div>
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
              style={{ color: '#ffffff' }}
            >
              <Plus className="w-4 h-4" />
              Add Business
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[var(--color-muted)] animate-pulse" />
            </div>
            <p className="text-[var(--color-muted)]">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              No Businesses Yet
            </h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Create your first business to get started with filings.
            </p>
            <Link
              href="/dashboard/new-filing"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
              style={{ color: '#ffffff' }}
            >
              <Plus className="w-4 h-4" />
              Add Your First Business
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-5 hover:border-[var(--color-navy)] hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-soft)] rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">
                        {business.businessName || 'Unnamed Business'}
                      </h3>
                      {business.ein && (
                        <p className="text-xs text-[var(--color-muted)]">
                          EIN: {business.ein}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {business.address && (
                    <div className="flex items-start gap-2 text-[var(--color-muted)]">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <div className="flex items-center gap-2 text-[var(--color-muted)]">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  {business.signingAuthorityName && (
                    <div className="flex items-center gap-2 text-[var(--color-muted)]">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span>{business.signingAuthorityName}</span>
                      {business.signingAuthorityTitle && (
                        <span className="text-xs">({business.signingAuthorityTitle})</span>
                      )}
                    </div>
                  )}
                  {business.createdAt && (
                    <div className="flex items-center gap-2 text-[var(--color-muted)] text-xs pt-2 border-t border-[var(--color-border)]">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Created: {formatDate(business.createdAt)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                  <Link
                    href={`/dashboard/new-filing?businessId=${business.id}`}
                    className="inline-flex items-center gap-2 text-sm text-[var(--color-navy)] hover:underline font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Use for Filing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

