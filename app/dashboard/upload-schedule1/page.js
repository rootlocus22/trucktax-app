'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { createFiling, createBusiness, createVehicle, getBusinessesByUser, getVehiclesByUser, uploadInputDocument } from '@/lib/db';
import { saveDraftFiling, getDraftFiling, deleteDraftFiling } from '@/lib/draftHelpers';
import { calculateFilingCost } from '@/app/actions/pricing';
import { TruckLoader } from '@/components/TruckLoader';
import { AILoader } from '@/components/AILoader';
import {
  FileText,
  CheckCircle,
  ArrowRight,
  Building2,
  Plus,
  ChevronUp,
  ChevronDown,
  Loader2,
  X
} from 'lucide-react';
import BusinessFormModal from '@/components/BusinessFormModal';
import VehicleFormModal from '@/components/VehicleFormModal';

function UploadSchedule1Content() {
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
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicleIndex, setEditingVehicleIndex] = useState(null);

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

      // Only save draft once we have a business and at least one vehicle
      // This ensures we only draft filings that have significant progress (2290 only)
      const hasBusiness = selectedBusinessId || extractedBusiness;
      const hasMinimumData = hasBusiness && selectedVehicleIds.length > 0;

      if (step < 2 || !hasMinimumData) {
        return;
      }

      draftSavingRef.current = true;
      try {
        // If we don't have a draftId, check if an identical draft already exists
        // to prevent creating redundant draft documents (same business + same vehicles)
        if (!draftId && selectedBusinessId) {
          try {
            const existingDrafts = await getDraftFilingsByUser(user.uid);
            const sortedCurrentVehicles = [...selectedVehicleIds].sort().join(',');

            const duplicateDraft = existingDrafts.find(d => {
              if (d.selectedBusinessId !== selectedBusinessId) return false;
              if (!d.selectedVehicleIds) return false;
              const sortedDraftVehicles = [...d.selectedVehicleIds].sort().join(',');
              return sortedCurrentVehicles === sortedDraftVehicles;
            });

            if (duplicateDraft) {
              console.log('[DRAFT] Found matching existing draft for upload, linking to ID:', duplicateDraft.id);
              setDraftId(duplicateDraft.id);
              draftSavingRef.current = false;
              return; // Skip this save, let the next cycle update it if needed
            }
          } catch (err) {
            console.error('[DRAFT] Error checking for duplicates:', err);
          }
        }

        const draftData = {
          draftId,
          workflowType: 'upload',
          step,
          filingData,
          taxYear: filingData.taxYear, // Explicitly save taxYear for dashboard display
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

      // Build extracted business object
      if (extracted.businessName && extracted.ein) {
        const busObj = {
          businessName: extracted.businessName,
          ein: extracted.ein,
          address: typeof extracted.address === 'object'
            ? extracted.address.street
            : extracted.address,
          city: extracted.address?.city || '',
          state: extracted.address?.state || '',
          zip: extracted.address?.zip || '',
          country: extracted.address?.country || 'United States of America',
          phone: extracted.phone || '',
          signingAuthorityName: extracted.signingAuthorityName || '',
          signingAuthorityPhone: extracted.signingAuthorityPhone || '',
          signingAuthorityPIN: '',
          hasThirdPartyDesignee: false
        };
        setExtractedBusiness(busObj);

        // Auto-detect existing business
        const existingBusiness = businesses.find(b => b.ein === busObj.ein);
        if (existingBusiness) {
          setSelectedBusinessId(existingBusiness.id);
        }
      }

      if (extracted.vehicles && Array.isArray(extracted.vehicles) && extracted.vehicles.length > 0) {
        setExtractedVehicles(extracted.vehicles.map(v => ({
          vin: v.vin?.toUpperCase() || '',
          grossWeightCategory: v.grossWeightCategory || '',
          isSuspended: !!v.isSuspended,
          vehicleType: v.isSuspended ? 'suspended' : 'taxable',
          logging: extracted.isLogging || false
        })));
      }

      if (extracted.taxYear) setExtractedTaxYear(extracted.taxYear);
      if (extracted.firstUsedMonth) setExtractedFirstUsedMonth(extracted.firstUsedMonth);

      setFilingData({
        taxYear: extracted.taxYear || filingData.taxYear,
        firstUsedMonth: extracted.firstUsedMonth || filingData.firstUsedMonth
      });

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

  const handleBusinessSubmit = async (data) => {
    setLoading(true);
    try {
      const businessId = await createBusiness(user.uid, data);
      await loadData();
      setSelectedBusinessId(businessId);
      setExtractedBusiness(null);
      setShowBusinessModal(false);
    } catch (error) {
      console.error('Error saving business:', error);
      setError('Failed to save business.');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSubmit = async (data) => {
    setLoading(true);
    try {
      const vehicleId = await createVehicle(user.uid, data);
      await loadData();
      setSelectedVehicleIds(prev => [...new Set([...prev, vehicleId])]);

      if (editingVehicleIndex !== null) {
        setExtractedVehicles(prev => prev.filter((_, i) => i !== editingVehicleIndex));
        setEditingVehicleIndex(null);
      }
      setShowVehicleModal(false);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setError('Failed to save vehicle.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllVehicles = async () => {
    setLoading(true);
    try {
      const newIds = [];
      for (const v of extractedVehicles) {
        if (v.vin && v.grossWeightCategory) {
          const id = await createVehicle(user.uid, v);
          newIds.push(id);
        }
      }
      await loadData();
      setSelectedVehicleIds(prev => [...new Set([...prev, ...newIds])]);
      setExtractedVehicles([]);
    } catch (error) {
      console.error('Error saving vehicles:', error);
      setError('Failed to save some vehicles.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text)] tracking-tight mb-2">
            Upload Schedule 1 PDF
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted)]">
            Upload your Schedule 1 PDF and we'll automatically extract business and vehicle information
          </p>
        </div>

        {/* Step Indicator */}
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step === s
                    ? 'bg-[var(--color-orange)] text-white'
                    : step > s
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                    }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 2 && (
                  <div
                    className={`h-1 w-12 mx-1 ${step > s ? 'bg-green-500' : 'bg-gray-200'
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
                  onChange={(e) => setFilingData({ ...filingData, taxYear: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-orange)]"
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
                  onChange={(e) => setFilingData({ ...filingData, firstUsedMonth: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-orange)]"
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
                <div className="bg-slate-900 rounded-2xl p-4 mb-8 border border-blue-500/20 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="text-blue-400 w-20 h-20" />
                  </div>
                  <AILoader message={extractionProgress || 'AI is analyzing your Schedule 1 PDF...'} />
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-4">
                      Upload Schedule 1 PDF *
                    </label>

                    {!file ? (
                      <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-12 text-center hover:border-[var(--color-orange)] transition cursor-pointer">
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
                      <div className="border-2 border-[var(--color-orange)] rounded-xl p-4 bg-[var(--color-page-alt)]">
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

              {/* Business Selection/Review */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[var(--color-orange)]" />
                    <h3 className="text-lg font-bold text-[var(--color-text)]">Business Entity</h3>
                  </div>
                  {!selectedBusinessId && extractedBusiness && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full animate-pulse">
                      Extracted from PDF
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Existing */}
                  <div className="relative">
                    <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
                      Select Existing Business
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBusinessId}
                        onChange={(e) => {
                          setSelectedBusinessId(e.target.value);
                          if (e.target.value) setExtractedBusiness(null);
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--color-border)] rounded-xl appearance-none focus:ring-2 focus:ring-[var(--color-orange)] font-semibold text-sm"
                      >
                        <option value="">-- Select Business --</option>
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>{b.businessName} ({b.ein})</option>
                        ))}
                      </select>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
                    </div>
                  </div>

                  {/* Extracted or New */}
                  <div className="flex flex-col justify-end">
                    {extractedBusiness ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-bold text-sm text-[var(--color-text)]">{extractedBusiness.businessName}</p>
                            <p className="font-mono text-xs text-blue-600">
                              {extractedBusiness.ein}
                              {selectedBusinessId && businesses.find(b => b.id === selectedBusinessId)?.ein === extractedBusiness.ein && (
                                <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded uppercase">Auto-Matched</span>
                              )}
                            </p>
                          </div>
                          {!selectedBusinessId && (
                            <button
                              onClick={() => setShowBusinessModal(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Review & Save
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setExtractedBusiness(null);
                            setSelectedBusinessId('');
                            setShowBusinessModal(true);
                          }}
                          className="w-full py-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 border border-dashed border-blue-300 rounded hover:bg-blue-100 transition"
                        >
                          Use Different Business Instead
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setExtractedBusiness(null);
                          setShowBusinessModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] transition-all font-bold text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Business
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicles Selection/Review */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-[var(--color-orange)]" />
                    <h3 className="text-lg font-bold text-[var(--color-text)]">Vehicle Fleet</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[var(--color-muted)]">
                      {selectedVehicleIds.length} Selected
                    </span>
                    {extractedVehicles.length > 0 && (
                      <button
                        onClick={handleSaveAllVehicles}
                        disabled={loading}
                        className="text-xs font-bold text-[var(--color-orange)] hover:underline flex items-center gap-1"
                      >
                        Save All Extracted ({extractedVehicles.length})
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Extracted Vehicles Preview */}
                  {extractedVehicles.map((v, i) => (
                    <div key={`extracted-${i}`} className="p-4 bg-orange-50/50 border border-orange-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-[var(--color-orange)]" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-sm text-[var(--color-text)]">{v.vin}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-orange-100 text-[var(--color-orange)] text-[10px] font-black uppercase rounded">
                              Category {v.grossWeightCategory}
                            </span>
                            {v.isSuspended && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase rounded">
                                Suspended
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingVehicleIndex(i);
                          setShowVehicleModal(true);
                        }}
                        className="p-2 text-[var(--color-muted)] hover:text-[var(--color-orange)] transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* List of saved vehicles to select */}
                  {vehicles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {vehicles.map(v => (
                        <label
                          key={v.id}
                          className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedVehicleIds.includes(v.id)
                            ? 'border-[var(--color-orange)] bg-orange-50/20'
                            : 'border-[var(--color-border)] bg-white hover:border-orange-200'
                            }`}
                        >
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-[var(--color-orange)] focus:ring-[var(--color-orange)]"
                            checked={selectedVehicleIds.includes(v.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedVehicleIds([...selectedVehicleIds, v.id]);
                              else setSelectedVehicleIds(selectedVehicleIds.filter(id => id !== v.id));
                            }}
                          />
                          <div>
                            <p className="font-mono font-bold text-sm text-[var(--color-text)]">{v.vin}</p>
                            <p className="text-[10px] font-black text-[var(--color-muted)] uppercase tracking-tight">
                              Category {v.grossWeightCategory} • {v.isSuspended ? 'Suspended' : 'Taxable'}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setEditingVehicleIndex(null);
                      setShowVehicleModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] transition-all font-bold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Vehicle
                  </button>
                </div>
              </div>

              {/* Modal Components */}
              <BusinessFormModal
                isOpen={showBusinessModal}
                onClose={() => setShowBusinessModal(false)}
                onSubmit={handleBusinessSubmit}
                initialBusiness={extractedBusiness}
                loading={loading}
                title={extractedBusiness ? "Review Business Details" : "Add New Business"}
              />

              <VehicleFormModal
                isOpen={showVehicleModal}
                onClose={() => {
                  setShowVehicleModal(false);
                  setEditingVehicleIndex(null);
                }}
                onSubmit={handleVehicleSubmit}
                businesses={businesses}
                initialBusinessId={selectedBusinessId}
                initialVehicle={editingVehicleIndex !== null ? extractedVehicles[editingVehicleIndex] : null}
                loading={loading}
              />

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
                    const currentSelectedBusinessId = selectedBusinessId;
                    if (extractedBusiness && !currentSelectedBusinessId) {
                      await handleSaveBusiness();
                    }

                    // Ensure vehicles are saved and selected
                    if (extractedVehicles.length > 0 && selectedVehicleIds.length === 0) {
                      await handleSaveVehicles();
                    }

                    // Final check for selection
                    if (!selectedBusinessId && !currentSelectedBusinessId) {
                      setError('Please save or select a business before continuing.');
                      return;
                    }

                    if (selectedVehicleIds.length === 0) {
                      setError('Please save or select at least one vehicle before continuing.');
                      return;
                    }

                    // Save draft and hand off to comprehensive filing flow
                    if (user) {
                      try {
                        const draftData = {
                          workflowType: 'upload',
                          step: 5, // Hand off to Step 5 (Review) in NewFilingPage
                          filingData,
                          extractedBusiness,
                          extractedVehicles,
                          selectedBusinessId: selectedBusinessId || currentSelectedBusinessId,
                          selectedVehicleIds,
                          pdfUrl, // Pass the AI extraction source file
                          pricing: null // NewFilingPage will recalculate
                        };
                        const savedDraftId = await saveDraftFiling(user.uid, draftData);
                        router.push(`/dashboard/new-filing?draft=${savedDraftId}`);
                      } catch (error) {
                        console.error('Error handoff to filing flow:', error);
                        setError('Process failed. Please try again.');
                      }
                    }
                  }}
                  disabled={loading}
                  className="px-6 py-2 bg-[var(--color-orange)] text-white rounded-lg font-semibold hover:bg-[var(--color-orange-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Review & Pay
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function UploadSchedule1Page() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-orange)] mx-auto mb-4"></div>
              <p className="text-sm text-[var(--color-muted)]">Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    }>
      <UploadSchedule1Content />
    </Suspense>
  );
}
