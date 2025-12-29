'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, updateBusiness, deleteBusiness } from '@/lib/db';
import { validateBusinessName, validateEIN, formatEIN } from '@/lib/validation';
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
  ChevronsUpDown
} from 'lucide-react';

export default function BusinessesPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [deletingBusiness, setDeletingBusiness] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    businessName: '',
    ein: '',
    address: '',
    phone: '',
    signingAuthorityName: '',
    entityType: ''
  });
  const [businessErrors, setBusinessErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Entity type options
  const entityTypes = [
    'Corporation',
    'LLC',
    'Partnership',
    'Sole Proprietorship',
    'Other'
  ];

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

  const handleEdit = (business) => {
    setEditingBusiness({ ...business });
    setBusinessErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingBusiness) return;

    const errors = {};

    // Validate business name (required)
    if (!editingBusiness.businessName || editingBusiness.businessName.trim() === '') {
      errors.businessName = 'Business name is required';
    } else {
      const nameVal = validateBusinessName(editingBusiness.businessName.trim());
      if (!nameVal.isValid) {
        errors.businessName = nameVal.error;
      }
    }

    // Validate EIN if provided (must be exactly 9 digits)
    if (editingBusiness.ein && editingBusiness.ein.trim() !== '') {
      const einVal = validateEIN(editingBusiness.ein.trim());
      if (!einVal.isValid) {
        errors.ein = einVal.error;
      }
    }

    // Validate phone number format (optional but if provided, should be valid)
    if (editingBusiness.phone && editingBusiness.phone.trim() !== '') {
      const phoneRegex = /^[\d\s\-\(\)]+$/;
      const cleanPhone = editingBusiness.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        errors.phone = 'Phone number must be between 10 and 15 digits';
      } else if (!phoneRegex.test(editingBusiness.phone)) {
        errors.phone = 'Phone number contains invalid characters';
      }
    }

    // Validate address (optional but if provided, should have reasonable length)
    if (editingBusiness.address && editingBusiness.address.trim() !== '') {
      if (editingBusiness.address.trim().length < 5) {
        errors.address = 'Address is too short';
      } else if (editingBusiness.address.trim().length > 200) {
        errors.address = 'Address is too long (max 200 characters)';
      }
    }

    // Validate signing authority name (optional but if provided, should be valid)
    if (editingBusiness.signingAuthorityName && editingBusiness.signingAuthorityName.trim() !== '') {
      if (editingBusiness.signingAuthorityName.trim().length < 2) {
        errors.signingAuthorityName = 'Name is too short';
      } else if (editingBusiness.signingAuthorityName.trim().length > 100) {
        errors.signingAuthorityName = 'Name is too long (max 100 characters)';
      } else if (!/^[a-zA-Z\s\-'\.]+$/.test(editingBusiness.signingAuthorityName.trim())) {
        errors.signingAuthorityName = 'Name contains invalid characters';
      }
    }

    // If there are errors, set them and return
    if (Object.keys(errors).length > 0) {
      setBusinessErrors(errors);
      return;
    }

    setSaving(true);
    setBusinessErrors({});

    try {
      await updateBusiness(editingBusiness.id, {
        businessName: editingBusiness.businessName.trim(),
        ein: editingBusiness.ein?.trim() || '',
        address: editingBusiness.address?.trim() || '',
        phone: editingBusiness.phone?.trim() || '',
        signingAuthorityName: editingBusiness.signingAuthorityName?.trim() || '',
        entityType: editingBusiness.entityType || ''
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
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[var(--color-orange)] mb-4 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                Business Management
              </h1>
              <p className="text-slate-500">
                Manage your business profiles and filing information
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg active:scale-95 transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Add Business</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {businesses.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by business name, EIN, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[var(--color-orange)]/30 border-t-[var(--color-orange)] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading businesses...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
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
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {searchQuery ? 'No businesses match your search' : 'No Businesses Yet'}
            </h2>
            <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Add your business details to get started with your tax filings. You can manage multiple businesses from here.'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
              >
                Add Your First Business
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ overflow: 'visible' }}>
            {/* Modern Table Header - Hidden on mobile */}
            <div className="hidden lg:block sticky top-0 z-20 bg-white border-b border-slate-200 backdrop-blur-sm bg-white/95">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
                <div className="col-span-4">
                  <button
                    onClick={() => handleSort('businessName')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Business
                    {sortConfig.key === 'businessName' ? (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort('ein')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    EIN
                    {sortConfig.key === 'ein' ? (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort('entityType')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Type
                    {sortConfig.key === 'entityType' ? (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </div>
                <div className="col-span-2">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    Added
                    {sortConfig.key === 'createdAt' ? (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    ) : (
                      <ChevronsUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </button>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</span>
                </div>
              </div>
            </div>

            {/* Modern Table Body */}
            <div className="divide-y divide-slate-100 relative" style={{ overflow: 'visible' }}>
              {filteredBusinesses.map((business, index) => (
                <div
                  key={business.id}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 sm:px-6 py-4 sm:py-5 hover:bg-gradient-to-r hover:from-blue-50/30 hover:via-white hover:to-white transition-all duration-300 relative cursor-pointer"
                  style={{ 
                    animationDelay: `${index * 30}ms`,
                    animation: 'fadeInUp 0.4s ease-out forwards',
                    position: 'relative',
                    zIndex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.zIndex = '50';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.zIndex = '1';
                  }}
                >
                  {/* Left accent bar on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-orange)] via-[var(--color-amber)] to-[var(--color-orange)] opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-r-full"></div>

                  {/* Business Info - Full width on mobile, spans 4 cols on desktop */}
                  <div className="col-span-1 lg:col-span-4 flex items-center gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:scale-110 group-hover:shadow-md">
                      <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 transition-transform group-hover:rotate-12" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[var(--color-orange)] transition-colors truncate">
                          {business.businessName || 'Unnamed Business'}
                        </h3>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {business.address && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EIN */}
                  <div className="col-span-1 lg:col-span-2 flex items-center">
                    {business.ein ? (
                      <div className="flex items-center gap-2">
                        {/* <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-slate-300 shadow-sm">
                          <span className="text-xs font-bold text-slate-700 font-mono">{formatEIN(business.ein)}</span>
                        </div> */}
                        <span className="text-sm text-slate-600 font-medium hidden sm:inline font-mono">
                          {formatEIN(business.ein)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Not set</span>
                    )}
                  </div>

                  {/* Entity Type */}
                  <div className="col-span-1 lg:col-span-2 flex items-center">
                    {business.entityType ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-300 rounded-xl text-xs sm:text-sm font-semibold shadow-sm">
                        {business.entityType}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Not set</span>
                    )}
                  </div>

                  {/* Added Date */}
                  <div className="col-span-1 lg:col-span-2 flex items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-medium">
                        {formatDate(business.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 lg:col-span-2 flex items-center justify-start lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:border-0">
                    <Link
                      href={`/dashboard/new-filing?businessId=${business.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 lg:flex-none px-4 py-2.5 bg-gradient-to-r from-[var(--color-orange)] to-[var(--color-amber)] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Use for Filing</span>
                    </Link>
                    <div className="relative actions-menu-group" style={{ zIndex: 50 }}>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 hover:bg-slate-100 rounded-xl transition-all hover:scale-110 relative"
                      >
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                      <div className="absolute right-0 top-full mt-0.5 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl opacity-0 invisible actions-menu transition-all" style={{ zIndex: 100 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(business);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-t-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Business
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingBusiness(business);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Business
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingBusiness && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !saving && setEditingBusiness(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Edit Business</h2>
                <button
                  onClick={() => setEditingBusiness(null)}
                  disabled={saving}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {businessErrors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {businessErrors.general}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.businessName || ''}
                    onChange={(e) => {
                      setEditingBusiness({ ...editingBusiness, businessName: e.target.value });
                      // Clear error when user starts typing
                      if (businessErrors.businessName) {
                        setBusinessErrors({ ...businessErrors, businessName: '' });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${
                      businessErrors.businessName ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="Enter business name"
                  />
                  {businessErrors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{businessErrors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    EIN (Employer Identification Number)
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.ein || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                      setEditingBusiness({ ...editingBusiness, ein: value });
                      // Clear error when user starts typing
                      if (businessErrors.ein) {
                        setBusinessErrors({ ...businessErrors, ein: '' });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all font-mono ${
                      businessErrors.ein ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="123456789"
                    maxLength={9}
                  />
                  {businessErrors.ein && (
                    <p className="mt-1 text-sm text-red-600">{businessErrors.ein}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Entity Type
                  </label>
                  <select
                    value={editingBusiness.entityType || ''}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, entityType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select entity type</option>
                    {entityTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={editingBusiness.address || ''}
                    onChange={(e) => {
                      setEditingBusiness({ ...editingBusiness, address: e.target.value });
                      // Clear error when user starts typing
                      if (businessErrors.address) {
                        setBusinessErrors({ ...businessErrors, address: '' });
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${
                      businessErrors.address ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                    placeholder="Enter business address"
                    rows={3}
                  />
                  {businessErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{businessErrors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editingBusiness.phone || ''}
                      onChange={(e) => {
                        setEditingBusiness({ ...editingBusiness, phone: e.target.value });
                        // Clear error when user starts typing
                        if (businessErrors.phone) {
                          setBusinessErrors({ ...businessErrors, phone: '' });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${
                        businessErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                      placeholder="(555) 123-4567"
                    />
                    {businessErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{businessErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Signing Authority Name
                    </label>
                    <input
                      type="text"
                      value={editingBusiness.signingAuthorityName || ''}
                      onChange={(e) => {
                        setEditingBusiness({ ...editingBusiness, signingAuthorityName: e.target.value });
                        // Clear error when user starts typing
                        if (businessErrors.signingAuthorityName) {
                          setBusinessErrors({ ...businessErrors, signingAuthorityName: '' });
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${
                        businessErrors.signingAuthorityName ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                      placeholder="John Doe"
                    />
                    {businessErrors.signingAuthorityName && (
                      <p className="mt-1 text-sm text-red-600">{businessErrors.signingAuthorityName}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingBusiness(null)}
                  disabled={saving}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-[var(--color-orange)] text-white rounded-xl font-semibold hover:bg-[var(--color-orange-soft)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
    </ProtectedRoute>
  );
}
