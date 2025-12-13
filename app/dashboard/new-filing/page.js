'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, createBusiness, getVehiclesByUser, createVehicle, createFiling, getFilingsByUser, getVehicle } from '@/lib/db';
import { saveDraftFiling, getDraftFiling, deleteDraftFiling } from '@/lib/draftHelpers';
import { detectDuplicateFiling, formatIncompleteFiling } from '@/lib/filingIntelligence';
import { uploadInputDocument } from '@/lib/storage';
import { calculateFilingCost } from '@/app/actions/pricing'; // Server Action
import { calculateTax, calculateRefundAmount, calculateWeightIncreaseAdditionalTax, calculateMileageExceededTax } from '@/lib/pricing'; // Keep for client-side estimation only
import { validateBusinessName, validateEIN, formatEIN, validateVIN, validateAddress, validatePhone } from '@/lib/validation';
import { validateVINCorrection, validateWeightIncrease, validateMileageExceeded, calculateWeightIncreaseDueDate, getAmendmentTypeConfig } from '@/lib/amendmentHelpers';
import { FileText, AlertTriangle, RefreshCw, Truck, Info, CreditCard, CheckCircle, ShieldCheck, AlertCircle, RotateCcw, Clock, Building2, ChevronUp, Loader2 } from 'lucide-react';
import { PricingSidebar } from '@/components/PricingSidebar';

// Mobile Pricing Summary Component - Sticky Bottom
function MobilePricingSummary({
  filingType,
  filingData,
  selectedVehicleIds,
  vehicles,
  selectedBusinessId,
  businesses,
  amendmentType,
  weightIncreaseData,
  mileageExceededData,
  step,
  onContinue,
  onSubmit,
  loading = false,
  hideSubmitButton = false
}) {
  const [pricing, setPricing] = useState({
    totalTax: 0,
    serviceFee: 0,
    salesTax: 0,
    grandTotal: 0,
    totalRefund: 0
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      if (!filingType || selectedVehicleIds.length === 0) {
        setPricing({
          totalTax: 0,
          serviceFee: 0,
          salesTax: 0,
          grandTotal: 0,
          totalRefund: 0
        });
        return;
      }

      const selectedVehiclesList = vehicles.filter(v => selectedVehicleIds.includes(v.id));
      const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

      let state = 'CA';
      if (selectedBusiness?.address) {
        const parts = selectedBusiness.address.split(',');
        if (parts.length >= 2) {
          const stateZip = parts[parts.length - 1].trim();
          state = stateZip.split(' ')[0];
        }
      }

      setPricingLoading(true);
      try {
        const filingDataForPricing = {
          filingType,
          firstUsedMonth: filingData?.firstUsedMonth || 'July'
        };

        let amendmentDataForPricing = null;
        if (filingType === 'amendment' && amendmentType) {
          filingDataForPricing.amendmentType = amendmentType;

          if (amendmentType === 'weight_increase') {
            amendmentDataForPricing = {
              originalWeightCategory: weightIncreaseData?.originalWeightCategory,
              newWeightCategory: weightIncreaseData?.newWeightCategory,
              increaseMonth: weightIncreaseData?.increaseMonth
            };
          } else if (amendmentType === 'mileage_exceeded') {
            const vehicle = vehicles.find(v => v.id === mileageExceededData?.vehicleId);
            amendmentDataForPricing = {
              vehicleCategory: vehicle?.grossWeightCategory || '',
              firstUsedMonth: filingData?.firstUsedMonth || 'July'
            };
          } else if (amendmentType === 'vin_correction') {
            amendmentDataForPricing = {};
          }
        }

        if (amendmentDataForPricing !== null) {
          filingDataForPricing.amendmentData = amendmentDataForPricing;
        }

        const sanitizedVehicles = selectedVehiclesList.map(v => ({
          id: v.id,
          vin: v.vin,
          grossWeightCategory: v.grossWeightCategory,
          isSuspended: v.isSuspended
        }));

        const { calculateFilingCost } = await import('@/app/actions/pricing');
        const result = await calculateFilingCost(
          filingDataForPricing,
          sanitizedVehicles,
          { state }
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

    const timeoutId = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timeoutId);
  }, [filingType, filingData, selectedVehicleIds, vehicles, selectedBusinessId, businesses, amendmentType, weightIncreaseData, mileageExceededData]);

  const hasData = filingType && selectedVehicleIds.length > 0;
  const vehicleCount = selectedVehicleIds.length;
  const totalAmount = filingType === 'refund' ? pricing.totalRefund : pricing.grandTotal;

  return (
    <div className="w-full">
      {/* Collapsed View - Always Visible */}
      <div className="px-2 sm:px-3 md:px-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <span className="text-xs font-medium text-slate-500">Order Summary</span>
              {vehicleCount > 0 && (
                <span className="text-xs px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                  {vehicleCount} {vehicleCount === 1 ? 'vehicle' : 'vehicles'}
                </span>
              )}
            </div>
            {pricingLoading ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                <span className="text-xs text-slate-400">Calculating...</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5 sm:gap-2">
                <span className={`text-base sm:text-lg md:text-xl font-bold ${hasData && filingType === 'refund' ? 'text-emerald-600' : hasData ? 'text-slate-900' : 'text-slate-400'}`}>
                  {hasData && filingType === 'refund' ? '+' : ''}${hasData ? totalAmount.toFixed(2) : '0.00'}
                </span>
                {hasData && filingType === 'amendment' && amendmentType === 'vin_correction' && (
                  <span className="text-xs text-emerald-600 font-medium">FREE</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {step === 5 && onSubmit && !hideSubmitButton && (
              <button
                onClick={onSubmit}
                disabled={loading || !hasData}
                className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-[var(--color-orange)] text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-[#ff7a20] active:scale-95 transition touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5 sm:gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    <span className="hidden sm:inline">Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Pay & Submit</span>
                    <span className="sm:hidden">Pay</span>
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition touch-manipulation"
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              <ChevronUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${expanded ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded View - Details */}
      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 px-2 sm:px-3 md:px-4 py-2.5 sm:py-3 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2 text-xs">
            {hasData ? (
              <>
                {filingType === 'refund' ? (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Estimated Refund</span>
                    <span className="font-semibold text-emerald-600">+${pricing.totalRefund?.toFixed(2) || '0.00'}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-600">IRS Tax</span>
                      <span className="font-semibold">${pricing.totalTax?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service Fee</span>
                      <span className="font-semibold">${pricing.serviceFee?.toFixed(2) || '0.00'}</span>
                    </div>
                    {pricing.salesTax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sales Tax</span>
                        <span className="font-semibold">${pricing.salesTax?.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {filingType === 'amendment' && amendmentType === 'vin_correction' && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-700">
                    <span className="font-medium">VIN corrections are FREE</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500 text-center py-2">
                Select filing type and vehicles to see pricing
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NewFilingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftId, setDraftId] = useState(null);
  const draftSavingRef = useRef(false);

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
  const [showBusinessForm, setShowBusinessForm] = useState(false);

  // Step 3: Vehicles
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    grossWeightCategory: '',
    isSuspended: false
  });
  const [vehicleErrors, setVehicleErrors] = useState({});

  // Refund Details (for 8849)
  const [refundDetails, setRefundDetails] = useState({}); // { vehicleId: { reason: '', date: '' } }

  // Amendment Details
  const [amendmentType, setAmendmentType] = useState(''); // 'vin_correction', 'weight_increase', 'mileage_exceeded'
  const [vinCorrectionData, setVinCorrectionData] = useState({
    originalVIN: '',
    correctedVIN: '',
    originalFilingId: ''
  });
  const [previousFilings, setPreviousFilings] = useState([]); // For VIN correction dropdown
  const [previousFilingsVINs, setPreviousFilingsVINs] = useState([]); // List of VINs from previous filings
  const [vinInputMode, setVinInputMode] = useState('select'); // 'select' or 'manual'
  const [duplicateFiling, setDuplicateFiling] = useState(null); // Detected duplicate filing
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [weightIncreaseData, setWeightIncreaseData] = useState({
    vehicleId: '',
    originalWeightCategory: '',
    newWeightCategory: '',
    increaseMonth: '',
    additionalTaxDue: 0
  });
  const [mileageExceededData, setMileageExceededData] = useState({
    vehicleId: '',
    originalMileageLimit: 5000,
    actualMileageUsed: 0,
    exceededMonth: '',
    isAgriculturalVehicle: false
  });


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
            if (draft.filingType) setFilingType(draft.filingType);
            if (draft.selectedBusinessId) setSelectedBusinessId(draft.selectedBusinessId);
            if (draft.selectedVehicleIds) setSelectedVehicleIds(draft.selectedVehicleIds);
            if (draft.filingData) setFilingData(draft.filingData);
            if (draft.amendmentType) setAmendmentType(draft.amendmentType);
            if (draft.vinCorrectionData) setVinCorrectionData(draft.vinCorrectionData);
            if (draft.weightIncreaseData) setWeightIncreaseData(draft.weightIncreaseData);
            if (draft.mileageExceededData) setMileageExceededData(draft.mileageExceededData);
            if (draft.refundDetails) setRefundDetails(draft.refundDetails);
            if (draft.pricing) setPricing(draft.pricing);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    };
    loadDraft();
  }, [user, searchParams]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Fetch Pricing from Server - Now runs on all steps for real-time pricing
  useEffect(() => {
    const fetchPricing = async () => {
      // Calculate pricing when we have minimum data (filing type and at least one vehicle selected)
      if (!filingType || selectedVehicleIds.length === 0) {
        setPricing({
          totalTax: 0,
          serviceFee: 0,
          salesTax: 0,
          grandTotal: 0,
          totalRefund: 0
        });
        return;
      }

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
        // Prepare filing data with amendment information if applicable
        const filingDataForPricing = {
          filingType,
          firstUsedMonth: filingData.firstUsedMonth
        };

        // Add amendment data if this is an amendment filing
        let amendmentDataForPricing = null;
        if (filingType === 'amendment' && amendmentType) {
          filingDataForPricing.amendmentType = amendmentType;

          if (amendmentType === 'weight_increase') {
            amendmentDataForPricing = {
              originalWeightCategory: weightIncreaseData.originalWeightCategory,
              newWeightCategory: weightIncreaseData.newWeightCategory,
              increaseMonth: weightIncreaseData.increaseMonth
            };
          } else if (amendmentType === 'mileage_exceeded') {
            // For mileage exceeded, we need the vehicle's weight category and first-used month
            const vehicle = vehicles.find(v => v.id === mileageExceededData.vehicleId);
            amendmentDataForPricing = {
              vehicleCategory: vehicle?.grossWeightCategory || '',
              firstUsedMonth: filingData.firstUsedMonth // Use the tax period's first-used month
            };
          } else if (amendmentType === 'vin_correction') {
            // VIN corrections have no tax
            amendmentDataForPricing = {};
          }
        }

        if (amendmentDataForPricing !== null) {
          filingDataForPricing.amendmentData = amendmentDataForPricing;
        }

        // Sanitize vehicles to remove complex objects (like Firestore Timestamps)
        const sanitizedVehicles = selectedVehiclesList.map(v => ({
          id: v.id,
          vin: v.vin,
          grossWeightCategory: v.grossWeightCategory,
          isSuspended: v.isSuspended
        }));

        const result = await calculateFilingCost(
          filingDataForPricing,
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
  }, [step, selectedVehicleIds, filingType, filingData.firstUsedMonth, vehicles, selectedBusinessId, businesses, amendmentType, weightIncreaseData, mileageExceededData]);

  // Duplicate Detection: Check for existing incomplete filings with same data
  useEffect(() => {
    const checkForDuplicate = async () => {
      // Only check on steps 2-4 when we have some data
      if (step < 2 || step > 4 || !user || previousFilings.length === 0) {
        setDuplicateFiling(null);
        setShowDuplicateWarning(false);
        return;
      }

      // Build filing data to check
      const filingDataToCheck = {
        filingType,
        taxYear: filingData.taxYear,
        businessId: selectedBusinessId,
        vehicleIds: selectedVehicleIds,
        amendmentType: filingType === 'amendment' ? amendmentType : null,
        amendmentDetails: {}
      };

      // Add amendment details if applicable
      if (filingType === 'amendment') {
        if (amendmentType === 'vin_correction') {
          filingDataToCheck.amendmentDetails = {
            vinCorrection: {
              originalVIN: vinCorrectionData.originalVIN
            }
          };
        } else if (amendmentType === 'weight_increase' && weightIncreaseData.vehicleId) {
          filingDataToCheck.amendmentDetails = {
            weightIncrease: {
              vehicleId: weightIncreaseData.vehicleId
            }
          };
        } else if (amendmentType === 'mileage_exceeded' && mileageExceededData.vehicleId) {
          filingDataToCheck.amendmentDetails = {
            mileageExceeded: {
              vehicleId: mileageExceededData.vehicleId
            }
          };
        }
      }

      // Check for duplicates
      const duplicate = detectDuplicateFiling(filingDataToCheck, previousFilings);

      if (duplicate && !showDuplicateWarning) {
        setDuplicateFiling(duplicate);
        // Show warning after a small delay to avoid flashing
        setTimeout(() => setShowDuplicateWarning(true), 500);
      } else if (!duplicate) {
        setDuplicateFiling(null);
        setShowDuplicateWarning(false);
      }
    };

    checkForDuplicate();
  }, [step, filingType, filingData.taxYear, selectedBusinessId, selectedVehicleIds, amendmentType, vinCorrectionData.originalVIN, weightIncreaseData.vehicleId, mileageExceededData.vehicleId, previousFilings, showDuplicateWarning, user]);

  // Auto-save draft as user progresses
  useEffect(() => {
    const saveDraft = async () => {
      if (!user || draftSavingRef.current) return; // Don't save if already saving

      // Save from step 2 onwards (when filing type is selected)
      if (step < 2) return;

      // Always save if we're past step 1 (user has made some progress)
      // This ensures we capture the filing type selection
      const hasData = filingType || selectedBusinessId || selectedVehicleIds.length > 0 || step > 2;
      if (!hasData) {
        console.log('Skipping draft save - no meaningful data yet');
        return;
      }

      draftSavingRef.current = true;
      try {
        const draftData = {
          draftId,
          workflowType: 'manual',
          step,
          filingType,
          selectedBusinessId,
          selectedVehicleIds,
          filingData,
          amendmentType: filingType === 'amendment' ? amendmentType : null,
          vinCorrectionData: filingType === 'amendment' && amendmentType === 'vin_correction' ? vinCorrectionData : null,
          weightIncreaseData: filingType === 'amendment' && amendmentType === 'weight_increase' ? weightIncreaseData : null,
          mileageExceededData: filingType === 'amendment' && amendmentType === 'mileage_exceeded' ? mileageExceededData : null,
          refundDetails: filingType === 'refund' ? refundDetails : null,
          pricing: pricing.grandTotal > 0 ? pricing : null
        };

        console.log('Saving draft filing for manual workflow, step:', step, 'filingType:', filingType);
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
  }, [user, step, filingType, selectedBusinessId, selectedVehicleIds, filingData, amendmentType, vinCorrectionData, weightIncreaseData, mileageExceededData, refundDetails, pricing, draftId]);

  const loadData = async () => {
    try {
      const userBusinesses = await getBusinessesByUser(user.uid);
      const userVehicles = await getVehiclesByUser(user.uid);
      setBusinesses(userBusinesses);
      setVehicles(userVehicles);

      // Load previous filings for VIN correction dropdown
      const filings = await getFilingsByUser(user.uid);
      setPreviousFilings(filings);

      // Store all filings for duplicate detection
      setPreviousFilings(filings);

      // Extract unique VINs from previous filings (completed filings only)
      const completedFilings = filings.filter(f => f.status === 'completed');
      const vinMap = new Map(); // Map VIN -> { filingId, vehicleId }

      for (const filing of completedFilings) {
        if (filing.vehicleIds && filing.vehicleIds.length > 0) {
          for (const vehicleId of filing.vehicleIds) {
            try {
              const vehicle = await getVehicle(vehicleId);
              if (vehicle && vehicle.vin) {
                if (!vinMap.has(vehicle.vin)) {
                  vinMap.set(vehicle.vin, {
                    vin: vehicle.vin,
                    filingId: filing.id,
                    vehicleId: vehicleId,
                    taxYear: filing.taxYear,
                    filingDate: filing.createdAt
                  });
                }
              }
            } catch (err) {
              console.error(`Error loading vehicle ${vehicleId}:`, err);
            }
          }
        }
      }

      setPreviousFilingsVINs(Array.from(vinMap.values()).sort((a, b) => {
        // Sort by most recent filing date first
        if (!a.filingDate || !b.filingDate) return 0;
        return new Date(b.filingDate) - new Date(a.filingDate);
      }));
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
    setLoading(true);
    setError('');

    try {
      // For amendments, auto-determine business if not selected
      let businessIdToUse = selectedBusinessId;
      let vehicleIdsToUse = selectedVehicleIds;

      if (filingType === 'amendment') {
        // For amendments, find business from vehicle's previous filings
        let vehicleIdForAmendment = null;
        if (amendmentType === 'weight_increase' && weightIncreaseData.vehicleId) {
          vehicleIdForAmendment = weightIncreaseData.vehicleId;
        } else if (amendmentType === 'mileage_exceeded' && mileageExceededData.vehicleId) {
          vehicleIdForAmendment = mileageExceededData.vehicleId;
        }

        if (!businessIdToUse && vehicleIdForAmendment) {
          // Find business from previous filings for this vehicle
          const previousFilings = await getFilingsByUser(user.uid);
          const filingWithVehicle = previousFilings.find(filing =>
            filing.vehicleIds && filing.vehicleIds.includes(vehicleIdForAmendment) && filing.businessId
          );

          if (filingWithVehicle && filingWithVehicle.businessId) {
            businessIdToUse = filingWithVehicle.businessId;
          } else if (businesses.length > 0) {
            // Fallback to first business
            businessIdToUse = businesses[0].id;
          }
        } else if (!businessIdToUse && businesses.length > 0) {
          // No vehicle selected but has businesses, use first one
          businessIdToUse = businesses[0].id;
        }

        // For amendments, include the vehicle from amendment data
        if (vehicleIdForAmendment && !vehicleIdsToUse.includes(vehicleIdForAmendment)) {
          vehicleIdsToUse = [vehicleIdForAmendment];
        }
      }

      // Validate business selection (except VIN corrections which might not need it)
      if (!businessIdToUse && filingType !== 'amendment') {
        setError('Please select or create a business');
        setLoading(false);
        return;
      }

      // Validate vehicle selection for non-amendments
      if (vehicleIdsToUse.length === 0 && filingType !== 'amendment') {
        setError('Please select or add at least one vehicle');
        setLoading(false);
        return;
      }

      // For VIN corrections without a business, try to find from original filing
      if (!businessIdToUse && filingType === 'amendment' && amendmentType === 'vin_correction') {
        if (vinCorrectionData.originalFilingId) {
          const { getFiling } = await import('@/lib/db');
          const originalFiling = await getFiling(vinCorrectionData.originalFilingId);
          if (originalFiling && originalFiling.businessId) {
            businessIdToUse = originalFiling.businessId;
          }
        }
        // If still no business, use first available or allow null
        if (!businessIdToUse && businesses.length > 0) {
          businessIdToUse = businesses[0].id;
        }
      }

      // Prepare amendment details if filing is an amendment
      let amendmentDetails = {};
      let amendmentDueDate = null;

      if (filingType === 'amendment') {
        if (amendmentType === 'vin_correction') {
          amendmentDetails = {
            vinCorrection: {
              originalVIN: vinCorrectionData.originalVIN,
              correctedVIN: vinCorrectionData.correctedVIN,
              originalFilingId: vinCorrectionData.originalFilingId || null
            }
          };
        } else if (amendmentType === 'weight_increase') {
          amendmentDetails = {
            weightIncrease: {
              vehicleId: weightIncreaseData.vehicleId,
              originalWeightCategory: weightIncreaseData.originalWeightCategory,
              newWeightCategory: weightIncreaseData.newWeightCategory,
              increaseMonth: weightIncreaseData.increaseMonth,
              additionalTaxDue: weightIncreaseData.additionalTaxDue
            }
          };
          // Calculate due date (last day of following month)
          amendmentDueDate = calculateWeightIncreaseDueDate(weightIncreaseData.increaseMonth);
        } else if (amendmentType === 'mileage_exceeded') {
          amendmentDetails = {
            mileageExceeded: {
              vehicleId: mileageExceededData.vehicleId,
              originalMileageLimit: mileageExceededData.originalMileageLimit,
              actualMileageUsed: mileageExceededData.actualMileageUsed,
              exceededMonth: mileageExceededData.exceededMonth,
              isAgriculturalVehicle: mileageExceededData.isAgriculturalVehicle
            }
          };
        }
      }

      // Final check for business (amendments should always have a business)
      if (!businessIdToUse) {
        setError('Please select or create a business. We could not automatically determine the business for this amendment.');
        setLoading(false);
        return;
      }

      // Create filing
      const filingId = await createFiling({
        userId: user.uid,
        businessId: businessIdToUse,
        vehicleIds: vehicleIdsToUse,
        taxYear: filingData.taxYear,
        firstUsedMonth: filingData.firstUsedMonth,
        filingType: filingType, // Add filing type
        amendmentType: filingType === 'amendment' ? amendmentType : null, // Add amendment type
        amendmentDetails: filingType === 'amendment' ? amendmentDetails : {}, // Add amendment details
        amendmentDueDate: amendmentDueDate, // Add due date for weight increases
        refundDetails: filingType === 'refund' ? refundDetails : {}, // Add refund details
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

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
  const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));

  // Get vehicle references for amendments
  const weightIncreaseVehicle = filingType === 'amendment' && amendmentType === 'weight_increase' && weightIncreaseData.vehicleId
    ? vehicles.find(v => v.id === weightIncreaseData.vehicleId)
    : null;
  const mileageExceededVehicle = filingType === 'amendment' && amendmentType === 'mileage_exceeded' && mileageExceededData.vehicleId
    ? vehicles.find(v => v.id === mileageExceededData.vehicleId)
    : null;

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

  const handleContinue = () => {
    if (step === 1 && filingType) {
      setStep(2);
    } else if (step === 2 && selectedBusinessId) {
      setStep(3);
    } else if (step === 3 && selectedVehicleIds.length > 0) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else {
      // Show error if can't continue
      if (step === 2 && !selectedBusinessId) {
        setError('Please select or create a business');
      } else if (step === 3 && selectedVehicleIds.length === 0) {
        setError('Please select or add at least one vehicle');
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 pb-24 xl:pb-8 max-w-[1600px] xl:mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-10 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            <div className="w-full md:w-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-1 sm:mb-2">New Filing Request</h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">
                Step {step} of 5: <span className="text-[var(--color-orange)] font-bold">{getStepTitle(step)}</span>
              </p>
            </div>
            {/* Desktop Stepper */}
            <div className="hidden md:flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                    ${s < step
                      ? 'bg-[var(--color-orange)] border-[var(--color-orange)] text-white'
                      : s === step
                        ? 'bg-white border-[var(--color-orange)] text-[var(--color-orange)] shadow-lg scale-110'
                        : 'bg-white border-slate-200 text-slate-400'
                    }
                  `}>
                    {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 5 && (
                    <div className={`w-12 h-1 transition-colors duration-300 ${s < step ? 'bg-[var(--color-orange)]' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Mobile Progress Bar with Label */}
          <div className="md:hidden mb-3 sm:mb-4 md:mb-6">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900">Step {step} of 5</span>
              <span className="text-xs sm:text-sm font-medium text-[var(--color-orange)]">{getStepTitle(step)}</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-orange)] transition-all duration-500 ease-out"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Error and Warnings */}
        <div className="mb-3 sm:mb-4 md:mb-6 space-y-2 sm:space-y-3 md:space-y-4 w-full">
          {error && (
            <div className="p-2.5 sm:p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{error}</span>
            </div>
          )}

          {showDuplicateWarning && duplicateFiling && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-amber-900 mb-2">Similar Filing Found</h3>
                  <p className="text-xs sm:text-sm text-amber-800 mb-3 sm:mb-4">
                    You already have an incomplete filing with similar details. Would you like to resume that filing or continue with a new one?
                  </p>
                  <div className="bg-white rounded-lg border border-amber-200 p-3 sm:p-4 mb-3 sm:mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <span className="font-medium text-xs sm:text-sm text-amber-900 break-words">
                        {formatIncompleteFiling(duplicateFiling)?.description || 'Existing Filing'}
                      </span>
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
                        {duplicateFiling.status === 'submitted' ? 'In Progress' :
                          duplicateFiling.status === 'processing' ? 'Processing' :
                            'Action Required'}
                      </span>
                    </div>
                    <div className="text-xs text-amber-700 space-y-1">
                      <p>Tax Year: {duplicateFiling.taxYear}</p>
                      {duplicateFiling.vehicleIds && duplicateFiling.vehicleIds.length > 0 && (
                        <p>{duplicateFiling.vehicleIds.length} vehicle{duplicateFiling.vehicleIds.length !== 1 ? 's' : ''}</p>
                      )}
                      {formatIncompleteFiling(duplicateFiling)?.lastUpdated && (
                        <p>
                          Last updated: {(() => {
                            const date = formatIncompleteFiling(duplicateFiling).lastUpdated;
                            return date instanceof Date
                              ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : new Date(date.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          })()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Link
                      href={`/dashboard/filings/${duplicateFiling.id}`}
                      className="px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 active:scale-95 transition text-xs sm:text-sm flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Resume Existing Filing
                    </Link>
                    <button
                      onClick={() => {
                        setShowDuplicateWarning(false);
                        setDuplicateFiling(null);
                      }}
                      className="px-3 sm:px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 active:scale-95 transition text-xs sm:text-sm touch-manipulation"
                    >
                      Continue New Filing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid - Form Left, Pricing Right */}
        <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Form Content */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Step 1: Filing Type */}
            {step === 1 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2 sm:gap-3">
                  <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 text-xs sm:text-sm font-bold">1</span>
                  Select Filing Type
                </h2>

                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  <button
                    onClick={() => {
                      setFilingType('standard');
                      setAmendmentType('');
                    }}
                    className={`group relative p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg active:scale-[0.98] touch-manipulation ${filingType === 'standard'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-blue-300 bg-white active:bg-slate-50'
                      }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-colors ${filingType === 'standard' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                    </div>
                    {filingType === 'standard' && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-blue-600 bg-white rounded-full p-0.5 sm:p-1 shadow-sm">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-blue-100" />
                      </div>
                    )}
                    <h3 className={`font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 ${filingType === 'standard' ? 'text-blue-900' : 'text-slate-900'}`}>Standard 2290</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                      File a new Form 2290 for heavy highway vehicles.
                    </p>
                  </button>

                  <button
                    onClick={() => setFilingType('amendment')}
                    className={`group relative p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg active:scale-[0.98] touch-manipulation ${filingType === 'amendment'
                      ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500'
                      : 'border-slate-200 hover:border-amber-300 bg-white active:bg-slate-50'
                      }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-colors ${filingType === 'amendment' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-600'}`}>
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                    </div>
                    {filingType === 'amendment' && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-amber-600 bg-white rounded-full p-0.5 sm:p-1 shadow-sm">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-100" />
                      </div>
                    )}
                    <h3 className={`font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 ${filingType === 'amendment' ? 'text-amber-900' : 'text-slate-900'}`}>Amendment</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                      Correct a VIN, report weight increase, or mileage exceeded.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setFilingType('refund');
                      setAmendmentType('');
                    }}
                    className={`group relative p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg active:scale-[0.98] touch-manipulation ${filingType === 'refund'
                      ? 'border-green-600 bg-green-50/50 ring-1 ring-green-600'
                      : 'border-slate-200 hover:border-green-300 bg-white active:bg-slate-50'
                      }`}
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 md:mb-4 transition-colors ${filingType === 'refund' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500 group-hover:bg-green-50 group-hover:text-green-600'}`}>
                      <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" strokeWidth={1.5} />
                    </div>
                    {filingType === 'refund' && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-green-600 bg-white rounded-full p-0.5 sm:p-1 shadow-sm">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-green-100" />
                      </div>
                    )}
                    <h3 className={`font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 ${filingType === 'refund' ? 'text-green-900' : 'text-slate-900'}`}>Refund (8849)</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                      Claim a credit for sold, destroyed, or low-mileage vehicles.
                    </p>
                  </button>
                </div>

                {/* Amendment Type Sub-Selection */}
                {filingType === 'amendment' && (
                  <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 md:pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-4 sm:h-5 md:h-6 bg-amber-500 rounded-full"></span>
                      What type of amendment do you need?
                    </h3>
                    <div className="grid gap-2.5 sm:gap-3 md:gap-4">
                      {/* VIN Correction */}
                      <button
                        onClick={() => {
                          setAmendmentType('vin_correction');
                          setVinInputMode('select');
                          setVinCorrectionData({ originalVIN: '', correctedVIN: '', originalFilingId: '' });
                        }}
                        className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${amendmentType === 'vin_correction'
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-start gap-5">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${amendmentType === 'vin_correction' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-base mb-1 ${amendmentType === 'vin_correction' ? 'text-blue-900' : 'text-slate-900'}`}>VIN Correction</h4>
                            <p className="text-sm text-slate-500 mb-3">
                              Correct an incorrect VIN on a previously filed Form 2290. No additional tax due.
                            </p>
                            <div className="flex gap-2">
                              {amendmentType === 'vin_correction' && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">Selected</span>}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Weight Increase */}
                      <button
                        onClick={() => setAmendmentType('weight_increase')}
                        className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${amendmentType === 'weight_increase'
                          ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500 shadow-sm'
                          : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-start gap-5">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${amendmentType === 'weight_increase' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Truck className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-base mb-1 ${amendmentType === 'weight_increase' ? 'text-orange-900' : 'text-slate-900'}`}>Taxable Gross Weight Increase</h4>
                            <p className="text-sm text-slate-500 mb-3">
                              Report vehicle moving to higher weight category. Additional tax will be calculated.
                            </p>
                            <div className="flex gap-2">
                              {amendmentType === 'weight_increase' && <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">Selected</span>}
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Mileage Exceeded */}
                      <button
                        onClick={() => setAmendmentType('mileage_exceeded')}
                        className={`p-5 rounded-xl border-2 text-left transition-all duration-200 ${amendmentType === 'mileage_exceeded'
                          ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500 shadow-sm'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-start gap-5">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${amendmentType === 'mileage_exceeded' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-base mb-1 ${amendmentType === 'mileage_exceeded' ? 'text-purple-900' : 'text-slate-900'}`}>Mileage Use Limit Exceeded</h4>
                            <p className="text-sm text-slate-500 mb-3">
                              Report suspended vehicle exceeding 5,000 miles. Full tax due.
                            </p>
                            <div className="flex gap-2">
                              {amendmentType === 'mileage_exceeded' && <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md">Selected</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => {
                      if (filingType === 'amendment' && !amendmentType) {
                        setError('Please select an amendment type');
                        return;
                      }
                      setError('');
                      setStep(2);
                    }}
                    className="px-6 py-3 bg-[#ff8b3d] text-white rounded-xl font-semibold hover:bg-[#e57d36] transition shadow-sm"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 1.5: Amendment Details (only shown if amendment filing type) */}
            {step === 2 && filingType === 'amendment' && (
              <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
                <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">
                  Amendment Details
                </h2>

                {/* VIN Correction Details */}
                {amendmentType === 'vin_correction' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <span className="text-2xl sm:text-3xl">📝</span>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-[var(--color-text)]">VIN Correction</h3>
                          <p className="text-xs sm:text-sm text-[var(--color-muted)]">Correct an incorrect VIN from a previously filed Form 2290</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Original VIN (Incorrect) *
                      </label>

                      {/* Input Mode Toggle */}
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => setVinInputMode('select')}
                          className={`px-2 sm:px-3 py-1.5 text-xs rounded-lg transition touch-manipulation ${vinInputMode === 'select'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-200'
                            }`}
                        >
                          <span className="hidden sm:inline">Select from Previous Filings</span>
                          <span className="sm:hidden">Select</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVinInputMode('manual')}
                          className={`px-2 sm:px-3 py-1.5 text-xs rounded-lg transition touch-manipulation ${vinInputMode === 'manual'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-200'
                            }`}
                        >
                          <span className="hidden sm:inline">Enter Manually</span>
                          <span className="sm:hidden">Manual</span>
                        </button>
                      </div>

                      {/* Dropdown Selection */}
                      {vinInputMode === 'select' ? (
                        <div>
                          <select
                            value={vinCorrectionData.originalVIN || ''}
                            onChange={(e) => {
                              const selectedVIN = e.target.value;
                              if (selectedVIN) {
                                const selectedVINData = previousFilingsVINs.find(v => v.vin === selectedVIN);
                                setVinCorrectionData({
                                  ...vinCorrectionData,
                                  originalVIN: selectedVIN,
                                  originalFilingId: selectedVINData?.filingId || ''
                                });
                              } else {
                                setVinCorrectionData({ ...vinCorrectionData, originalVIN: '', originalFilingId: '' });
                              }
                            }}
                            className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-orange)] font-mono bg-white touch-manipulation"
                          >
                            <option value="">Select a VIN from previous filings...</option>
                            {previousFilingsVINs.map((vinData) => (
                              <option key={vinData.vin} value={vinData.vin}>
                                {vinData.vin} {vinData.taxYear ? `- ${vinData.taxYear}` : ''}
                                {vinData.filingDate ? ` (Filed: ${vinData.filingDate instanceof Date ? vinData.filingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : new Date(vinData.filingDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })})` : ''}
                              </option>
                            ))}
                          </select>
                          {previousFilingsVINs.length === 0 && (
                            <p className="mt-1 text-xs text-amber-600">No previous filings found. You can enter the VIN manually using the "Manual" option above.</p>
                          )}
                          {vinCorrectionData.originalVIN && (
                            <p className="mt-1 text-xs text-green-600">
                              ✓ Selected VIN from previous filing
                            </p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input
                            type="text"
                            value={vinCorrectionData.originalVIN}
                            onChange={(e) => setVinCorrectionData({ ...vinCorrectionData, originalVIN: e.target.value.toUpperCase() })}
                            className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-orange)] font-mono touch-manipulation"
                            placeholder="1HGBH41JXMN109186"
                            maxLength="17"
                          />
                          <p className="mt-1 text-xs text-[var(--color-muted)]">Enter the VIN as it appears on the original filing (17 characters)</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Corrected VIN (Correct) *
                      </label>
                      <input
                        type="text"
                        value={vinCorrectionData.correctedVIN}
                        onChange={(e) => setVinCorrectionData({ ...vinCorrectionData, correctedVIN: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-orange)] font-mono touch-manipulation"
                        placeholder="1HGBH41JXMN109187"
                        maxLength="17"
                      />
                      <p className="mt-1 text-xs text-[var(--color-muted)]">Enter the correct VIN (must be different from original)</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-green-700">
                        <strong>✓ No Additional Tax:</strong> VIN corrections are FREE with no additional HVUT tax due.
                      </p>
                    </div>
                  </div>
                )}

                {/* Weight Increase Details */}
                {amendmentType === 'weight_increase' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <span className="text-2xl sm:text-3xl">⚖️</span>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-[var(--color-text)]">Taxable Gross Weight Increase</h3>
                          <p className="text-xs sm:text-sm text-[var(--color-muted)]">Report when your vehicle moved to a higher weight category</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Select Vehicle *
                      </label>
                      <select
                        value={weightIncreaseData.vehicleId}
                        onChange={(e) => {
                          const selectedVehicleId = e.target.value;
                          const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

                          // Auto-populate original weight category from selected vehicle
                          if (selectedVehicle) {
                            setWeightIncreaseData({
                              ...weightIncreaseData,
                              vehicleId: selectedVehicleId,
                              originalWeightCategory: selectedVehicle.grossWeightCategory || ''
                            });
                          } else {
                            setWeightIncreaseData({ ...weightIncreaseData, vehicleId: selectedVehicleId });
                          }
                        }}
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
                      >
                        <option value="">Select a vehicle...</option>
                        {vehicles.map(v => (
                          <option key={v.id} value={v.id}>{v.vin}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Original Weight Category *
                        </label>
                        <select
                          value={weightIncreaseData.originalWeightCategory}
                          onChange={(e) => {
                            setWeightIncreaseData({ ...weightIncreaseData, originalWeightCategory: e.target.value });
                          }}
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
                        >
                          <option value="">Select...</option>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'].map(cat => (
                            <option key={cat} value={cat}>Category {cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          New Weight Category *
                        </label>
                        <select
                          value={weightIncreaseData.newWeightCategory}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            setWeightIncreaseData({ ...weightIncreaseData, newWeightCategory: newCat });
                            // Calculate additional tax if both categories and month are set
                            if (weightIncreaseData.originalWeightCategory && newCat && weightIncreaseData.increaseMonth) {
                              const additionalTax = calculateWeightIncreaseAdditionalTax(
                                weightIncreaseData.originalWeightCategory,
                                newCat,
                                weightIncreaseData.increaseMonth
                              );
                              setWeightIncreaseData(prev => ({ ...prev, newWeightCategory: newCat, additionalTaxDue: additionalTax }));
                            }
                          }}
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
                        >
                          <option value="">Select...</option>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'].map(cat => (
                            <option key={cat} value={cat}>Category {cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Month Weight Increased *
                      </label>
                      <select
                        value={weightIncreaseData.increaseMonth}
                        onChange={(e) => {
                          const month = e.target.value;
                          setWeightIncreaseData({ ...weightIncreaseData, increaseMonth: month });
                          // Calculate additional tax if all fields are set
                          if (weightIncreaseData.originalWeightCategory && weightIncreaseData.newWeightCategory && month) {
                            const additionalTax = calculateWeightIncreaseAdditionalTax(
                              weightIncreaseData.originalWeightCategory,
                              weightIncreaseData.newWeightCategory,
                              month
                            );
                            setWeightIncreaseData(prev => ({ ...prev, increaseMonth: month, additionalTaxDue: additionalTax }));
                          }
                        }}
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
                      >
                        <option value="">Select month...</option>
                        {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => {
                          const year = (m === 'January' || m === 'February' || m === 'March' || m === 'April' || m === 'May' || m === 'June') ? '2026' : '2025';
                          const fullValue = `${m} ${year}`;
                          return <option key={m} value={fullValue}>{m} {year}</option>;
                        })}
                      </select>
                    </div>

                    {weightIncreaseData.additionalTaxDue > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                          <span className="text-sm font-bold text-slate-700">Additional Tax Due:</span>
                          <span className="text-xl sm:text-2xl font-extrabold text-orange-600">${weightIncreaseData.additionalTaxDue.toFixed(2)}</span>
                        </div>
                        {weightIncreaseData.increaseMonth && (
                          <div className="mt-3 pt-3 border-t border-orange-100 flex items-center gap-2 text-xs text-orange-800 font-medium">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="break-words">Due Date: {calculateWeightIncreaseDueDate(weightIncreaseData.increaseMonth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Mileage Exceeded Details */}
                {amendmentType === 'mileage_exceeded' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <span className="text-2xl sm:text-3xl">🛣️</span>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-[var(--color-text)]">Mileage Use Limit Exceeded</h3>
                          <p className="text-xs sm:text-sm text-[var(--color-muted)]">Report when a suspended vehicle exceeded its mileage limit</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Select Suspended Vehicle *
                      </label>
                      <select
                        value={mileageExceededData.vehicleId}
                        onChange={(e) => setMileageExceededData({ ...mileageExceededData, vehicleId: e.target.value })}
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
                      >
                        <option value="">Select a vehicle...</option>
                        {vehicles.filter(v => v.isSuspended).map(v => (
                          <option key={v.id} value={v.id}>{v.vin} (Suspended)</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">Only suspended vehicles are shown</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Vehicle Type *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <label className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-xl cursor-pointer transition-all touch-manipulation ${!mileageExceededData.isAgriculturalVehicle
                          ? 'border-[var(--color-orange)] bg-[var(--color-orange)]/5 ring-1 ring-[var(--color-orange)]'
                          : 'border-[var(--color-border)] hover:bg-slate-50 active:bg-slate-50'
                          }`}>
                          <input
                            type="radio"
                            name="vehicleType"
                            checked={!mileageExceededData.isAgriculturalVehicle}
                            onChange={() => setMileageExceededData({ ...mileageExceededData, isAgriculturalVehicle: false, originalMileageLimit: 5000 })}
                            className="w-5 h-5 text-[var(--color-orange)] flex-shrink-0 touch-manipulation"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-sm sm:text-base text-[var(--color-text)]">Standard Vehicle</div>
                            <div className="text-xs sm:text-sm text-[var(--color-muted)]">5,000 mile annual limit</div>
                          </div>
                        </label>
                        <label className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-xl cursor-pointer transition-all touch-manipulation ${mileageExceededData.isAgriculturalVehicle
                          ? 'border-[var(--color-orange)] bg-[var(--color-orange)]/5 ring-1 ring-[var(--color-orange)]'
                          : 'border-[var(--color-border)] hover:bg-slate-50 active:bg-slate-50'
                          }`}>
                          <input
                            type="radio"
                            name="vehicleType"
                            checked={mileageExceededData.isAgriculturalVehicle}
                            onChange={() => setMileageExceededData({ ...mileageExceededData, isAgriculturalVehicle: true, originalMileageLimit: 7500 })}
                            className="w-5 h-5 text-[var(--color-orange)] flex-shrink-0 touch-manipulation"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-sm sm:text-base text-[var(--color-text)]">Agricultural Vehicle</div>
                            <div className="text-xs sm:text-sm text-[var(--color-muted)]">7,500 mile annual limit</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Actual Mileage Used *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={mileageExceededData.actualMileageUsed || ''}
                            onChange={(e) => setMileageExceededData({ ...mileageExceededData, actualMileageUsed: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation"
                            placeholder="6500"
                            min="0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">miles</span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          Must exceed {mileageExceededData.originalMileageLimit.toLocaleString()} miles
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Month Limit Was Exceeded *
                        </label>
                        <select
                          value={mileageExceededData.exceededMonth}
                          onChange={(e) => setMileageExceededData({ ...mileageExceededData, exceededMonth: e.target.value })}
                          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white"
                        >
                          <option value="">Select month...</option>
                          {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => (
                            <option key={m} value={m}>{m} {m === 'January' || m === 'February' || m === 'March' || m === 'April' || m === 'May' || m === 'June' ? '2026' : '2025'}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-5 flex gap-2 sm:gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <p className="text-xs sm:text-sm text-purple-700 leading-relaxed">
                        <strong>Note:</strong> Once a suspended vehicle exceeds the mileage limit, you must pay the full HVUT tax based on when the vehicle was first used in the tax period.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 border border-[var(--color-border)] rounded-lg text-sm sm:text-base text-[var(--color-text)] hover:bg-[var(--color-page-alt)] active:bg-[var(--color-page-alt)] transition touch-manipulation"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      // Validate amendment details before proceeding
                      if (amendmentType === 'vin_correction') {
                        const validation = validateVINCorrection(vinCorrectionData.originalVIN, vinCorrectionData.correctedVIN);
                        if (!validation.isValid) {
                          setError(validation.errors.join(', '));
                          return;
                        }
                      } else if (amendmentType === 'weight_increase') {
                        if (!weightIncreaseData.vehicleId || !weightIncreaseData.originalWeightCategory || !weightIncreaseData.newWeightCategory || !weightIncreaseData.increaseMonth) {
                          setError('Please fill in all weight increase fields');
                          return;
                        }
                        const validation = validateWeightIncrease(weightIncreaseData.originalWeightCategory, weightIncreaseData.newWeightCategory);
                        if (!validation.isValid) {
                          setError(validation.error);
                          return;
                        }
                      } else if (amendmentType === 'mileage_exceeded') {
                        if (!mileageExceededData.vehicleId || !mileageExceededData.actualMileageUsed || !mileageExceededData.exceededMonth) {
                          setError('Please fill in all mileage exceeded fields');
                          return;
                        }
                        const validation = validateMileageExceeded(mileageExceededData.actualMileageUsed, mileageExceededData.isAgriculturalVehicle);
                        if (!validation.isValid) {
                          setError(validation.error);
                          return;
                        }
                      }
                      setError('');
                      // For amendments, skip business and vehicles steps and go directly to review
                      // The amendment details already captured all necessary information
                      setStep(5);
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-[#ff8b3d] text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-[#e57d36] active:scale-95 transition shadow-sm touch-manipulation"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Business (skip for amendments, renumber for non-amendments) */}
            {step === 2 && filingType !== 'amendment' && (
              <div className="bg-[var(--color-card)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--color-text)] mb-3 sm:mb-4 md:mb-6">Business Information</h2>

                {/* Existing Businesses List */}
                {!showBusinessForm && businesses.length > 0 && (
                  <div className="mb-4 sm:mb-6 md:mb-8">
                    <label className="block text-sm font-bold text-[var(--color-text)] mb-2 sm:mb-3">
                      Select Business
                    </label>
                    <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {businesses.map((business) => (
                        <button
                          key={business.id}
                          onClick={() => setSelectedBusinessId(business.id)}
                          className={`p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 text-left transition relative group h-full flex flex-col touch-manipulation active:scale-[0.98] ${selectedBusinessId === business.id
                            ? 'border-[var(--color-orange)] bg-[var(--color-page-alt)] ring-1 ring-[var(--color-orange)]'
                            : 'border-[var(--color-border)] hover:border-[var(--color-orange)]/50 hover:shadow-md bg-white active:bg-slate-50'
                            }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-[var(--color-text)] mb-1.5 sm:mb-2 group-hover:text-[var(--color-orange)] transition-colors break-words">{business.businessName}</div>
                            <div className="space-y-0.5 sm:space-y-1">
                              <p className="text-xs sm:text-sm font-medium text-[var(--color-muted)]">EIN: <span className="font-mono text-[var(--color-text)]">{business.ein}</span></p>
                              <p className="text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed break-words">{business.address}</p>
                            </div>
                          </div>
                          {selectedBusinessId === business.id && (
                            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 text-[var(--color-orange)]">
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 fill-[var(--color-orange)] text-white" />
                            </div>
                          )}
                        </button>
                      ))}

                      {/* Add New Business Button - Enhanced */}
                      <button
                        onClick={() => {
                          setShowBusinessForm(true);
                          setSelectedBusinessId(''); // Clear selection when adding new
                        }}
                        className="p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] hover:bg-[var(--color-page-alt)] active:scale-[0.98] transition group flex flex-col items-center justify-center gap-2 sm:gap-3 min-h-[120px] sm:min-h-[150px] md:min-h-[180px] lg:min-h-[200px] touch-manipulation"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                          <span className="text-lg sm:text-xl md:text-2xl font-bold">+</span>
                        </div>
                        <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg">Add New Business</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Add New Business Form */}
                {(showBusinessForm || businesses.length === 0) && (
                  <div className="mb-3 sm:mb-4 md:mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-[var(--color-text)]">
                        {businesses.length > 0 ? 'Add New Business' : 'Add Business Details'}
                      </h3>
                      {businesses.length > 0 && (
                        <button
                          onClick={() => setShowBusinessForm(false)}
                          className="text-xs sm:text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] underline touch-manipulation"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 p-2.5 sm:p-3 md:p-4 lg:p-6 bg-[var(--color-page-alt)] rounded-lg sm:rounded-xl border border-[var(--color-border)]">
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
                          className={`w-full px-4 py-3 text-base sm:text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation ${businessErrors.businessName ? 'border-red-500' : 'border-[var(--color-border)]'}`}
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
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.ein ? 'border-red-500' : 'border-[var(--color-border)]'}`}
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
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.address ? 'border-red-500' : 'border-[var(--color-border)]'}`}
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
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.phone ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                          placeholder="(555) 123-4567"
                        />
                        {businessErrors.phone && (
                          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {businessErrors.phone}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        <div>
                          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            Signing Authority Name
                          </label>
                          <input
                            type="text"
                            value={newBusiness.signingAuthorityName}
                            onChange={(e) => setNewBusiness({ ...newBusiness, signingAuthorityName: e.target.value })}
                            className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation"
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
                            className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation"
                            placeholder="Owner, President, etc."
                          />
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await handleAddBusiness();
                          setShowBusinessForm(false);
                        }}
                        disabled={loading}
                        className="w-full md:col-span-2 bg-[#ff8b3d] text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-[#e57d36] active:scale-95 transition disabled:opacity-50 mt-2 sm:mt-4 shadow-sm touch-manipulation"
                      >
                        {loading ? 'Adding...' : 'Save & Add Business'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-[var(--color-border)] rounded-lg text-sm sm:text-base text-[var(--color-text)] hover:bg-[var(--color-page-alt)] active:bg-[var(--color-page-alt)] transition touch-manipulation font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (showBusinessForm && (newBusiness.businessName || newBusiness.ein)) {
                        setError('Please save the new business details before proceeding, or click Cancel.');
                        return;
                      }
                      if (selectedBusinessId) setStep(3);
                      else setError('Please select or create a business');
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ff8b3d] text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-[#e57d36] active:scale-95 transition shadow-sm touch-manipulation"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vehicles */}
            {step === 3 && (
              <div className="bg-[var(--color-card)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--color-text)] mb-3 sm:mb-4 md:mb-6">Vehicle Information</h2>

                {/* Tax Year & Month Selection - Moved here for better context */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4 lg:gap-6 mb-4 sm:mb-6 md:mb-8 p-2.5 sm:p-3 md:p-4 lg:p-6 bg-[var(--color-page-alt)] rounded-lg sm:rounded-xl border border-[var(--color-border)]">
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                      Tax Year
                    </label>
                    <select
                      value={filingData.taxYear}
                      onChange={(e) => setFilingData({ ...filingData, taxYear: e.target.value })}
                      className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-orange)] bg-white touch-manipulation"
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
                      className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-orange)] bg-white touch-manipulation"
                    >
                      {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Existing Vehicles List */}
                {vehicles.length > 0 && !showVehicleForm && (
                  <div className="mb-4 sm:mb-6 md:mb-8">
                    <label className="block text-sm font-bold text-[var(--color-text)] mb-2 sm:mb-3">
                      Select Vehicles to File
                    </label>
                    <div className="grid gap-2.5 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto border border-[var(--color-border)] rounded-lg p-2 sm:p-3 md:p-4 bg-white mb-3 sm:mb-4">
                      {vehicles.map((vehicle) => {
                        const isRefund = filingType === 'refund';
                        const estimatedAmount = isRefund
                          ? calculateRefundAmount(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth)
                          : calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);

                        const isSelected = selectedVehicleIds.includes(vehicle.id);

                        return (
                          <div key={vehicle.id} className={`p-3 sm:p-4 rounded-xl border-2 transition h-full flex flex-col ${isSelected ? 'bg-[var(--color-page-alt)] border-[var(--color-orange)]' : 'border-transparent hover:border-[var(--color-border)] bg-[var(--color-page)]/50'}`}>
                            <label className="flex flex-col h-full cursor-pointer relative">
                              <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedVehicleIds([...selectedVehicleIds, vehicle.id]);
                                      } else {
                                        setSelectedVehicleIds(selectedVehicleIds.filter(id => id !== vehicle.id));
                                      }
                                    }}
                                    className="w-5 h-5 mt-1 text-[var(--color-orange)] rounded focus:ring-[var(--color-orange)] flex-shrink-0 touch-manipulation"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-[var(--color-text)] font-mono text-base sm:text-lg break-all leading-tight">
                                      {vehicle.vin}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                                      <span className="text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                        Cat: {vehicle.grossWeightCategory}
                                      </span>
                                      {vehicle.isSuspended && (
                                        <span className="text-amber-700 font-bold text-[10px] uppercase tracking-wider bg-amber-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-amber-200">
                                          Suspended
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-auto pt-3 sm:pt-4 border-t border-[var(--color-border)] flex justify-between items-end">
                                <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wide">
                                  {isRefund ? 'Est. Refund' : 'Est. Tax'}
                                </span>
                                <span className={`text-lg sm:text-xl font-bold ${isRefund ? 'text-green-600' : 'text-[var(--color-text)]'}`}>
                                  ${estimatedAmount.toFixed(2)}
                                </span>
                              </div>
                            </label>

                            {/* Refund Details Inputs */}
                            {isRefund && isSelected && (
                              <div className="mt-3 grid grid-cols-1 gap-3 p-3 bg-white rounded border border-dashed border-green-200">
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-text)] mb-1">Refund Reason</label>
                                  <select
                                    className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-green-500"
                                    value={refundDetails[vehicle.id]?.reason || ''}
                                    onChange={(e) => setRefundDetails(prev => ({
                                      ...prev,
                                      [vehicle.id]: { ...prev[vehicle.id], reason: e.target.value }
                                    }))}
                                  >
                                    <option value="">Select Reason...</option>
                                    <option value="sold">Sold / Transferred</option>
                                    <option value="destroyed">Destroyed / Stolen</option>
                                    <option value="mileage">Low Mileage (Overpaid)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[var(--color-text)] mb-1">Date of Event</label>
                                  <input
                                    type="date"
                                    className="w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-green-500"
                                    value={refundDetails[vehicle.id]?.date || ''}
                                    onChange={(e) => setRefundDetails(prev => ({
                                      ...prev,
                                      [vehicle.id]: { ...prev[vehicle.id], date: e.target.value }
                                    }))}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setShowVehicleForm(true)}
                      className="w-full p-3 sm:p-4 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] hover:bg-[var(--color-page-alt)] active:scale-95 transition flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-bold text-sm sm:text-base">+</span>
                      </div>
                      <span className="font-semibold text-sm sm:text-base">Add Another Vehicle</span>
                    </button>
                  </div>
                )}

                {/* Add New Vehicle Form */}
                {(showVehicleForm || vehicles.length === 0) && (
                  <div className="mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">
                        {vehicles.length > 0 ? 'Add New Vehicle' : 'Add Vehicle'}
                      </h3>
                      {vehicles.length > 0 && (
                        <button
                          onClick={() => setShowVehicleForm(false)}
                          className="text-xs sm:text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] underline touch-manipulation"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 md:p-6 bg-[var(--color-page-alt)] rounded-xl border border-[var(--color-border)]">
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
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono uppercase ${vehicleErrors.vin ? 'border-red-500' : 'border-[var(--color-border)]'}`}
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
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] bg-white appearance-none"
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
                      <div className="md:col-span-2 flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-100 transition-colors hover:border-amber-200 touch-manipulation">
                        <input
                          type="checkbox"
                          id="suspended"
                          checked={newVehicle.isSuspended}
                          onChange={(e) => setNewVehicle({ ...newVehicle, isSuspended: e.target.checked })}
                          className="w-5 h-5 mt-0.5 text-amber-600 focus:ring-amber-500 rounded cursor-pointer flex-shrink-0 touch-manipulation"
                        />
                        <div className="cursor-pointer flex-1" onClick={() => setNewVehicle({ ...newVehicle, isSuspended: !newVehicle.isSuspended })}>
                          <label htmlFor="suspended" className="text-sm font-bold text-amber-900 block cursor-pointer">
                            Suspended Vehicle (Low Mileage)
                          </label>
                          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                            Check this if you expect to drive less than 5,000 miles (7,500 for agriculture) on public highways. Tax will be $0.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await handleAddVehicle();
                          setShowVehicleForm(false);
                        }}
                        disabled={loading}
                        className="md:col-span-2 w-full bg-[#ff8b3d] text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-[#e57d36] active:scale-95 transition disabled:opacity-50 mt-2 sm:mt-4 shadow-sm touch-manipulation"
                      >
                        {loading ? 'Adding...' : 'Add Vehicle'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2 border border-[var(--color-border)] rounded-lg text-xs sm:text-sm md:text-base text-[var(--color-text)] hover:bg-[var(--color-page-alt)] active:bg-[var(--color-page-alt)] transition touch-manipulation"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (showVehicleForm && newVehicle.vin) {
                        setError('Please save the new vehicle before proceeding, or click Cancel.');
                        return;
                      }
                      if (selectedVehicleIds.length > 0) setStep(4);
                      else setError('Please select or add at least one vehicle');
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2 bg-[#ff8b3d] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold hover:bg-[#e57d36] active:scale-95 transition shadow-sm touch-manipulation"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {step === 4 && (
              <div className="bg-[var(--color-card)] rounded-xl sm:rounded-2xl border border-[var(--color-border)] p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[var(--color-text)] mb-3 sm:mb-4 md:mb-6">Documents (Optional)</h2>
                <p className="text-xs sm:text-sm md:text-base text-[var(--color-muted)] mb-3 sm:mb-4 md:mb-6">
                  Upload previous year's Schedule 1 or other supporting documents to help us process your filing faster.
                </p>

                <div className="mb-3 sm:mb-4 md:mb-6 p-3 sm:p-4 md:p-6 lg:p-8 border-2 border-dashed border-[var(--color-border)] rounded-lg sm:rounded-xl text-center hover:bg-[var(--color-page-alt)] active:bg-[var(--color-page-alt)] transition cursor-pointer relative touch-manipulation">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleDocumentUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    multiple
                  />
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-[var(--color-text)] mb-1">Click to Upload PDF</p>
                  <p className="text-xs sm:text-sm text-[var(--color-muted)]">or drag and drop here</p>
                </div>

                {documents.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-xs sm:text-sm font-medium text-[var(--color-text)] mb-2">Uploaded Documents:</h3>
                    <ul className="space-y-2">
                      {documents.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between p-2.5 sm:p-3 bg-[var(--color-page-alt)] rounded-lg border border-[var(--color-border)]">
                          <span className="text-xs sm:text-sm text-[var(--color-text)] flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-muted)] flex-shrink-0" />
                            <span className="truncate">{doc.name}</span>
                          </span>
                          <button
                            onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                            className="text-red-600 hover:text-red-800 active:text-red-900 text-xs sm:text-sm font-medium ml-2 flex-shrink-0 touch-manipulation"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => setStep(3)}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2 border border-[var(--color-border)] rounded-lg text-xs sm:text-sm md:text-base text-[var(--color-text)] hover:bg-[var(--color-page-alt)] active:bg-[var(--color-page-alt)] transition touch-manipulation"
                  >
                    Back
                  </button>
                  <button
                    onClick={async () => {
                      // Save draft before moving to payment step
                      if (user) {
                        try {
                          const draftData = {
                            draftId,
                            workflowType: 'manual',
                            step: 5,
                            filingType,
                            selectedBusinessId,
                            selectedVehicleIds,
                            filingData,
                            amendmentType: filingType === 'amendment' ? amendmentType : null,
                            vinCorrectionData: filingType === 'amendment' && amendmentType === 'vin_correction' ? vinCorrectionData : null,
                            weightIncreaseData: filingType === 'amendment' && amendmentType === 'weight_increase' ? weightIncreaseData : null,
                            mileageExceededData: filingType === 'amendment' && amendmentType === 'mileage_exceeded' ? mileageExceededData : null,
                            refundDetails: filingType === 'refund' ? refundDetails : null,
                            pricing: null // Will be calculated on step 5
                          };
                          const savedDraftId = await saveDraftFiling(user.uid, draftData);
                          if (!draftId) {
                            setDraftId(savedDraftId);
                          }
                        } catch (error) {
                          console.error('Error saving draft:', error);
                        }
                      }
                      setStep(5);
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2 bg-[#ff8b3d] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold hover:bg-[#e57d36] active:scale-95 transition shadow-sm touch-manipulation"
                  >
                    Review & Pay
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Pay */}
            {step === 5 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-3 sm:p-4 md:p-6 lg:p-8 shadow-sm">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-text)] mb-4 sm:mb-6 md:mb-8">Review Your Filing</h2>

                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Filing Summary Overview */}
                  <div className="bg-[var(--color-page-alt)] p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border border-[var(--color-border)]">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-[var(--color-text)] mb-3 sm:mb-4 md:mb-6 flex items-center gap-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-orange)]" />
                      Filing Overview
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                      <div>
                        <p className="text-sm text-[var(--color-muted)] mb-1">Filing Type</p>
                        <p className="font-bold text-lg capitalize text-[var(--color-text)]">{filingData.filingType || filingType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted)] mb-1">Tax Year</p>
                        <p className="font-bold text-lg text-[var(--color-text)]">{filingData.taxYear}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted)] mb-1">First Used Month</p>
                        <p className="font-bold text-lg text-[var(--color-text)]">{filingData.firstUsedMonth}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--color-muted)] mb-1">Total Vehicles</p>
                        <p className="font-bold text-lg text-[var(--color-text)]">
                          {filingType === 'amendment'
                            ? (amendmentType === 'vin_correction' ? 'N/A' : '1')
                            : selectedVehicles.length
                          } <span className="text-sm font-normal text-[var(--color-muted)]">vehicles</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Amendment Details Section */}
                  {filingType === 'amendment' && amendmentType && (
                    <div className="bg-amber-50/50 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-amber-100">
                      <h3 className="font-bold text-base sm:text-lg text-[var(--color-text)] mb-4 sm:mb-6 flex items-center gap-2">
                        {amendmentType === 'vin_correction' && '📝'}
                        {amendmentType === 'weight_increase' && '⚖️'}
                        {amendmentType === 'mileage_exceeded' && '🛣️'}
                        Amendment Details
                      </h3>

                      {amendmentType === 'vin_correction' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200">
                            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">Original VIN (Incorrect)</p>
                            <p className="font-mono text-base sm:text-lg md:text-xl font-bold text-red-600 line-through break-all">
                              {vinCorrectionData.originalVIN}
                            </p>
                          </div>
                          <div className="bg-white p-4 sm:p-6 rounded-xl border border-green-200">
                            <p className="text-xs text-green-700 uppercase tracking-wider mb-2">Corrected VIN (Correct)</p>
                            <p className="font-mono text-base sm:text-lg md:text-xl font-bold text-green-600 break-all">
                              {vinCorrectionData.correctedVIN}
                            </p>
                          </div>
                          <div className="sm:col-span-2 flex items-center gap-2 text-green-700 font-medium text-sm sm:text-base">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span>No Additional Tax Due for VIN Correction</span>
                          </div>
                        </div>
                      )}

                      {amendmentType === 'weight_increase' && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 sm:gap-6 items-start md:items-center">
                            {weightIncreaseVehicle && (
                              <div className="flex-1 w-full md:w-auto">
                                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Vehicle VIN</p>
                                <p className="font-mono text-base sm:text-lg md:text-xl font-bold text-[var(--color-text)] break-all">{weightIncreaseVehicle.vin}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start">
                              <div className="text-center">
                                <p className="text-xs text-[var(--color-muted)] mb-1">Original Weight</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-400">{weightIncreaseData.originalWeightCategory}</p>
                              </div>
                              <div className="text-xl sm:text-2xl text-orange-500">→</div>
                              <div className="text-center">
                                <p className="text-xs text-orange-600 mb-1">New Weight</p>
                                <p className="text-xl sm:text-2xl font-bold text-orange-600">{weightIncreaseData.newWeightCategory}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Month of Increase</p>
                              <p className="text-base sm:text-lg font-semibold break-words">{weightIncreaseData.increaseMonth}</p>
                            </div>
                            <div className="bg-white p-3 sm:p-4 rounded-xl border border-orange-200">
                              <p className="text-xs text-orange-700 uppercase tracking-wider mb-1">Additional Tax Due</p>
                              <p className="text-xl sm:text-2xl font-bold text-orange-600">${weightIncreaseData.additionalTaxDue?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {amendmentType === 'mileage_exceeded' && (
                        <div className="space-y-4 sm:space-y-6">
                          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200">
                            {mileageExceededVehicle && (
                              <div className="mb-3 sm:mb-4">
                                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Vehicle VIN</p>
                                <p className="font-mono text-base sm:text-lg md:text-xl font-bold text-[var(--color-text)] break-all">{mileageExceededVehicle.vin}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                              <div>
                                <p className="text-xs text-[var(--color-muted)] mb-1">Vehicle Type</p>
                                <p className="font-semibold text-sm sm:text-base">{mileageExceededData.isAgriculturalVehicle ? 'Agricultural' : 'Standard'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[var(--color-muted)] mb-1">Mileage Limit</p>
                                <p className="font-semibold text-sm sm:text-base">{mileageExceededData.originalMileageLimit?.toLocaleString()} miles</p>
                              </div>
                              <div>
                                <p className="text-xs text-[var(--color-muted)] mb-1">Month Exceeded</p>
                                <p className="font-semibold text-sm sm:text-base break-words">{mileageExceededData.exceededMonth}</p>
                              </div>
                              <div>
                                <p className="text-xs text-purple-700 mb-1">Actual Mileage</p>
                                <p className="font-bold text-sm sm:text-base text-purple-700">{mileageExceededData.actualMileageUsed?.toLocaleString()} miles</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {filingType !== 'amendment' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                      {/* Business Section */}
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-[var(--color-text)] mb-4 sm:mb-6 flex items-center gap-2">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-orange)]" />
                          Business Information
                        </h3>
                        {selectedBusiness && (
                          <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[var(--color-border)] shadow-sm">
                            <h4 className="font-bold text-lg sm:text-xl text-[var(--color-text)] mb-3 sm:mb-4 break-words">{selectedBusiness.businessName}</h4>
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">EIN</p>
                                <p className="font-mono font-medium text-sm sm:text-base text-[var(--color-text)]">{selectedBusiness.ein}</p>
                              </div>
                              <div>
                                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Address</p>
                                <p className="font-medium text-sm sm:text-base text-[var(--color-text)] break-words">{selectedBusiness.address}</p>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Phone</p>
                                  <p className="font-medium text-sm sm:text-base text-[var(--color-text)]">{selectedBusiness.phone || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Signer</p>
                                  <p className="font-medium text-sm sm:text-base text-[var(--color-text)] break-words">{selectedBusiness.signingAuthorityName || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Vehicles Section */}
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-[var(--color-text)] mb-4 sm:mb-6 flex items-center gap-2">
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-orange)]" />
                          Vehicles Included
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {selectedVehicles.map((vehicle) => {
                            const isRefund = filingType === 'refund';
                            const amount = isRefund
                              ? calculateRefundAmount(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth)
                              : calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);

                            return (
                              <div key={vehicle.id} className="bg-white p-3 sm:p-4 rounded-xl border border-[var(--color-border)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 flex-wrap">
                                    <span className="font-mono font-bold text-base sm:text-lg text-[var(--color-text)] break-all">{vehicle.vin}</span>
                                    {vehicle.isSuspended && (
                                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 sm:px-2 py-0.5 rounded flex-shrink-0">Suspended</span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--color-muted)]">
                                    <span>Category: <strong>{vehicle.grossWeightCategory}</strong></span>
                                    {isRefund && refundDetails[vehicle.id] && (
                                      <span className="text-green-600">Refund Reason: <span className="capitalize font-medium">{refundDetails[vehicle.id].reason}</span></span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-4 min-w-[100px]">
                                  <p className="text-xs text-[var(--color-muted)] mb-1">{isRefund ? 'Return Amount' : 'Tax Amount'}</p>
                                  <p className={`font-bold text-lg sm:text-xl ${isRefund ? 'text-green-600' : 'text-[var(--color-text)]'}`}>${amount.toFixed(2)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 md:pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setStep(4)}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base text-[var(--color-text)] hover:bg-slate-50 active:bg-slate-100 transition font-medium touch-manipulation"
                  >
                    Back to Documents
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || pricingLoading}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 bg-[var(--color-orange)] text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base lg:text-lg hover:bg-[#ff7a20] active:scale-95 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Processing...</span>
                        <span className="sm:hidden">Processing</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Pay & Submit</span>
                        <span className="sm:hidden">Pay</span>
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Sidebar - Right Side */}
          <div className="hidden xl:block sticky top-24 self-start h-fit">
            <PricingSidebar
              filingType={filingType}
              filingData={filingData}
              selectedVehicleIds={selectedVehicleIds}
              vehicles={vehicles}
              selectedBusinessId={selectedBusinessId}
              businesses={businesses}
              amendmentType={amendmentType}
              weightIncreaseData={weightIncreaseData}
              mileageExceededData={mileageExceededData}
            step={step}
            onContinue={handleContinue}
            onSubmit={handleSubmit}
            loading={loading}
            hideSubmitButton={step === 5}
          />
        </div>
        </div>

        {/* Mobile Pricing Summary - Sticky Bottom */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-200 shadow-2xl safe-area-inset-bottom">
          <MobilePricingSummary
            filingType={filingType}
            filingData={filingData}
            selectedVehicleIds={selectedVehicleIds}
            vehicles={vehicles}
            selectedBusinessId={selectedBusinessId}
            businesses={businesses}
            amendmentType={amendmentType}
            weightIncreaseData={weightIncreaseData}
            mileageExceededData={mileageExceededData}
            step={step}
            onContinue={handleContinue}
            onSubmit={handleSubmit}
            loading={loading}
            hideSubmitButton={step === 5}
          />
        </div>
      </div>
    </ProtectedRoute >
  );
}

export default function NewFilingPage() {
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
      <NewFilingContent />
    </Suspense>
  );
}
