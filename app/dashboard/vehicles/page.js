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
    grossWeightCategory: '',
    isSuspended: false
  });
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Weight category options
  const weightCategories = [
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
    { value: 'W', label: 'W - Over 75,000 lbs (Maximum)' },
  ];

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
      filtered = filtered.filter(v => !v.isSuspended);
    } else if (filterStatus === 'suspended') {
      filtered = filtered.filter(v => v.isSuspended);
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
    const found = weightCategories.find(cat => cat.value === category);
    return found ? found.label : category || 'Not specified';
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
    setEditingVehicle({ ...vehicle });
    setVehicleErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingVehicle) return;

    const vinVal = validateVIN(editingVehicle.vin);
    if (!vinVal.isValid) {
      setVehicleErrors({ vin: vinVal.error });
      return;
    }

    if (!editingVehicle.grossWeightCategory) {
      setVehicleErrors({ grossWeightCategory: 'Weight category is required' });
      return;
    }

    setSaving(true);
    setVehicleErrors({});

    try {
      await updateVehicle(editingVehicle.id, {
        vin: editingVehicle.vin.toUpperCase().trim(),
        grossWeightCategory: editingVehicle.grossWeightCategory,
        isSuspended: editingVehicle.isSuspended || false
      });

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
    const vinVal = validateVIN(newVehicle.vin);
    if (!vinVal.isValid) {
      setVehicleErrors({ vin: vinVal.error });
      return;
    }

    if (!newVehicle.grossWeightCategory) {
      setVehicleErrors({ grossWeightCategory: 'Weight category is required' });
      return;
    }

    // Check for duplicate VIN
    const duplicateVehicle = vehicles.find(v => v.vin === newVehicle.vin.toUpperCase());
    if (duplicateVehicle) {
      setVehicleErrors({ vin: 'This VIN already exists in your vehicle list' });
      return;
    }

    setSaving(true);
    setVehicleErrors({});

    try {
      await createVehicle(user.uid, {
        vin: newVehicle.vin.toUpperCase().trim(),
        grossWeightCategory: newVehicle.grossWeightCategory,
        isSuspended: newVehicle.isSuspended || false
      });

      await loadVehicles();
      setShowAddModal(false);
      setNewVehicle({
        vin: '',
        grossWeightCategory: '',
        isSuspended: false
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
                Active ({vehicles.filter(v => !v.isSuspended).length})
              </button>
              <button
                onClick={() => setFilterStatus('suspended')}
                className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  filterStatus === 'suspended'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Suspended ({vehicles.filter(v => v.isSuspended).length})
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
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:border-[var(--color-orange)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group"
              >
                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  vehicle.isSuspended ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                }`}></div>

                {/* Header with actions */}
                <div className="flex items-start justify-between mb-6 pt-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                      vehicle.isSuspended 
                        ? 'bg-amber-50 border-amber-200 group-hover:bg-amber-100' 
                        : 'bg-emerald-50 border-emerald-200 group-hover:bg-emerald-100'
                    }`}>
                      <Truck className={`w-7 h-7 ${
                        vehicle.isSuspended ? 'text-amber-600' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div>
                      {vehicle.isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="relative actions-menu-group">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible actions-menu transition-all z-30">
                      <button
                        onClick={() => handleEdit(vehicle)}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 rounded-t-xl transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Vehicle
                      </button>
                      <button
                        onClick={() => setDeletingVehicle(vehicle)}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Vehicle
                      </button>
                    </div>
                  </div>
                </div>

                {/* VIN Display */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[var(--color-orange)] transition-colors font-mono">
                      {vehicle.vin || 'No VIN'}
                    </h3>
                    <button
                      onClick={() => copyToClipboard(vehicle.vin)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Copy VIN"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Weight className="w-4 h-4" />
                    {getWeightCategoryLabel(vehicle.grossWeightCategory)}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-3 mb-6 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-xl border border-slate-200">
                      <span className="block text-xs font-medium text-slate-500 uppercase mb-1">Weight Category</span>
                      <span className="block font-bold text-slate-900 text-lg">{vehicle.grossWeightCategory || 'N/A'}</span>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-xl border border-slate-200">
                      <span className="block text-xs font-medium text-slate-500 uppercase mb-1">Added</span>
                      <span className="block font-bold text-slate-900">
                        {vehicle.createdAt ? new Date(vehicle.createdAt.seconds ? vehicle.createdAt.seconds * 1000 : vehicle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-transparent transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <Link
                    href={`/dashboard/new-filing?vehicleId=${vehicle.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--color-orange)] text-white font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg transition-all duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    Use
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {editingVehicle && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !saving && setEditingVehicle(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
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
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    VIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingVehicle.vin}
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gross Weight Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingVehicle.grossWeightCategory}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, grossWeightCategory: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select weight category</option>
                    {weightCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {vehicleErrors.grossWeightCategory && (
                    <p className="mt-1 text-sm text-red-600">{vehicleErrors.grossWeightCategory}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="edit-suspended"
                    checked={editingVehicle.isSuspended || false}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, isSuspended: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-[var(--color-orange)] focus:ring-[var(--color-orange)]"
                  />
                  <label htmlFor="edit-suspended" className="flex-1 text-sm font-medium text-slate-700 cursor-pointer">
                    Vehicle is suspended (exempt from tax)
                  </label>
                </div>

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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => !saving && setShowAddModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gross Weight Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newVehicle.grossWeightCategory}
                    onChange={(e) => setNewVehicle({ ...newVehicle, grossWeightCategory: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select weight category</option>
                    {weightCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {vehicleErrors.grossWeightCategory && (
                    <p className="mt-1 text-sm text-red-600">{vehicleErrors.grossWeightCategory}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    id="new-suspended"
                    checked={newVehicle.isSuspended || false}
                    onChange={(e) => setNewVehicle({ ...newVehicle, isSuspended: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-[var(--color-orange)] focus:ring-[var(--color-orange)]"
                  />
                  <label htmlFor="new-suspended" className="flex-1 text-sm font-medium text-slate-700 cursor-pointer">
                    Vehicle is suspended (exempt from tax)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewVehicle({ vin: '', grossWeightCategory: '', isSuspended: false });
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
