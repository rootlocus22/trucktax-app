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
  Info
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
    city: '',
    state: '',
    zip: '',
    country: 'United States of America', // Default to United States
    phone: '',
    signingAuthorityName: '',
    signingAuthorityPhone: '',
    signingAuthorityPIN: '',
    hasThirdPartyDesignee: false,
    thirdPartyDesigneeName: '',
    thirdPartyDesigneePhone: '',
    thirdPartyDesigneePIN: ''
  });
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

  const handleEdit = (business) => {
    setEditingBusiness({ 
      ...business,
      city: business.city || '',
      state: business.state || '',
      zip: business.zip || '',
      country: business.country || '',
      signingAuthorityName: business.signingAuthorityName || '',
      signingAuthorityPhone: business.signingAuthorityPhone || '',
        signingAuthorityPIN: business.signingAuthorityPIN || '',
        hasThirdPartyDesignee: business.hasThirdPartyDesignee || false,
        thirdPartyDesigneeName: business.thirdPartyDesigneeName || '',
        thirdPartyDesigneePhone: business.thirdPartyDesigneePhone || '',
        thirdPartyDesigneePIN: business.thirdPartyDesigneePIN || '',
        country: business.country || 'United States of America'
    });
    setBusinessErrors({});
  };

  const handleBusinessChange = (field, value, isEdit = false) => {
    let formattedValue = value;
    if (field === 'ein') {
      formattedValue = formatEIN(value);
    }
    if (field === 'zip') {
      // Format ZIP: allow 5 digits or 5+4 format
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.slice(0, 5) + '-' + formattedValue.slice(5, 9);
      }
    }
    if (field === 'state') {
      // Convert to uppercase for state codes
      formattedValue = value.toUpperCase().trim();
    }
    if (field === 'phone' || field === 'signingAuthorityPhone' || field === 'thirdPartyDesigneePhone') {
      // Format phone number: (XXX) XXX-XXXX
      const cleanPhone = value.replace(/\D/g, '');
      if (cleanPhone.length <= 3) {
        formattedValue = cleanPhone;
      } else if (cleanPhone.length <= 6) {
        formattedValue = `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3)}`;
      } else if (cleanPhone.length <= 10) {
        formattedValue = `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6, 10)}`;
      } else {
        // Handle 11 digits (with country code 1)
        formattedValue = `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7, 11)}`;
      }
    }
    if (field === 'signingAuthorityPIN' || field === 'thirdPartyDesigneePIN') {
      // Format PIN: only allow 5 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 5);
    }

    if (isEdit) {
      setEditingBusiness(prev => ({ ...prev, [field]: formattedValue }));
    } else {
      setNewBusiness(prev => ({ ...prev, [field]: formattedValue }));
    }

    // Real-time validation
    let validation;
    if (field === 'businessName') validation = validateBusinessName(formattedValue);
    if (field === 'ein') validation = validateEIN(formattedValue);
    if (field === 'address') validation = validateAddress(formattedValue, true);
    if (field === 'city') validation = validateCity(formattedValue, true);
    if (field === 'state') validation = validateState(formattedValue, true);
    if (field === 'zip') validation = validateZip(formattedValue, true);
    if (field === 'country') validation = validateCountry(formattedValue, true);
    if (field === 'phone') validation = validatePhone(formattedValue, true);
    if (field === 'signingAuthorityName') {
      validation = formattedValue && formattedValue.trim().length >= 2 
        ? { isValid: true, error: '' } 
        : { isValid: false, error: 'Signing Authority Name is required and must be at least 2 characters' };
    }
    if (field === 'signingAuthorityPhone') validation = validatePhone(formattedValue, true);
    if (field === 'signingAuthorityPIN') validation = validatePIN(formattedValue, true);
    if (field === 'thirdPartyDesigneeName') {
      const hasThirdParty = isEdit ? editingBusiness?.hasThirdPartyDesignee : newBusiness.hasThirdPartyDesignee;
      validation = hasThirdParty 
        ? (formattedValue && formattedValue.trim().length >= 2 
            ? { isValid: true, error: '' } 
            : { isValid: false, error: 'Third Party Designee Name is required and must be at least 2 characters' })
        : { isValid: true, error: '' };
    }
    if (field === 'thirdPartyDesigneePhone') validation = validatePhone(formattedValue, isEdit ? editingBusiness?.hasThirdPartyDesignee : newBusiness.hasThirdPartyDesignee);
    if (field === 'thirdPartyDesigneePIN') validation = validatePIN(formattedValue, isEdit ? editingBusiness?.hasThirdPartyDesignee : newBusiness.hasThirdPartyDesignee);

    if (validation) {
      setBusinessErrors(prev => ({
        ...prev,
        [field]: validation.isValid ? '' : validation.error
      }));
    }
  };

  const handleAddBusiness = async () => {
    // Run all validations
    const nameVal = validateBusinessName(newBusiness.businessName);
    const einVal = validateEIN(newBusiness.ein);
    const addrVal = validateAddress(newBusiness.address, true);
    const cityVal = validateCity(newBusiness.city, true);
    const stateVal = validateState(newBusiness.state, true);
    const zipVal = validateZip(newBusiness.zip, true);
    const countryVal = validateCountry(newBusiness.country, true);
    const phoneVal = validatePhone(newBusiness.phone, true);
    // Validate signing authority name (required, but simpler than business name)
    const signingAuthorityNameVal = newBusiness.signingAuthorityName && newBusiness.signingAuthorityName.trim().length >= 2 
      ? { isValid: true, error: '' } 
      : { isValid: false, error: 'Signing Authority Name is required and must be at least 2 characters' };
    const signingAuthorityPhoneVal = validatePhone(newBusiness.signingAuthorityPhone, true);
    const signingAuthorityPINVal = validatePIN(newBusiness.signingAuthorityPIN, true);
    // Validate third party designee name (required if Third Party Designee is Yes)
    const thirdPartyDesigneeNameVal = newBusiness.hasThirdPartyDesignee 
      ? (newBusiness.thirdPartyDesigneeName && newBusiness.thirdPartyDesigneeName.trim().length >= 2 
          ? { isValid: true, error: '' } 
          : { isValid: false, error: 'Third Party Designee Name is required and must be at least 2 characters' })
      : { isValid: true, error: '' };
    const thirdPartyDesigneePhoneVal = validatePhone(newBusiness.thirdPartyDesigneePhone, newBusiness.hasThirdPartyDesignee);
    const thirdPartyDesigneePINVal = validatePIN(newBusiness.thirdPartyDesigneePIN, newBusiness.hasThirdPartyDesignee);

    if (!nameVal.isValid || !einVal.isValid || !addrVal.isValid || !cityVal.isValid || !stateVal.isValid || !zipVal.isValid || !countryVal.isValid || !phoneVal.isValid ||
        !signingAuthorityNameVal.isValid || !signingAuthorityPhoneVal.isValid || !signingAuthorityPINVal.isValid ||
        !thirdPartyDesigneeNameVal.isValid || !thirdPartyDesigneePhoneVal.isValid || !thirdPartyDesigneePINVal.isValid) {
      setBusinessErrors({
        businessName: nameVal.error,
        ein: einVal.error,
        address: addrVal.error,
        city: cityVal.error,
        state: stateVal.error,
        zip: zipVal.error,
        country: countryVal.error,
        phone: phoneVal.error,
        signingAuthorityName: signingAuthorityNameVal.error,
        signingAuthorityPhone: signingAuthorityPhoneVal.error,
        signingAuthorityPIN: signingAuthorityPINVal.error,
        thirdPartyDesigneeName: thirdPartyDesigneeNameVal.error,
        thirdPartyDesigneePhone: thirdPartyDesigneePhoneVal.error,
        thirdPartyDesigneePIN: thirdPartyDesigneePINVal.error
      });
      return;
    }

    setSaving(true);
    setBusinessErrors({});

    try {
      await createBusiness(user.uid, newBusiness);
      await loadBusinesses();
      setShowAddModal(false);
      setNewBusiness({
        businessName: '',
        ein: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        signingAuthorityName: '',
        signingAuthorityPhone: '',
        signingAuthorityPIN: '',
        hasThirdPartyDesignee: false,
        thirdPartyDesigneeName: '',
        thirdPartyDesigneePhone: '',
        thirdPartyDesigneePIN: ''
      });
    } catch (error) {
      console.error('Error creating business:', error);
      setBusinessErrors({ general: 'Failed to create business. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingBusiness) return;

    // Run all validations
    const nameVal = validateBusinessName(editingBusiness.businessName);
    const einVal = validateEIN(editingBusiness.ein);
    const addrVal = validateAddress(editingBusiness.address, true);
    const cityVal = validateCity(editingBusiness.city, true);
    const stateVal = validateState(editingBusiness.state, true);
    const zipVal = validateZip(editingBusiness.zip, true);
    const countryVal = validateCountry(editingBusiness.country, true);
    const phoneVal = validatePhone(editingBusiness.phone, true);
    // Validate signing authority name (required, but simpler than business name)
    const signingAuthorityNameVal = editingBusiness.signingAuthorityName && editingBusiness.signingAuthorityName.trim().length >= 2 
      ? { isValid: true, error: '' } 
      : { isValid: false, error: 'Signing Authority Name is required and must be at least 2 characters' };
    const signingAuthorityPhoneVal = validatePhone(editingBusiness.signingAuthorityPhone, true);
    const signingAuthorityPINVal = validatePIN(editingBusiness.signingAuthorityPIN, true);
    // Validate third party designee name (required if Third Party Designee is Yes)
    const thirdPartyDesigneeNameVal = editingBusiness.hasThirdPartyDesignee 
      ? (editingBusiness.thirdPartyDesigneeName && editingBusiness.thirdPartyDesigneeName.trim().length >= 2 
          ? { isValid: true, error: '' } 
          : { isValid: false, error: 'Third Party Designee Name is required and must be at least 2 characters' })
      : { isValid: true, error: '' };
    const thirdPartyDesigneePhoneVal = validatePhone(editingBusiness.thirdPartyDesigneePhone, editingBusiness.hasThirdPartyDesignee);
    const thirdPartyDesigneePINVal = validatePIN(editingBusiness.thirdPartyDesigneePIN, editingBusiness.hasThirdPartyDesignee);

    if (!nameVal.isValid || !einVal.isValid || !addrVal.isValid || !cityVal.isValid || !stateVal.isValid || !zipVal.isValid || !countryVal.isValid || !phoneVal.isValid ||
        !signingAuthorityNameVal.isValid || !signingAuthorityPhoneVal.isValid || !signingAuthorityPINVal.isValid ||
        !thirdPartyDesigneeNameVal.isValid || !thirdPartyDesigneePhoneVal.isValid || !thirdPartyDesigneePINVal.isValid) {
      setBusinessErrors({
        businessName: nameVal.error,
        ein: einVal.error,
        address: addrVal.error,
        city: cityVal.error,
        state: stateVal.error,
        zip: zipVal.error,
        country: countryVal.error,
        phone: phoneVal.error,
        signingAuthorityName: signingAuthorityNameVal.error,
        signingAuthorityPhone: signingAuthorityPhoneVal.error,
        signingAuthorityPIN: signingAuthorityPINVal.error,
        thirdPartyDesigneeName: thirdPartyDesigneeNameVal.error,
        thirdPartyDesigneePhone: thirdPartyDesigneePhoneVal.error,
        thirdPartyDesigneePIN: thirdPartyDesigneePINVal.error
      });
      return;
    }

    setSaving(true);
    setBusinessErrors({});

    try {
      await updateBusiness(editingBusiness.id, {
        businessName: editingBusiness.businessName.trim(),
        ein: editingBusiness.ein?.trim() || '',
        address: editingBusiness.address?.trim() || '',
        city: editingBusiness.city?.trim() || '',
        state: editingBusiness.state?.trim() || '',
        zip: editingBusiness.zip?.trim() || '',
        country: editingBusiness.country?.trim() || 'United States of America',
        phone: editingBusiness.phone?.trim() || '',
        signingAuthorityName: editingBusiness.signingAuthorityName?.trim() || '',
        signingAuthorityPhone: editingBusiness.signingAuthorityPhone?.trim() || '',
        signingAuthorityPIN: editingBusiness.signingAuthorityPIN?.trim() || '',
        hasThirdPartyDesignee: editingBusiness.hasThirdPartyDesignee || false,
        thirdPartyDesigneeName: editingBusiness.hasThirdPartyDesignee ? (editingBusiness.thirdPartyDesigneeName?.trim() || '') : '',
        thirdPartyDesigneePhone: editingBusiness.hasThirdPartyDesignee ? (editingBusiness.thirdPartyDesigneePhone?.trim() || '') : '',
        thirdPartyDesigneePIN: editingBusiness.hasThirdPartyDesignee ? (editingBusiness.thirdPartyDesigneePIN?.trim() || '') : ''
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
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setNewBusiness({
                    businessName: '',
                    ein: '',
                    address: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'United States of America',
                    phone: '',
                    signingAuthorityName: '',
                    signingAuthorityPhone: '',
                    signingAuthorityPIN: '',
                    hasThirdPartyDesignee: false,
                    thirdPartyDesigneeName: '',
                    thirdPartyDesigneePhone: '',
                    thirdPartyDesigneePIN: ''
                  });
                  setBusinessErrors({});
                }}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg active:scale-95 transition-all duration-200 shadow-md"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Business</span>
            <span className="sm:hidden">Add</span>
              </button>
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
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setNewBusiness({
                    businessName: '',
                    ein: '',
                    address: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: 'United States of America',
                    phone: '',
                    signingAuthorityName: '',
                    signingAuthorityPhone: '',
                    signingAuthorityPIN: '',
                    hasThirdPartyDesignee: false,
                    thirdPartyDesigneeName: '',
                    thirdPartyDesigneePhone: '',
                    thirdPartyDesigneePIN: ''
                  });
                  setBusinessErrors({});
                }}
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
            >
              Add Your First Business
              <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ overflow: 'visible' }}>
            {/* Modern Table Header - Hidden on mobile */}
            <div className="hidden lg:block sticky top-0 z-20 bg-white border-b border-slate-200 backdrop-blur-sm bg-white/95">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
                <div className="col-span-5">
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
                <div className="col-span-3">
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

                  {/* Business Info - Full width on mobile, spans 5 cols on desktop */}
                  <div className="col-span-1 lg:col-span-5 flex items-center gap-3 sm:gap-4">
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

        {/* Add Business Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !saving && setShowAddModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add New Business</h2>
                <button
                  onClick={() => setShowAddModal(false)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Business Name <span className="text-[var(--color-orange)]">*</span>
                    </label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                        <strong>IRS Rule:</strong> Only letters, numbers, spaces, "&" and "-" are allowed. Do not use commas, periods, or other symbols.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newBusiness.businessName}
                    onChange={(e) => handleBusinessChange('businessName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.businessName ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="ABC Trucking LLC"
                  />
                  {businessErrors.businessName && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.businessName}</span>
                    </p>
                    )}
                  </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    EIN (Employer Identification Number) <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBusiness.ein}
                    onChange={(e) => handleBusinessChange('ein', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono ${businessErrors.ein ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="12-3456789"
                    maxLength="10"
                  />
                  {businessErrors.ein && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.ein}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Business Address <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBusiness.address}
                    onChange={(e) => handleBusinessChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.address ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="123 Main St"
                  />
                  {businessErrors.address && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.address}</span>
                    </p>
                  )}
                        </div>

                        <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    City <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBusiness.city}
                    onChange={(e) => handleBusinessChange('city', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.city ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="Los Angeles"
                  />
                  {businessErrors.city && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.city}</span>
                    </p>
                  )}
                        </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    State <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBusiness.state}
                    onChange={(e) => handleBusinessChange('state', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] uppercase ${businessErrors.state ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="CA"
                    maxLength="2"
                  />
                  {businessErrors.state && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.state}</span>
                    </p>
                  )}
                      </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ZIP Code <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBusiness.zip}
                    onChange={(e) => handleBusinessChange('zip', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono ${businessErrors.zip ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="12345"
                    maxLength="10"
                  />
                  {businessErrors.zip && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.zip}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Country <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={newBusiness.country}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 border rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed border-slate-200"
                    placeholder="United States of America"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Only United States is allowed for Form 2290 filings
                  </p>
                          </div>

                          <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newBusiness.phone}
                    onChange={(e) => handleBusinessChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.phone ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="(555) 123-4567"
                  />
                  {businessErrors.phone && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.phone}</span>
                    </p>
                  )}
                          </div>

                {/* Signing Authority Section */}
                <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-semibold text-slate-700">Signing Authority</h3>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                        The person authorized to sign Form 2290 on behalf of the business. This person must have the legal authority to sign tax returns.
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Name <span className="text-[var(--color-orange)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={newBusiness.signingAuthorityName}
                        onChange={(e) => handleBusinessChange('signingAuthorityName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.signingAuthorityName ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="John Doe"
                      />
                      {businessErrors.signingAuthorityName && (
                        <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityName}</span>
                        </p>
                      )}
                          </div>
                          <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone <span className="text-[var(--color-orange)]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newBusiness.signingAuthorityPhone}
                        onChange={(e) => handleBusinessChange('signingAuthorityPhone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.signingAuthorityPhone ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="(555) 123-4567"
                      />
                      {businessErrors.signingAuthorityPhone && (
                        <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityPhone}</span>
                        </p>
                      )}
                          </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        PIN <span className="text-[var(--color-orange)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={newBusiness.signingAuthorityPIN}
                        onChange={(e) => handleBusinessChange('signingAuthorityPIN', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono placeholder:text-slate-400 ${businessErrors.signingAuthorityPIN ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="12345"
                        maxLength="5"
                      />
                      {businessErrors.signingAuthorityPIN && (
                        <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityPIN}</span>
                        </p>
                      )}
                        </div>
                  </div>

                  {/* Third Party Designee */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Third Party Designee
                      </label>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                          A third party designee is someone you authorize to discuss your Form 2290 with the IRS. This is optional.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNewBusiness({ ...newBusiness, hasThirdPartyDesignee: false, thirdPartyDesigneeName: '', thirdPartyDesigneePhone: '', thirdPartyDesigneePIN: '' })}
                        className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-200 touch-manipulation w-fit ${
                          newBusiness.hasThirdPartyDesignee === false
                            ? 'border-[var(--color-orange)] bg-orange-50 shadow-md scale-[1.02]'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          newBusiness.hasThirdPartyDesignee === false
                            ? 'border-[var(--color-orange)] bg-[var(--color-orange)]'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {newBusiness.hasThirdPartyDesignee === false && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                        <span className={`text-sm font-semibold ${
                          newBusiness.hasThirdPartyDesignee === false
                            ? 'text-[var(--color-orange)]'
                            : 'text-slate-600'
                        }`}>
                          No
                        </span>
                        {newBusiness.hasThirdPartyDesignee === false && (
                          <CheckCircle className="w-4 h-4 text-[var(--color-orange)] absolute top-2 right-2" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewBusiness({ ...newBusiness, hasThirdPartyDesignee: true })}
                        className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-200 touch-manipulation w-fit ${
                          newBusiness.hasThirdPartyDesignee === true
                            ? 'border-[var(--color-orange)] bg-orange-50 shadow-md scale-[1.02]'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          newBusiness.hasThirdPartyDesignee === true
                            ? 'border-[var(--color-orange)] bg-[var(--color-orange)]'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {newBusiness.hasThirdPartyDesignee === true && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className={`text-sm font-semibold ${
                          newBusiness.hasThirdPartyDesignee === true
                            ? 'text-[var(--color-orange)]'
                            : 'text-slate-600'
                        }`}>
                          Yes
                        </span>
                        {newBusiness.hasThirdPartyDesignee === true && (
                          <CheckCircle className="w-4 h-4 text-[var(--color-orange)] absolute top-2 right-2" />
                        )}
                      </button>
                  </div>

                    {newBusiness.hasThirdPartyDesignee && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Name <span className="text-[var(--color-orange)]">*</span>
                          </label>
                          <input
                            type="text"
                            value={newBusiness.thirdPartyDesigneeName}
                            onChange={(e) => handleBusinessChange('thirdPartyDesigneeName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.thirdPartyDesigneeName ? 'border-red-500' : 'border-blue-300'}`}
                            placeholder="Jane Smith"
                          />
                          {businessErrors.thirdPartyDesigneeName && (
                            <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneeName}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Phone <span className="text-[var(--color-orange)]">*</span>
                          </label>
                          <input
                            type="tel"
                            value={newBusiness.thirdPartyDesigneePhone}
                            onChange={(e) => handleBusinessChange('thirdPartyDesigneePhone', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.thirdPartyDesigneePhone ? 'border-red-500' : 'border-blue-300'}`}
                            placeholder="(555) 123-4567"
                          />
                          {businessErrors.thirdPartyDesigneePhone && (
                            <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneePhone}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            PIN <span className="text-[var(--color-orange)]">*</span>
                          </label>
                          <input
                            type="text"
                            value={newBusiness.thirdPartyDesigneePIN}
                            onChange={(e) => handleBusinessChange('thirdPartyDesigneePIN', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono placeholder:text-slate-400 ${businessErrors.thirdPartyDesigneePIN ? 'border-red-500' : 'border-blue-300'}`}
                            placeholder="12345"
                            maxLength="5"
                          />
                          {businessErrors.thirdPartyDesigneePIN && (
                            <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneePIN}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                    </button>
                <button
                  onClick={handleAddBusiness}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-[var(--color-orange)] text-white rounded-xl font-semibold hover:bg-[var(--color-orange-soft)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Business'
                  )}
                </button>
                  </div>
                </div>
              </div>
        )}

        {/* Edit Modal */}
        {editingBusiness && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !saving && setEditingBusiness(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Business Name <span className="text-[var(--color-orange)]">*</span>
                    </label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                        <strong>IRS Rule:</strong> Only letters, numbers, spaces, "&" and "-" are allowed. Do not use commas, periods, or other symbols.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={editingBusiness.businessName || ''}
                    onChange={(e) => handleBusinessChange('businessName', e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.businessName ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="ABC Trucking LLC"
                  />
                  {businessErrors.businessName && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.businessName}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    EIN (Employer Identification Number) <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.ein || ''}
                    onChange={(e) => handleBusinessChange('ein', e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono ${businessErrors.ein ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="12-3456789"
                    maxLength="10"
                  />
                  {businessErrors.ein && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.ein}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Business Address <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.address || ''}
                    onChange={(e) => handleBusinessChange('address', e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.address ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="123 Main St"
                  />
                  {businessErrors.address && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.address}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    City <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.city || ''}
                    onChange={(e) => handleBusinessChange('city', e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.city ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="Los Angeles"
                  />
                  {businessErrors.city && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.city}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    State <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.state || ''}
                    onChange={(e) => handleBusinessChange('state', e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] uppercase ${businessErrors.state ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="CA"
                    maxLength="2"
                  />
                  {businessErrors.state && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.state}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ZIP Code <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.zip || ''}
                    onChange={(e) => handleBusinessChange('zip', e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono ${businessErrors.zip ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="12345"
                    maxLength="10"
                  />
                  {businessErrors.zip && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.zip}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Country <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingBusiness.country || 'United States of America'}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 border rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed border-slate-200"
                    placeholder="United States of America"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Only United States is allowed for Form 2290 filings
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone <span className="text-[var(--color-orange)]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editingBusiness.phone || ''}
                    onChange={(e) => handleBusinessChange('phone', e.target.value, true)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.phone ? 'border-red-500' : 'border-slate-200'}`}
                    placeholder="(555) 123-4567"
                  />
                  {businessErrors.phone && (
                    <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Signing Authority Section */}
                <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base font-semibold text-slate-700">Signing Authority</h3>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                        The person authorized to sign Form 2290 on behalf of the business. This person must have the legal authority to sign tax returns.
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Name <span className="text-[var(--color-orange)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingBusiness.signingAuthorityName || ''}
                        onChange={(e) => handleBusinessChange('signingAuthorityName', e.target.value, true)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.signingAuthorityName ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="John Doe"
                      />
                      {businessErrors.signingAuthorityName && (
                        <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityName}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone <span className="text-[var(--color-orange)]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={editingBusiness.signingAuthorityPhone || ''}
                        onChange={(e) => handleBusinessChange('signingAuthorityPhone', e.target.value, true)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.signingAuthorityPhone ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="(555) 123-4567"
                      />
                      {businessErrors.signingAuthorityPhone && (
                        <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityPhone}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        PIN <span className="text-[var(--color-orange)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingBusiness.signingAuthorityPIN || ''}
                        onChange={(e) => handleBusinessChange('signingAuthorityPIN', e.target.value, true)}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono placeholder:text-slate-400 ${businessErrors.signingAuthorityPIN ? 'border-red-500' : 'border-slate-200'}`}
                        placeholder="12345"
                        maxLength="5"
                      />
                      {businessErrors.signingAuthorityPIN && (
                        <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityPIN}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Third Party Designee */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Third Party Designee
                      </label>
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-400 cursor-help" />
                        <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                          A third party designee is someone you authorize to discuss your Form 2290 with the IRS. This is optional.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingBusiness({ ...editingBusiness, hasThirdPartyDesignee: false, thirdPartyDesigneeName: '', thirdPartyDesigneePhone: '', thirdPartyDesigneePIN: '' })}
                        className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-200 touch-manipulation w-fit ${
                          editingBusiness.hasThirdPartyDesignee === false
                            ? 'border-[var(--color-orange)] bg-orange-50 shadow-md scale-[1.02]'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          editingBusiness.hasThirdPartyDesignee === false
                            ? 'border-[var(--color-orange)] bg-[var(--color-orange)]'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {editingBusiness.hasThirdPartyDesignee === false && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className={`text-sm font-semibold ${
                          editingBusiness.hasThirdPartyDesignee === false
                            ? 'text-[var(--color-orange)]'
                            : 'text-slate-600'
                        }`}>
                          No
                        </span>
                        {editingBusiness.hasThirdPartyDesignee === false && (
                          <CheckCircle className="w-4 h-4 text-[var(--color-orange)] absolute top-2 right-2" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingBusiness({ ...editingBusiness, hasThirdPartyDesignee: true })}
                        className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-200 touch-manipulation w-fit ${
                          editingBusiness.hasThirdPartyDesignee === true
                            ? 'border-[var(--color-orange)] bg-orange-50 shadow-md scale-[1.02]'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          editingBusiness.hasThirdPartyDesignee === true
                            ? 'border-[var(--color-orange)] bg-[var(--color-orange)]'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {editingBusiness.hasThirdPartyDesignee === true && (
                            <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className={`text-sm font-semibold ${
                          editingBusiness.hasThirdPartyDesignee === true
                            ? 'text-[var(--color-orange)]'
                            : 'text-slate-600'
                        }`}>
                          Yes
                        </span>
                        {editingBusiness.hasThirdPartyDesignee === true && (
                          <CheckCircle className="w-4 h-4 text-[var(--color-orange)] absolute top-2 right-2" />
                        )}
                      </button>
                    </div>

                    {editingBusiness.hasThirdPartyDesignee && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Name <span className="text-[var(--color-orange)]">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingBusiness.thirdPartyDesigneeName || ''}
                            onChange={(e) => handleBusinessChange('thirdPartyDesigneeName', e.target.value, true)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.thirdPartyDesigneeName ? 'border-red-500' : 'border-blue-300'}`}
                            placeholder="Jane Smith"
                          />
                          {businessErrors.thirdPartyDesigneeName && (
                            <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneeName}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Phone <span className="text-[var(--color-orange)]">*</span>
                          </label>
                          <input
                            type="tel"
                            value={editingBusiness.thirdPartyDesigneePhone || ''}
                            onChange={(e) => handleBusinessChange('thirdPartyDesigneePhone', e.target.value, true)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] placeholder:text-slate-400 ${businessErrors.thirdPartyDesigneePhone ? 'border-red-500' : 'border-blue-300'}`}
                            placeholder="(555) 123-4567"
                          />
                          {businessErrors.thirdPartyDesigneePhone && (
                            <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneePhone}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            PIN <span className="text-[var(--color-orange)]">*</span>
                          </label>
                          <input
                            type="text"
                            value={editingBusiness.thirdPartyDesigneePIN || ''}
                            onChange={(e) => handleBusinessChange('thirdPartyDesigneePIN', e.target.value, true)}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono placeholder:text-slate-400 ${businessErrors.thirdPartyDesigneePIN ? 'border-red-500' : 'border-blue-300'}`}
                            placeholder="12345"
                            maxLength="5"
                          />
                          {businessErrors.thirdPartyDesigneePIN && (
                            <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneePIN}</span>
                            </p>
                          )}
                        </div>
                      </div>
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
