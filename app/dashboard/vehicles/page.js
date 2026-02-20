'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getVehiclesByUser, createVehicle, updateVehicle, deleteVehicle, getBusinessesByUser } from '@/lib/db';
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
  Loader2,
  Sparkles
} from 'lucide-react';
import VehicleFormModal from '@/components/VehicleFormModal';

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [businesses, setBusinesses] = useState([]);
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
    soldDate: '', // date picker (for prior year)
    businessId: '' // business association
  });
  const [vehicleErrors, setVehicleErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [csvBusinessId, setCsvBusinessId] = useState('');
  const [showCsvBusinessModal, setShowCsvBusinessModal] = useState(false);
  const fileInputRef = useRef(null);

  // Vehicle type options
  const vehicleTypes = [
    { value: 'taxable', label: 'Taxable Vehicle' },
    { value: 'suspended', label: 'Suspended Vehicle' },
    { value: 'credit', label: 'Credit Vehicle' },
    { value: 'priorYearSold', label: 'Prior Year Sold Suspended Vehicle' }
  ];

  // Tax rate mappings
  const TAX_RATES_NON_LOGGING = {
    'A': 100.00, 'B': 122.00, 'C': 144.00, 'D': 166.00, 'E': 188.00,
    'F': 210.00, 'G': 232.00, 'H': 254.00, 'I': 276.00, 'J': 298.00,
    'K': 320.00, 'L': 342.00, 'M': 364.00, 'N': 386.00, 'O': 408.00,
    'P': 430.00, 'Q': 452.00, 'R': 474.00, 'S': 496.00, 'T': 518.00,
    'U': 540.00, 'V': 550.00, 'W': 550.00
  };

  const TAX_RATES_LOGGING = {
    'A': 75.00, 'B': 91.50, 'C': 108.00, 'D': 124.50, 'E': 141.00,
    'F': 157.50, 'G': 174.00, 'H': 190.50, 'I': 207.00, 'J': 223.50,
    'K': 240.00, 'L': 256.50, 'M': 273.00, 'N': 289.50, 'O': 306.00,
    'P': 322.50, 'Q': 339.00, 'R': 355.50, 'S': 372.00, 'T': 388.50,
    'U': 405.00, 'V': 412.50, 'W': 412.50
  };

  // Helper function to format currency with 2 decimal places
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to get weight category options with pricing
  const getWeightCategoryOptions = (isLogging) => {
    const taxRates = isLogging === true ? TAX_RATES_LOGGING : TAX_RATES_NON_LOGGING;
    const loggingText = isLogging === true ? ' (Logging)' : isLogging === false ? ' (Non-Logging)' : '';

    return [
      { value: 'A', label: `A - 55,000 lbs${loggingText} - ${formatCurrency(taxRates['A'])}` },
      { value: 'B', label: `B - 55,001 - 56,000 lbs${loggingText} - ${formatCurrency(taxRates['B'])}` },
      { value: 'C', label: `C - 56,001 - 57,000 lbs${loggingText} - ${formatCurrency(taxRates['C'])}` },
      { value: 'D', label: `D - 57,001 - 58,000 lbs${loggingText} - ${formatCurrency(taxRates['D'])}` },
      { value: 'E', label: `E - 58,001 - 59,000 lbs${loggingText} - ${formatCurrency(taxRates['E'])}` },
      { value: 'F', label: `F - 59,001 - 60,000 lbs${loggingText} - ${formatCurrency(taxRates['F'])}` },
      { value: 'G', label: `G - 60,001 - 61,000 lbs${loggingText} - ${formatCurrency(taxRates['G'])}` },
      { value: 'H', label: `H - 61,001 - 62,000 lbs${loggingText} - ${formatCurrency(taxRates['H'])}` },
      { value: 'I', label: `I - 62,001 - 63,000 lbs${loggingText} - ${formatCurrency(taxRates['I'])}` },
      { value: 'J', label: `J - 63,001 - 64,000 lbs${loggingText} - ${formatCurrency(taxRates['J'])}` },
      { value: 'K', label: `K - 64,001 - 65,000 lbs${loggingText} - ${formatCurrency(taxRates['K'])}` },
      { value: 'L', label: `L - 65,001 - 66,000 lbs${loggingText} - ${formatCurrency(taxRates['L'])}` },
      { value: 'M', label: `M - 66,001 - 67,000 lbs${loggingText} - ${formatCurrency(taxRates['M'])}` },
      { value: 'N', label: `N - 67,001 - 68,000 lbs${loggingText} - ${formatCurrency(taxRates['N'])}` },
      { value: 'O', label: `O - 68,001 - 69,000 lbs${loggingText} - ${formatCurrency(taxRates['O'])}` },
      { value: 'P', label: `P - 69,001 - 70,000 lbs${loggingText} - ${formatCurrency(taxRates['P'])}` },
      { value: 'Q', label: `Q - 70,001 - 71,000 lbs${loggingText} - ${formatCurrency(taxRates['Q'])}` },
      { value: 'R', label: `R - 71,001 - 72,000 lbs${loggingText} - ${formatCurrency(taxRates['R'])}` },
      { value: 'S', label: `S - 72,001 - 73,000 lbs${loggingText} - ${formatCurrency(taxRates['S'])}` },
      { value: 'T', label: `T - 73,001 - 74,000 lbs${loggingText} - ${formatCurrency(taxRates['T'])}` },
      { value: 'U', label: `U - 74,001 - 75,000 lbs${loggingText} - ${formatCurrency(taxRates['U'])}` },
      { value: 'V', label: `V - More than 75,000 lbs${loggingText} - ${formatCurrency(taxRates['V'])}` }
    ];
  };

  // Weight category options (A to V for taxable/credit, W for suspended)
  // These are used for display purposes when logging is not yet selected
  const weightCategoriesAToV = [
    { value: 'A', label: 'A - 55,000 lbs' },
    { value: 'B', label: 'B - 55,001 - 56,000 lbs' },
    { value: 'C', label: 'C - 56,001 - 57,000 lbs' },
    { value: 'D', label: 'D - 57,001 - 58,000 lbs' },
    { value: 'E', label: 'E - 58,001 - 59,000 lbs' },
    { value: 'F', label: 'F - 59,001 - 60,000 lbs' },
    { value: 'G', label: 'G - 60,001 - 61,000 lbs' },
    { value: 'H', label: 'H - 61,001 - 62,000 lbs' },
    { value: 'I', label: 'I - 62,001 - 63,000 lbs' },
    { value: 'J', label: 'J - 63,001 - 64,000 lbs' },
    { value: 'K', label: 'K - 64,001 - 65,000 lbs' },
    { value: 'L', label: 'L - 65,001 - 66,000 lbs' },
    { value: 'M', label: 'M - 66,001 - 67,000 lbs' },
    { value: 'N', label: 'N - 67,001 - 68,000 lbs' },
    { value: 'O', label: 'O - 68,001 - 69,000 lbs' },
    { value: 'P', label: 'P - 69,001 - 70,000 lbs' },
    { value: 'Q', label: 'Q - 70,001 - 71,000 lbs' },
    { value: 'R', label: 'R - 71,001 - 72,000 lbs' },
    { value: 'S', label: 'S - 72,001 - 73,000 lbs' },
    { value: 'T', label: 'T - 73,001 - 74,000 lbs' },
    { value: 'U', label: 'U - 74,001 - 75,000 lbs' },
    { value: 'V', label: 'V - More than 75,000 lbs' }
  ];

  const getWeightCategoryWLabel = (isLogging) => {
    const taxRates = isLogging === true ? TAX_RATES_LOGGING : TAX_RATES_NON_LOGGING;
    const loggingText = isLogging === true ? ' (Logging)' : isLogging === false ? ' (Non-Logging)' : '';
    return `W - Over 75,000 lbs (Maximum)${loggingText} - ${formatCurrency(taxRates['W'])}`;
  };

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

  const getMaxDate = (type) => {
    // For credit dates, exclude June (last month of tax period - no credit available)
    if (type === 'credit') {
      const today = new Date();
      const currentMonth = today.getMonth(); // 0-indexed: 0=January, 5=June
      const currentYear = today.getFullYear();

      // If current month is June or later, set max to May 31st of current year
      // Otherwise, use current date
      if (currentMonth >= 5) { // June (5) or later
        return `${currentYear}-05-31`; // May 31st
      }
      return today.toISOString().split('T')[0];
    }
    // For other types, use present date
    return new Date().toISOString().split('T')[0];
  };

  useEffect(() => {
    if (user) {
      loadVehicles();
      loadBusinesses();
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

  const loadBusinesses = async () => {
    if (!user) return;

    try {
      const userBusinesses = await getBusinessesByUser(user.uid);
      setBusinesses(userBusinesses);
    } catch (error) {
      console.error('Error loading businesses:', error);
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

  const handleCsvBusinessSelect = () => {
    if (!csvBusinessId || csvBusinessId.trim() === '') {
      setUploadError('Please select a business before uploading CSV.');
      return;
    }
    // Trigger file input after business is selected
    fileInputRef.current?.click();
    setShowCsvBusinessModal(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if business is selected (should be set before file selection)
    if (!csvBusinessId || csvBusinessId.trim() === '') {
      setUploadError('Please select a business first.');
      setShowCsvBusinessModal(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

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
                isSuspended: suspended,
                vehicleType: suspended ? 'suspended' : 'taxable',
                businessId: csvBusinessId // Include businessId for all CSV imports
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
        setUploadSuccess(`Successfully added ${successCount} vehicles to selected business.${failCount > 0 ? ` Failed to add ${failCount} rows.` : ''}`);

        // Reset CSV business selection after successful upload
        setCsvBusinessId('');

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
      soldDate: vehicle.soldDate || '',
      businessId: vehicle.businessId || ''
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

    // Validate business selection
    if (!editingVehicle.businessId || editingVehicle.businessId.trim() === '') {
      errors.businessId = 'Business selection is required';
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
        } else {
          // Validate that credit date is not in June (last month of tax period - no credit available)
          const creditDateObj = new Date(editingVehicle.creditDate);
          const creditMonth = creditDateObj.getMonth(); // 0-indexed: 0=January, 5=June
          if (creditMonth === 5) { // June is month index 5
            errors.creditDate = 'You cannot claim credit for the June month for any reason. June is the last month of the tax period, so there are no remaining months to claim credit.';
          }
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
        soldDate: editingVehicle.soldDate || null,
        businessId: editingVehicle.businessId
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

  const handleAddVehicle = async (vehicleData) => {
    // Check for duplicate VIN
    const duplicateVehicle = vehicles.find(v => v.vin === vehicleData.vin.toUpperCase());
    if (duplicateVehicle) {
      setVehicleErrors({ vin: 'This VIN already exists in your vehicle list' });
      return;
    }

    setSaving(true);
    setVehicleErrors({});

    try {
      const dataToSave = {
        vin: vehicleData.vin.toUpperCase().trim(),
        vehicleType: vehicleData.vehicleType,
        grossWeightCategory: vehicleData.grossWeightCategory,
        logging: vehicleData.logging,
        agricultural: vehicleData.agricultural ?? null,
        creditReason: vehicleData.creditReason || null,
        creditDate: vehicleData.creditDate || null,
        soldTo: vehicleData.soldTo || null,
        soldDate: vehicleData.soldDate || null,
        businessId: vehicleData.businessId
      };

      await createVehicle(user.uid, dataToSave);

      await loadVehicles();
      setShowAddModal(false);
      setVehicleErrors({});
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
        {/* Professional Header */}
        <div className="bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 mb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#173b63] flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                  <Truck className="w-5 h-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Fleet Management
                </h1>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Control your vehicle fleet, weights, and compliance status
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv"
                className="hidden"
              />
              <button
                onClick={() => {
                  if (businesses.length === 0) {
                    setUploadError('Please create a business first before importing vehicles.');
                    return;
                  }
                  setShowCsvBusinessModal(true);
                }}
                disabled={uploading || businesses.length === 0}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Import CSV</span>
                    <span className="sm:hidden">Import</span>
                  </span>
                )}
            </button>
            <Link
              href="/ucr/file"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-lg active:scale-95 transition-all duration-200 shadow-md touch-manipulation"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add Vehicle</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </div>
        </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Fleet Summary Banner */}
          <div className="bg-[#173b63] rounded-[2rem] p-6 shadow-xl shadow-slate-900/10 border border-white/10 relative overflow-hidden group mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#14b8a6]/10 rounded-full -ml-24 -mb-24 blur-3xl transition-transform group-hover:scale-110"></div>

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#ff8b3d] to-[#f07a2d] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/5">
                      Fleet Overview
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {vehicles.length} Total Vehicles
                  </h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      {vehicles.filter(v => v.vehicleType === 'taxable' || v.vehicleType === 'credit').length} Active
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                      {vehicles.filter(v => v.vehicleType === 'suspended' || v.vehicleType === 'priorYearSold').length} Suspended
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                    Data Integrity
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Shield className="w-4 h-4 text-[#14b8a6]" />
                    Safe & Secure
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">No Vehicles Yet</h2>
            <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
              Add your vehicle information to streamline your future filings. You can also import multiple vehicles via CSV.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold text-sm border-2 border-slate-200 rounded-xl hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <Link
                href="/ucr/file"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[var(--color-orange-soft)] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 shadow-lg"
              >
                Add Your First Vehicle
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
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
            <div className="mb-8 flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search fleet by VIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#14b8a6] outline-none transition-all text-sm font-bold tracking-tight"
                />
              </div>
              <div className="flex p-1 bg-slate-100 rounded-[1.25rem] w-full md:w-auto">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  All ({vehicles.length})
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'active'
                    ? 'bg-[#14b8a6] text-white shadow-lg shadow-teal-500/20'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  Active ({vehicles.filter(v => v.vehicleType === 'taxable' || v.vehicleType === 'credit').length})
                </button>
                <button
                  onClick={() => setFilterStatus('suspended')}
                  className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === 'suspended'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'text-slate-500 hover:text-slate-700'
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
                    onClick={() => {
                      if (businesses.length === 0) {
                        setUploadError('Please create a business first before importing vehicles.');
                        return;
                      }
                      setShowCsvBusinessModal(true);
                    }}
                    disabled={businesses.length === 0}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    Import CSV
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#14b8a6] text-white px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0d9488] transition-all shadow-xl shadow-teal-500/20 active:scale-95"
                  >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    Add Your First Vehicle
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-transparent lg:bg-white lg:rounded-2xl lg:border lg:border-slate-200 lg:shadow-sm overflow-hidden mb-20">
              {/* Modern Table Header */}
              <div className="hidden lg:block bg-slate-50 border-b border-slate-200">
                <div className="grid grid-cols-12 gap-4 px-6 py-4">
                  <div className="col-span-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vehicle Identification</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Context</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight Profile</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Added</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Management</span>
                  </div>
                </div>
              </div>

              {/* High-Density Row Redesign */}
              <div className="space-y-4 lg:space-y-0 lg:divide-y lg:divide-slate-100 p-1 lg:p-0">
                {filteredVehicles.map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    className="group bg-white lg:bg-transparent rounded-2xl lg:rounded-none border border-slate-200 lg:border-none shadow-sm lg:shadow-none grid grid-cols-1 lg:grid-cols-12 gap-4 px-5 py-5 lg:px-6 lg:py-4 hover:bg-slate-50/50 transition-all duration-300 relative"
                    style={{
                      animationDelay: `${index * 30}ms`,
                      animation: 'fadeInUp 0.4s ease-out forwards',
                    }}
                  >
                    <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-[#14b8a6] opacity-0 group-hover:opacity-100 transition-all rounded-r-full"></div>

                    {/* Vehicle */}
                    <div className="col-span-1 lg:col-span-3 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#14b8a6]/10 group-hover:text-[#14b8a6] group-hover:border-[#14b8a6]/20 transition-all shadow-sm">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-slate-900 font-mono tracking-tighter">
                            {vehicle.vin || 'NO VIN'}
                          </span>
                          <button
                            onClick={() => copyToClipboard(vehicle.vin)}
                            className="p-1 text-slate-300 hover:text-[#14b8a6] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          VIN Identity
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="col-span-1 lg:col-span-2 flex items-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${vehicle.vehicleType === 'suspended' || vehicle.vehicleType === 'priorYearSold'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${vehicle.vehicleType === 'suspended' || vehicle.vehicleType === 'priorYearSold' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></div>
                        {getVehicleTypeLabel(vehicle.vehicleType || 'taxable')}
                      </span>
                    </div>

                    {/* Details/Context */}
                    <div className="col-span-1 lg:col-span-2 flex items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                          {vehicle.vehicleType === 'taxable' ? (vehicle.logging ? 'Logging Integrated' : 'Standard Transport') : 'Non-Taxable Use'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                          Fleet Context
                        </span>
                      </div>
                    </div>

                    {/* Weight Profile */}
                    <div className="col-span-1 lg:col-span-2 flex items-center">
                      {vehicle.vehicleType !== 'priorYearSold' && (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-900/10 group-hover:bg-[#173b63] transition-colors">
                            {vehicle.grossWeightCategory || 'N/A'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-900 tracking-tight">
                              Category {vehicle.grossWeightCategory || 'N/A'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Weight Profile
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Added Date - Premium Polish */}
                    <div className="col-span-1 lg:col-span-1 flex items-center">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-900">
                          {vehicle.createdAt
                            ? new Date(vehicle.createdAt.seconds ? vehicle.createdAt.seconds * 1000 : vehicle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Registered
                        </span>
                      </div>
                    </div>

                    {/* Management Actions */}
                    <div className="col-span-1 lg:col-span-2 flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/new-filing?vehicleId=${vehicle.id}`}
                        className="min-w-[120px] text-center px-4 py-2 bg-[#14b8a6] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0d9488] transition-all shadow-md shadow-teal-500/10 active:scale-95"
                      >
                        Use for Filing
                      </Link>
                      <div className="relative actions-menu-group" style={{ zIndex: 100 }}>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl opacity-0 invisible actions-menu transition-all transform scale-95 z-[200]">
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 flex items-center gap-3 rounded-t-2xl transition-colors"
                          >
                            <Edit className="w-4 h-4 text-slate-400" />
                            Edit Vehicle
                          </button>
                          <button
                            onClick={() => setDeletingVehicle(vehicle)}
                            className="w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-3 rounded-b-2xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove Fleet
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

                  {/* Business Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Business <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingVehicle.businessId || ''}
                      onChange={(e) => setEditingVehicle({ ...editingVehicle, businessId: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select a business</option>
                      {businesses.map(business => (
                        <option key={business.id} value={business.id}>
                          {business.businessName || business.name || 'Unnamed Business'}
                        </option>
                      ))}
                    </select>
                    {vehicleErrors.businessId && (
                      <p className="mt-1 text-sm text-red-600">{vehicleErrors.businessId}</p>
                    )}
                    {businesses.length === 0 && (
                      <p className="mt-1 text-sm text-amber-600">
                        No businesses found. Please create a business first.
                      </p>
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

                <div className="mt-auto">
                  <Link
                    href="/ucr/file"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-[var(--color-orange)] hover:text-white transition-all duration-200"
                  >
                    <FileText className="w-4 h-4" />
                    Use for Filing
                  </Link>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* Add Vehicle Modal */}
          <VehicleFormModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setVehicleErrors({});
            }}
            onSubmit={handleAddVehicle}
            businesses={businesses}
            loading={saving}
            submitButtonText="Add Vehicle"
            title="Add New Vehicle"
            externalErrors={vehicleErrors}
          />

          {/* CSV Business Selection Modal */}
          {showCsvBusinessModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Select Business for CSV Import</h2>
                  <button
                    onClick={() => {
                      setShowCsvBusinessModal(false);
                      setCsvBusinessId('');
                      setUploadError('');
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Business <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={csvBusinessId}
                      onChange={(e) => {
                        setCsvBusinessId(e.target.value);
                        setUploadError('');
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all"
                    >
                      <option value="">Select a business</option>
                      {businesses.map(business => (
                        <option key={business.id} value={business.id}>
                          {business.businessName || business.name || 'Unnamed Business'}
                        </option>
                      ))}
                    </select>
                    {uploadError && csvBusinessId === '' && (
                      <p className="mt-1 text-sm text-red-600">{uploadError}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <strong>CSV Format:</strong> VIN, Weight Category, Suspended (optional)
                      <br />
                      <span className="text-xs text-blue-600 mt-1 block">
                        Example: 1HGBH41JXMN109186, F, false
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowCsvBusinessModal(false);
                        setCsvBusinessId('');
                        setUploadError('');
                      }}
                      className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCsvBusinessSelect}
                      disabled={!csvBusinessId || csvBusinessId.trim() === ''}
                      className="flex-1 px-4 py-3 bg-[var(--color-orange)] text-white rounded-xl font-semibold hover:bg-[var(--color-orange-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Continue to Upload
                      <Upload className="w-4 h-4" />
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
      </div>
    </ProtectedRoute>
  );
}
