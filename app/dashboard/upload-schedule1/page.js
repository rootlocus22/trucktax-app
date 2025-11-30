'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { createFiling, createBusiness, createVehicle, getBusinessesByUser, getVehiclesByUser, uploadInputDocument } from '@/lib/db';
import { saveDraftFiling, getDraftFiling, deleteDraftFiling } from '@/lib/draftHelpers';
import { calculateFilingCost } from '@/app/actions/pricing';
import { TruckLoader } from '@/components/TruckLoader';
import { FileText, Edit, CreditCard, ShieldCheck, CheckCircle, ArrowRight, Building2, Truck } from 'lucide-react';

export default function UploadSchedule1Page() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Step tracking
  const [step, setStep] = useState(1); // 1: Upload, 2: Review/Edit, 3: Pricing/Payment
  const [draftId, setDraftId] = useState(null);
  const draftSavingRef = useRef(false);
  
  // File and extraction
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractionProgress, setExtractionProgress] = useState('');
  
  // Extracted data (not yet saved to DB)
  const [extractedBusiness, setExtractedBusiness] = useState(null);
  const [extractedVehicles, setExtractedVehicles] = useState([]);
  const [extractedTaxYear, setExtractedTaxYear] = useState('2025-2026');
  const [extractedFirstUsedMonth, setExtractedFirstUsedMonth] = useState('July');
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Review/Edit state
  const [businesses, setBusinesses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [filingData, setFilingData] = useState({
    taxYear: '2025-2026',
    firstUsedMonth: 'July'
  });
  
  // Pricing
  const [pricing, setPricing] = useState({
    totalTax: 0,
    serviceFee: 0,
    salesTax: 0,
    grandTotal: 0
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  
  // Load draft if resuming
  useEffect(() => {
    const loadDraft = async () => {
      if (!searchParams || !user) return;
      const draftParam = searchParams.get('draft');
      if (draftParam) {
        try {
          const draft = await getDraftFiling(draftParam);
          if (draft && draft.userId === user.uid) {
            // Restore draft state
            setDraftId(draft.id);
            if (draft.step) setStep(draft.step);
            if (draft.filingData) setFilingData(draft.filingData);
            if (draft.extractedBusiness) setExtractedBusiness(draft.extractedBusiness);
            if (draft.extractedVehicles) setExtractedVehicles(draft.extractedVehicles);
            if (draft.selectedBusinessId) setSelectedBusinessId(draft.selectedBusinessId);
            if (draft.selectedVehicleIds) setSelectedVehicleIds(draft.selectedVehicleIds);
            if (draft.pdfUrl) setPdfUrl(draft.pdfUrl);
            if (draft.pricing) setPricing(draft.pricing);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    };
    loadDraft();
  }, [user, searchParams]);

  // Load existing businesses and vehicles
  useEffect(() => {
    if (user && step >= 2) {
      loadData();
    }
  }, [user, step]);

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

  // Calculate pricing when on step 3
  useEffect(() => {
    if (step === 3 && selectedVehicleIds.length > 0) {
      // Use either selectedBusinessId or extractedBusiness
      const hasBusiness = selectedBusinessId || extractedBusiness;
      if (hasBusiness) {
        fetchPricing();
      }
    }
  }, [step, selectedVehicleIds, filingData.firstUsedMonth, selectedBusinessId, vehicles, businesses]);

  // Auto-save draft as user progresses
  useEffect(() => {
    const saveDraft = async () => {
      if (!user || draftSavingRef.current) return; // Don't save if already saving
      
      // Save from step 2 onwards (when PDF is uploaded)
      if (step < 2) return;
      
      // Only save if we have meaningful data
      const hasData = pdfUrl || extractedBusiness || selectedBusinessId || selectedVehicleIds.length > 0;
      if (!hasData) {
        console.log('Skipping draft save - no meaningful data yet');
        return;
      }

      draftSavingRef.current = true;
      try {
        const draftData = {
          draftId,
          workflowType: 'upload',
          step,
          filingData,
          extractedBusiness,
          extractedVehicles,
          selectedBusinessId,
          selectedVehicleIds,
          pdfUrl,
          pricing: pricing.grandTotal > 0 ? pricing : null
        };

        console.log('Saving draft filing for upload workflow, step:', step);
        const savedDraftId = await saveDraftFiling(user.uid, draftData);
        console.log('Draft saved with ID:', savedDraftId);
        if (!draftId) {
          setDraftId(savedDraftId);
        }
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        draftSavingRef.current = false;
      }
    };

    // Debounce draft saving - save after 500ms of inactivity
    const timeoutId = setTimeout(saveDraft, 500);
    return () => clearTimeout(timeoutId);
  }, [user, step, filingData, extractedBusiness, extractedVehicles, selectedBusinessId, selectedVehicleIds, pdfUrl, pricing, draftId]);

  const fetchPricing = async () => {
    setPricingLoading(true);
    try {
      const selectedVehiclesList = vehicles.filter(v => selectedVehicleIds.includes(v.id));
      
      if (selectedVehiclesList.length === 0) {
        console.warn('No vehicles found for pricing calculation');
        return;
      }

      // Get business - use selected or extracted
      const selectedBusiness = selectedBusinessId 
        ? businesses.find(b => b.id === selectedBusinessId)
        : null;
      
      // Get state from business address
      let state = '';
      if (selectedBusiness?.address) {
        const addressParts = (selectedBusiness.address || '').split(',');
        state = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim().split(' ')[0] : '';
      } else if (extractedBusiness?.address) {
        const addressParts = (extractedBusiness.address || '').split(',');
        state = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim().split(' ')[0] : '';
      }

      const filingDataForPricing = {
        filingType: 'standard',
        firstUsedMonth: filingData.firstUsedMonth
      };

      // Ensure vehicles have proper structure for tax calculation
      const sanitizedVehicles = selectedVehiclesList.map(v => {
        // Make sure isSuspended is a boolean - default to false if not explicitly set
        // Only mark as suspended if explicitly true, not if undefined/null
        const isSuspended = v.isSuspended === true;
        
        return {
          id: v.id,
          vin: v.vin,
          grossWeightCategory: (v.grossWeightCategory || '').toUpperCase().trim(),
          isSuspended: isSuspended
        };
      }).filter(v => {
        // Filter out invalid vehicles
        const hasValidCategory = v.grossWeightCategory && v.grossWeightCategory.length === 1;
        if (!hasValidCategory) {
          console.warn(`Vehicle ${v.vin} has invalid weight category: "${v.grossWeightCategory}"`);
        }
        return hasValidCategory;
      });

      console.log('Pricing calculation - Filing Data:', filingDataForPricing);
      console.log('Pricing calculation - Vehicles:', sanitizedVehicles.map(v => ({
        vin: v.vin,
        category: v.grossWeightCategory,
        suspended: v.isSuspended,
        originalSuspended: selectedVehiclesList.find(sv => sv.id === v.id)?.isSuspended
      })));

      if (sanitizedVehicles.length === 0) {
        console.warn('No valid vehicles after sanitization');
        return;
      }

      const result = await calculateFilingCost(
        filingDataForPricing,
        sanitizedVehicles,
        { state }
      );

      console.log('Pricing result:', result);

      if (result.success) {
        setPricing({
          totalTax: result.breakdown.totalTax,
          serviceFee: result.breakdown.serviceFee,
          salesTax: result.breakdown.salesTax,
          grandTotal: result.breakdown.grandTotal
        });
        
        // Save draft with pricing when calculated
        if (user && !draftSavingRef.current) {
          draftSavingRef.current = true;
          try {
            const draftData = {
              draftId,
              workflowType: 'upload',
              step: 3,
              filingData,
              extractedBusiness,
              extractedVehicles,
              selectedBusinessId,
              selectedVehicleIds,
              pdfUrl,
              pricing: result.breakdown
            };
            const savedDraftId = await saveDraftFiling(user.uid, draftData);
            if (!draftId) {
              setDraftId(savedDraftId);
            }
            console.log('Draft saved with pricing on step 3');
          } catch (error) {
            console.error('Error saving draft with pricing:', error);
          } finally {
            draftSavingRef.current = false;
          }
        }
      } else {
        console.error('Pricing calculation failed:', result.error);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setPricingLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleExtractData = async () => {
    if (!file || !user) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    setExtractionProgress('Uploading PDF to server...');

    try {
      // Get auth token
      const idToken = await user.getIdToken(true);
      if (!idToken) {
          throw new Error('Failed to get authentication token');
      }

      // Step 1: Upload PDF via API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filingId', 'temp'); // Temporary ID

      const uploadResponse = await fetch('/api/upload-schedule1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadResult = await uploadResponse.json();
      setPdfUrl(uploadResult.url);
      setExtractionProgress('Extracting data with AI...');

      // Step 2: Extract data via API
      const extractResponse = await fetch('/api/extract-schedule1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: uploadResult.url,
          fileName: file.name,
        }),
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to extract data');
      }

      const extractResult = await extractResponse.json();
      const extracted = extractResult.data;

      if (!extracted) {
        throw new Error('Failed to extract data from PDF. Please try again or use manual entry.');
      }

      // Store extracted data (not yet saved to DB)
      if (extracted.businessName && extracted.ein) {
        setExtractedBusiness({
          businessName: extracted.businessName,
          ein: extracted.ein,
          address: extracted.address || '',
          phone: extracted.phone || '',
          signingAuthorityName: extracted.signingAuthorityName || '',
          signingAuthorityTitle: extracted.signingAuthorityTitle || ''
        });
      }

      if (extracted.vehicles && Array.isArray(extracted.vehicles) && extracted.vehicles.length > 0) {
        setExtractedVehicles(extracted.vehicles.map(v => ({
          vin: v.vin?.toUpperCase() || '',
          grossWeightCategory: v.grossWeightCategory || '',
          isSuspended: v.isSuspended || false
        })));
      }

      if (extracted.taxYear) setExtractedTaxYear(extracted.taxYear);
      if (extracted.firstUsedMonth) setExtractedFirstUsedMonth(extracted.firstUsedMonth);

      setFilingData({
        taxYear: extracted.taxYear || filingData.taxYear,
        firstUsedMonth: extracted.firstUsedMonth || filingData.firstUsedMonth
      });

      // Load existing businesses and vehicles to check for matches
      await loadData();

      // Auto-detect existing business
      if (extractedBusiness) {
        const existingBusiness = businesses.find(b => b.ein === extractedBusiness.ein);
        if (existingBusiness) {
          setSelectedBusinessId(existingBusiness.id);
        }
      }

      // Auto-detect existing vehicles
      if (extractedVehicles.length > 0) {
        const matchingVehicleIds = vehicles
          .filter(v => extractedVehicles.some(ev => ev.vin === v.vin))
          .map(v => v.id);
        if (matchingVehicleIds.length > 0) {
          setSelectedVehicleIds(matchingVehicleIds);
        }
      }

      // Move to review step
      setStep(2);
      setExtractionProgress('');

    } catch (error) {
      console.error('Error processing Schedule 1:', error);
      let errorMessage = 'Failed to process Schedule 1. Please try again or use manual entry.';
      if (error.message) errorMessage = error.message;
      setError(errorMessage);
    } finally {
      setLoading(false);
      setExtractionProgress('');
    }
  };

  const handleSaveBusiness = async () => {
    if (!extractedBusiness || !user) return;
    
    setLoading(true);
    setError('');
    try {
      // Check if business already exists
      const existingBusiness = businesses.find(b => b.ein === extractedBusiness.ein);
      if (existingBusiness) {
        setSelectedBusinessId(existingBusiness.id);
        setError('');
        return;
      }
      
      const businessId = await createBusiness(user.uid, extractedBusiness);
      await loadData();
      setSelectedBusinessId(businessId);
      setError('');
    } catch (error) {
      console.error('Error saving business:', error);
      setError('Failed to create business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVehicles = async () => {
    if (!extractedVehicles.length || !user) return;
    
    setLoading(true);
    setError('');
    try {
      const vehicleIds = [];
      for (const vehicleData of extractedVehicles) {
        if (vehicleData.vin && vehicleData.grossWeightCategory) {
          // Check if vehicle already exists
          const existingVehicle = vehicles.find(v => v.vin === vehicleData.vin);
          if (existingVehicle) {
            vehicleIds.push(existingVehicle.id);
          } else {
            const vehicleId = await createVehicle(user.uid, vehicleData);
            vehicleIds.push(vehicleId);
          }
        }
      }
      
      if (vehicleIds.length === 0) {
        setError('No valid vehicles to save. Please check VIN and weight category.');
        return;
      }
      
      await loadData();
      setSelectedVehicleIds([...new Set([...selectedVehicleIds, ...vehicleIds])]); // Merge with existing selections
      setError('');
    } catch (error) {
      console.error('Error saving vehicles:', error);
      setError('Failed to create vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBusinessId || selectedVehicleIds.length === 0) {
      setError('Please select a business and at least one vehicle');
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
        filingType: 'standard',
        inputDocuments: pdfUrl ? [pdfUrl] : [],
        pricing: pricing,
        notes: `Schedule 1 PDF uploaded and data extracted automatically. Extracted ${selectedVehicleIds.length} vehicle(s).`
      });

      // Delete draft immediately after successful submission
      if (draftId) {
        try {
          console.log('Deleting draft filing after successful submission:', draftId);
          await deleteDraftFiling(draftId);
          console.log('Draft filing deleted successfully');
          setDraftId(null); // Clear draft ID from state
        } catch (error) {
          console.error('Error deleting draft:', error);
          // Don't fail the whole submission if draft deletion fails
        }
      }

      router.push(`/dashboard/filings/${filingId}`);
    } catch (error) {
      console.error('Error creating filing:', error);
      setError('Failed to create filing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-2">
            Upload Schedule 1 PDF
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted)]">
            Upload your Schedule 1 PDF and we'll automatically extract business and vehicle information
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step === s
                    ? 'bg-[var(--color-navy)] text-white'
                    : step > s
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-1 w-12 mx-1 ${
                    step > s ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Upload & Extract */}
        {step === 1 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">Step 1: Upload PDF</h2>

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

            {loading ? (
              <div className="bg-[var(--color-page-alt)] rounded-xl p-8">
                <TruckLoader message={extractionProgress || 'Processing your Schedule 1 PDF...'} />
              </div>
            ) : (
              <>
            <div className="mb-8">
              <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                Upload Schedule 1 PDF *
              </label>
              
              {!file ? (
                <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-12 text-center hover:border-[var(--color-navy)] transition cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="schedule1-upload"
                  />
                  <label htmlFor="schedule1-upload" className="cursor-pointer">
                    <div className="text-5xl mb-4">📄</div>
                    <p className="text-lg font-semibold text-[var(--color-text)] mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      PDF file (max 10MB)
                    </p>
                  </label>
                </div>
              ) : (
                    <div className="border-2 border-[var(--color-navy)] rounded-xl p-4 bg-[var(--color-page-alt)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">📄</div>
                          <div>
                            <p className="font-semibold text-[var(--color-text)]">{file.name}</p>
                        <p className="text-sm text-[var(--color-muted)]">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFile(null)}
                          className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 text-xl">ℹ️</div>
                <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">What we'll extract:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Business name and EIN</li>
                    <li>Business address</li>
                    <li>Vehicle VINs and weight categories</li>
                    <li>Tax year and filing period</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExtractData}
                disabled={loading || !file}
                className="px-6 py-3 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white rounded-lg font-semibold hover:shadow-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload & Extract Data
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Review & Edit */}
        {step === 2 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">Step 2: Review & Edit Extracted Data</h2>

            {/* Business Section */}
            {extractedBusiness && (
              <div className="mb-6 p-4 bg-[var(--color-page-alt)] rounded-lg border border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[var(--color-navy)]" />
                  <h3 className="font-semibold text-[var(--color-text)]">Business Information</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-[var(--color-muted)] mb-1">Business Name</label>
                    <input
                      type="text"
                      value={extractedBusiness.businessName}
                      onChange={(e) => setExtractedBusiness({...extractedBusiness, businessName: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--color-muted)] mb-1">EIN</label>
                    <input
                      type="text"
                      value={extractedBusiness.ein}
                      onChange={(e) => setExtractedBusiness({...extractedBusiness, ein: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-[var(--color-muted)] mb-1">Address</label>
                    <input
                      type="text"
                      value={extractedBusiness.address}
                      onChange={(e) => setExtractedBusiness({...extractedBusiness, address: e.target.value})}
                      className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveBusiness}
                    disabled={loading}
                    className="px-4 py-2 bg-[var(--color-navy)] text-white rounded-lg hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50"
                  >
                    {businesses.find(b => b.ein === extractedBusiness.ein) ? 'Update Business' : 'Save Business'}
                  </button>
                  
                  {/* Select existing business */}
                  {businesses.length > 0 && (
                    <select
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      className="px-4 py-2 border border-[var(--color-border)] rounded-lg"
                    >
                      <option value="">Or select existing business...</option>
                      {businesses.map(b => (
                        <option key={b.id} value={b.id}>{b.businessName} ({b.ein})</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )}

            {/* Vehicles Section */}
            {extractedVehicles.length > 0 && (
              <div className="mb-6 p-4 bg-[var(--color-page-alt)] rounded-lg border border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-[var(--color-navy)]" />
                  <h3 className="font-semibold text-[var(--color-text)]">Vehicles ({extractedVehicles.length})</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  {extractedVehicles.map((vehicle, index) => (
                    <div key={index} className="grid md:grid-cols-3 gap-3 p-3 bg-white rounded border border-[var(--color-border)]">
                      <div>
                        <label className="block text-xs text-[var(--color-muted)] mb-1">VIN</label>
                        <input
                          type="text"
                          value={vehicle.vin}
                          onChange={(e) => {
                            const updated = [...extractedVehicles];
                            updated[index].vin = e.target.value.toUpperCase();
                            setExtractedVehicles(updated);
                          }}
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg font-mono text-sm"
                          maxLength="17"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-muted)] mb-1">Weight Category</label>
                        <input
                          type="text"
                          value={vehicle.grossWeightCategory}
                          onChange={(e) => {
                            const updated = [...extractedVehicles];
                            updated[index].grossWeightCategory = e.target.value.toUpperCase();
                            setExtractedVehicles(updated);
                          }}
                          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg text-sm"
                          maxLength="1"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={vehicle.isSuspended}
                            onChange={(e) => {
                              const updated = [...extractedVehicles];
                              updated[index].isSuspended = e.target.checked;
                              setExtractedVehicles(updated);
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-[var(--color-text)]">Suspended</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveVehicles}
                  disabled={loading}
                  className="px-4 py-2 bg-[var(--color-navy)] text-white rounded-lg hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50"
                >
                  Save All Vehicles
                </button>
                
                {/* Select existing vehicles */}
                {vehicles.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm text-[var(--color-muted)] mb-2">Or select existing vehicles:</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {vehicles.map(v => (
                        <label key={v.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedVehicleIds.includes(v.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVehicleIds([...selectedVehicleIds, v.id]);
                              } else {
                                setSelectedVehicleIds(selectedVehicleIds.filter(id => id !== v.id));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm font-mono">{v.vin}</span>
                          <span className="text-sm text-[var(--color-muted)]">({v.grossWeightCategory})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back
              </button>
              <button
                onClick={async () => {
                  setError('');
                  
                  // Ensure business is saved and selected
                  if (extractedBusiness) {
                    if (!selectedBusinessId) {
                      await handleSaveBusiness();
                    }
                  }
                  
                  // Ensure vehicles are saved and selected
                  if (extractedVehicles.length > 0 && selectedVehicleIds.length === 0) {
                    await handleSaveVehicles();
                  }
                  
                  // Validate before proceeding
                  if (!selectedBusinessId) {
                    setError('Please save or select a business before continuing.');
                    return;
                  }
                  
                  if (selectedVehicleIds.length === 0) {
                    setError('Please save or select at least one vehicle before continuing.');
                    return;
                  }
                  
                  // Save draft before moving to payment step
                  if (user) {
                    try {
                      const draftData = {
                        draftId,
                        workflowType: 'upload',
                        step: 3,
                        filingData,
                        extractedBusiness,
                        extractedVehicles,
                        selectedBusinessId,
                        selectedVehicleIds,
                        pdfUrl,
                        pricing: null // Will be calculated on step 3
                      };
                      const savedDraftId = await saveDraftFiling(user.uid, draftData);
                      if (!draftId) {
                        setDraftId(savedDraftId);
                      }
                    } catch (error) {
                      console.error('Error saving draft:', error);
                    }
                  }
                  
                  setStep(3);
                }}
                disabled={loading}
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Pay */}
        {step === 3 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-6">Step 3: Review & Pay</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Summary Column */}
              <div className="md:col-span-2 space-y-6">
                {/* Business Information */}
                {(() => {
                  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
                  if (!selectedBusiness && extractedBusiness) {
                    // Show extracted business even if not saved yet
                    return (
                      <div className="bg-[var(--color-page-alt)] p-6 rounded-xl border border-[var(--color-border)]">
                        <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-[var(--color-navy)]" />
                          Business Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[var(--color-muted)]">Business Name</p>
                            <p className="font-semibold">{extractedBusiness.businessName}</p>
                          </div>
                          <div>
                            <p className="text-[var(--color-muted)]">EIN</p>
                            <p className="font-semibold font-mono">{extractedBusiness.ein}</p>
                          </div>
                          {extractedBusiness.address && (
                            <div className="col-span-2">
                              <p className="text-[var(--color-muted)]">Address</p>
                              <p className="font-semibold">{extractedBusiness.address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else if (selectedBusiness) {
                    return (
                      <div className="bg-[var(--color-page-alt)] p-6 rounded-xl border border-[var(--color-border)]">
                        <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-[var(--color-navy)]" />
                          Business Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[var(--color-muted)]">Business Name</p>
                            <p className="font-semibold">{selectedBusiness.businessName}</p>
                          </div>
                          <div>
                            <p className="text-[var(--color-muted)]">EIN</p>
                            <p className="font-semibold font-mono">{selectedBusiness.ein}</p>
                          </div>
                          {selectedBusiness.address && (
                            <div className="col-span-2">
                              <p className="text-[var(--color-muted)]">Address</p>
                              <p className="font-semibold">{selectedBusiness.address}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div className="bg-[var(--color-page-alt)] p-6 rounded-xl border border-[var(--color-border)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--color-navy)]" />
                    Filing Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                      <p className="font-semibold">{selectedVehicleIds.length}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Vehicles */}
                <div className="bg-[var(--color-page-alt)] p-6 rounded-xl border border-[var(--color-border)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4">Selected Vehicles</h3>
                  <div className="space-y-2">
                    {vehicles.filter(v => selectedVehicleIds.includes(v.id)).map(v => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-white rounded border border-[var(--color-border)]">
                        <div>
                          <p className="font-mono font-semibold">{v.vin}</p>
                          <p className="text-sm text-[var(--color-muted)]">Weight: {v.grossWeightCategory} {v.isSuspended && '(Suspended)'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Column */}
              <div className="bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-soft)] rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-6">Order Summary</h3>
                
                {pricingLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="mt-2 text-sm">Calculating...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">IRS Tax Amount</span>
                        <span className="font-bold">${pricing.totalTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">Service Fee</span>
                        <span className="font-bold">${pricing.serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/80">Sales Tax (Est.)</span>
                        <span className="font-bold">${pricing.salesTax.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-8 border-t border-white/20 pt-4">
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

            <div className="flex justify-start pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
              >
                Back to Review
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
