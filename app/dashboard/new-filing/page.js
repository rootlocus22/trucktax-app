'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, createBusiness, getVehiclesByUser, createVehicle, createFiling } from '@/lib/db';
import { uploadInputDocument } from '@/lib/storage';
import { calculateFilingCost } from '@/app/actions/pricing'; // Server Action
import { calculateTax } from '@/lib/pricing'; // Keep for client-side estimation only
import { validateBusinessName, validateEIN, formatEIN, validateVIN, validateAddress, validatePhone } from '@/lib/validation';
import { FileText, AlertTriangle, RefreshCw, Truck, Info, CreditCard, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function NewFilingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Filing Type
  const [filingType, setFilingType] = useState('standard'); // standard, amendment, refund

  // Step 2: Business
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [newBusiness, setNewBusiness] = useState({
    businessName: '',
    ein: '',
    address: '',
    phone: '',
    signingAuthorityName: '',
    signingAuthorityTitle: ''
  });
  const [businessErrors, setBusinessErrors] = useState({});

  // Step 3: Vehicles
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    grossWeightCategory: '',
    isSuspended: false
  });
  const [vehicleErrors, setVehicleErrors] = useState({});

  // Step 4: Documents
  const [documents, setDocuments] = useState([]);

  // Step 5: Review
  const [filingData, setFilingData] = useState({
    taxYear: '2025-2026',
    firstUsedMonth: 'July'
  });

  // Pricing State (Fetched from Server)
  const [pricing, setPricing] = useState({
    totalTax: 0,
    serviceFee: 0,
    salesTax: 0,
    grandTotal: 0
  });
  const [pricingLoading, setPricingLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Fetch Pricing from Server when Review Step is active or data changes
  useEffect(() => {
    const fetchPricing = async () => {
      if (step !== 5) return; // Only calculate on Review step to save server calls

      const selectedVehiclesList = vehicles.filter(v => selectedVehicleIds.includes(v.id));
      const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

      // Parse state from address (simple assumption for now, ideally use structured address)
      // Assuming address format "123 Main St, City, State ZIP"
      let state = 'CA'; // Default fallback
      if (selectedBusiness?.address) {
        const parts = selectedBusiness.address.split(',');
        if (parts.length >= 2) {
          const stateZip = parts[parts.length - 1].trim();
          state = stateZip.split(' ')[0];
        }
      }

      setPricingLoading(true);
      try {
        // Sanitize vehicles to remove complex objects (like Firestore Timestamps)
        const sanitizedVehicles = selectedVehiclesList.map(v => ({
          id: v.id,
          vin: v.vin,
          grossWeightCategory: v.grossWeightCategory,
          isSuspended: v.isSuspended
        }));

        const result = await calculateFilingCost(
          { filingType, firstUsedMonth: filingData.firstUsedMonth },
          sanitizedVehicles,
          { state } // Pass state for tax calc
        );

        if (result.success) {
          setPricing(result.breakdown);
        }
      } catch (err) {
        console.error('Pricing fetch error:', err);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, [step, selectedVehicleIds, filingType, filingData.firstUsedMonth, vehicles, selectedBusinessId, businesses]);

  const loadData = async () => {
    try {
      const userBusinesses = await getBusinessesByUser(user.uid);
      const userVehicles = await getVehiclesByUser(user.uid);
      setBusinesses(userBusinesses);
      setVehicles(userVehicles);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleBusinessChange = (field, value) => {
    let formattedValue = value;
    if (field === 'ein') {
      formattedValue = formatEIN(value);
    }

    setNewBusiness(prev => ({ ...prev, [field]: formattedValue }));

    // Real-time validation
    let validation;
    if (field === 'businessName') validation = validateBusinessName(formattedValue);
    if (field === 'ein') validation = validateEIN(formattedValue);
    if (field === 'address') validation = validateAddress(formattedValue);
    if (field === 'phone') validation = validatePhone(formattedValue);

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
    const addrVal = validateAddress(newBusiness.address);
    const phoneVal = validatePhone(newBusiness.phone);

    if (!nameVal.isValid || !einVal.isValid || !addrVal.isValid || !phoneVal.isValid) {
      setBusinessErrors({
        businessName: nameVal.error,
        ein: einVal.error,
        address: addrVal.error,
        phone: phoneVal.error
      });
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);
    try {
      const businessId = await createBusiness(user.uid, newBusiness);
      await loadData();
      setSelectedBusinessId(businessId);
      setNewBusiness({
        businessName: '',
        ein: '',
        address: '',
        phone: '',
        signingAuthorityName: '',
        signingAuthorityTitle: ''
      });
      setBusinessErrors({});
      setError('');
    } catch (error) {
      setError('Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = (field, value) => {
    let formattedValue = value;
    if (field === 'vin') {
      formattedValue = value.toUpperCase();
    }

    setNewVehicle(prev => ({ ...prev, [field]: formattedValue }));

    if (field === 'vin') {
      const validation = validateVIN(formattedValue);
      setVehicleErrors(prev => ({
        ...prev,
        vin: validation.isValid ? '' : validation.error
      }));
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.grossWeightCategory) {
      setError('Gross weight category is required');
      return;
    }

    const vinVal = validateVIN(newVehicle.vin);
    if (!vinVal.isValid) {
      setVehicleErrors({ vin: vinVal.error });
      return;
    }

    setLoading(true);
    try {
      const vehicleId = await createVehicle(user.uid, {
        vin: newVehicle.vin,
        grossWeightCategory: newVehicle.grossWeightCategory,
        isSuspended: newVehicle.isSuspended
      });
      await loadData();
      setSelectedVehicleIds([...selectedVehicleIds, vehicleId]);
      setNewVehicle({
        vin: '',
        grossWeightCategory: '',
        isSuspended: false
      });
      setVehicleErrors({});
      setError('');
    } catch (error) {
      setError('Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setLoading(true);
    try {
      // We'll upload after filing is created, store file for now
      setDocuments([...documents, file]);
      setError('');
    } catch (error) {
      setError('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBusinessId) {
      setError('Please select or create a business');
      return;
    }

    if (selectedVehicleIds.length === 0) {
      setError('Please select or add at least one vehicle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create filing
      const filingId = await createFiling({
        userId: user.uid,
        businessId: selectedBusinessId,
        vehicleIds: selectedVehicleIds,
        taxYear: filingData.taxYear,
        firstUsedMonth: filingData.firstUsedMonth,
        filingType: filingType, // Add filing type
        inputDocuments: [],
        pricing: pricing // Save pricing snapshot
      });

      // Upload documents if any
      const documentUrls = [];
      for (let i = 0; i < documents.length; i++) {
        const url = await uploadInputDocument(documents[i], filingId, `document-${i}`);
        documentUrls.push(url);
      }

      // Update filing with document URLs
      if (documentUrls.length > 0) {
        const { updateFiling } = await import('@/lib/db');
        await updateFiling(filingId, { inputDocuments: documentUrls });
      }

      router.push(`/dashboard/filings/${filingId}`);
    } catch (error) {
      console.error('Error creating filing:', error);
      setError('Failed to create filing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
  const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));

  const getStepTitle = (s) => {
    switch (s) {
      case 1: return 'Filing Type';
      case 2: return 'Business Information';
      case 3: return 'Vehicles';
      case 4: return 'Documents';
      case 5: return 'Review & Pay';
      default: return '';
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto pb-20">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">New Filing Request</h1>
              <p className="text-sm text-[var(--color-muted)]">
                Step {step} of 5: <span className="font-medium text-[var(--color-navy)]">{getStepTitle(step)}</span>
              </p>
            </div>
            <div className="hidden md:flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-8 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-[var(--color-navy)]' : 'bg-[var(--color-border)]'}`}
                />
              ))}
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="md:hidden flex gap-1 h-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 rounded-full transition-colors ${s <= step ? 'bg-[var(--color-navy)]' : 'bg-[var(--color-border)]'}`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Step 1: Filing Type */}
        {step === 1 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Select Filing Type</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setFilingType('standard')}
                className={`p-6 rounded-xl border-2 text-left transition ${filingType === 'standard'
                  ? 'border-[var(--color-navy)] bg-[var(--color-page-alt)] ring-1 ring-[var(--color-navy)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-navy)]/50'
                  }`}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Standard 2290</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  File a new Form 2290 for vehicles used on public highways.
                </p>
              </button>

              <button
                onClick={() => setFilingType('amendment')}
                className={`p-6 rounded-xl border-2 text-left transition ${filingType === 'amendment'
                  ? 'border-[var(--color-navy)] bg-[var(--color-page-alt)] ring-1 ring-[var(--color-navy)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-navy)]/50'
                  }`}
              >
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Amendment</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Correct a VIN or report an increase in taxable gross weight.
                </p>
              </button>

              <button
                onClick={() => setFilingType('refund')}
                className={`p-6 rounded-xl border-2 text-left transition ${filingType === 'refund'
                  ? 'border-[var(--color-navy)] bg-[var(--color-page-alt)] ring-1 ring-[var(--color-navy)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-navy)]/50'
                  }`}
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Refund (8849)</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Claim a credit for sold, destroyed, or low-mileage vehicles.
                </p>
              </button>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition shadow-md"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Business */}
        {step === 2 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Business Information</h2>

            {businesses.length > 0 && (
              <div className="mb-8 p-4 bg-[var(--color-page-alt)] rounded-xl border border-[var(--color-border)]">
                <label className="block text-sm font-bold text-[var(--color-text)] mb-3">
                  Select Existing Business
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] bg-white"
                >
                  <option value="">Select a business...</option>
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.businessName} - EIN: {business.ein}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                {businesses.length > 0 ? 'Or Add New Business' : 'Add Business Details'}
              </h3>
              <div className="grid gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-[var(--color-text)]">
                      Business Name *
                    </label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-[var(--color-muted)] cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                        <strong>IRS Rule:</strong> Only letters, numbers, spaces, "&" and "-" are allowed. Do not use commas, periods, or other symbols.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newBusiness.businessName}
                    onChange={(e) => handleBusinessChange('businessName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] ${businessErrors.businessName ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                    placeholder="ABC Trucking LLC"
                  />
                  {businessErrors.businessName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {businessErrors.businessName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    EIN (Employer Identification Number) *
                  </label>
                  <input
                    type="text"
                    value={newBusiness.ein}
                    onChange={(e) => handleBusinessChange('ein', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] ${businessErrors.ein ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                    placeholder="12-3456789"
                    maxLength="10"
                  />
                  {businessErrors.ein && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {businessErrors.ein}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={newBusiness.address}
                    onChange={(e) => handleBusinessChange('address', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] ${businessErrors.address ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                    placeholder="123 Main St, City, State ZIP"
                  />
                  {businessErrors.address && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {businessErrors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newBusiness.phone}
                    onChange={(e) => handleBusinessChange('phone', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] ${businessErrors.phone ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                    placeholder="(555) 123-4567"
                  />
                  {businessErrors.phone && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {businessErrors.phone}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Signing Authority Name
                    </label>
                    <input
                      type="text"
                      value={newBusiness.signingAuthorityName}
                      onChange={(e) => setNewBusiness({ ...newBusiness, signingAuthorityName: e.target.value })}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newBusiness.signingAuthorityTitle}
                      onChange={(e) => setNewBusiness({ ...newBusiness, signingAuthorityTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                      placeholder="Owner, President, etc."
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddBusiness}
                  disabled={loading}
                  className="w-full bg-[var(--color-navy)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50 mt-2"
                >
                  {loading ? 'Adding...' : 'Save & Add Business'}
                </button>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (selectedBusinessId) setStep(3);
                  else setError('Please select or create a business');
                }}
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Vehicles */}
        {step === 3 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Vehicle Information</h2>

            {/* Tax Year & Month Selection - Moved here for better context */}
            <div className="grid grid-cols-2 gap-6 mb-8 p-4 bg-[var(--color-page-alt)] rounded-xl border border-[var(--color-border)]">
              <div>
                <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                  Tax Year
                </label>
                <select
                  value={filingData.taxYear}
                  onChange={(e) => setFilingData({ ...filingData, taxYear: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] bg-white"
                >
                  <option value="2025-2026">2025-2026 (Current)</option>
                  <option value="2024-2025">2024-2025</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                  First Used Month
                </label>
                <select
                  value={filingData.firstUsedMonth}
                  onChange={(e) => setFilingData({ ...filingData, firstUsedMonth: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] bg-white"
                >
                  {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {vehicles.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-[var(--color-text)] mb-3">
                  Select Vehicles to File
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-[var(--color-border)] rounded-lg p-4 bg-white">
                  {vehicles.map((vehicle) => {
                    const estimatedTax = calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);
                    return (
                      <label key={vehicle.id} className="flex items-center gap-3 p-3 hover:bg-[var(--color-page-alt)] rounded-lg cursor-pointer border border-transparent hover:border-[var(--color-border)] transition">
                        <input
                          type="checkbox"
                          checked={selectedVehicleIds.includes(vehicle.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVehicleIds([...selectedVehicleIds, vehicle.id]);
                            } else {
                              setSelectedVehicleIds(selectedVehicleIds.filter(id => id !== vehicle.id));
                            }
                          }}
                          className="w-5 h-5 text-[var(--color-navy)] rounded focus:ring-[var(--color-navy)]"
                        />
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-[var(--color-text)] font-mono">{vehicle.vin}</span>
                            <div className="text-sm text-[var(--color-muted)] flex items-center gap-2">
                              <span>Cat: {vehicle.grossWeightCategory}</span>
                              {vehicle.isSuspended && <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded-full">Suspended</span>}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[var(--color-text)]">${estimatedTax.toFixed(2)}</span>
                            <p className="text-xs text-[var(--color-muted)]">Est. Tax</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {vehicles.length > 0 ? 'Or Add New Vehicle' : 'Add Vehicle'}
              </h3>
              <div className="space-y-4 p-6 bg-[var(--color-page-alt)] rounded-xl border border-[var(--color-border)]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-[var(--color-text)]">
                      VIN (17 characters) *
                    </label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-[var(--color-muted)] cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                        <strong>IRS Rule:</strong> VIN must be exactly 17 characters. Letters I, O, and Q are NOT allowed.
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={newVehicle.vin}
                    onChange={(e) => handleVehicleChange('vin', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] font-mono uppercase ${vehicleErrors.vin ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                    placeholder="1HGBH41JXMN109186"
                    maxLength="17"
                  />
                  <div className="flex justify-between mt-1">
                    {vehicleErrors.vin ? (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {vehicleErrors.vin}
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--color-muted)]">
                        {newVehicle.vin.length}/17 characters
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-[var(--color-text)]">
                      Gross Weight Category *
                    </label>
                    <div className="group relative">
                      <Info className="w-4 h-4 text-[var(--color-muted)] cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                        The maximum loaded weight of the vehicle (truck + trailer + max load).
                      </div>
                    </div>
                  </div>
                  <select
                    value={newVehicle.grossWeightCategory}
                    onChange={(e) => setNewVehicle({ ...newVehicle, grossWeightCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] bg-white"
                  >
                    <option value="">Select weight category...</option>
                    <option value="A">A: 55,000 - 55,999 lbs ($100)</option>
                    <option value="B">B: 56,000 - 57,999 lbs ($122)</option>
                    <option value="C">C: 58,000 - 59,999 lbs ($144)</option>
                    <option value="D">D: 60,000 - 61,999 lbs ($166)</option>
                    <option value="E">E: 62,000 - 63,999 lbs ($188)</option>
                    <option value="F">F: 64,000 - 65,999 lbs ($210)</option>
                    <option value="G">G: 66,000 - 67,999 lbs ($232)</option>
                    <option value="H">H: 68,000 - 69,999 lbs ($254)</option>
                    <option value="I">I: 70,000 - 71,999 lbs ($276)</option>
                    <option value="J">J: 72,000 - 73,999 lbs ($298)</option>
                    <option value="K">K: 74,000 - 75,000 lbs ($320)</option>
                    <option value="W">W: Over 75,000 lbs ($550 - Max)</option>
                  </select>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <input
                    type="checkbox"
                    id="suspended"
                    checked={newVehicle.isSuspended}
                    onChange={(e) => setNewVehicle({ ...newVehicle, isSuspended: e.target.checked })}
                    className="w-5 h-5 mt-0.5 text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <div>
                    <label htmlFor="suspended" className="text-sm font-bold text-amber-900 block">
                      Suspended Vehicle (Low Mileage)
                    </label>
                    <p className="text-xs text-amber-700 mt-1">
                      Check this if you expect to drive less than 5,000 miles (7,500 for agriculture) on public highways. Tax will be $0.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAddVehicle}
                  disabled={loading}
                  className="w-full bg-[var(--color-navy)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (selectedVehicleIds.length > 0) setStep(4);
                  else setError('Please select or add at least one vehicle');
                }}
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Documents (Optional)</h2>
            <p className="text-[var(--color-muted)] mb-6">
              Upload previous year's Schedule 1 or other supporting documents to help us process your filing faster.
            </p>

            <div className="mb-6 p-8 border-2 border-dashed border-[var(--color-border)] rounded-xl text-center hover:bg-[var(--color-page-alt)] transition cursor-pointer relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleDocumentUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                multiple
              />
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-semibold text-[var(--color-text)]">Click to Upload PDF</p>
              <p className="text-sm text-[var(--color-muted)]">or drag and drop here</p>
            </div>

            {documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">Uploaded Documents:</h3>
                <ul className="space-y-2">
                  {documents.map((doc, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-[var(--color-page-alt)] rounded-lg border border-[var(--color-border)]">
                      <span className="text-sm text-[var(--color-text)] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--color-muted)]" />
                        {doc.name}
                      </span>
                      <button
                        onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition"
              >
                Review & Pay
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Pay */}
        {step === 5 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Review & Pay</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Summary Column */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-[var(--color-page-alt)] p-6 rounded-xl border border-[var(--color-border)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[var(--color-navy)]" />
                    Filing Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--color-muted)]">Filing Type</p>
                      <p className="font-semibold capitalize">{filingData.filingType || filingType}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)]">Tax Year</p>
                      <p className="font-semibold">{filingData.taxYear}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)]">First Used</p>
                      <p className="font-semibold">{filingData.firstUsedMonth}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)]">Vehicles</p>
                      <p className="font-semibold">{selectedVehicles.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[var(--color-page-alt)] p-6 rounded-xl border border-[var(--color-border)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4">Business Info</h3>
                  {selectedBusiness && (
                    <div className="text-sm">
                      <p className="font-bold text-lg">{selectedBusiness.businessName}</p>
                      <p className="text-[var(--color-muted)]">EIN: {selectedBusiness.ein}</p>
                      <p className="text-[var(--color-muted)]">{selectedBusiness.address}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-[var(--color-text)] mb-4">Vehicle List</h3>
                  <div className="space-y-2">
                    {selectedVehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex justify-between items-center p-3 border border-[var(--color-border)] rounded-lg text-sm">
                        <div>
                          <span className="font-mono font-bold">{vehicle.vin}</span>
                          <span className="text-[var(--color-muted)] ml-2">({vehicle.grossWeightCategory})</span>
                        </div>
                        <span className="font-semibold">
                          ${calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Column */}
              <div>
                <div className="bg-[var(--color-navy)] text-white p-6 rounded-2xl shadow-lg sticky top-6">
                  <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                  {pricingLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
                        <div className="flex justify-between">
                          <span className="text-white/80">IRS Tax Amount</span>
                          <span className="font-bold">${pricing.totalTax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/80">Service Fee</span>
                          <span className="font-bold">${pricing.serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">Sales Tax (Est.)</span>
                          <span className="font-bold">${pricing.salesTax.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mb-8">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-3xl font-bold">${pricing.grandTotal.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || pricingLoading}
                    className="w-full bg-[var(--color-orange)] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : (
                      <>
                        Pay & Submit <CreditCard className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60">
                    <ShieldCheck className="w-4 h-4" />
                    Secure 256-bit SSL Encrypted
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-start pt-4">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back to Documents
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
