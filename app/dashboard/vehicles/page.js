'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getVehiclesByUser, createVehicle, updateVehicle, deleteVehicle } from '@/lib/db';
import { validateVIN } from '@/lib/validation';
import {
  Truck,
  Plus,
  ArrowLeft,
  Weight,
  AlertCircle,
  CheckCircle,
  Upload,
  FileText,
  X,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Calendar,
  Shield,
  Loader2
} from 'lucide-react';

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, suspended
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    vehicleType: 'taxable', // taxable, suspended, credit, priorYearSold
    grossWeightCategory: '',
    logging: null, // true/false/null
    agricultural: null, // true/false/null (for suspended)
    creditReason: '', // sold, stolen, destroyed, lowMileage (for credit)
    creditDate: '', // date picker (for credit)
    soldTo: '', // input field (for prior year)
    soldDate: '' // date picker (for prior year)
  });
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Vehicle type options
  const vehicleTypes = [
    { value: 'taxable', label: 'Taxable Vehicle' },
    { value: 'suspended', label: 'Suspended Vehicle' },
    { value: 'credit', label: 'Credit Vehicle' },
    { value: 'priorYearSold', label: 'Prior Year Sold Suspended Vehicle' }
  ];

  // Weight category options (A to V for taxable/credit, W for suspended)
  const weightCategoriesAToV = [
    { value: 'A', label: 'A - 55,000 - 55,999 lbs' },
    { value: 'B', label: 'B - 56,000 - 57,999 lbs' },
    { value: 'C', label: 'C - 58,000 - 59,999 lbs' },
    { value: 'D', label: 'D - 60,000 - 61,999 lbs' },
    { value: 'E', label: 'E - 62,000 - 63,999 lbs' },
    { value: 'F', label: 'F - 64,000 - 65,999 lbs' },
    { value: 'G', label: 'G - 66,000 - 67,999 lbs' },
    { value: 'H', label: 'H - 68,000 - 69,999 lbs' },
    { value: 'I', label: 'I - 70,000 - 71,999 lbs' },
    { value: 'J', label: 'J - 72,000 - 73,999 lbs' },
    { value: 'K', label: 'K - 74,000 - 75,000 lbs' },
    { value: 'L', label: 'L - 75,001 - 76,999 lbs' },
    { value: 'M', label: 'M - 77,000 - 78,999 lbs' },
    { value: 'N', label: 'N - 79,000 - 80,999 lbs' },
    { value: 'O', label: 'O - 81,000 - 82,999 lbs' },
    { value: 'P', label: 'P - 83,000 - 84,999 lbs' },
    { value: 'Q', label: 'Q - 85,000 - 86,999 lbs' },
    { value: 'R', label: 'R - 87,000 - 88,999 lbs' },
    { value: 'S', label: 'S - 89,000 - 90,999 lbs' },
    { value: 'T', label: 'T - 91,000 - 92,999 lbs' },
    { value: 'U', label: 'U - 93,000 - 94,999 lbs' },
    { value: 'V', label: 'V - 95,000 - 96,999 lbs' }
  ];

  const weightCategoryW = { value: 'W', label: 'W - Over 75,000 lbs (Maximum)' };

  // Credit reason options
  const creditReasons = [
    { value: 'sold', label: 'Sold' },
    { value: 'stolen', label: 'Stolen' },
    { value: 'destroyed', label: 'Destroyed' },
    { value: 'lowMileage', label: 'Low Mileage' }
  ];

  // Get min/max dates for date pickers
  const getMinDate = (type) => {
    if (type === 'credit') {
      // From July 2024
      return '2024-07-01';
    } else if (type === 'priorYearSold') {
      // From last year
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      return lastYear.toISOString().split('T')[0];
    }
    return '';
  };

  const getMaxDate = () => {
    // Present date
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    if (user) {
      loadVehicles();
    }
  }, [user]);

  useEffect(() => {
    // Filter vehicles based on search and status
    let filtered = vehicles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.vin?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(v => v.vehicleType === 'taxable' || v.vehicleType === 'credit');
    } else if (filterStatus === 'suspended') {
      filtered = filtered.filter(v => v.vehicleType === 'suspended' || v.vehicleType === 'priorYearSold');
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, filterStatus]);

  const loadVehicles = async () => {
    if (!user) return;

    try {
      const userVehicles = await getVehiclesByUser(user.uid);
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeightCategoryLabel = (category) => {
    const found = weightCategoriesAToV.find(cat => cat.value === category);
    if (found) return found.label;
    if (category === 'W') return weightCategoryW.label;
    return category || 'Not specified';
  };

  const getVehicleTypeLabel = (type) => {
    const found = vehicleTypes.find(t => t.value === type);
    return found ? found.label : type || 'Unknown';
  };

  const getCreditReasonLabel = (reason) => {
    const found = creditReasons.find(r => r.value === reason);
    return found ? found.label : reason || 'Not specified';
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadError('Please upload a valid CSV file.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').map(row => row.trim()).filter(row => row);

        const startIdx = rows[0].toLowerCase().includes('vin') ? 1 : 0;

        let successCount = 0;
        let failCount = 0;

        for (let i = startIdx; i < rows.length; i++) {
          const cols = rows[i].split(',').map(col => col.trim());
          if (cols.length < 2) continue;

          const vin = cols[0].toUpperCase();
          const weight = cols[1].toUpperCase();
          const suspended = cols[2] ? (cols[2].toLowerCase() === 'true' || cols[2].toLowerCase() === 'yes') : false;

          if (vin.length === 17) {
            try {
              await createVehicle(user.uid, {
                vin,
                grossWeightCategory: weight,
                isSuspended: suspended
              });
              successCount++;
            } catch (err) {
              console.error(`Failed to add VIN ${vin}:`, err);
              failCount++;
            }
          } else {
            failCount++;
          }
        }

        await loadVehicles();
        setUploadSuccess(`Successfully added ${successCount} vehicles.${failCount > 0 ? ` Failed to add ${failCount} rows.` : ''}`);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        console.error('Error processing CSV:', err);
        setUploadError('Failed to process CSV file.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleEdit = (vehicle) => {
    // Ensure all fields are initialized
    setEditingVehicle({
      ...vehicle,
      vehicleType: vehicle.vehicleType || 'taxable',
      logging: vehicle.logging ?? null,
      agricultural: vehicle.agricultural ?? null,
      creditReason: vehicle.creditReason || '',
      creditDate: vehicle.creditDate || '',
      soldTo: vehicle.soldTo || '',
      soldDate: vehicle.soldDate || ''
    });
    setVehicleErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingVehicle) return;

    const errors = {};
    
    // Validate VIN
    const vinVal = validateVIN(editingVehicle.vin);
    if (!vinVal.isValid) {
      errors.vin = vinVal.error;
    }

    // Validate based on vehicle type
    if (editingVehicle.vehicleType === 'taxable' || editingVehicle.vehicleType === 'credit') {
      if (!editingVehicle.grossWeightCategory || editingVehicle.grossWeightCategory === 'W') {
        errors.grossWeightCategory = 'Weight category (A-V) is required';
      }
      if (editingVehicle.logging === null) {
        errors.logging = 'Logging option is required';
      }
      if (editingVehicle.vehicleType === 'credit') {
        if (!editingVehicle.creditReason) {
          errors.creditReason = 'Credit reason is required';
        }
        if (!editingVehicle.creditDate) {
          errors.creditDate = 'Credit date is required';
        }
      }
    } else if (editingVehicle.vehicleType === 'suspended') {
      if (editingVehicle.grossWeightCategory !== 'W') {
        errors.grossWeightCategory = 'Weight category must be W for suspended vehicles';
      }
      if (editingVehicle.logging === null) {
        errors.logging = 'Logging option is required';
      }
      if (editingVehicle.agricultural === null) {
        errors.agricultural = 'Agricultural option is required';
      }
    } else if (editingVehicle.vehicleType === 'priorYearSold') {
      if (!editingVehicle.soldTo || editingVehicle.soldTo.trim() === '') {
        errors.soldTo = 'Sold To field is required';
      }
      if (!editingVehicle.soldDate) {
        errors.soldDate = 'Sold date is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      setVehicleErrors(errors);
      return;
    }

    setSaving(true);
    setVehicleErrors({});

    try {
      const updateData = {
        vin: editingVehicle.vin.toUpperCase().trim(),
        vehicleType: editingVehicle.vehicleType,
        grossWeightCategory: editingVehicle.grossWeightCategory,
        logging: editingVehicle.logging,
        agricultural: editingVehicle.agricultural ?? null,
        creditReason: editingVehicle.creditReason || null,
        creditDate: editingVehicle.creditDate || null,
        soldTo: editingVehicle.soldTo || null,
        soldDate: editingVehicle.soldDate || null
      };

      await updateVehicle(editingVehicle.id, updateData);

      await loadVehicles();
      setEditingVehicle(null);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      setVehicleErrors({ general: 'Failed to update vehicle. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      await deleteVehicle(vehicleId);
      await loadVehicles();
      setDeletingVehicle(null);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddVehicle = async () => {
    const errors = {};
    
    // Validate VIN
    const vinVal = validateVIN(newVehicle.vin);
    if (!vinVal.isValid) {
      errors.vin = vinVal.error;
    }

    // Check for duplicate VIN
    const duplicateVehicle = vehicles.find(v => v.vin === newVehicle.vin.toUpperCase());
    if (duplicateVehicle) {
      errors.vin = 'This VIN already exists in your vehicle list';
    }

    // Validate based on vehicle type
    if (newVehicle.vehicleType === 'taxable' || newVehicle.vehicleType === 'credit') {
      if (!newVehicle.grossWeightCategory || newVehicle.grossWeightCategory === 'W') {
        errors.grossWeightCategory = 'Weight category (A-V) is required';
      }
      if (newVehicle.logging === null) {
        errors.logging = 'Logging option is required';
      }
      if (newVehicle.vehicleType === 'credit') {
        if (!newVehicle.creditReason) {
          errors.creditReason = 'Credit reason is required';
        }
        if (!newVehicle.creditDate) {
          errors.creditDate = 'Credit date is required';
        }
      }
    } else if (newVehicle.vehicleType === 'suspended') {
      if (newVehicle.grossWeightCategory !== 'W') {
        errors.grossWeightCategory = 'Weight category must be W for suspended vehicles';
      }
      if (newVehicle.logging === null) {
        errors.logging = 'Logging option is required';
      }
      if (newVehicle.agricultural === null) {
        errors.agricultural = 'Agricultural option is required';
      }
    } else if (newVehicle.vehicleType === 'priorYearSold') {
      if (!newVehicle.soldTo || newVehicle.soldTo.trim() === '') {
        errors.soldTo = 'Sold To field is required';
      }
      if (!newVehicle.soldDate) {
        errors.soldDate = 'Sold date is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      setVehicleErrors(errors);
      return;
    }

    setSaving(true);
    setVehicleErrors({});

    try {
      const vehicleData = {
        vin: newVehicle.vin.toUpperCase().trim(),
        vehicleType: newVehicle.vehicleType,
        grossWeightCategory: newVehicle.grossWeightCategory,
        logging: newVehicle.logging,
        agricultural: newVehicle.agricultural ?? null,
        creditReason: newVehicle.creditReason || null,
        creditDate: newVehicle.creditDate || null,
        soldTo: newVehicle.soldTo || null,
        soldDate: newVehicle.soldDate || null
      };

      await createVehicle(user.uid, vehicleData);

      await loadVehicles();
      setShowAddModal(false);
      setNewVehicle({
        vin: '',
        vehicleType: 'taxable',
        grossWeightCategory: '',
        logging: null,
        agricultural: null,
        creditReason: '',
        creditDate: '',
        soldTo: '',
        soldDate: ''
      });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      setVehicleErrors({ general: 'Failed to create vehicle. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
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
                Vehicle Fleet Management
            </h1>
            <p className="text-slate-500">
                Manage your vehicle fleet details, weight categories, and filing information
            </p>
          </div>
            
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-sm disabled:opacity-50"
            >
              {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Importing...</span>
                  </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import CSV</span>
                  <span className="sm:hidden">Import</span>
                </>
              )}
            </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg active:scale-95 transition-all duration-200 shadow-md"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Vehicle</span>
              <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {uploadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{uploadError}</span>
            </div>
            <button onClick={() => setUploadError('')} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {uploadSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-700 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{uploadSuccess}</span>
            </div>
            <button onClick={() => setUploadSuccess('')} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search and Filter Bar */}
        {vehicles.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by VIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  filterStatus === 'all'
                    ? 'bg-[var(--color-orange)] text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                All ({vehicles.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  filterStatus === 'active'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Active ({vehicles.filter(v => v.vehicleType === 'taxable' || v.vehicleType === 'credit').length})
              </button>
              <button
                onClick={() => setFilterStatus('suspended')}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  filterStatus === 'suspended'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Suspended ({vehicles.filter(v => v.vehicleType === 'suspended' || v.vehicleType === 'priorYearSold').length})
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[var(--color-orange)]/30 border-t-[var(--color-orange)] rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Loading vehicles...</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white border border-dashed border-slate-200 rounded-3xl">
            <div className="relative mb-8 group">
              <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-white to-blue-50 p-8 rounded-[2rem] border border-blue-100 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                <Truck className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
                <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-2xl shadow-lg border border-blue-50">
                  <Plus className="w-6 h-6 text-blue-600" strokeWidth={3} />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {searchQuery || filterStatus !== 'all' ? 'No vehicles match your filters' : 'No Vehicles Yet'}
            </h2>
            <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Add your vehicle information to streamline your future filings. You can also import multiple vehicles via CSV.'}
            </p>
            {(!searchQuery && filterStatus === 'all') && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold text-sm border-2 border-slate-200 rounded-xl hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
                <button
                  onClick={() => setShowAddModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
              >
                Add Your First Vehicle
                <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
            </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm" style={{ overflow: 'visible' }}>
            {/* Modern Table Header - Hidden on mobile */}
            <div className="hidden lg:block sticky top-0 z-10 bg-white border-b border-slate-200 backdrop-blur-sm bg-white/95">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
                <div className="col-span-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vehicle</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight</span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Added</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</span>
                </div>
              </div>
            </div>

            {/* Modern Table Body */}
            <div className="divide-y divide-slate-100 relative" style={{ overflow: 'visible' }}>
              {filteredVehicles.map((vehicle, index) => (
              <div
                key={vehicle.id}
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

                  {/* Vehicle Info - Full width on mobile, spans 3 cols on desktop */}
                  <div className="col-span-1 lg:col-span-3 flex items-center gap-3 sm:gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                      vehicle.vehicleType === 'suspended' || vehicle.vehicleType === 'priorYearSold'
                        ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 group-hover:from-amber-100 group-hover:to-amber-200 group-hover:scale-110 group-hover:shadow-md' 
                        : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 group-hover:from-emerald-100 group-hover:to-emerald-200 group-hover:scale-110 group-hover:shadow-md'
                    }`}>
                      <Truck className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-12 ${
                        vehicle.vehicleType === 'suspended' || vehicle.vehicleType === 'priorYearSold' ? 'text-amber-600' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-mono group-hover:text-[var(--color-orange)] transition-colors truncate">
                          {vehicle.vin || 'No VIN'}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(vehicle.vin);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                          title="Copy VIN"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Type - Full width on mobile, spans 2 cols on desktop */}
                  <div className="col-span-1 lg:col-span-2 flex items-center">
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold">
                      {getVehicleTypeLabel(vehicle.vehicleType || 'taxable')}
                    </span>
                  </div>

                  {/* Details - Full width on mobile, spans 2 cols on desktop */}
                  <div className="col-span-1 lg:col-span-2 flex items-center">
                    <div className="flex flex-col gap-1 text-xs sm:text-sm text-slate-600">
                      {vehicle.vehicleType === 'taxable' && (
                        <span>Logging: {vehicle.logging ? 'Yes' : vehicle.logging === false ? 'No' : 'N/A'}</span>
                      )}
                      {vehicle.vehicleType === 'suspended' && (
                        <>
                          <span>Logging: {vehicle.logging ? 'Yes' : vehicle.logging === false ? 'No' : 'N/A'}</span>
                          <span>Agricultural: {vehicle.agricultural ? 'Yes' : vehicle.agricultural === false ? 'No' : 'N/A'}</span>
                        </>
                      )}
                      {vehicle.vehicleType === 'credit' && (
                        <>
                          <span>Logging: {vehicle.logging ? 'Yes' : vehicle.logging === false ? 'No' : 'N/A'}</span>
                          <span>Reason: {getCreditReasonLabel(vehicle.creditReason)}</span>
                          {vehicle.creditDate && (
                            <span>Date: {new Date(vehicle.creditDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          )}
                        </>
                      )}
                      {vehicle.vehicleType === 'priorYearSold' && (
                        <>
                          <span>Sold To: {vehicle.soldTo || 'N/A'}</span>
                          {vehicle.soldDate && (
                            <span>Date: {new Date(vehicle.soldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Weight Category - Full width on mobile, spans 2 cols on desktop */}
                  <div className="col-span-1 lg:col-span-2 flex items-center">
                    {vehicle.vehicleType !== 'priorYearSold' && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 flex items-center justify-center border-2 border-slate-400 shadow-sm group-hover:scale-110 transition-transform">
                          <span className="text-sm font-bold text-slate-700">{vehicle.grossWeightCategory || 'N/A'}</span>
                        </div>
                        <span className="text-sm text-slate-600 font-medium hidden lg:inline">
                          {vehicle.grossWeightCategory ? `Category ${vehicle.grossWeightCategory}` : 'Not set'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Added Date - Full width on mobile, spans 1 col on desktop */}
                  <div className="col-span-1 lg:col-span-1 flex items-center">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-medium hidden lg:inline">
                        {vehicle.createdAt 
                          ? new Date(vehicle.createdAt.seconds ? vehicle.createdAt.seconds * 1000 : vehicle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </span>
                      <span className="font-medium lg:hidden">
                        {vehicle.createdAt 
                          ? new Date(vehicle.createdAt.seconds ? vehicle.createdAt.seconds * 1000 : vehicle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Actions - Full width on mobile, spans 2 cols on desktop */}
                  <div className="col-span-1 lg:col-span-2 flex items-center justify-start lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:border-0">
                    <Link
                      href={`/dashboard/new-filing?vehicleId=${vehicle.id}`}
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
                            handleEdit(vehicle);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-t-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Vehicle
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingVehicle(vehicle);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Vehicle
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
        {editingVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => !saving && setEditingVehicle(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Edit Vehicle</h2>
                <button
                  onClick={() => setEditingVehicle(null)}
                  disabled={saving}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {vehicleErrors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {vehicleErrors.general}
                </div>
              )}

              <div className="space-y-4">
                {/* VIN - Always visible */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    VIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.vin || ''}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setEditingVehicle({ ...editingVehicle, vin: val });
                      if (val.length === 17) {
                        const vinVal = validateVIN(val);
                        setVehicleErrors({ ...vehicleErrors, vin: vinVal.isValid ? '' : vinVal.error });
                      } else {
                        setVehicleErrors({ ...vehicleErrors, vin: '' });
                      }
                    }}
                    maxLength={17}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all font-mono"
                    placeholder="17-character VIN"
                  />
                  {vehicleErrors.vin && (
                    <p className="mt-1 text-sm text-red-600">{vehicleErrors.vin}</p>
                  )}
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingVehicle.vehicleType || 'taxable'}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setEditingVehicle({
                        ...editingVehicle,
                        vehicleType: newType,
                        // Reset type-specific fields when changing type
                        grossWeightCategory: newType === 'suspended' ? 'W' : (newType === 'priorYearSold' ? '' : editingVehicle.grossWeightCategory),
                        logging: null,
                        agricultural: null,
                        creditReason: '',
                        creditDate: '',
                        soldTo: '',
                        soldDate: ''
                      });
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Gross Weight Category - Show for taxable, suspended, credit */}
                {(editingVehicle.vehicleType === 'taxable' || editingVehicle.vehicleType === 'credit' || editingVehicle.vehicleType === 'suspended') && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Gross Weight Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingVehicle.grossWeightCategory || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, grossWeightCategory: e.target.value })}
                      disabled={editingVehicle.vehicleType === 'suspended'}
                      className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${
                        editingVehicle.vehicleType === 'suspended' ? 'bg-slate-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">Select weight category</option>
                      {editingVehicle.vehicleType === 'suspended' ? (
                        <option value="W">{weightCategoryW.label}</option>
                      ) : (
                        weightCategoriesAToV.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))
                      )}
                    </select>
                    {vehicleErrors.grossWeightCategory && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.grossWeightCategory}</p>
                    )}
                  </div>
                )}

                {/* Logging - Show for taxable, suspended, credit */}
                {(editingVehicle.vehicleType === 'taxable' || editingVehicle.vehicleType === 'credit' || editingVehicle.vehicleType === 'suspended') && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Logging <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingVehicle({ ...editingVehicle, logging: true })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          editingVehicle.logging === true
                            ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVehicle({ ...editingVehicle, logging: false })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          editingVehicle.logging === false
                            ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        No
                      </button>
                    </div>
                    {vehicleErrors.logging && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.logging}</p>
                    )}
                  </div>
                )}

                {/* Agricultural - Show for suspended */}
                {editingVehicle.vehicleType === 'suspended' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Agricultural <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingVehicle({ ...editingVehicle, agricultural: true })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          editingVehicle.agricultural === true
                            ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVehicle({ ...editingVehicle, agricultural: false })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          editingVehicle.agricultural === false
                            ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        No
                      </button>
                    </div>
                    {vehicleErrors.agricultural && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.agricultural}</p>
                    )}
                  </div>
                )}

                {/* Credit Reason - Show for credit */}
                {editingVehicle.vehicleType === 'credit' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingVehicle.creditReason || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, creditReason: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select reason</option>
                      {creditReasons.map(reason => (
                        <option key={reason.value} value={reason.value}>{reason.label}</option>
                      ))}
                    </select>
                    {vehicleErrors.creditReason && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.creditReason}</p>
                    )}
                  </div>
                )}

                {/* Credit Date - Show for credit */}
                {editingVehicle.vehicleType === 'credit' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editingVehicle.creditDate || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, creditDate: e.target.value })}
                      min={getMinDate('credit')}
                      max={getMaxDate()}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                    />
                    {vehicleErrors.creditDate && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.creditDate}</p>
                    )}
                  </div>
                )}

                {/* Sold To - Show for priorYearSold */}
                {editingVehicle.vehicleType === 'priorYearSold' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Sold To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingVehicle.soldTo || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, soldTo: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                      placeholder="Buyer name or company"
                    />
                    {vehicleErrors.soldTo && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.soldTo}</p>
                    )}
                  </div>
                )}

                {/* Sold Date - Show for priorYearSold */}
                {editingVehicle.vehicleType === 'priorYearSold' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Sold Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editingVehicle.soldDate || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, soldDate: e.target.value })}
                      min={getMinDate('priorYearSold')}
                      max={getMaxDate()}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                    />
                    {vehicleErrors.soldDate && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.soldDate}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setEditingVehicle(null)}
                    disabled={saving}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
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
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => !saving && setShowAddModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add New Vehicle</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {vehicleErrors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {vehicleErrors.general}
                </div>
              )}

              <div className="space-y-4">
                {/* VIN - Always visible */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    VIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newVehicle.vin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setNewVehicle({ ...newVehicle, vin: val });
                      if (val.length === 17) {
                        const vinVal = validateVIN(val);
                        setVehicleErrors({ ...vehicleErrors, vin: vinVal.isValid ? '' : vinVal.error });
                      } else {
                        setVehicleErrors({ ...vehicleErrors, vin: '' });
                      }
                    }}
                    maxLength={17}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all font-mono"
                    placeholder="17-character VIN"
                  />
                  {vehicleErrors.vin && (
                    <p className="mt-1 text-sm text-red-600">{vehicleErrors.vin}</p>
                  )}
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newVehicle.vehicleType || 'taxable'}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setNewVehicle({
                        ...newVehicle,
                        vehicleType: newType,
                        // Reset type-specific fields when changing type
                        grossWeightCategory: newType === 'suspended' ? 'W' : '',
                        logging: null,
                        agricultural: null,
                        creditReason: '',
                        creditDate: '',
                        soldTo: '',
                        soldDate: ''
                      });
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Gross Weight Category - Show for taxable, suspended, credit */}
                {(newVehicle.vehicleType === 'taxable' || newVehicle.vehicleType === 'credit' || newVehicle.vehicleType === 'suspended') && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Gross Weight Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newVehicle.grossWeightCategory || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, grossWeightCategory: e.target.value })}
                      disabled={newVehicle.vehicleType === 'suspended'}
                      className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all ${
                        newVehicle.vehicleType === 'suspended' ? 'bg-slate-100 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">Select weight category</option>
                      {newVehicle.vehicleType === 'suspended' ? (
                        <option value="W">{weightCategoryW.label}</option>
                      ) : (
                        weightCategoriesAToV.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))
                      )}
                    </select>
                    {vehicleErrors.grossWeightCategory && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.grossWeightCategory}</p>
                    )}
                  </div>
                )}

                {/* Logging - Show for taxable, suspended, credit */}
                {(newVehicle.vehicleType === 'taxable' || newVehicle.vehicleType === 'credit' || newVehicle.vehicleType === 'suspended') && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Logging <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNewVehicle({ ...newVehicle, logging: true })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          newVehicle.logging === true
                            ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVehicle({ ...newVehicle, logging: false })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          newVehicle.logging === false
                            ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        No
                      </button>
                    </div>
                    {vehicleErrors.logging && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.logging}</p>
                    )}
                  </div>
                )}

                {/* Agricultural - Show for suspended */}
                {newVehicle.vehicleType === 'suspended' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Agricultural <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNewVehicle({ ...newVehicle, agricultural: true })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          newVehicle.agricultural === true
                            ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewVehicle({ ...newVehicle, agricultural: false })}
                        className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          newVehicle.agricultural === false
                            ? 'border-[var(--color-orange)] bg-orange-50 text-[var(--color-orange)]'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        No
                      </button>
                    </div>
                    {vehicleErrors.agricultural && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.agricultural}</p>
                    )}
                  </div>
                )}

                {/* Credit Reason - Show for credit */}
                {newVehicle.vehicleType === 'credit' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newVehicle.creditReason || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, creditReason: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select reason</option>
                      {creditReasons.map(reason => (
                        <option key={reason.value} value={reason.value}>{reason.label}</option>
                      ))}
                    </select>
                    {vehicleErrors.creditReason && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.creditReason}</p>
                    )}
                  </div>
                )}

                {/* Credit Date - Show for credit */}
                {newVehicle.vehicleType === 'credit' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newVehicle.creditDate || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, creditDate: e.target.value })}
                      min={getMinDate('credit')}
                      max={getMaxDate()}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                    />
                    {vehicleErrors.creditDate && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.creditDate}</p>
                    )}
                  </div>
                )}

                {/* Sold To - Show for priorYearSold */}
                {newVehicle.vehicleType === 'priorYearSold' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Sold To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newVehicle.soldTo || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, soldTo: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                      placeholder="Buyer name or company"
                    />
                    {vehicleErrors.soldTo && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.soldTo}</p>
                    )}
                  </div>
                )}

                {/* Sold Date - Show for priorYearSold */}
                {newVehicle.vehicleType === 'priorYearSold' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Sold Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={newVehicle.soldDate || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, soldDate: e.target.value })}
                      min={getMinDate('priorYearSold')}
                      max={getMaxDate()}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                    />
                    {vehicleErrors.soldDate && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.soldDate}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewVehicle({
                        vin: '',
                        vehicleType: 'taxable',
                        grossWeightCategory: '',
                        logging: null,
                        agricultural: null,
                        creditReason: '',
                        creditDate: '',
                        soldTo: '',
                        soldDate: ''
                      });
                      setVehicleErrors({});
                    }}
                    disabled={saving}
                    className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddVehicle}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-[var(--color-orange)] text-white rounded-xl font-semibold hover:bg-[var(--color-orange-soft)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Vehicle
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Delete Vehicle</h2>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="mb-6 text-slate-700">
                Are you sure you want to delete vehicle <span className="font-mono font-bold">{deletingVehicle.vin}</span>? This will remove it from your fleet permanently.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingVehicle(null)}
                  disabled={saving}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingVehicle.id)}
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
