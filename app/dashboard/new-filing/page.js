'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, createBusiness, getVehiclesByUser, createVehicle, createFiling } from '@/lib/db';
import { uploadInputDocument } from '@/lib/storage';

export default function NewFilingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Business
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

  // Step 2: Vehicles
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    grossWeightCategory: '',
    isSuspended: false
  });

  // Step 3: Documents
  const [documents, setDocuments] = useState([]);

  // Step 4: Review
  const [filingData, setFilingData] = useState({
    taxYear: '2025-2026',
    firstUsedMonth: 'July'
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

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

  const handleAddBusiness = async () => {
    if (!newBusiness.businessName || !newBusiness.ein) {
      setError('Business name and EIN are required');
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
      setError('');
    } catch (error) {
      setError('Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const validateVIN = (vin) => {
    return vin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.vin || !newVehicle.grossWeightCategory) {
      setError('VIN and gross weight category are required');
      return;
    }

    if (!validateVIN(newVehicle.vin)) {
      setError('VIN must be exactly 17 characters (letters and numbers only, excluding I, O, Q)');
      return;
    }

    setLoading(true);
    try {
      const vehicleId = await createVehicle(user.uid, {
        vin: newVehicle.vin.toUpperCase(),
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
        inputDocuments: []
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

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">New Filing Request</h1>
          <p className="mt-2 text-[var(--color-muted)]">
            Step {step} of 4: {step === 1 ? 'Business Information' : step === 2 ? 'Vehicles' : step === 3 ? 'Documents' : 'Review'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex-1 h-2 mx-1 rounded ${s <= step ? 'bg-[var(--color-navy)]' : 'bg-[var(--color-border)]'}`}></div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Business */}
        {step === 1 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Business Information</h2>
            
            {businesses.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                  Select Existing Business
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
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
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {businesses.length > 0 ? 'Or Add New Business' : 'Add Business'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={newBusiness.businessName}
                    onChange={(e) => setNewBusiness({...newBusiness, businessName: e.target.value})}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                    placeholder="ABC Trucking LLC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    EIN (Employer Identification Number) *
                  </label>
                  <input
                    type="text"
                    value={newBusiness.ein}
                    onChange={(e) => setNewBusiness({...newBusiness, ein: e.target.value.replace(/\D/g, '')})}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                    placeholder="12-3456789"
                    maxLength="11"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Business Address
                  </label>
                  <input
                    type="text"
                    value={newBusiness.address}
                    onChange={(e) => setNewBusiness({...newBusiness, address: e.target.value})}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newBusiness.phone}
                    onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Signing Authority Name
                    </label>
                    <input
                      type="text"
                      value={newBusiness.signingAuthorityName}
                      onChange={(e) => setNewBusiness({...newBusiness, signingAuthorityName: e.target.value})}
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
                      onChange={(e) => setNewBusiness({...newBusiness, signingAuthorityTitle: e.target.value})}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                      placeholder="Owner, President, etc."
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddBusiness}
                  disabled={loading}
                  className="w-full bg-[var(--color-navy)] text-white py-2 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Business'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedBusinessId) setStep(2);
                  else setError('Please select or create a business');
                }}
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicles */}
        {step === 2 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Vehicles</h2>
            
            {vehicles.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                  Select Existing Vehicles
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-[var(--color-border)] rounded-lg p-4">
                  {vehicles.map((vehicle) => (
                    <label key={vehicle.id} className="flex items-center gap-3 p-2 hover:bg-[var(--color-page-alt)] rounded cursor-pointer">
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
                        className="w-4 h-4"
                      />
                      <div>
                        <span className="font-medium">{vehicle.vin}</span>
                        <span className="text-sm text-[var(--color-muted)] ml-2">
                          - {vehicle.grossWeightCategory} {vehicle.isSuspended ? '(Suspended)' : ''}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                {vehicles.length > 0 ? 'Or Add New Vehicle' : 'Add Vehicle'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    VIN (17 characters) *
                  </label>
                  <input
                    type="text"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value.toUpperCase().slice(0, 17)})}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] font-mono"
                    placeholder="1HGBH41JXMN109186"
                    maxLength="17"
                  />
                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {newVehicle.vin.length}/17 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Gross Weight Category *
                  </label>
                  <select
                    value={newVehicle.grossWeightCategory}
                    onChange={(e) => setNewVehicle({...newVehicle, grossWeightCategory: e.target.value})}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                  >
                    <option value="">Select weight category...</option>
                    <option value="A">55,000 - 55,999 lbs</option>
                    <option value="B">56,000 - 57,999 lbs</option>
                    <option value="C">58,000 - 59,999 lbs</option>
                    <option value="D">60,000 - 61,999 lbs</option>
                    <option value="E">62,000 - 63,999 lbs</option>
                    <option value="F">64,000 - 65,999 lbs</option>
                    <option value="G">66,000 - 67,999 lbs</option>
                    <option value="H">68,000 - 69,999 lbs</option>
                    <option value="I">70,000 - 71,999 lbs</option>
                    <option value="J">72,000 - 73,999 lbs</option>
                    <option value="K">74,000 - 75,000 lbs</option>
                    <option value="W">Over 75,000 lbs (Maximum)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="suspended"
                    checked={newVehicle.isSuspended}
                    onChange={(e) => setNewVehicle({...newVehicle, isSuspended: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="suspended" className="text-sm text-[var(--color-text)]">
                    Vehicle qualifies for suspended status (less than 5,000 miles expected)
                  </label>
                </div>
                <button
                  onClick={handleAddVehicle}
                  disabled={loading}
                  className="w-full bg-[var(--color-navy)] text-white py-2 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Vehicle'}
                </button>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (selectedVehicleIds.length > 0) setStep(3);
                  else setError('Please select or add at least one vehicle');
                }}
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Documents (Optional)</h2>
            <p className="text-[var(--color-muted)] mb-6">
              Upload previous year's Schedule 1 or other supporting documents to help us process your filing faster.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Upload PDF Documents
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleDocumentUpload}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                multiple
              />
            </div>

            {documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">Uploaded Documents:</h3>
                <ul className="space-y-2">
                  {documents.map((doc, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-[var(--color-page-alt)] rounded">
                      <span className="text-sm text-[var(--color-text)]">{doc.name}</span>
                      <button
                        onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Tax Year
              </label>
              <select
                value={filingData.taxYear}
                onChange={(e) => setFilingData({...filingData, taxYear: e.target.value})}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                First Used Month
              </label>
              <select
                value={filingData.firstUsedMonth}
                onChange={(e) => setFilingData({...filingData, firstUsedMonth: e.target.value})}
                className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
              >
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
              </select>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Review & Submit</h2>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Business Information</h3>
                <div className="bg-[var(--color-page-alt)] p-4 rounded-lg">
                  {selectedBusiness && (
                    <>
                      <p><strong>Name:</strong> {selectedBusiness.businessName}</p>
                      <p><strong>EIN:</strong> {selectedBusiness.ein}</p>
                      {selectedBusiness.address && <p><strong>Address:</strong> {selectedBusiness.address}</p>}
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Vehicles ({selectedVehicles.length})</h3>
                <div className="bg-[var(--color-page-alt)] p-4 rounded-lg space-y-2">
                  {selectedVehicles.map((vehicle) => (
                    <p key={vehicle.id}>
                      <strong>VIN:</strong> {vehicle.vin} - {vehicle.grossWeightCategory} {vehicle.isSuspended ? '(Suspended)' : ''}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">Filing Details</h3>
                <div className="bg-[var(--color-page-alt)] p-4 rounded-lg">
                  <p><strong>Tax Year:</strong> {filingData.taxYear}</p>
                  <p><strong>First Used Month:</strong> {filingData.firstUsedMonth}</p>
                  <p><strong>Documents:</strong> {documents.length} file(s) uploaded</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Filing Request'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

