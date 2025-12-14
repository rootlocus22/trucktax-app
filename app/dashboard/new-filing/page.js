'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { FileText, AlertTriangle, RefreshCw, Truck, Info, CreditCard, CheckCircle, ShieldCheck, AlertCircle, RotateCcw } from 'lucide-react';

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

  // MCS-150 Upsell State
  const [mcs150Upgrade, setMcs150Upgrade] = useState(false);
  const [dotPin, setDotPin] = useState('');
  const [usdotNumber, setUsdotNumber] = useState('');
  const [mileageStats, setMileageStats] = useState('');
  const [needPinService, setNeedPinService] = useState(false);


  // Step 4: Documents
  const [documents, setDocuments] = useState([]);

  // Step 5: Review
  const [filingData, setFilingData] = useState({
    taxYear: '2025-2026',
    taxYear: '2025-2026',
    firstUsedMonth: 'July'
  });

  // Step 5: Compliance
  const [signature, setSignature] = useState('');
  const [agreedToPerjury, setAgreedToPerjury] = useState(false);
  const [agreedToConsent, setAgreedToConsent] = useState(false);

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

      // Calculate MCS Price
      const mcs150Price = mcs150Upgrade ? (needPinService ? 69 : 49) : 0;

      // Create filing
      const filingId = await createFiling({
        userId: user.uid,
        businessId: businessIdToUse,
        vehicleIds: vehicleIdsToUse,
        taxYear: filingData.taxYear,
        firstUsedMonth: filingData.firstUsedMonth,
        filingType: filingType, // Add filing type
        status: 'submitted', // Or 'pending_payment' if we had real payments
        mcs150Status: mcs150Upgrade ? 'submitted' : null,
        mcs150Pin: mcs150Upgrade && !needPinService ? dotPin : null,
        mcs150Price: mcs150Price,
        needPinService: mcs150Upgrade ? needPinService : false,
        mcs150UsdotNumber: mcs150Upgrade ? usdotNumber : null,
        mcs150MileageStats: mcs150Upgrade ? mileageStats : null,
        // Add compliance data
        compliance: {
          signature: signature,
          signedAt: new Date().toISOString(),
          agreedToPerjury: agreedToPerjury,
          agreedToConsent: agreedToConsent,
          ipAddress: 'captured_on_server' // Ideally captured server-side
        },
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

        {/* Duplicate Filing Warning */}
        {showDuplicateWarning && duplicateFiling && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Similar Filing Found</h3>
                <p className="text-sm text-amber-800 mb-4">
                  You already have an incomplete filing with similar details. Would you like to resume that filing or continue with a new one?
                </p>
                <div className="bg-white rounded-lg border border-amber-200 p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-amber-900">
                      {formatIncompleteFiling(duplicateFiling)?.description || 'Existing Filing'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
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
                <div className="flex gap-3">
                  <Link
                    href={`/dashboard/filings/${duplicateFiling.id}`}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition text-sm flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resume Existing Filing
                  </Link>
                  <button
                    onClick={() => {
                      setShowDuplicateWarning(false);
                      setDuplicateFiling(null);
                    }}
                    className="px-4 py-2 bg-white border border-amber-300 text-amber-700 rounded-lg font-semibold hover:bg-amber-50 transition text-sm"
                  >
                    Continue New Filing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Filing Type */}
        {step === 1 && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Select Filing Type</h2>

            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => {
                  setFilingType('standard');
                  setAmendmentType(''); // Clear amendment type
                }}
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
                  Correct a VIN, report weight increase, or mileage exceeded.
                </p>
              </button>

              <button
                onClick={() => {
                  setFilingType('refund');
                  setAmendmentType(''); // Clear amendment type
                }}
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

            {/* Amendment Type Sub-Selection */}
            {filingType === 'amendment' && (
              <div className="mt-8 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">
                  What type of amendment do you need to file?
                </h3>
                <div className="grid gap-4">
                  {/* VIN Correction */}
                  <button
                    onClick={() => {
                      setAmendmentType('vin_correction');
                      setVinInputMode('select'); // Reset to dropdown mode
                      setVinCorrectionData({ originalVIN: '', correctedVIN: '', originalFilingId: '' }); // Reset data
                    }}
                    className={`p-6 rounded-xl border-2 text-left transition ${amendmentType === 'vin_correction'
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-[var(--color-border)] hover:border-blue-500/50 hover:bg-blue-50/50'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">📝</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--color-text)] mb-2">VIN Correction</h4>
                        <p className="text-sm text-[var(--color-muted)] mb-3">
                          Correct an incorrect Vehicle Identification Number on a previously filed Form 2290
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            ⏰ No specific deadline
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                            💰 FREE - No additional tax due
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Weight Increase */}
                  <button
                    onClick={() => setAmendmentType('weight_increase')}
                    className={`p-6 rounded-xl border-2 text-left transition ${amendmentType === 'weight_increase'
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                      : 'border-[var(--color-border)] hover:border-orange-500/50 hover:bg-orange-50/50'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">⚖️</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--color-text)] mb-2">Taxable Gross Weight Increase</h4>
                        <p className="text-sm text-[var(--color-muted)] mb-3">
                          Report when your vehicle moved to a higher weight category during the tax period
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                            ⏰ DUE: Last day of month following weight increase
                          </span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                            💰 Additional tax will be calculated
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Mileage Exceeded */}
                  <button
                    onClick={() => setAmendmentType('mileage_exceeded')}
                    className={`p-6 rounded-xl border-2 text-left transition ${amendmentType === 'mileage_exceeded'
                      ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-500'
                      : 'border-[var(--color-border)] hover:border-purple-500/50 hover:bg-purple-50/50'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">🛣️</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[var(--color-text)] mb-2">Mileage Use Limit Exceeded</h4>
                        <p className="text-sm text-[var(--color-muted)] mb-3">
                          Report when a suspended vehicle exceeded the 5,000 mile limit (7,500 miles for agricultural vehicles)
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                            ⏰ Report the month mileage was exceeded
                          </span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                            💰 Full tax will be calculated
                          </span>
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
                className="px-6 py-3 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition shadow-md"
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
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className=" flex items-center gap-3 mb-4">
                    <span className="text-3xl">📝</span>
                    <div>
                      <h3 className="font-bold text-[var(--color-text)]">VIN Correction</h3>
                      <p className="text-sm text-[var(--color-muted)]">Correct an incorrect VIN from a previously filed Form 2290</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Original VIN (Incorrect) *
                  </label>

                  {/* Input Mode Toggle */}
                  {/* Compliance & Signature Section */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-6">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      Sign & Submit
                    </h3>

                    {/* Perjury Statement */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition">
                        <input
                          type="checkbox"
                          checked={agreedToPerjury}
                          onChange={(e) => setAgreedToPerjury(e.target.checked)}
                          className="mt-1 w-4 h-4 text-[var(--color-navy)] border-gray-300 rounded focus:ring-[var(--color-navy)]"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          <strong>Perjury Statement:</strong> Under penalties of perjury, I declare that I have examined this return, including accompanying schedules and statements, and to the best of my knowledge and belief, it is true, correct, and complete.
                        </span>
                      </label>
                    </div>

                    {/* Section 7216 Consent */}
                    <div className="space-y-3">
                      <label className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition">
                        <input
                          type="checkbox"
                          checked={agreedToConsent}
                          onChange={(e) => setAgreedToConsent(e.target.checked)}
                          className="mt-1 w-4 h-4 text-[var(--color-navy)] border-gray-300 rounded focus:ring-[var(--color-navy)]"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                          <strong>Consent to Disclosure:</strong> I consent to the disclosure of my tax return information to TruckTax for the purpose of electronically filing my return and for providing me with updates regarding my filing status. I understand that I am not required to consent to this disclosure.
                        </span>
                      </label>
                    </div>

                    {/* Signature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Digital Signature
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          placeholder="Type your full legal name"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent font-serif italic text-lg"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                          Digitally Signed
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        By typing your name above, you are electronically signing this return.
                      </p>
                    </div>

                    {complianceError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700 animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {complianceError}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setVinInputMode('select')}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${vinInputMode === 'select'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Select from Previous Filings
                    </button>
                    <button
                      type="button"
                      onClick={() => setVinInputMode('manual')}
                      className={`px-3 py-1.5 text-xs rounded-lg transition ${vinInputMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      Enter Manually
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
                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] font-mono bg-white"
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
                        <p className="mt-1 text-xs text-amber-600">No previous filings found. You can enter the VIN manually using the "Enter Manually" option above.</p>
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
                        className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] font-mono"
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
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] font-mono"
                    placeholder="1HGBH41JXMN109187"
                    maxLength="17"
                  />
                  <p className="mt-1 text-xs text-[var(--color-muted)]">Enter the correct VIN (must be different from original)</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">
                    <strong>✓ No Additional Tax:</strong> VIN corrections are FREE with no additional HVUT tax due.
                  </p>
                </div>
              </div>
            )}

            {/* Weight Increase Details */}
            {amendmentType === 'weight_increase' && (
              <div className="space-y-6">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚖️</span>
                    <div>
                      <h3 className="font-bold text-[var(--color-text)]">Taxable Gross Weight Increase</h3>
                      <p className="text-sm text-[var(--color-muted)]">Report when your vehicle moved to a higher weight category</p>
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
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                  >
                    <option value="">Select a vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.vin}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Original Weight Category *
                    </label>
                    <select
                      value={weightIncreaseData.originalWeightCategory}
                      onChange={(e) => {
                        setWeightIncreaseData({ ...weightIncreaseData, originalWeightCategory: e.target.value });
                      }}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
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
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
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
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
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
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[var(--color-text)]">Additional Tax Due:</span>
                      <span className="text-2xl font-bold text-orange-600">${weightIncreaseData.additionalTaxDue.toFixed(2)}</span>
                    </div>
                    {weightIncreaseData.increaseMonth && (
                      <p className="text-xs text-orange-700 mt-2">
                        ⏰ <strong>Due Date:</strong> {calculateWeightIncreaseDueDate(weightIncreaseData.increaseMonth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mileage Exceeded Details */}
            {amendmentType === 'mileage_exceeded' && (
              <div className="space-y-6">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🛣️</span>
                    <div>
                      <h3 className="font-bold text-[var(--color-text)]">Mileage Use Limit Exceeded</h3>
                      <p className="text-sm text-[var(--color-muted)]">Report when a suspended vehicle exceeded its mileage limit</p>
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
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
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
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-page-alt)]">
                      <input
                        type="radio"
                        name="vehicleType"
                        checked={!mileageExceededData.isAgriculturalVehicle}
                        onChange={() => setMileageExceededData({ ...mileageExceededData, isAgriculturalVehicle: false, originalMileageLimit: 5000 })}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-[var(--color-text)]">Standard Vehicle</div>
                        <div className="text-xs text-[var(--color-muted)]">5,000 mile annual limit</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg cursor-pointer hover:bg-[var(--color-page-alt)]">
                      <input
                        type="radio"
                        name="vehicleType"
                        checked={mileageExceededData.isAgriculturalVehicle}
                        onChange={() => setMileageExceededData({ ...mileageExceededData, isAgriculturalVehicle: true, originalMileageLimit: 7500 })}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium text-[var(--color-text)]">Agricultural Vehicle</div>
                        <div className="text-xs text-[var(--color-muted)]">7,500 mile annual limit</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Actual Mileage Used *
                  </label>
                  <input
                    type="number"
                    value={mileageExceededData.actualMileageUsed || ''}
                    onChange={(e) => setMileageExceededData({ ...mileageExceededData, actualMileageUsed: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                    placeholder="6500"
                    min="0"
                  />
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
                    className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]"
                  >
                    <option value="">Select month...</option>
                    {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => (
                      <option key={m} value={m}>{m} {m === 'January' || m === 'February' || m === 'March' || m === 'April' || m === 'May' || m === 'June' ? '2026' : '2025'}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-700">
                    <strong>ℹ️ Note:</strong> Once a suspended vehicle exceeds the mileage limit, you must pay the full HVUT tax based on when the vehicle was first used in the tax period.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
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
                className="px-6 py-2 bg-[var(--color-navy)] text-white rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Business (skip for amendments, renumber for non-amendments) */}
        {step === 2 && filingType !== 'amendment' && (
          <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Business Information</h2>

            {/* Existing Businesses List */}
            {!showBusinessForm && businesses.length > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-[var(--color-text)] mb-3">
                  Select Business
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => setSelectedBusinessId(business.id)}
                      className={`p-4 rounded-xl border-2 text-left transition ${selectedBusinessId === business.id
                        ? 'border-[var(--color-navy)] bg-[var(--color-page-alt)] ring-1 ring-[var(--color-navy)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-navy)]/50'
                        }`}
                    >
                      <div className="font-bold text-[var(--color-text)]">{business.businessName}</div>
                      <div className="text-sm text-[var(--color-muted)] mt-1">EIN: {business.ein}</div>
                      <div className="text-xs text-[var(--color-muted)] truncate mt-1">{business.address}</div>
                    </button>
                  ))}

                  {/* Add New Business Button */}
                  <button
                    onClick={() => {
                      setShowBusinessForm(true);
                      setSelectedBusinessId(''); // Clear selection when adding new
                    }}
                    className="p-4 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] hover:bg-[var(--color-page-alt)] transition flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xl font-bold">+</span>
                    </div>
                    <span className="font-semibold">Add New Business</span>
                  </button>
                </div>
              </div>
            )}

            {/* Add New Business Form */}
            {(showBusinessForm || businesses.length === 0) && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {businesses.length > 0 ? 'Add New Business' : 'Add Business Details'}
                  </h3>
                  {businesses.length > 0 && (
                    <button
                      onClick={() => setShowBusinessForm(false)}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] underline"
                    >
                      Cancel & Select Existing
                    </button>
                  )}
                </div>

                <div className="grid gap-4 p-6 bg-[var(--color-page-alt)] rounded-xl border border-[var(--color-border)]">
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
                    onClick={async () => {
                      await handleAddBusiness();
                      // If successful (no errors), hide form
                      // Note: handleAddBusiness sets errors if any. We can check if businesses length increased or use a callback.
                      // For simplicity, we'll rely on the user seeing the new business in the list if they switch back, 
                      // but ideally handleAddBusiness should return success.
                      // Let's modify handleAddBusiness to return true on success.
                      // For now, we'll just let the user click "Save" and if it works, we can manually toggle.
                      // Actually, better to just let the state update.
                      setShowBusinessForm(false);
                    }}
                    disabled={loading}
                    className="w-full bg-[var(--color-navy)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50 mt-2"
                  >
                    {loading ? 'Adding...' : 'Save & Add Business'}
                  </button>
                </div>
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
                onClick={() => {
                  if (showBusinessForm && (newBusiness.businessName || newBusiness.ein)) {
                    setError('Please save the new business details before proceeding, or click Cancel.');
                    return;
                  }
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

            {/* Existing Vehicles List */}
            {vehicles.length > 0 && !showVehicleForm && (
              <div className="mb-8">
                <label className="block text-sm font-bold text-[var(--color-text)] mb-3">
                  Select Vehicles to File
                </label>
                <div className="space-y-4 max-h-[600px] overflow-y-auto border border-[var(--color-border)] rounded-lg p-4 bg-white mb-4">
                  {vehicles.map((vehicle) => {
                    const isRefund = filingType === 'refund';
                    const estimatedAmount = isRefund
                      ? calculateRefundAmount(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth)
                      : calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);

                    const isSelected = selectedVehicleIds.includes(vehicle.id);

                    return (
                      <div key={vehicle.id} className={`p-3 rounded-lg border transition ${isSelected ? 'bg-[var(--color-page-alt)] border-[var(--color-navy)]' : 'border-transparent hover:border-[var(--color-border)]'}`}>
                        <label className="flex items-center gap-3 cursor-pointer mb-2">
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
                              <span className={`font-bold ${isRefund ? 'text-green-600' : 'text-[var(--color-text)]'}`}>
                                ${estimatedAmount.toFixed(2)}
                              </span>
                              <p className="text-xs text-[var(--color-muted)]">
                                {isRefund ? 'Est. Refund' : 'Est. Tax'}
                              </p>
                            </div>
                          </div>
                        </label>

                        {/* Refund Details Inputs */}
                        {isRefund && isSelected && (
                          <div className="ml-8 mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white rounded border border-dashed border-green-200">
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
                  className="w-full p-4 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] hover:bg-[var(--color-page-alt)] transition flex items-center justify-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="font-bold">+</span>
                  </div>
                  <span className="font-semibold">Add Another Vehicle</span>
                </button>
              </div>
            )}

            {/* Add New Vehicle Form */}
            {(showVehicleForm || vehicles.length === 0) && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    {vehicles.length > 0 ? 'Add New Vehicle' : 'Add Vehicle'}
                  </h3>
                  {vehicles.length > 0 && (
                    <button
                      onClick={() => setShowVehicleForm(false)}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] underline"
                    >
                      Cancel & Select Existing
                    </button>
                  )}
                </div>

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
                    onClick={async () => {
                      await handleAddVehicle();
                      setShowVehicleForm(false);
                    }}
                    disabled={loading}
                    className="w-full bg-[var(--color-navy)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--color-navy-soft)] transition disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Vehicle'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
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
                      <p className="font-semibold">
                        {filingType === 'amendment'
                          ? (amendmentType === 'vin_correction' ? 'N/A' : '1')
                          : selectedVehicles.length
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Amendment Details Section */}
                {filingType === 'amendment' && amendmentType && (
                  <div className="bg-[var(--color-page-alt)] p-6 rounded-xl border border-[var(--color-border)]">
                    <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                      {amendmentType === 'vin_correction' && '📝'}
                      {amendmentType === 'weight_increase' && '⚖️'}
                      {amendmentType === 'mileage_exceeded' && '🛣️'}
                      Amendment Details
                    </h3>

                    {amendmentType === 'vin_correction' && (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="text-[var(--color-muted)] mb-1">Amendment Type</p>
                          <p className="font-semibold">VIN Correction</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded border border-[var(--color-border)]">
                          <div>
                            <p className="text-xs text-[var(--color-muted)] mb-1">Original VIN (Incorrect)</p>
                            <p className="font-mono text-sm font-bold text-red-600 line-through">
                              {vinCorrectionData.originalVIN}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-muted)] mb-1">Corrected VIN</p>
                            <p className="font-mono text-sm font-bold text-green-600">
                              {vinCorrectionData.correctedVIN}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                          <strong>✓ No Additional Tax:</strong> VIN corrections are FREE
                        </div>
                      </div>
                    )}

                    {amendmentType === 'weight_increase' && (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="text-[var(--color-muted)] mb-1">Amendment Type</p>
                          <p className="font-semibold">Taxable Gross Weight Increase</p>
                        </div>
                        {weightIncreaseVehicle && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                            <p className="text-[var(--color-muted)] mb-1">Vehicle VIN</p>
                            <p className="font-mono font-bold text-[var(--color-text)]">{weightIncreaseVehicle.vin}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-3 gap-2 items-center">
                          <div className="p-3 bg-white rounded border border-[var(--color-border)] text-center">
                            <p className="text-xs text-[var(--color-muted)]">Original</p>
                            <p className="text-xl font-bold text-gray-700">
                              {weightIncreaseData.originalWeightCategory}
                            </p>
                          </div>
                          <div className="text-center text-2xl text-orange-600">→</div>
                          <div className="p-3 bg-white rounded border border-orange-300 text-center">
                            <p className="text-xs text-[var(--color-muted)]">New</p>
                            <p className="text-xl font-bold text-orange-600">
                              {weightIncreaseData.newWeightCategory}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-[var(--color-muted)]">Month of Increase</p>
                            <p className="font-semibold">{weightIncreaseData.increaseMonth}</p>
                          </div>
                          <div>
                            <p className="text-[var(--color-muted)]">Additional Tax Due</p>
                            <p className="font-semibold text-orange-600 text-lg">
                              ${weightIncreaseData.additionalTaxDue?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                        {weightIncreaseData.increaseMonth && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>⏰ Due By:</strong> {calculateWeightIncreaseDueDate(weightIncreaseData.increaseMonth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        )}
                      </div>
                    )}

                    {amendmentType === 'mileage_exceeded' && (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <p className="text-[var(--color-muted)] mb-1">Amendment Type</p>
                          <p className="font-semibold">Mileage Use Limit Exceeded</p>
                        </div>
                        {mileageExceededVehicle && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                            <p className="text-[var(--color-muted)] mb-1">Vehicle VIN</p>
                            <p className="font-mono font-bold text-[var(--color-text)]">{mileageExceededVehicle.vin}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-[var(--color-muted)]">Vehicle Type</p>
                            <p className="font-semibold">
                              {mileageExceededData.isAgriculturalVehicle ? 'Agricultural' : 'Standard'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[var(--color-muted)]">Mileage Limit</p>
                            <p className="font-semibold">
                              {mileageExceededData.originalMileageLimit?.toLocaleString()} miles
                            </p>
                          </div>
                          <div>
                            <p className="text-[var(--color-muted)]">Actual Mileage Used</p>
                            <p className="font-semibold text-purple-600 text-lg">
                              {mileageExceededData.actualMileageUsed?.toLocaleString()} miles
                            </p>
                          </div>
                          <div>
                            <p className="text-[var(--color-muted)]">Month Exceeded</p>
                            <p className="font-semibold">{mileageExceededData.exceededMonth}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-700">
                          <strong>ℹ️ Full HVUT Tax Now Due:</strong> Vehicle was previously suspended
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {filingType !== 'amendment' && (
                  <>
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
                        {selectedVehicles.map((vehicle) => {
                          const isRefund = filingType === 'refund';
                          const amount = isRefund
                            ? calculateRefundAmount(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth)
                            : calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);

                          return (
                            <div key={vehicle.id} className="flex justify-between items-center p-3 border border-[var(--color-border)] rounded-lg text-sm">
                              <div>
                                <span className="font-mono font-bold">{vehicle.vin}</span>
                                <span className="text-[var(--color-muted)] ml-2">({vehicle.grossWeightCategory})</span>
                                {isRefund && refundDetails[vehicle.id] && (
                                  <div className="text-xs text-[var(--color-muted)] mt-1">
                                    Reason: <span className="capitalize">{refundDetails[vehicle.id].reason}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <span className={`font-semibold ${isRefund ? 'text-green-600' : ''}`}>
                                  ${amount.toFixed(2)}
                                </span>
                                {isRefund && <p className="text-xs text-[var(--color-muted)]">Refund</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Compliance Section */}
                <div className="bg-[var(--color-page-alt)] p-6 rounded-xl border border-[var(--color-border)]">
                  <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[var(--color-navy)]" />
                    Compliance & Signature
                  </h3>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 p-3 bg-white rounded border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-navy)] transition">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-[var(--color-navy)] rounded border-gray-300 focus:ring-[var(--color-navy)]"
                        checked={agreedToPerjury}
                        onChange={(e) => setAgreedToPerjury(e.target.checked)}
                      />
                      <span className="text-sm text-[var(--color-text)]">
                        <strong>Perjury Statement:</strong> I declare under penalty of perjury that I have examined this return, including accompanying schedules and statements, and to the best of my knowledge and belief, it is true, correct, and complete.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-white rounded border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-navy)] transition">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-[var(--color-navy)] rounded border-gray-300 focus:ring-[var(--color-navy)]"
                        checked={agreedToConsent}
                        onChange={(e) => setAgreedToConsent(e.target.checked)}
                      />
                      <span className="text-sm text-[var(--color-text)]">
                        <strong>Consent to Disclosure:</strong> I consent to the IRS disclosing information about my payment of the heavy highway vehicle use tax to the Department of Transportation for proof of payment purposes.
                      </span>
                    </label>

                    <div>
                      <label className="block text-sm font-bold text-[var(--color-text)] mb-1">
                        Electronic Signature <span className="text-red-500">*</span>
                      </label>
                      <div className="text-xs text-[var(--color-muted)] mb-2">Type your full name to sign this return</div>
                      <input
                        type="text"
                        className="w-full p-3 bg-white border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent outline-none transition"
                        placeholder="e.g. John Doe"
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* MCS-150 Upsell Removed - Moved to dedicated workflow */}
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
                        {filingType === 'refund' ? (
                          <>
                            <div className="flex justify-between text-green-200">
                              <span className="text-white/80">Est. Refund Amount</span>
                              <span className="font-bold">${(pricing.totalRefund || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/80">Tax Due</span>
                              <span className="font-bold">$0.00</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between">
                            <span className="text-white/80">IRS Tax Amount</span>
                            <span className="font-bold">${pricing.totalTax.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-white/80">Service Fee</span>
                          <span className="font-bold">${pricing.serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">Sales Tax (Est.)</span>
                          <span className="font-bold">${pricing.salesTax.toFixed(2)}</span>
                        </div>

                        {/* MCS-150 Add-ons */}
                        {mcs150Upgrade && (
                          <div className="flex justify-between text-blue-200 pt-2 border-t border-white/10 mt-2">
                            <span className="text-white/80">DOT Compliance</span>
                            <span className="font-bold">$49.00</span>
                          </div>
                        )}
                        {mcs150Upgrade && needPinService && (
                          <div className="flex justify-between text-orange-200">
                            <span className="text-white/80">PIN Retrieval</span>
                            <span className="font-bold">$20.00</span>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-end mb-8">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-3xl font-bold">
                          ${(pricing.grandTotal + (mcs150Upgrade ? (needPinService ? 69 : 49) : 0)).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading || pricingLoading || !signature || !agreedToPerjury || !agreedToConsent}
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
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-navy)] mx-auto mb-4"></div>
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
