'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, createBusiness, updateBusiness, deleteBusiness } from '@/lib/db';
import { validateBusinessName, validateEIN, formatEIN, validateAddress, validatePhone, validateCity, validateState, validateZip, validateCountry, validatePIN } from '@/lib/validation';
import {
  Building2,
  Plus,
  ArrowLeft,
  FileText,
  Calendar,
  Phone,
  MapPin,
  User,
  Edit,
  Trash2,
  Search,
  MoreVertical,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Info,
  Sparkles,
  Upload
} from 'lucide-react';
import BusinessFormModal from '@/components/BusinessFormModal';

export default function BusinessesPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [deletingBusiness, setDeletingBusiness] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [businessErrors, setBusinessErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });


  useEffect(() => {
    if (user) {
      loadBusinesses();
    }
  }, [user]);

  useEffect(() => {
    // Filter and sort businesses
    let filtered = businesses;

    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ein?.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, '')) ||
        b.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle dates
        if (sortConfig.key === 'createdAt') {
          aValue = aValue?.seconds ? aValue.seconds * 1000 : (aValue ? new Date(aValue).getTime() : 0);
          bValue = bValue?.seconds ? bValue.seconds * 1000 : (bValue ? new Date(bValue).getTime() : 0);
        } else {
          // Handle strings
          aValue = aValue?.toString().toLowerCase() || '';
          bValue = bValue?.toString().toLowerCase() || '';
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredBusinesses(filtered);
  }, [businesses, searchQuery, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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
    const d = date instanceof Date ? date : (date.seconds ? new Date(date.seconds * 1000) : new Date(date));
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const businessCards = filteredBusinesses.map((business) => (
    <div
      key={business.id}
      className="group bg-white rounded-2xl border border-slate-200 hover:border-[var(--color-orange)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
    >
      <div className="p-8 pb-6 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 group-hover:from-orange-50/30 group-hover:to-white transition-colors">
        <div className="flex items-start justify-between mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-[var(--color-orange)] group-hover:shadow-md transition-all duration-300">
            <Building2 className="w-8 h-8 text-blue-600 group-hover:text-[var(--color-orange)] transition-colors duration-300" strokeWidth={1.5} />
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white text-slate-600 rounded-lg text-xs font-bold border border-slate-200 uppercase tracking-wide shadow-sm">
              {business.entityType || 'Business'}
            </span>
          </div>
        </div>
      </div>
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
        <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-all duration-200 touch-manipulation">
            <Edit className="w-4 h-4" />
            Edit Details
          </button>
          <Link
            href="/ucr/file"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-orange)] text-white font-semibold text-sm hover:bg-[var(--color-orange-soft)] active:scale-95 shadow-md hover:shadow-lg transition-all duration-200 touch-manipulation"
          >
            <FileText className="w-4 h-4" />
            Start Filing
          </Link>
        </div>
      </div>
    </div>
  ));

  const handleEdit = (business) => {
    setEditingBusiness(business);
  };

  const handleAddBusiness = async (data) => {
    setSaving(true);
    setBusinessErrors({});

    try {
      await createBusiness(user.uid, data);
      await loadBusinesses();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating business:', error);
      setBusinessErrors({ general: 'Failed to create business. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (data) => {
    if (!editingBusiness) return;

    setSaving(true);
    setBusinessErrors({});

    try {
      await updateBusiness(editingBusiness.id, {
        ...data,
        businessName: data.businessName.trim(),
        ein: data.ein?.trim() || '',
        address: data.address?.trim() || '',
        city: data.city?.trim() || '',
        state: data.state?.trim() || '',
        zip: data.zip?.trim() || '',
        country: data.country?.trim() || 'United States of America',
        phone: data.phone?.trim() || '',
        signingAuthorityName: data.signingAuthorityName?.trim() || '',
        signingAuthorityPhone: data.signingAuthorityPhone?.trim() || '',
        signingAuthorityPIN: data.signingAuthorityPIN?.trim() || '',
        hasThirdPartyDesignee: data.hasThirdPartyDesignee || false,
        thirdPartyDesigneeName: data.hasThirdPartyDesignee ? (data.thirdPartyDesigneeName?.trim() || '') : '',
        thirdPartyDesigneePhone: data.hasThirdPartyDesignee ? (data.thirdPartyDesigneePhone?.trim() || '') : '',
        thirdPartyDesigneePIN: data.hasThirdPartyDesignee ? (data.thirdPartyDesigneePIN?.trim() || '') : ''
      });

      await loadBusinesses();
      setEditingBusiness(null);
    } catch (error) {
      console.error('Error updating business:', error);
      setBusinessErrors({ general: 'Failed to update business. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (businessId) => {
    setSaving(true);
    try {
      await deleteBusiness(businessId);
      await loadBusinesses();
      setDeletingBusiness(null);
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Failed to delete business. Please try again.');
    } finally {
      setSaving(false);
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
                  <Building2 className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Business Directory
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Link href="/dashboard" className="hover:text-[#14b8a6] transition-colors">Dashboard</Link>
                <span>/</span>
                <span className="text-slate-400">Entity Management</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/upload-schedule1"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10 border border-white/10"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" strokeWidth={3} />
                AI-Powered Upload
              </Link>
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setBusinessErrors({});
                }}
                className="inline-flex items-center justify-center gap-2 bg-[#14b8a6] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0d9488] transition-all active:scale-95 shadow-lg shadow-teal-500/20"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                Add New Entity
              </button>
            </div>
          </div>
          <Link
            href="/ucr/file"
            className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg active:scale-95 transition-all duration-200 shadow-md touch-manipulation w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Business</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Empty state */}
          {!loading && businesses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">No Businesses Yet</h2>
              <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
                Add your business details to get started with your tax filings. You can manage multiple businesses from here.
              </p>
              <Link
                href="/ucr/file"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
              >
                Add Your First Business
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          )}
          {/* Management Context Banner + Grid when we have businesses */}
          {!loading && businesses.length > 0 && (
            <>
              <div className="bg-[#173b63] rounded-[2rem] p-6 shadow-xl shadow-slate-900/10 border border-white/10 relative overflow-hidden group mb-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-teal-500/20">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/5">
                          Registration Center
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight">
                        {businesses.length} Registered {businesses.length === 1 ? 'Business' : 'Businesses'}
                      </h2>
                      <p className="text-sm text-white/60 mt-1">
                        Active filing entities linked to your account
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Search Bar */}
              {businesses.length > 0 && (
                <div className="mb-8 flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search entities by name, EIN, or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all text-sm font-bold tracking-tight"
                    />
                  </div>
                </div>
              )}
              <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
                {businessCards}
                {filteredBusinesses.length === 0 && searchQuery && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">No businesses match your search</h2>
                  <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
            <div className="bg-transparent lg:bg-white lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-sm overflow-hidden mb-20 hidden">
              {/* High-Density Table Header */}
              <div className="hidden lg:block bg-slate-50 border-b border-slate-100">
                <div className="grid grid-cols-12 gap-4 px-6 py-4">
                  <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Entity Identification
                  </div>
                  <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Tax Identifier
                  </div>
                  <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Established
                  </div>
                  <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                    Management
                  </div>
                </div>
              </div>

              {/* High-Density Row Redesign */}
              <div className="space-y-4 lg:space-y-0 lg:divide-y lg:divide-slate-100 p-1 lg:p-0">
                {filteredBusinesses.map((business, index) => (
                  <div
                    key={business.id}
                    className="group bg-white lg:bg-transparent rounded-2xl lg:rounded-none border border-slate-200 lg:border-none shadow-sm lg:shadow-none grid grid-cols-1 lg:grid-cols-12 gap-4 px-5 py-5 lg:px-6 lg:py-4 hover:bg-slate-50/50 transition-all duration-300 relative"
                    style={{
                      animationDelay: `${index * 30}ms`,
                      animation: 'fadeInUp 0.4s ease-out forwards',
                    }}
                  >
                    <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-[#14b8a6] opacity-0 group-hover:opacity-100 transition-all rounded-r-full"></div>

                    {/* Business Identity */}
                    <div className="col-span-1 lg:col-span-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#14b8a6]/10 group-hover:text-[#14b8a6] group-hover:border-[#14b8a6]/20 transition-all shadow-sm">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-[#173b63] transition-colors leading-tight">
                          {business.businessName || 'UNNAMED ENTITY'}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          <MapPin className="w-3 h-3 text-[#14b8a6]" />
                          <span className="truncate max-w-[250px]">{business.address || 'Location Not Set'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Identifier (EIN) */}
                    <div className="col-span-1 lg:col-span-2 flex items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900 font-mono tracking-tighter">
                          {business.ein ? formatEIN(business.ein) : 'PENDING EIN'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                          Employer ID
                        </span>
                      </div>
                    </div>

                    {/* Registration Profile */}
                    <div className="col-span-1 lg:col-span-2 flex items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                          {formatDate(business.createdAt)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                          Registered On
                        </span>
                      </div>
                    </div>

                    {/* Management Actions */}
                    <div className="col-span-1 lg:col-span-3 flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/new-filing?businessId=${business.id}`}
                        className="min-w-[140px] text-center px-4 py-2 bg-[#14b8a6] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0d9488] transition-all shadow-md shadow-teal-500/10 active:scale-95"
                      >
                        Use for Filing
                      </Link>
                      <div className="relative actions-menu-group" style={{ zIndex: 100 }}>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl opacity-0 invisible actions-menu transition-all transform scale-95 z-[200]">
                          <button
                            onClick={() => handleEdit(business)}
                            className="w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 flex items-center gap-3 rounded-t-2xl transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-400" />
                            Edit Entity
                          </button>
                          <button
                            onClick={() => setDeletingBusiness(business)}
                            className="w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-3 rounded-b-2xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove Entity
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </>
          )}

          {/* Add Business Modal */}
          <BusinessFormModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddBusiness}
            loading={saving}
            externalErrors={businessErrors}
          />

          {/* Edit Modal */}
          <BusinessFormModal
            isOpen={!!editingBusiness}
            onClose={() => setEditingBusiness(null)}
            onSubmit={handleSaveEdit}
            initialBusiness={editingBusiness}
            loading={saving}
            submitButtonText="Save Changes"
            title="Edit Business"
            externalErrors={businessErrors}
          />

          {/* Delete Confirmation Modal */}
          {deletingBusiness && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !saving && setDeletingBusiness(null)}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Delete Business</h2>
                    <p className="text-sm text-slate-500">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-slate-700 mb-6">
                  Are you sure you want to delete <span className="font-bold">{deletingBusiness.businessName || 'this business'}</span>?
                  This will permanently remove all business information.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingBusiness(null)}
                    disabled={saving}
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deletingBusiness.id)}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
