'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getAllFilings, getUser, getBusiness } from '@/lib/db';
import { 
  CheckCircle, 
  DollarSign,
  Calendar,
  ArrowRight,
  FileText,
  Building2,
  Truck,
  TrendingUp,
  Search,
  X,
  User
} from 'lucide-react';

const EARNINGS_PER_FILING = 5.00; // $5 per completed filing

export default function AgentFilingHistory() {
  const { userData } = useAuth();
  const [allFilings, setAllFilings] = useState([]);
  const [filingsWithDetails, setFilingsWithDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFilings();
  }, []);

  const loadFilings = async () => {
    try {
      const filings = await getAllFilings();
      setAllFilings(filings);
      
      // Load user and business details for each filing
      const filingsWithDetailsData = await Promise.all(
        filings.map(async (filing) => {
          let user = null;
          let business = null;
          
          if (filing.userId) {
            try {
              user = await getUser(filing.userId);
            } catch (err) {
              console.error(`Error loading user for filing ${filing.id}:`, err);
            }
          }
          
          if (filing.businessId) {
            try {
              business = await getBusiness(filing.businessId);
            } catch (err) {
              console.error(`Error loading business for filing ${filing.id}:`, err);
            }
          }
          
          return {
            ...filing,
            user,
            business
          };
        })
      );
      
      setFilingsWithDetails(filingsWithDetailsData);
    } catch (error) {
      console.error('Error loading filings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search completed filings
  const completedFilings = useMemo(() => {
    let filtered = filingsWithDetails
      .filter(f => f.status === 'completed')
      .sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt || 0);
        const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt || 0);
        return dateB.getTime() - dateA.getTime();
      });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(filing => {
        // Search in user name/email
        const userName = filing.user?.displayName?.toLowerCase() || '';
        const userEmail = filing.user?.email?.toLowerCase() || '';
        
        // Search in business name
        const businessName = filing.business?.businessName?.toLowerCase() || '';
        const businessEin = filing.business?.ein?.toLowerCase() || '';
        
        // Search in tax year
        const taxYear = filing.taxYear?.toLowerCase() || '';
        
        // Search in filing ID
        const filingId = filing.id?.toLowerCase() || '';
        
        return userName.includes(query) ||
               userEmail.includes(query) ||
               businessName.includes(query) ||
               businessEin.includes(query) ||
               taxYear.includes(query) ||
               filingId.includes(query);
      });
    }

    return filtered;
  }, [filingsWithDetails, searchQuery]);

  const totalEarnings = completedFilings.length * EARNINGS_PER_FILING;

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
    <ProtectedRoute requiredRole="agent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[var(--color-text)] mb-2">
            Filing History
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            View all completed filings and track your earnings
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search by name, email, business name, EIN, tax year, or filing ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] outline-none bg-white text-[var(--color-text)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-4 h-4 text-[var(--color-muted)]" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Found {completedFilings.length} {completedFilings.length === 1 ? 'filing' : 'filings'} matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
              <p className="text-sm opacity-80 mt-1">
                {completedFilings.length} {completedFilings.length === 1 ? 'filing' : 'filings'} completed
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Filings List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--color-muted)] animate-pulse" />
            </div>
            <p className="text-[var(--color-muted)]">Loading filing history...</p>
          </div>
        ) : completedFilings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[var(--color-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              No Completed Filings Yet
            </h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Completed filings will appear here with earnings information.
            </p>
            <Link
              href="/agent"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transition shadow-md"
              style={{ color: '#ffffff' }}
            >
              View Active Queue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {completedFilings.map((filing) => {
              return (
                <div
                  key={filing.id}
                  className="bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] p-5 hover:border-green-300 hover:shadow-md transition group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">
                          Tax Year: {filing.taxYear || 'N/A'}
                        </h3>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Completed
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                          <DollarSign className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs font-semibold text-green-700">+${EARNINGS_PER_FILING.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {filing.user && (
                          <div className="flex items-center gap-2 text-[var(--color-muted)]">
                            <User className="w-4 h-4" />
                            <span className="truncate">
                              {filing.user.displayName || filing.user.email || 'Unknown User'}
                            </span>
                          </div>
                        )}
                        {filing.business && (
                          <div className="flex items-center gap-2 text-[var(--color-muted)]">
                            <Building2 className="w-4 h-4" />
                            <span className="truncate">
                              {filing.business.businessName || 'Business'}
                            </span>
                          </div>
                        )}
                        {filing.vehicleIds && filing.vehicleIds.length > 0 && (
                          <div className="flex items-center gap-2 text-[var(--color-muted)]">
                            <Truck className="w-4 h-4" />
                            <span>{filing.vehicleIds.length} {filing.vehicleIds.length === 1 ? 'vehicle' : 'vehicles'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[var(--color-muted)]">
                          <Calendar className="w-4 h-4" />
                          <span>Completed: {formatDate(filing.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/agent/filings/${filing.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-navy)] text-white rounded-lg font-medium text-sm hover:bg-[var(--color-navy-soft)] transition group-hover:shadow-md"
                        style={{ color: '#ffffff' }}
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                      </Link>
                    </div>
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

