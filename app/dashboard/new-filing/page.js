'use client';

import { useState, useEffect, useRef, Suspense, useMemo, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, createBusiness, getVehiclesByUser, createVehicle, createFiling, getFilingsByUser, getVehicle, logPayment, deleteFiling, getFiling } from '@/lib/db';
import { saveDraftFiling, getDraftFiling, deleteDraftFiling, getDraftFilingsByUser, getAllDraftFilingsByUser } from '@/lib/draftHelpers';
// Duplicate filing detection imports removed - functionality disabled
import { uploadInputDocument } from '@/lib/storage';
import { calculateFilingCost } from '@/app/actions/pricing'; // Server Action
import { calculateTax, calculateRefundAmount, calculateWeightIncreaseAdditionalTax, calculateMileageExceededTax } from '@/lib/pricing'; // Keep for client-side estimation only
import { validateBusinessName, validateEIN, formatEIN, validateVIN, validateAddress, validatePhone, validateState, validateZip, validateCity, validateCountry, validatePIN } from '@/lib/validation';
import { validateVINCorrection, validateWeightIncrease, validateMileageExceeded, calculateWeightIncreaseDueDate, getAmendmentTypeConfig } from '@/lib/amendmentHelpers';
import { FileText, AlertTriangle, RefreshCw, Truck, Info, CreditCard, CheckCircle, ShieldCheck, AlertCircle, RotateCcw, Clock, Building2, ChevronUp, ChevronDown, Loader2, X, Plus, ArrowRight } from 'lucide-react';
import { PricingSidebar } from '@/components/PricingSidebar';
import StripeWrapper from '@/components/StripeWrapper';
import VehicleFormModal from '@/components/VehicleFormModal';


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
    totalRefund: 0,
    bulkSavings: 0,
    standardRate: 34.99,
    vehicleCount: 0
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      // For VIN corrections, mileage exceeded, and weight increase, allow calculation even without vehicles
      const isVinCorrection = filingType === 'amendment' && amendmentType === 'vin_correction';
      const isMileageExceeded = filingType === 'amendment' && amendmentType === 'mileage_exceeded';
      const isWeightIncrease = filingType === 'amendment' && amendmentType === 'weight_increase';

      if (!filingType || (selectedVehicleIds.length === 0 && !isVinCorrection && !isMileageExceeded && !isWeightIncrease)) {
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
              amendedMonth: weightIncreaseData?.amendedMonth,
              firstUsedMonth: weightIncreaseData?.firstUsedMonth,
              originalIsLogging: weightIncreaseData?.originalIsLogging || false,
              newIsLogging: weightIncreaseData?.newIsLogging || false
            };
          } else if (amendmentType === 'mileage_exceeded') {
            const vehicle = vehicles.find(v => v.id === mileageExceededData?.vehicleId);
            // Use firstUsedMonth from user input (from their original filing)
            const firstUsedMonth = mileageExceededData?.firstUsedMonth || filingData?.firstUsedMonth || 'July';
            amendmentDataForPricing = {
              vehicleCategory: vehicle?.grossWeightCategory || '',
              firstUsedMonth: firstUsedMonth,
              isLogging: vehicle?.logging === true
            };
          } else if (amendmentType === 'vin_correction') {
            amendmentDataForPricing = {};
          }
        }

        if (amendmentDataForPricing !== null) {
          filingDataForPricing.amendmentData = amendmentDataForPricing;
        }

        // Sanitize vehicles to remove complex objects (like Firestore Timestamps)
        // Include vehicleType, logging, and creditDate for proper tax calculation
        // For VIN corrections and mileage exceeded, vehicles array can be empty
        const sanitizedVehicles = selectedVehiclesList.length > 0
          ? selectedVehiclesList.map(v => ({
            id: v.id,
            vin: v.vin,
            grossWeightCategory: v.grossWeightCategory,
            isSuspended: v.isSuspended || false,
            vehicleType: v.vehicleType || (v.isSuspended ? 'suspended' : 'taxable'),
            logging: v.logging !== undefined ? v.logging : null,
            creditDate: v.creditDate || null // Include creditDate for credit vehicle proration
          }))
          : []; // Empty array for VIN corrections and mileage exceeded with no vehicles

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

  // For VIN corrections, mileage exceeded, and weight increase, hasData should be true even without vehicles
  const isVinCorrection = filingType === 'amendment' && amendmentType === 'vin_correction';
  const isMileageExceeded = filingType === 'amendment' && amendmentType === 'mileage_exceeded';
  const isWeightIncrease = filingType === 'amendment' && amendmentType === 'weight_increase';
  const hasData = filingType && (selectedVehicleIds.length > 0 || isVinCorrection || isMileageExceeded || isWeightIncrease);
  const vehicleCount = selectedVehicleIds.length;
  // For collapsed view, show what's due now (service fee + sales tax), not grand total
  // IRS tax is paid separately, so we only show platform fees in the collapsed summary
  const totalAmount = filingType === 'refund'
    ? pricing.totalRefund
    : (() => {
      // For weight increase amendments, ensure $10 service fee is included if pricing hasn't been calculated
      if (isWeightIncrease && (pricing.serviceFee || 0) === 0) {
        const baseFee = 10.00;
        const estimatedSalesTax = baseFee * 0.07;
        return baseFee + estimatedSalesTax;
      }
      return (pricing.serviceFee || 0) + (pricing.salesTax || 0) - (pricing.couponDiscount || 0);
    })();

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
                <span className={`text-base sm:text-lg md:text-xl font-bold ${hasData && filingType === 'refund' ? 'text-emerald-600' : hasData ? 'text-midnight' : 'text-slate-400'}`}>
                  {hasData && filingType === 'refund' ? '+' : ''}${hasData ? totalAmount.toFixed(2) : '0.00'}
                </span>
                {hasData && filingType === 'amendment' && amendmentType === 'vin_correction' && (
                  <span className="text-xs text-emerald-600 font-medium">FREE</span>
                )}
                {hasData && filingType === 'amendment' && (amendmentType === 'mileage_exceeded' || amendmentType === 'weight_increase') && (
                  <span className="text-xs text-purple-600 font-medium">$10 fee</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {step === 5 && onSubmit && !hideSubmitButton && (
              <button
                onClick={onSubmit}
                disabled={loading || !hasData}
                className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-[var(--color-orange)] text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-[var(--color-orange-hover)] active:scale-95 transition touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-orange-500/20"
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
            {!hasData ? (
              <>
                <div className="pb-2 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Payment to IRS</span>
                    <span className="text-xs font-bold text-slate-400">$0.00</span>
                  </div>
                </div>
                <div className="pb-2 border-b border-slate-200 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Service Fee</span>
                    <span className="text-xs font-bold text-slate-400">$0.00</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 text-center">
                    Select filing type and vehicles to see pricing
                  </div>
                </div>
              </>
            ) : (
              <>
                {filingType === 'refund' ? (
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-600 font-semibold uppercase tracking-tight">Estimated Refund</span>
                    <span className="font-bold text-emerald-600">+${pricing.totalRefund?.toFixed(2) || '0.00'}</span>
                  </div>
                ) : (
                  <>
                    <div className="pb-2 border-b border-slate-200">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-blue-700 uppercase tracking-tight">Payment to IRS</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">IRS Tax Amount</p>
                        </div>
                        <span className="text-sm font-bold text-blue-700">
                          ${(() => {
                            // For weight increase amendments, use additionalTaxDue if available
                            if (isWeightIncrease && weightIncreaseData?.additionalTaxDue) {
                              return weightIncreaseData.additionalTaxDue.toFixed(2);
                            }
                            return pricing.totalTax?.toFixed(2) || '0.00';
                          })()}
                        </span>
                      </div>
                    </div>
                    <div className="pb-2 border-b border-slate-200 pt-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-tight">Service Fee</span>
                          <p className="text-[10px] text-slate-500 mt-0.5">Platform service fee</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">
                          ${(() => {
                            // For weight increase amendments, ensure $10 is shown if pricing hasn't been calculated
                            if (isWeightIncrease && (pricing.serviceFee || 0) === 0) {
                              return '10.00';
                            }
                            return pricing.serviceFee?.toFixed(2) || '0.00';
                          })()}
                        </span>
                      </div>
                      {/* Show standard rate and bulk savings for multi-vehicle filings */}
                      {vehicleCount > 1 && filingType !== 'amendment' && filingType !== 'refund' && (
                        <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-xs text-slate-500">Standard Rate</p>
                              <p className="text-xs text-slate-400 mt-0.5">($34.99 × {vehicleCount})</p>
                            </div>
                            <p className="text-xs font-medium text-slate-400 line-through">${(34.99 * vehicleCount).toFixed(2)}</p>
                          </div>
                          {pricing.bulkSavings > 0 && (
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-emerald-700">Volume Discount</p>
                                <p className="text-xs text-emerald-600 mt-0.5">Bulk savings</p>
                              </div>
                              <p className="text-xs font-bold text-emerald-700">-${(pricing.bulkSavings || 0).toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      )}
                      {pricing.salesTax > 0 && (
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-slate-500">+ Sales Tax</span>
                          <span className="font-medium">${pricing.salesTax?.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                        <span className="text-xs font-bold text-emerald-700">Total Due Now</span>
                        <span className="text-sm font-bold text-emerald-700">
                          ${(() => {
                            // For weight increase amendments, ensure $10 service fee is included if pricing hasn't been calculated
                            let serviceFee = pricing.serviceFee || 0;
                            if (isWeightIncrease && serviceFee === 0) {
                              serviceFee = 10.00;
                            }
                            // Estimate sales tax if not calculated (7% of service fee)
                            const salesTax = pricing.salesTax || (serviceFee > 0 ? serviceFee * 0.07 : 0);
                            return (serviceFee + salesTax - (pricing.couponDiscount || 0)).toFixed(2);
                          })()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {filingType === 'amendment' && amendmentType === 'vin_correction' && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-700">
                    <span className="font-medium">VIN corrections: $10 service fee (No IRS tax)</span>
                  </div>
                )}
                {filingType === 'amendment' && amendmentType === 'weight_increase' && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-orange-700">
                    <span className="font-medium">
                      Weight increase: $10 service fee {weightIncreaseData?.additionalTaxDue > 0 ? `+ IRS tax ($${weightIncreaseData.additionalTaxDue.toFixed(2)})` : '(No IRS tax required)'}
                    </span>
                  </div>
                )}
                {filingType === 'amendment' && amendmentType === 'mileage_exceeded' && (
                  <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-purple-700">
                    <span className="font-medium">
                      Mileage exceeded: $10 service fee {pricing.totalTax > 0 ? `+ IRS tax ($${pricing.totalTax.toFixed(2)})` : '(No IRS tax required)'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions for weight category formatting (used in weight increase amendment)
const TAX_RATES_NON_LOGGING_WEIGHT = {
  'A': 100.00, 'B': 122.00, 'C': 144.00, 'D': 166.00, 'E': 188.00,
  'F': 210.00, 'G': 232.00, 'H': 254.00, 'I': 276.00, 'J': 298.00,
  'K': 320.00, 'L': 342.00, 'M': 364.00, 'N': 386.00, 'O': 408.00,
  'P': 430.00, 'Q': 452.00, 'R': 474.00, 'S': 496.00, 'T': 518.00,
  'U': 540.00, 'V': 550.00, 'W': 550.00
};

const TAX_RATES_LOGGING_WEIGHT = {
  'A': 75.00, 'B': 91.50, 'C': 108.00, 'D': 124.50, 'E': 141.00,
  'F': 157.50, 'G': 174.00, 'H': 190.50, 'I': 207.00, 'J': 223.50,
  'K': 240.00, 'L': 256.50, 'M': 273.00, 'N': 289.50, 'O': 306.00,
  'P': 322.50, 'Q': 339.00, 'R': 355.50, 'S': 372.00, 'T': 388.50,
  'U': 405.00, 'V': 412.50, 'W': 412.50
};

const formatCurrencyWeight = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getWeightCategoryOptionsWithPricing = (isLogging = false, includeW = false) => {
  const taxRates = isLogging ? TAX_RATES_LOGGING_WEIGHT : TAX_RATES_NON_LOGGING_WEIGHT;
  const loggingText = isLogging ? ' (Logging)' : '';

  const categories = [
    { value: 'A', label: `A - 55,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['A'])}` },
    { value: 'B', label: `B - 55,001 - 56,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['B'])}` },
    { value: 'C', label: `C - 56,001 - 57,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['C'])}` },
    { value: 'D', label: `D - 57,001 - 58,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['D'])}` },
    { value: 'E', label: `E - 58,001 - 59,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['E'])}` },
    { value: 'F', label: `F - 59,001 - 60,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['F'])}` },
    { value: 'G', label: `G - 60,001 - 61,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['G'])}` },
    { value: 'H', label: `H - 61,001 - 62,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['H'])}` },
    { value: 'I', label: `I - 62,001 - 63,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['I'])}` },
    { value: 'J', label: `J - 63,001 - 64,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['J'])}` },
    { value: 'K', label: `K - 64,001 - 65,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['K'])}` },
    { value: 'L', label: `L - 65,001 - 66,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['L'])}` },
    { value: 'M', label: `M - 66,001 - 67,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['M'])}` },
    { value: 'N', label: `N - 67,001 - 68,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['N'])}` },
    { value: 'O', label: `O - 68,001 - 69,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['O'])}` },
    { value: 'P', label: `P - 69,001 - 70,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['P'])}` },
    { value: 'Q', label: `Q - 70,001 - 71,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['Q'])}` },
    { value: 'R', label: `R - 71,001 - 72,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['R'])}` },
    { value: 'S', label: `S - 72,001 - 73,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['S'])}` },
    { value: 'T', label: `T - 73,001 - 74,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['T'])}` },
    { value: 'U', label: `U - 74,001 - 75,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['U'])}` },
    { value: 'V', label: `V - More than 75,000 lbs${loggingText} - ${formatCurrencyWeight(taxRates['V'])}` }
  ];

  if (includeW) {
    categories.push({ value: 'W', label: `W - Over 75,000 lbs (Maximum)${loggingText} - ${formatCurrencyWeight(taxRates['W'])}` });
  }

  return categories;
};

function NewFilingContent() {
  console.log('[COMPONENT INIT] NewFilingContent function called');

  const { user } = useAuth();
  console.log('[COMPONENT INIT] useAuth completed', { hasUser: !!user });

  const router = useRouter();
  console.log('[COMPONENT INIT] useRouter completed');

  const searchParams = useSearchParams();
  const draftParam = searchParams.get('draft');
  const lastLoadedDraftIdRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filingId, setFilingId] = useState(null);

  console.log('[COMPONENT INIT] State initialized');

  const [error, setError] = useState('');
  const [draftId, setDraftId] = useState(null);
  const draftSavingRef = useRef(false);
  const [showDraftWarningModal, setShowDraftWarningModal] = useState(false);
  const [existingDraft, setExistingDraft] = useState(null);
  const [modalVehicles, setModalVehicles] = useState([]);
  const errorRef = useRef(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const loadingRef = useRef(false);
  const loadingDraftRef = useRef(false);
  const effectRunCounts = useRef({ draftLoad: 0, vehicleReload: 0, pricing: 0, loadData: 0 });
  const renderCount = useRef(0);

  // RESET logic when draftParam changes
  useEffect(() => {
    if (draftParam !== lastLoadedDraftIdRef.current) {
      console.log('[COMPONENT INIT] Draft param changed from', lastLoadedDraftIdRef.current, 'to', draftParam);
      setDataLoaded(false);
      setDraftId(null);
      setStep(1);
    }
  }, [draftParam]);

  // Track render count - defer to avoid blocking
  useEffect(() => {
    renderCount.current++;
    if (renderCount.current > 50) {
      console.warn('[RENDER] Component has rendered', renderCount.current, 'times! This might indicate an infinite loop.');
    }
  }, []); // Only run once on mount

  // Step 1: Filing Type
  const [filingType, setFilingType] = useState('standard'); // standard, amendment, refund

  // Step 2: Business
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [newBusiness, setNewBusiness] = useState({
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
  const [businessErrors, setBusinessErrors] = useState({});
  const [showBusinessForm, setShowBusinessForm] = useState(false);

  // Step 3: Vehicles
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([]);
  const [taxableDropdownOpen, setTaxableDropdownOpen] = useState(false);
  const [suspendedDropdownOpen, setSuspendedDropdownOpen] = useState(false);
  const [creditDropdownOpen, setCreditDropdownOpen] = useState(false);
  const [priorYearSoldDropdownOpen, setPriorYearSoldDropdownOpen] = useState(false);
  const [vehicleTypeError, setVehicleTypeError] = useState('');

  // Calculate vehicle categories by vehicleType
  const vehicleCategories = useMemo(() => {
    const isRefund = filingType === 'refund';
    const taxable = vehicles.filter(v => v.vehicleType === 'taxable' || (!v.vehicleType && !v.isSuspended));
    const suspended = vehicles.filter(v => v.vehicleType === 'suspended' || (v.vehicleType === undefined && v.isSuspended));
    const credit = vehicles.filter(v => v.vehicleType === 'credit');
    const priorYearSold = vehicles.filter(v => v.vehicleType === 'priorYearSold');
    return { isRefund, taxable, suspended, credit, priorYearSold };
  }, [vehicles, filingType]);

  // Validate vehicle type combinations
  const validateVehicleTypeCombination = (selectedIds) => {
    if (selectedIds.length === 0) return { isValid: true, error: '' };

    const selectedVehicles = vehicles.filter(v => selectedIds.includes(v.id));
    const hasTaxable = selectedVehicles.some(v => v.vehicleType === 'taxable' || (!v.vehicleType && !v.isSuspended));
    const hasSuspended = selectedVehicles.some(v => v.vehicleType === 'suspended' || (v.vehicleType === undefined && v.isSuspended));
    const hasCredit = selectedVehicles.some(v => v.vehicleType === 'credit');
    const hasPriorYearSold = selectedVehicles.some(v => v.vehicleType === 'priorYearSold');

    const typeCount = [hasTaxable, hasSuspended, hasCredit, hasPriorYearSold].filter(Boolean).length;

    // Valid combinations:
    // 1. All 4 types together
    if (hasTaxable && hasSuspended && hasCredit && hasPriorYearSold) {
      return { isValid: true, error: '' };
    }
    // 2. Only taxable
    if (hasTaxable && !hasSuspended && !hasCredit && !hasPriorYearSold) {
      return { isValid: true, error: '' };
    }
    // 3. Only suspended
    if (!hasTaxable && hasSuspended && !hasCredit && !hasPriorYearSold) {
      return { isValid: true, error: '' };
    }
    // 4. Taxable + suspended + credit
    if (hasTaxable && hasSuspended && hasCredit && !hasPriorYearSold) {
      return { isValid: true, error: '' };
    }
    // 5. Taxable + suspended + Prior year
    if (hasTaxable && hasSuspended && !hasCredit && hasPriorYearSold) {
      return { isValid: true, error: '' };
    }
    // 6. Taxable + credit
    if (hasTaxable && !hasSuspended && hasCredit && !hasPriorYearSold) {
      return { isValid: true, error: '' };
    }
    // 7. Taxable + suspended
    if (hasTaxable && hasSuspended && !hasCredit && !hasPriorYearSold) {
      return { isValid: true, error: '' };
    }
    // 8. Taxable + Prior year
    if (hasTaxable && !hasSuspended && !hasCredit && hasPriorYearSold) {
      return { isValid: true, error: '' };
    }
    // 9. Suspended + Prior year sold
    if (!hasTaxable && hasSuspended && !hasCredit && hasPriorYearSold) {
      return { isValid: true, error: '' };
    }

    // Invalid combination
    return {
      isValid: false,
      error: 'Invalid vehicle type combination. Valid combinations: All 4 types together, Only Taxable, Only Suspended, Taxable + Suspended + Credit, Taxable + Suspended + Prior Year, Taxable + Credit, Taxable + Suspended, Taxable + Prior Year, or Suspended + Prior Year Sold.'
    };
  };
  const [newVehicle, setNewVehicle] = useState({
    vin: '',
    vehicleType: 'taxable',
    logging: false,
    agricultural: false,
    grossWeightCategory: '',
    creditReason: '',
    creditDate: '',
    soldTo: '',
    soldDate: '',
    businessId: selectedBusinessId || ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [vehicleErrors, setVehicleErrors] = useState({});

  // Tax rate mappings (from vehicles page)
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

  const formatCurrencyLocal = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getWeightCategoryOptions = (isLogging) => {
    const taxRates = isLogging === true ? TAX_RATES_LOGGING : TAX_RATES_NON_LOGGING;
    const loggingText = isLogging === true ? ' (Logging)' : isLogging === false ? ' (Non-Logging)' : '';

    return [
      { value: 'A', label: `A - 55,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['A'])}` },
      { value: 'B', label: `B - 55,001 - 56,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['B'])}` },
      { value: 'C', label: `C - 56,001 - 57,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['C'])}` },
      { value: 'D', label: `D - 57,001 - 58,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['D'])}` },
      { value: 'E', label: `E - 58,001 - 59,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['E'])}` },
      { value: 'F', label: `F - 59,001 - 60,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['F'])}` },
      { value: 'G', label: `G - 60,001 - 61,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['G'])}` },
      { value: 'H', label: `H - 61,001 - 62,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['H'])}` },
      { value: 'I', label: `I - 62,001 - 63,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['I'])}` },
      { value: 'J', label: `J - 63,001 - 64,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['J'])}` },
      { value: 'K', label: `K - 64,001 - 65,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['K'])}` },
      { value: 'L', label: `L - 65,001 - 66,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['L'])}` },
      { value: 'M', label: `M - 66,001 - 67,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['M'])}` },
      { value: 'N', label: `N - 67,001 - 68,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['N'])}` },
      { value: 'O', label: `O - 68,001 - 69,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['O'])}` },
      { value: 'P', label: `P - 69,001 - 70,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['P'])}` },
      { value: 'Q', label: `Q - 70,001 - 71,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['Q'])}` },
      { value: 'R', label: `R - 71,001 - 72,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['R'])}` },
      { value: 'S', label: `S - 72,001 - 73,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['S'])}` },
      { value: 'T', label: `T - 73,001 - 74,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['T'])}` },
      { value: 'U', label: `U - 74,001 - 75,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['U'])}` },
      { value: 'V', label: `V - More than 75,000 lbs${loggingText} - ${formatCurrencyLocal(taxRates['V'])}` }
    ];
  };

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
    return `W - Over 75,000 lbs (Maximum)${loggingText} - ${formatCurrencyLocal(taxRates['W'])}`;
  };

  const getMinDateLocal = (type) => {
    if (type === 'credit') {
      return '2024-07-01';
    } else if (type === 'priorYearSold') {
      const lastYear = new Date();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      return lastYear.toISOString().split('T')[0];
    }
    return '';
  };

  const getMaxDateLocal = () => {
    return new Date().toISOString().split('T')[0];
  };

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
  // Duplicate filing detection removed - no longer used
  const [weightIncreaseData, setWeightIncreaseData] = useState({
    vehicleId: '',
    vin: '', // For manual VIN entry when vehicle doesn't exist
    originalWeightCategory: '',
    newWeightCategory: '',
    firstUsedMonth: '', // Month vehicle was first used in tax period (from original filing)
    amendedMonth: '', // Month when gross weight increased (renamed from increaseMonth)
    additionalTaxDue: 0,
    originalIsLogging: false, // Logging status for original weight category
    newIsLogging: false // Logging status for new weight category
  });
  const [weightIncreaseInputMode, setWeightIncreaseInputMode] = useState('select'); // 'select' or 'manual'
  const [mileageExceededData, setMileageExceededData] = useState({
    vehicleId: '',
    originalMileageLimit: 5000,
    actualMileageUsed: 0,
    exceededMonth: '',
    firstUsedMonth: '', // Month vehicle was first used in tax period (required for tax calculation per IRS)
    isAgriculturalVehicle: false
  });


  // Step 4: Documents
  const [documents, setDocuments] = useState([]);
  const [preUploadedDocuments, setPreUploadedDocuments] = useState([]); // URLs from AI extraction or previously saved drafts


  // Step 5: Review
  const [filingData, setFilingData] = useState({
    taxYear: '2025-2026',
    firstUsedMonth: 'July'
  });

  // Step 6: IRS Payment Method Selection
  const [irsPaymentMethod, setIrsPaymentMethod] = useState(''); // 'efw', 'eftps', 'credit_card', 'check'
  const [bankDetails, setBankDetails] = useState({
    routingNumber: '',
    accountNumber: '',
    confirmAccountNumber: '',
    accountType: '', // 'checking' or 'savings'
    phoneNumber: ''
  });
  const [bankDetailsErrors, setBankDetailsErrors] = useState({});

  // Step 6: Service Fee Payment (Platform Fee)
  const [serviceFeePaymentMethod, setServiceFeePaymentMethod] = useState(''); // 'credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'
  const [serviceFeePaid, setServiceFeePaid] = useState(false);
  const [serviceFeeProcessing, setServiceFeeProcessing] = useState(false);
  const [serviceFeePaymentDetails, setServiceFeePaymentDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    billingZipCode: ''
  });
  const [serviceFeeErrors, setServiceFeeErrors] = useState({});

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState(''); // 'percentage' or 'fixed'
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Pricing State (Fetched from Server)
  const [pricing, setPricing] = useState({
    totalTax: 0,
    serviceFee: 0,
    salesTax: 0,
    couponDiscount: 0,
    grandTotal: 0
  });
  const [pricingLoading, setPricingLoading] = useState(false);

  // Load draft if resuming
  useEffect(() => {
    effectRunCounts.current.draftLoad++;

    const loadDraft = async () => {
      // If no user or no draftParam, nothing to load from database
      if (!user || !draftParam) {
        if (!draftParam) setDataLoaded(true);
        return;
      }

      // If we've already loaded this specific draft, don't load it again
      if (lastLoadedDraftIdRef.current === draftParam && dataLoaded) {
        return;
      }

      console.log('[DRAFT LOAD] Proceeding with draft load for:', draftParam);
      loadingRef.current = true;
      loadingDraftRef.current = true;

      const startTime = performance.now();

      try {
        console.log('[DRAFT LOAD] Step 1: Loading businesses...');
        const businessesStart = performance.now();
        const userBusinesses = await getBusinessesByUser(user.uid);
        console.log('[DRAFT LOAD] Businesses loaded in', performance.now() - businessesStart, 'ms', { count: userBusinesses.length });
        setBusinesses(userBusinesses);

        console.log('[DRAFT LOAD] Step 2: Loading draft or filing...');
        const draftStart = performance.now();
        let draft = await getDraftFiling(draftParam);

        // If not found in draftFilings, check filings collection (for resumed payments)
        if (!draft) {
          console.log('[DRAFT LOAD] Not found in drafts, checking filings...');
          const { getFiling } = await import('@/lib/db');
          const filing = await getFiling(draftParam);
          if (filing && filing.userId === user.uid) {
            console.log('[DRAFT LOAD] Found in filings collection, converting to draft format');
            draft = {
              ...filing,
              draftId: draftParam, // Keep track of the original ID
              filingId: filing.id, // Explicitly set filingId
              selectedBusinessId: filing.businessId,
              selectedVehicleIds: filing.vehicleIds,
              filingData: {
                taxYear: filing.taxYear,
                firstUsedMonth: filing.firstUsedMonth
              },
              step: filing.status === 'pending_payment' ? 6 : 5 // Resume at payment or review
            };
          }
        }

        console.log('[DRAFT LOAD] Data loaded in', performance.now() - draftStart, 'ms', {
          found: !!draft,
          userIdMatch: draft?.userId === user.uid
        });

        if (draft && draft.userId === user.uid) {
          console.log('[DRAFT LOAD] Step 3: Restoring draft state...');
          const restoreStart = performance.now();

          // RESET all form state before restoring to prevent bleeding from previous attempts
          setFilingType('standard');
          setAmendmentType('');
          setSelectedBusinessId('');
          setSelectedVehicleIds([]);
          setFilingData({ taxYear: '2025-2026', firstUsedMonth: 'July' });
          setVinCorrectionData({ originalVIN: '', correctedVIN: '', originalFilingId: '' });
          setWeightIncreaseData({ vehicleId: '', vin: '', originalWeightCategory: '', newWeightCategory: '', firstUsedMonth: '', amendedMonth: '', additionalTaxDue: 0, originalIsLogging: false, newIsLogging: false });
          setMileageExceededData({ vehicleId: '', originalMileageLimit: 5000, actualMileageUsed: 0, exceededMonth: '', firstUsedMonth: '', isAgriculturalVehicle: false });
          setRefundDetails({});
          setPricing({ totalTax: 0, serviceFee: 0, salesTax: 0, couponDiscount: 0, grandTotal: 0 });

          // Restore draft state (non-UI critical first)
          if (draft.id) {
            console.log('[DRAFT LOAD] Setting draftId:', draft.id);
            setDraftId(draft.id);
          }
          if (draft.filingType) {
            console.log('[DRAFT LOAD] Setting filingType:', draft.filingType);
            setFilingType(draft.filingType);
          }
          if (draft.amendmentType) {
            console.log('[DRAFT LOAD] Setting amendmentType:', draft.amendmentType);
            setAmendmentType(draft.amendmentType);
          }
          if (draft.filingData) {
            console.log('[DRAFT LOAD] Setting filingData');
            setFilingData(draft.filingData);
          }
          if (draft.vinCorrectionData) {
            console.log('[DRAFT LOAD] Setting vinCorrectionData');
            setVinCorrectionData(draft.vinCorrectionData);
          }
          if (draft.weightIncreaseData) {
            console.log('[DRAFT LOAD] Setting weightIncreaseData');
            setWeightIncreaseData(draft.weightIncreaseData);
          }
          if (draft.mileageExceededData) {
            console.log('[DRAFT LOAD] Setting mileageExceededData');
            setMileageExceededData(draft.mileageExceededData);
          }
          if (draft.refundDetails) {
            console.log('[DRAFT LOAD] Setting refundDetails');
            setRefundDetails(draft.refundDetails);
          }
          if (draft.pricing) {
            console.log('[DRAFT LOAD] Setting pricing');
            setPricing(draft.pricing);
          }
          if (draft.filingId) {
            console.log('[DRAFT LOAD] Setting filingId:', draft.filingId);
            setFilingId(draft.filingId);
          }

          // Restore pre-uploaded documents (from AI flow or saved draft)
          if (draft.pdfUrl) {
            console.log('[DRAFT LOAD] Found pdfUrl in draft, adding to preUploadedDocuments');
            setPreUploadedDocuments([draft.pdfUrl]);
          } else if (draft.inputDocuments && Array.isArray(draft.inputDocuments)) {
            console.log('[DRAFT LOAD] Found inputDocuments in draft, setting preUploadedDocuments');
            setPreUploadedDocuments(draft.inputDocuments);
          }

          // Load vehicles BEFORE setting step to ensure UI has data
          if (draft.selectedBusinessId) {
            console.log('[DRAFT LOAD] Step 4: Loading vehicles for business:', draft.selectedBusinessId);
            const vehiclesStart = performance.now();
            try {
              const filteredVehicles = await getVehiclesByUser(user.uid, draft.selectedBusinessId);
              console.log('[DRAFT LOAD] Vehicles loaded in', performance.now() - vehiclesStart, 'ms', { count: filteredVehicles.length });
              setVehicles(filteredVehicles);

              // Set business and vehicle IDs AFTER vehicles are loaded into state
              console.log('[DRAFT LOAD] Setting selectedBusinessId:', draft.selectedBusinessId);
              setSelectedBusinessId(draft.selectedBusinessId);
              if (draft.selectedVehicleIds) {
                console.log('[DRAFT LOAD] Setting selectedVehicleIds:', draft.selectedVehicleIds.length, 'vehicles');
                setSelectedVehicleIds(draft.selectedVehicleIds);
              }
            } catch (error) {
              console.error('[DRAFT LOAD] Error loading vehicles for draft:', error);
              setSelectedBusinessId(draft.selectedBusinessId);
              if (draft.selectedVehicleIds) setSelectedVehicleIds(draft.selectedVehicleIds);
            }
          } else {
            console.log('[DRAFT LOAD] Step 4: Loading all vehicles (no business selected)');
            const vehiclesStart = performance.now();
            try {
              const allVehicles = await getVehiclesByUser(user.uid);
              console.log('[DRAFT LOAD] All vehicles loaded in', performance.now() - vehiclesStart, 'ms', { count: allVehicles.length });
              setVehicles(allVehicles);
              if (draft.selectedVehicleIds) {
                console.log('[DRAFT LOAD] Setting selectedVehicleIds:', draft.selectedVehicleIds.length, 'vehicles');
                setSelectedVehicleIds(draft.selectedVehicleIds);
              }
            } catch (error) {
              console.error('[DRAFT LOAD] Error loading vehicles for draft:', error);
              if (draft.selectedVehicleIds) setSelectedVehicleIds(draft.selectedVehicleIds);
            }
          }

          // FINALLY set the step after all dependencies are loaded
          if (draft.step) {
            const targetStep = draft.step === 4 ? 5 : draft.step;
            console.log('[DRAFT LOAD] Step 5: Setting step to', targetStep);
            setStep(targetStep);
          } else if (draft.selectedVehicleIds && draft.selectedVehicleIds.length > 0) {
            console.log('[DRAFT LOAD] Step 5: No step found in draft, but vehicles exist. Defaulting to Step 3.');
            setStep(3);
          } else if (draft.selectedBusinessId) {
            console.log('[DRAFT LOAD] Step 5: No step found in draft, but business exists. Defaulting to Step 2.');
            setStep(2);
          }

          console.log('[DRAFT LOAD] State restoration complete in', performance.now() - restoreStart, 'ms');

          // Mark data as loaded AFTER all state is restored to prevent cascading effects
          console.log('[DRAFT LOAD] Step 6: Setting dataLoaded = true');
          setDataLoaded(true);
          lastLoadedDraftIdRef.current = draftParam;
          console.log('[DRAFT LOAD] Total time:', performance.now() - startTime, 'ms');
        } else {
          console.log('[DRAFT LOAD] No draft found or userId mismatch');
          setDataLoaded(true);
          lastLoadedDraftIdRef.current = draftParam;
        }
      } catch (error) {
        console.error('[DRAFT LOAD] Error loading draft:', error);
        setDataLoaded(true); // Mark as loaded even on error to prevent retries
      } finally {
        console.log('[DRAFT LOAD] Clearing loadingRef');
        loadingRef.current = false;
        // Use setTimeout to clear loadingDraftRef after React has finished batching state updates
        setTimeout(() => {
          console.log('[DRAFT LOAD] Clearing loadingDraftRef');
          loadingDraftRef.current = false;
        }, 100);
      }
    };

    loadDraft();
  }, [user, draftParam]);

  // Auto-redirect from step 4 (Documents) to step 5 (Review) since step 4 is hidden
  useEffect(() => {
    if (step === 4) {
      setStep(5);
    }
  }, [step]);

  useEffect(() => {
    effectRunCounts.current.loadData++;
    console.log('[LOAD DATA] useEffect RUN #' + effectRunCounts.current.loadData, {
      hasUser: !!user,
      dataLoaded,
      loadingRef: loadingRef.current,
      draftParam
    });

    if (!user || dataLoaded || loadingRef.current) {
      console.log('[LOAD DATA] Early return');
      return;
    }

    // Don't load data if we're resuming a draft - draft loading will handle it
    if (draftParam) {
      console.log('[LOAD DATA] Skipping - draft param exists');
      // Don't mark as loaded yet - let draft loading handle it
      return;
    }

    console.log('[LOAD DATA] Starting loadData()');
    loadingRef.current = true;

    // Defer loadData to next tick to allow component to render first
    setTimeout(() => {
      loadData().then(() => {
        console.log('[LOAD DATA] loadData() completed');
        setDataLoaded(true);
        loadingRef.current = false;
      }).catch((error) => {
        console.error('[LOAD DATA] Error in loadData:', error);
        setDataLoaded(true);
        loadingRef.current = false;
      });
    }, 0);
  }, [user, dataLoaded, draftParam]);

  // Reload vehicles when business selection changes (but skip if we're loading a draft)
  useEffect(() => {
    effectRunCounts.current.vehicleReload++;
    console.log('[VEHICLE RELOAD] useEffect RUN #' + effectRunCounts.current.vehicleReload, {
      hasUser: !!user,
      dataLoaded,
      loadingRef: loadingRef.current,
      loadingDraftRef: loadingDraftRef.current,
      selectedBusinessId,
      currentVehiclesCount: vehicles.length
    });

    // Skip if we're currently loading a draft to prevent conflicts
    if (!user || loadingRef.current || loadingDraftRef.current) {
      console.log('[VEHICLE RELOAD] Early return - conditions not met');
      return;
    }

    // Skip if we're resuming a draft (draft loading handles vehicles)
    if (draftParam) {
      console.log('[VEHICLE RELOAD] Skipping - draft param exists');
      return;
    }

    // If dataLoaded is false, wait for initial load to complete
    if (!dataLoaded) {
      console.log('[VEHICLE RELOAD] Waiting for initial data load');
      return;
    }

    console.log('[VEHICLE RELOAD] Proceeding with vehicle reload');

    if (selectedBusinessId) {
      const reloadVehicles = async () => {
        try {
          const filteredVehicles = await getVehiclesByUser(user.uid, selectedBusinessId);
          console.log('[VEHICLE RELOAD] Loaded', filteredVehicles.length, 'vehicles for business:', selectedBusinessId);
          setVehicles(filteredVehicles);
          // Clear selected vehicles if they're not in the filtered list
          const filteredIds = filteredVehicles.map(v => v.id);
          setSelectedVehicleIds(prev => prev.filter(id => filteredIds.includes(id)));
        } catch (error) {
          console.error('Error reloading vehicles:', error);
        }
      };
      reloadVehicles();
    } else {
      // If no business selected, load all vehicles
      const reloadVehicles = async () => {
        try {
          const allVehicles = await getVehiclesByUser(user.uid);
          console.log('[VEHICLE RELOAD] Loaded', allVehicles.length, 'vehicles (all businesses)');
          setVehicles(allVehicles);
        } catch (error) {
          console.error('Error reloading vehicles:', error);
        }
      };
      reloadVehicles();
    }
  }, [selectedBusinessId, user, dataLoaded, draftParam, vehicles.length]);

  // Ensure vehicles are loaded when user reaches Step 3
  const step3LoadAttemptedRef = useRef(false);
  useEffect(() => {
    // Reset flag when step changes
    if (step !== 3) {
      step3LoadAttemptedRef.current = false;
      return;
    }

    if (step === 3 && user && !draftParam) {
      // If vehicles are already loaded, we're good
      if (vehicles.length > 0) {
        step3LoadAttemptedRef.current = false; // Reset for next time
        return;
      }

      // Prevent multiple simultaneous loads
      if (loadingRef.current || loadingDraftRef.current) {
        console.log('[STEP 3] Skipping - already loading');
        return;
      }

      // Prevent immediate retries
      if (step3LoadAttemptedRef.current) {
        console.log('[STEP 3] Already attempted load, waiting...');
        return;
      }

      console.log('[STEP 3] No vehicles found, loading vehicles...', {
        selectedBusinessId,
        dataLoaded,
        currentVehiclesCount: vehicles.length
      });
      step3LoadAttemptedRef.current = true;

      const loadVehiclesForStep3 = async () => {
        try {
          loadingRef.current = true;
          console.log('[STEP 3] Fetching vehicles...', { selectedBusinessId, userId: user.uid });

          const userVehicles = selectedBusinessId
            ? await getVehiclesByUser(user.uid, selectedBusinessId)
            : await getVehiclesByUser(user.uid);

          console.log('[STEP 3] Successfully loaded', userVehicles.length, 'vehicles for', selectedBusinessId || 'all businesses');

          if (userVehicles.length > 0) {
            setVehicles(userVehicles);
          } else {
            console.log('[STEP 3] No vehicles found in database');
          }

          // Also ensure businesses are loaded if not already
          if (businesses.length === 0) {
            console.log('[STEP 3] Loading businesses...');
            const userBusinesses = await getBusinessesByUser(user.uid);
            setBusinesses(userBusinesses);
          }
        } catch (error) {
          console.error('[STEP 3] Error loading vehicles:', error);
          step3LoadAttemptedRef.current = false; // Allow retry on error
        } finally {
          loadingRef.current = false;
          // Reset flag after a delay to allow retry if needed
          setTimeout(() => {
            step3LoadAttemptedRef.current = false;
          }, 3000);
        }
      };

      // Small delay to avoid race conditions with other effects
      const timeoutId = setTimeout(loadVehiclesForStep3, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [step, user, draftParam, vehicles.length, selectedBusinessId, businesses.length, dataLoaded]);

  // Scroll to top when error occurs
  useEffect(() => {
    // Check if any error exists
    const hasError = error ||
      vehicleTypeError ||
      Object.keys(businessErrors).length > 0 ||
      Object.keys(vehicleErrors).length > 0 ||
      Object.keys(bankDetailsErrors).length > 0;

    if (hasError && errorRef.current) {
      // Small delay to ensure error is rendered
      setTimeout(() => {
        const element = errorRef.current;
        if (element) {
          // Get the error message element (the actual visible error div)
          const errorMessage = element.querySelector('.bg-red-50, .text-red-700');
          const targetElement = errorMessage || element;

          // Calculate position accounting for current scroll position
          const elementTop = targetElement.getBoundingClientRect().top;
          const currentScrollY = window.scrollY || window.pageYOffset;
          const offset = 100; // Offset from top of viewport to account for any sticky headers

          // Scroll to position that puts error message near top of viewport
          const scrollPosition = currentScrollY + elementTop - offset;

          window.scrollTo({
            top: Math.max(0, scrollPosition), // Ensure we don't scroll to negative position
            behavior: 'smooth'
          });
        }
      }, 200);
    }
  }, [error, vehicleTypeError, businessErrors, vehicleErrors, bankDetailsErrors]);

  // Clear all errors when step changes and reset business form visibility
  useEffect(() => {
    setError('');
    setBusinessErrors({});
    setVehicleErrors({});
    setBankDetailsErrors({});
    setCouponError('');

    // Reset business form visibility when entering Step 2
    // This ensures existing businesses are shown first (unless there are no businesses)
    if (step === 2 && filingType !== 'amendment') {
      setShowBusinessForm(false);
    }
  }, [step, filingType]);

  // Load vehicles for modal when existingDraft is set
  useEffect(() => {
    const loadModalVehicles = async () => {
      if (!existingDraft || !user) return;

      const vehicleIds = existingDraft.selectedVehicleIds || existingDraft.vehicleIds || [];
      if (vehicleIds.length === 0) {
        setModalVehicles([]);
        return;
      }

      try {
        const vehiclePromises = vehicleIds.slice(0, 10).map(vehicleId => getVehicle(vehicleId));
        const loadedVehicles = await Promise.all(vehiclePromises);
        setModalVehicles(loadedVehicles.filter(v => v !== null));
      } catch (error) {
        console.error('Error loading vehicles for modal:', error);
        setModalVehicles([]);
      }
    };

    loadModalVehicles();
  }, [existingDraft, user]);

  // Check for existing drafts (only for Standard 2290)
  const handleNextFromStep1 = async () => {
    if (filingType === 'amendment' && !amendmentType) {
      setError('Please select the type of amendment you need: VIN Correction, Weight Increase, or Mileage Exceeded. Each amendment type has different requirements.');
      return;
    }

    setError('');

    // Only check for drafts/submitted filings if it's a Standard 2290 filing and no draft is currently active
    if (filingType === 'standard' && !draftParam) {
      try {
        setLoading(true);

        const recentFilings = await getFilingsByUser(user.uid);
        // Get all drafts (not just status 'draft') to check for any deletable drafts
        const allDrafts = await getAllDraftFilingsByUser(user.uid);

        // 1. FIRST PRIORITY: Check for deletable drafts/filings (NOT processing/completed/submitted)
        // These are drafts that can be deleted when starting a new filing
        // Check filings collection for deletable statuses (pending_payment, draft, awaiting_schedule_1)
        // Note: 'submitted' status means already submitted to IRS, so it's not deletable
        const deletableFiling = recentFilings.find(f =>
          f.filingType === 'standard' &&
          f.status !== 'processing' &&
          f.status !== 'completed' &&
          f.status !== 'submitted' &&
          (f.status === 'pending_payment' || f.status === 'awaiting_schedule_1' || f.status === 'draft')
        );

        // Check drafts collection for deletable drafts (exclude processing/completed)
        // Also exclude drafts that have been paid (step 5+) or have a filingId (promoted to filing)
        const deletableDrafts = allDrafts.filter(d => {
          // Skip if not standard filing type
          if (d.filingType !== 'standard') return false;

          // Skip if no business selected (not significant progress)
          if (!d.selectedBusinessId && !d.businessId) return false;

          // Skip if status is processing/completed/submitted
          if (d.status === 'processing' || d.status === 'completed' || d.status === 'submitted') return false;

          // Skip if draft has a filingId (it was promoted to a filing, check filings collection instead)
          if (d.filingId) return false;

          // Skip if draft is at step 5 or higher (payment completed)
          if (d.step >= 5) return false;

          return true;
        });

        // Prioritize filing over draft if both exist
        const deletableDraft = deletableFiling || (deletableDrafts.length > 0 ? deletableDrafts[0] : null);

        if (deletableDraft) {
          // Verify the draft/filing still exists before showing modal (in case it was deleted)
          let verifiedDraft = null;

          if (deletableFiling) {
            // Verify filing still exists
            verifiedDraft = await getFiling(deletableDraft.id);
            if (!verifiedDraft) {
              console.log('[DRAFT CHECK] Deletable filing was deleted, skipping modal');
              // Continue to step 2
              setStep(2);
              setLoading(false);
              return;
            }
          } else {
            // Verify draft still exists
            verifiedDraft = await getDraftFiling(deletableDraft.id || deletableDraft.draftId);
            if (!verifiedDraft) {
              console.log('[DRAFT CHECK] Deletable draft was deleted, skipping modal');
              // Continue to step 2
              setStep(2);
              setLoading(false);
              return;
            }
          }

          // Check if this draft should actually be treated as processing/completed
          // (has filingId or is at step 5+)
          const isActuallyProcessing = verifiedDraft.filingId || verifiedDraft.step >= 5;

          if (isActuallyProcessing) {
            // Treat as processing/completed, don't mark as deletable
            console.log('[DRAFT CHECK] Draft has been paid (step 5+ or has filingId), treating as processing:', verifiedDraft.id);
            setExistingDraft({
              ...verifiedDraft,
              isSubmitted: true,
              isProcessingOrCompleted: true
            });
          } else {
            console.log('[DRAFT CHECK] Found deletable draft/filing:', verifiedDraft.id, verifiedDraft.status);
            setExistingDraft({
              ...verifiedDraft,
              isSubmitted: deletableFiling ? true : false, // Filings are "submitted", drafts are not
              isDeletable: true, // Flag to indicate this can be deleted
              isFromFilingsCollection: !!deletableFiling // Flag to track which collection it came from
            });
          }
          setShowDraftWarningModal(true);
          setLoading(false);
          return;
        }

        // 2. SECOND PRIORITY: Only if no deletable drafts exist, check for Processing/Completed/Submitted filings
        // These cannot be deleted, only viewed (they've been paid and are being processed)
        const processingOrCompletedFiling = recentFilings.find(f =>
          f.filingType === 'standard' &&
          (f.status === 'processing' || f.status === 'completed' || f.status === 'submitted')
        );

        // Also check drafts that have been paid (step 5+) or have filingId (promoted to filing)
        const processingOrCompletedDraft = allDrafts.find(d => {
          if (d.filingType !== 'standard') return false;

          // Check by status
          if (d.status === 'processing' || d.status === 'completed' || d.status === 'submitted') return true;

          // Check if draft has filingId (promoted to filing)
          if (d.filingId) return true;

          // Check if draft is at step 5 or higher (payment completed)
          if (d.step >= 5) return true;

          return false;
        });

        const processingOrCompleted = processingOrCompletedFiling || processingOrCompletedDraft;

        if (processingOrCompleted) {
          // Verify the filing/draft still exists before showing modal (in case it was deleted)
          let verifiedProcessing = null;

          if (processingOrCompletedFiling) {
            // Verify filing still exists
            verifiedProcessing = await getFiling(processingOrCompleted.id);
            if (!verifiedProcessing) {
              console.log('[DRAFT CHECK] Processing filing was deleted, skipping modal');
              // Continue to step 2
              setStep(2);
              setLoading(false);
              return;
            }
          } else {
            // Verify draft still exists
            verifiedProcessing = await getDraftFiling(processingOrCompleted.id || processingOrCompleted.draftId);
            if (!verifiedProcessing) {
              console.log('[DRAFT CHECK] Processing draft was deleted, skipping modal');
              // Continue to step 2
              setLoading(false);
              setStep(2);
              return;
            }
          }

          console.log('[DRAFT CHECK] Found Processing/Completed/Submitted filing/draft:', verifiedProcessing.id, verifiedProcessing.status);
          setExistingDraft({
            ...verifiedProcessing,
            isSubmitted: true,
            isProcessingOrCompleted: true // Flag to indicate this blocks new filing creation and has been paid
          });
          setShowDraftWarningModal(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error checking for existing drafts/filings:', error);
      } finally {
        setLoading(false);
      }
    }

    // If not standard, or no drafts/filings found, proceed to step 2
    setStep(2);
  };

  // Fetch Pricing from Server - Now runs on all steps for real-time pricing
  useEffect(() => {
    effectRunCounts.current.pricing++;
    console.log('[PRICING] useEffect RUN #' + effectRunCounts.current.pricing, {
      loadingRef: loadingRef.current,
      loadingDraftRef: loadingDraftRef.current,
      dataLoaded,
      filingType,
      selectedVehicleIds: selectedVehicleIds.length,
      step
    });

    // Skip pricing calculation if we're loading a draft or data isn't loaded yet
    if (loadingRef.current || loadingDraftRef.current || !dataLoaded) {
      console.log('[PRICING] Early return - conditions not met');
      return;
    }

    console.log('[PRICING] Proceeding with pricing calculation');

    const fetchPricing = async () => {
      // Calculate pricing when we have minimum data (filing type and at least one vehicle selected)
      // Exception: VIN corrections and mileage exceeded don't require vehicles in selectedVehicleIds, so allow pricing calculation
      const isVinCorrection = filingType === 'amendment' && amendmentType === 'vin_correction';
      const isMileageExceeded = filingType === 'amendment' && amendmentType === 'mileage_exceeded';
      const hasMileageExceededVehicle = isMileageExceeded && mileageExceededData?.vehicleId;

      if (!filingType || (selectedVehicleIds.length === 0 && !isVinCorrection && !hasMileageExceededVehicle)) {
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
              amendedMonth: weightIncreaseData.amendedMonth,
              firstUsedMonth: weightIncreaseData.firstUsedMonth,
              originalIsLogging: weightIncreaseData.originalIsLogging || false,
              newIsLogging: weightIncreaseData.newIsLogging || false
            };
          } else if (amendmentType === 'mileage_exceeded') {
            // For mileage exceeded amendments, IRS requires tax calculation based on:
            // "the month the vehicle was first used in the tax period" (from original filing)
            // See IRS Form 2290 Instructions (Rev. July 2025), page 7
            const vehicle = vehicles.find(v => v.id === mileageExceededData.vehicleId);

            // Use firstUsedMonth from user input (they provide it from their original filing)
            // If not provided, try to use from current filing data, otherwise default to 'July'
            const firstUsedMonth = mileageExceededData.firstUsedMonth || filingData.firstUsedMonth || 'July';

            amendmentDataForPricing = {
              vehicleCategory: vehicle?.grossWeightCategory || '',
              firstUsedMonth: firstUsedMonth,
              isLogging: vehicle?.logging === true
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
        // Include vehicleType, logging, and creditDate for proper tax calculation
        // For VIN corrections and mileage exceeded, vehicles array can be empty
        const sanitizedVehicles = selectedVehiclesList.length > 0
          ? selectedVehiclesList.map(v => ({
            id: v.id,
            vin: v.vin,
            grossWeightCategory: v.grossWeightCategory,
            isSuspended: v.isSuspended || false,
            vehicleType: v.vehicleType || (v.isSuspended ? 'suspended' : 'taxable'),
            logging: v.logging !== undefined ? v.logging : null,
            creditDate: v.creditDate || null // Include creditDate for credit vehicle proration
          }))
          : []; // Empty array for VIN corrections and mileage exceeded with no vehicles

        const result = await calculateFilingCost(
          filingDataForPricing,
          sanitizedVehicles,
          { state } // Pass state for tax calc
        );

        if (result.success) {
          console.log('Pricing calculation result for mileage exceeded:', {
            amendmentType,
            serviceFee: result.breakdown.serviceFee,
            totalTax: result.breakdown.totalTax,
            salesTax: result.breakdown.salesTax
          });
          setPricing(result.breakdown);
        } else {
          console.error('Pricing calculation failed:', result.error);
          // For mileage exceeded amendments, set default $10 service fee
          if (filingType === 'amendment' && amendmentType === 'mileage_exceeded') {
            setPricing({
              totalTax: 0,
              serviceFee: 10.00,
              salesTax: 0,
              grandTotal: 10.00,
              totalRefund: 0
            });
          }
        }
      } catch (err) {
        console.error('Pricing fetch error:', err);
      } finally {
        setPricingLoading(false);
      }
    };

    fetchPricing();
  }, [step, selectedVehicleIds, filingType, filingData.firstUsedMonth, filingData, vehicles, selectedBusinessId, businesses, amendmentType, weightIncreaseData, mileageExceededData, dataLoaded]);

  // Validate vehicle type combinations whenever vehicles or selectedVehicleIds change
  useEffect(() => {
    if (selectedVehicleIds.length === 0) {
      setVehicleTypeError('');
      return;
    }

    // Only validate if all selected vehicle IDs exist in the vehicles array (to avoid race conditions)
    const allVehiclesExist = selectedVehicleIds.every(id => vehicles.some(v => v.id === id));
    if (!allVehiclesExist) {
      return; // Wait for all vehicles to be loaded
    }

    const validation = validateVehicleTypeCombination(selectedVehicleIds);
    if (!validation.isValid) {
      setVehicleTypeError(validation.error);
    } else {
      setVehicleTypeError('');
    }
  }, [vehicles, selectedVehicleIds]);

  // Duplicate Detection: DISABLED - No longer checking for duplicate filings
  // Removed duplicate filing detection functionality as requested

  // Auto-save draft as user progresses
  useEffect(() => {
    const saveDraft = async () => {
      // Don't save if no user, already saving, or currently loading a draft
      if (!user || draftSavingRef.current || loadingDraftRef.current) {
        return;
      }

      // Drafts are ONLY for Standard 2290 filings
      // Amendments and Refunds do not need drafting/resuming per user request
      if (filingType !== 'standard') return;

      // Only save draft once we have a business, at least one vehicle, and are on Step 3 or later
      // This ensures we only draft filings that have significant progress (2290 only)
      const hasMinimumData = selectedBusinessId && selectedVehicleIds.length > 0;
      if (step < 3 || !hasMinimumData) {
        return;
      }

      draftSavingRef.current = true;
      try {
        // If we don't have a draftId, check if an identical draft already exists
        // to prevent creating redundant draft documents (same business + same vehicles)
        if (!draftId) {
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
              console.log('[DRAFT] Found matching existing draft, linking to ID:', duplicateDraft.id);
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
          workflowType: 'manual',
          step,
          filingType,
          selectedBusinessId,
          selectedVehicleIds,
          filingData,
          taxYear: filingData.taxYear, // Explicitly save taxYear for dashboard display
          amendmentType: filingType === 'amendment' ? amendmentType : null,
          vinCorrectionData: filingType === 'amendment' && amendmentType === 'vin_correction' ? vinCorrectionData : null,
          weightIncreaseData: filingType === 'amendment' && amendmentType === 'weight_increase' ? weightIncreaseData : null,
          mileageExceededData: filingType === 'amendment' && amendmentType === 'mileage_exceeded' ? mileageExceededData : null,
          refundDetails: filingType === 'refund' ? refundDetails : null,
          pricing: pricing.grandTotal > 0 ? pricing : null
        };

        console.log('Saving draft filing for manual workflow, step:', step, 'filingType:', filingType, 'id:', draftId);
        const savedDraftId = await saveDraftFiling(user.uid, draftData);
        if (!draftId) {
          console.log('[DRAFT] Created new draft with ID:', savedDraftId);
          setDraftId(savedDraftId);
        } else {
          console.log('[DRAFT] Updated existing draft:', draftId);
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
      // Load vehicles filtered by selected business if one is selected
      const userVehicles = selectedBusinessId
        ? await getVehiclesByUser(user.uid, selectedBusinessId)
        : await getVehiclesByUser(user.uid);
      setBusinesses(userBusinesses);
      setVehicles(userVehicles);

      // Load previous filings for VIN correction dropdown - defer to prevent blocking
      setTimeout(async () => {
        try {
          const filings = await getFilingsByUser(user.uid);
          setPreviousFilings(filings);

          // Extract unique VINs from previous filings (completed filings only)
          // Defer this heavy operation to prevent blocking - load VINs asynchronously
          const completedFilings = filings.filter(f => f.status === 'completed');

          // Load VINs asynchronously in the background to prevent blocking
          setTimeout(async () => {
            try {
              const vinMap = new Map(); // Map VIN -> { filingId, vehicleId }

              // Collect all unique vehicle IDs first
              const vehicleIdsSet = new Set();
              for (const filing of completedFilings) {
                if (filing.vehicleIds && filing.vehicleIds.length > 0) {
                  filing.vehicleIds.forEach(id => vehicleIdsSet.add(id));
                }
              }

              // Load vehicles in parallel (limit to prevent blocking)
              const vehicleIdsArray = Array.from(vehicleIdsSet).slice(0, 50); // Limit to 50 vehicles max
              const vehiclePromises = vehicleIdsArray.map(async (vehicleId) => {
                try {
                  const vehicle = await getVehicle(vehicleId);
                  return { vehicleId, vehicle };
                } catch (err) {
                  console.error(`Error loading vehicle ${vehicleId}:`, err);
                  return { vehicleId, vehicle: null };
                }
              });

              // Wait for all vehicle loads to complete in parallel
              const vehicleResults = await Promise.all(vehiclePromises);

              // Map vehicles back to their filings
              const vehicleMap = new Map(vehicleResults.map(r => [r.vehicleId, r.vehicle]));

              // Build VIN map
              for (const filing of completedFilings) {
                if (filing.vehicleIds && filing.vehicleIds.length > 0) {
                  for (const vehicleId of filing.vehicleIds) {
                    const vehicle = vehicleMap.get(vehicleId);
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
                  }
                }
              }

              setPreviousFilingsVINs(Array.from(vinMap.values()).sort((a, b) => {
                // Sort by most recent filing date first
                if (!a.filingDate || !b.filingDate) return 0;
                return new Date(b.filingDate) - new Date(a.filingDate);
              }));
            } catch (error) {
              console.error('Error loading VINs:', error);
            }
          }, 200); // Additional delay for VIN loading
        } catch (error) {
          console.error('Error loading filings:', error);
        }
      }, 100); // Small delay to let the page render first
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleBusinessChange = (field, value) => {
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

    setNewBusiness(prev => ({ ...prev, [field]: formattedValue }));

    // Real-time validation
    let validation;
    if (field === 'businessName') validation = validateBusinessName(formattedValue);
    if (field === 'ein') validation = validateEIN(formattedValue);
    if (field === 'address') validation = validateAddress(formattedValue, true); // Required
    if (field === 'city') validation = validateCity(formattedValue, true); // Required
    if (field === 'state') validation = validateState(formattedValue, true); // Required
    if (field === 'zip') validation = validateZip(formattedValue, true); // Required
    if (field === 'country') validation = validateCountry(formattedValue, true); // Required
    if (field === 'phone') validation = validatePhone(formattedValue, true); // Required
    if (field === 'signingAuthorityName') {
      validation = formattedValue && formattedValue.trim().length >= 2
        ? { isValid: true, error: '' }
        : { isValid: false, error: 'Signing Authority Name is required and must be at least 2 characters' };
    }
    if (field === 'signingAuthorityPhone') validation = validatePhone(formattedValue, true); // Required
    if (field === 'signingAuthorityPIN') validation = validatePIN(formattedValue, true); // Required
    if (field === 'thirdPartyDesigneeName') {
      validation = newBusiness.hasThirdPartyDesignee
        ? (formattedValue && formattedValue.trim().length >= 2
          ? { isValid: true, error: '' }
          : { isValid: false, error: 'Third Party Designee Name is required and must be at least 2 characters' })
        : { isValid: true, error: '' };
    }
    if (field === 'thirdPartyDesigneePhone') validation = validatePhone(formattedValue, newBusiness.hasThirdPartyDesignee); // Required if Third Party Designee is Yes
    if (field === 'thirdPartyDesigneePIN') validation = validatePIN(formattedValue, newBusiness.hasThirdPartyDesignee); // Required if Third Party Designee is Yes

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
    const addrVal = validateAddress(newBusiness.address, true); // Required
    const cityVal = validateCity(newBusiness.city, true); // Required
    const stateVal = validateState(newBusiness.state, true); // Required
    const zipVal = validateZip(newBusiness.zip, true); // Required
    const countryVal = validateCountry(newBusiness.country, true); // Required
    const phoneVal = validatePhone(newBusiness.phone, true); // Required
    // Validate signing authority name (required, but simpler than business name)
    const signingAuthorityNameVal = newBusiness.signingAuthorityName && newBusiness.signingAuthorityName.trim().length >= 2
      ? { isValid: true, error: '' }
      : { isValid: false, error: 'Signing Authority Name is required and must be at least 2 characters' };
    const signingAuthorityPhoneVal = validatePhone(newBusiness.signingAuthorityPhone, true); // Required
    const signingAuthorityPINVal = validatePIN(newBusiness.signingAuthorityPIN, true); // Required
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
      // Create a detailed error message listing all issues
      const errorFields = [];
      if (!nameVal.isValid) errorFields.push('Business Name');
      if (!einVal.isValid) errorFields.push('EIN');
      if (!addrVal.isValid) errorFields.push('Business Address');
      if (!cityVal.isValid) errorFields.push('City');
      if (!stateVal.isValid) errorFields.push('State');
      if (!zipVal.isValid) errorFields.push('ZIP Code');
      if (!countryVal.isValid) errorFields.push('Country');
      if (!phoneVal.isValid) errorFields.push('Phone Number');
      if (!signingAuthorityNameVal.isValid) errorFields.push('Signing Authority Name');
      if (!signingAuthorityPhoneVal.isValid) errorFields.push('Signing Authority Phone');
      if (!signingAuthorityPINVal.isValid) errorFields.push('Signing Authority PIN');
      if (newBusiness.hasThirdPartyDesignee) {
        if (!thirdPartyDesigneeNameVal.isValid) errorFields.push('Third Party Designee Name');
        if (!thirdPartyDesigneePhoneVal.isValid) errorFields.push('Third Party Designee Phone');
        if (!thirdPartyDesigneePINVal.isValid) errorFields.push('Third Party Designee PIN');
      }

      setError(`Please correct the following required fields: ${errorFields.join(', ')}. All fields marked with an asterisk (*) are required.`);
      return false; // Return false to indicate failure
    }

    setLoading(true);
    try {
      const businessId = await createBusiness(user.uid, newBusiness);
      // Only reload businesses and vehicles, skip heavy VIN loading
      const userBusinesses = await getBusinessesByUser(user.uid);
      const userVehicles = selectedBusinessId
        ? await getVehiclesByUser(user.uid, selectedBusinessId)
        : await getVehiclesByUser(user.uid);
      setBusinesses(userBusinesses);
      setVehicles(userVehicles);
      setSelectedBusinessId(businessId);
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
      setBusinessErrors({});
      setError('');
      return true; // Return true to indicate success
    } catch (error) {
      setError('Unable to save business information. Please check your internet connection and try again. If the problem persists, contact support.');
      return false; // Return false to indicate failure
    } finally {
      setLoading(false);
    }
  };


  const handleAddVehicle = async (vehicleData) => {
    setLoading(true);
    setError('');
    setVehicleErrors({});

    try {
      const vinToSave = vehicleData.vin.toUpperCase().trim();

      // Create vehicle in database
      const vehicleId = await createVehicle(user.uid, {
        vin: vinToSave,
        businessId: vehicleData.businessId,
        vehicleType: vehicleData.vehicleType,
        logging: vehicleData.vehicleType === 'taxable' || vehicleData.vehicleType === 'credit' || vehicleData.vehicleType === 'suspended' ? vehicleData.logging : null,
        agricultural: vehicleData.vehicleType === 'suspended' ? vehicleData.agricultural : null,
        grossWeightCategory: vehicleData.vehicleType === 'suspended' ? 'W' : vehicleData.grossWeightCategory,
        isSuspended: vehicleData.vehicleType === 'suspended',
        creditReason: vehicleData.vehicleType === 'credit' ? vehicleData.creditReason : null,
        creditDate: vehicleData.vehicleType === 'credit' ? vehicleData.creditDate : null,
        soldTo: vehicleData.vehicleType === 'priorYearSold' ? vehicleData.soldTo : null,
        soldDate: vehicleData.vehicleType === 'priorYearSold' ? vehicleData.soldDate : null
      });

      console.log('Vehicle created with ID:', vehicleId);

      // Reload vehicles from database to get the new vehicle (skip heavy VIN loading)
      const userVehicles = selectedBusinessId
        ? await getVehiclesByUser(user.uid, selectedBusinessId)
        : await getVehiclesByUser(user.uid);
      setVehicles(userVehicles);

      // Add the new vehicle to selected vehicles (validation will happen in useEffect)
      setSelectedVehicleIds(prev => {
        if (prev.includes(vehicleId)) return prev;
        return [...prev, vehicleId];
      });

      setShowAddModal(false);
      return true;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      const errorMessage = error.message || 'Unknown error';
      setError(`Unable to save vehicle information: ${errorMessage}. Please verify the VIN is correct and try again.`);
      setVehicleErrors({ general: `Save failed: ${errorMessage}` });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Please upload only PDF files. Accepted formats: .pdf files only.');
      return;
    }

    setLoading(true);
    try {
      // We'll upload after filing is created, store file for now
      setDocuments([...documents, file]);
      setError('');
    } catch (error) {
      setError('Unable to upload document. Please check your internet connection and file size (max 10MB), then try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceFeePayment = async () => {
    setServiceFeeProcessing(true);
    setServiceFeeErrors({});
    setError('');

    try {
      // Validate payment details
      const errors = {};

      if (!serviceFeePaymentDetails.cardHolderName || serviceFeePaymentDetails.cardHolderName.trim().length < 2) {
        errors.cardHolderName = 'Cardholder name is required and must be at least 2 characters';
      }

      if (!serviceFeePaymentDetails.cardNumber || serviceFeePaymentDetails.cardNumber.replace(/\D/g, '').length < 13) {
        errors.cardNumber = 'Valid card number is required (13-16 digits)';
      }

      if (!serviceFeePaymentDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(serviceFeePaymentDetails.expiryDate)) {
        errors.expiryDate = 'Valid expiry date is required (MM/YY format)';
      } else {
        const [month, year] = serviceFeePaymentDetails.expiryDate.split('/');
        const expiryMonth = parseInt(month, 10);
        const expiryYear = parseInt('20' + year, 10);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (expiryMonth < 1 || expiryMonth > 12) {
          errors.expiryDate = 'Invalid month (must be 01-12)';
        } else if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
          errors.expiryDate = 'Card has expired';
        }
      }

      if (!serviceFeePaymentDetails.cvv || serviceFeePaymentDetails.cvv.length < 3) {
        errors.cvv = 'Valid CVV is required (3-4 digits)';
      }

      if (!serviceFeePaymentDetails.billingZipCode || serviceFeePaymentDetails.billingZipCode.length !== 5) {
        errors.billingZipCode = 'Valid 5-digit ZIP code is required';
      }

      if (Object.keys(errors).length > 0) {
        setServiceFeeErrors(errors);
        setServiceFeeProcessing(false);
        return;
      }

      // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark payment as paid
      setServiceFeePaid(true);
      setError('');

      // Clear payment details for security (in production, never store full card details)
      setServiceFeePaymentDetails({
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: '',
        billingZipCode: ''
      });

    } catch (error) {
      console.error('Service fee payment error:', error);
      setError('Payment processing failed. Please check your payment details and try again. If the problem persists, contact support.');
      setServiceFeeProcessing(false);
    }
  };

  const initiatePaymentFlow = async () => {
    setLoading(true);
    setError('');

    try {
      // Logic from handleSubmit to prepare data
      let businessIdToUse = selectedBusinessId;
      let vehicleIdsToUse = selectedVehicleIds;

      if (filingType === 'amendment') {
        let vehicleIdForAmendment = null;
        if (amendmentType === 'weight_increase' && weightIncreaseData.vehicleId) {
          vehicleIdForAmendment = weightIncreaseData.vehicleId;
        } else if (amendmentType === 'mileage_exceeded' && mileageExceededData.vehicleId) {
          vehicleIdForAmendment = mileageExceededData.vehicleId;
        }

        if (!businessIdToUse && vehicleIdForAmendment) {
          const previousFilings = await getFilingsByUser(user.uid);
          const filingWithVehicle = previousFilings.find(filing =>
            filing.vehicleIds && filing.vehicleIds.includes(vehicleIdForAmendment) && filing.businessId
          );
          if (filingWithVehicle && filingWithVehicle.businessId) {
            businessIdToUse = filingWithVehicle.businessId;
          } else if (businesses.length > 0) {
            businessIdToUse = businesses[0].id;
          }
        } else if (!businessIdToUse && businesses.length > 0) {
          businessIdToUse = businesses[0].id;
        }

        if (vehicleIdForAmendment && !vehicleIdsToUse.includes(vehicleIdForAmendment)) {
          vehicleIdsToUse = [vehicleIdForAmendment];
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
              vehicleId: weightIncreaseData.vehicleId || null,
              vin: weightIncreaseData.vin || null, // VIN if manually entered
              originalWeightCategory: weightIncreaseData.originalWeightCategory,
              newWeightCategory: weightIncreaseData.newWeightCategory,
              amendedMonth: weightIncreaseData.amendedMonth,
              firstUsedMonth: weightIncreaseData.firstUsedMonth,
              additionalTaxDue: weightIncreaseData.additionalTaxDue,
              originalIsLogging: weightIncreaseData.originalIsLogging || false,
              newIsLogging: weightIncreaseData.newIsLogging || false
            }
          };
          // Calculate due date (last day of following month)
          amendmentDueDate = calculateWeightIncreaseDueDate(weightIncreaseData.amendedMonth);
        } else if (amendmentType === 'mileage_exceeded') {
          amendmentDetails = {
            mileageExceeded: {
              vehicleId: mileageExceededData.vehicleId,
              originalMileageLimit: mileageExceededData.originalMileageLimit,
              actualMileageUsed: mileageExceededData.actualMileageUsed,
              exceededMonth: mileageExceededData.exceededMonth,
              firstUsedMonth: mileageExceededData.firstUsedMonth,
              isAgriculturalVehicle: mileageExceededData.isAgriculturalVehicle
            }
          };
        }
      }


      const filingPayload = {
        userId: user.uid,
        businessId: businessIdToUse,
        vehicleIds: vehicleIdsToUse,
        taxYear: filingData.taxYear,
        firstUsedMonth: filingData.firstUsedMonth,
        filingType: filingType,
        amendmentType: filingType === 'amendment' ? amendmentType : null,
        amendmentDetails: filingType === 'amendment' ? amendmentDetails : {},
        amendmentDueDate: amendmentDueDate,
        refundDetails: filingType === 'refund' ? refundDetails : {},
        inputDocuments: [],
        pricing: pricing,
        status: 'pending_payment',
        paymentStatus: 'pending',
        draftId: draftId, // Link to the draft to prevent duplicates on dashboard
        updatedAt: new Date().toISOString()
      };

      // Always use existing filingId if available to prevent duplicates
      let finalFId = filingId;
      if (finalFId) {
        const { updateFiling } = await import('@/lib/db');
        await updateFiling(finalFId, filingPayload);
      } else {
        // Only create new filing if one doesn't exist
        filingPayload.createdAt = new Date().toISOString();
        finalFId = await createFiling(filingPayload);
        setFilingId(finalFId); // Save to state immediately
      }

      setStep(6);

      // Save draft with the filing ID Link to prevent duplicates on reload
      if (user) {
        try {
          await saveDraftFiling(user.uid, {
            draftId: draftId,
            step: 6,
            filingType: filingType,
            selectedBusinessId: selectedBusinessId,
            selectedVehicleIds: selectedVehicleIds,
            filingData: filingData,
            amendmentType: amendmentType,
            vinCorrectionData: vinCorrectionData,
            weightIncreaseData: weightIncreaseData,
            mileageExceededData: mileageExceededData,
            refundDetails: refundDetails,
            pricing: pricing,
            filingId: finalFId
          });
        } catch (error) {
          console.error('Error saving draft with filing ID:', error);
        }
      }
    } catch (error) {
      console.error('Error initiating payment flow:', error);
      setError('Failed to prepare your filing. Please try again.');
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
        const filingTypeLabel = filingType === 'amendment' ? 'amendment' : filingType === 'refund' ? 'refund' : 'filing';
        setError(`Business information is required to submit your ${filingTypeLabel}. Please go back to Step 2 and select an existing business or create a new one.`);
        setLoading(false);
        return;
      }

      // Validate vehicle selection for non-amendments
      if (vehicleIdsToUse.length === 0 && filingType !== 'amendment') {
        const filingTypeLabel = filingType === 'refund' ? 'refund claim' : 'filing';
        setError(`To submit your ${filingTypeLabel}, you must select or add at least one vehicle. Please go back to Step 3 and select vehicles to include.`);
        setLoading(false);
        return;
      }

      // Validate IRS payment method selection (Step 6) - only required if there's tax due
      const totalTaxDue = pricing?.totalTax || 0;
      if (!irsPaymentMethod && totalTaxDue > 0) {
        setError('Please select an IRS payment method for the tax amount. This is required to submit your filing to the IRS.');
        setLoading(false);
        return;
      }

      // Validate service fee payment (Step 6)
      if (!serviceFeePaid) {
        setError('Service fee payment is required before submitting your filing. Please complete the service fee payment in Section 2 above.');
        setLoading(false);
        return;
      }

      // Validate bank details if EFW is selected (only if there's tax due)
      if (irsPaymentMethod === 'efw' && totalTaxDue > 0) {
        if (!bankDetails.routingNumber || !bankDetails.accountNumber || !bankDetails.confirmAccountNumber || !bankDetails.accountType || !bankDetails.phoneNumber) {
          const missingFields = [];
          if (!bankDetails.routingNumber) missingFields.push('Routing Number');
          if (!bankDetails.accountNumber) missingFields.push('Account Number');
          if (!bankDetails.confirmAccountNumber) missingFields.push('Confirm Account Number');
          if (!bankDetails.accountType) missingFields.push('Account Type');
          if (!bankDetails.phoneNumber) missingFields.push('Phone Number');
          setError(`Please complete all required bank account fields for Electronic Funds Withdrawal: ${missingFields.join(', ')}. All fields are required for direct debit payment.`);
          setLoading(false);
          return;
        }
        if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
          setBankDetailsErrors({ confirmAccountNumber: 'Account numbers do not match' });
          setError('Account number confirmation failed. The account number and confirmation account number must match exactly. Please verify and re-enter.');
          setLoading(false);
          return;
        }
        // Validate phone number with improved US phone validation
        const phoneVal = validatePhone(bankDetails.phoneNumber, true);
        if (!phoneVal.isValid) {
          setBankDetailsErrors({ phoneNumber: phoneVal.error });
          setError(phoneVal.error);
          setLoading(false);
          return;
        }
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
              vehicleId: weightIncreaseData.vehicleId || null,
              vin: weightIncreaseData.vin || null, // VIN if manually entered
              originalWeightCategory: weightIncreaseData.originalWeightCategory,
              newWeightCategory: weightIncreaseData.newWeightCategory,
              amendedMonth: weightIncreaseData.amendedMonth,
              firstUsedMonth: weightIncreaseData.firstUsedMonth,
              additionalTaxDue: weightIncreaseData.additionalTaxDue,
              originalIsLogging: weightIncreaseData.originalIsLogging || false,
              newIsLogging: weightIncreaseData.newIsLogging || false
            }
          };
          // Calculate due date (last day of following month)
          amendmentDueDate = calculateWeightIncreaseDueDate(weightIncreaseData.amendedMonth);
        } else if (amendmentType === 'mileage_exceeded') {
          amendmentDetails = {
            mileageExceeded: {
              vehicleId: mileageExceededData.vehicleId,
              originalMileageLimit: mileageExceededData.originalMileageLimit,
              actualMileageUsed: mileageExceededData.actualMileageUsed,
              exceededMonth: mileageExceededData.exceededMonth,
              firstUsedMonth: mileageExceededData.firstUsedMonth,
              isAgriculturalVehicle: mileageExceededData.isAgriculturalVehicle
            }
          };
        }
      }

      // Final check for business (amendments should always have a business)
      if (!businessIdToUse) {
        setError('Business information is required for this amendment filing. Please select an existing business from your account or create a new one. The IRS requires business details for all amendment filings.');
        setLoading(false);
        return;
      }

      // Prepare payment details
      const paymentDetails = {
        irsPaymentMethod: irsPaymentMethod,
        bankDetails: irsPaymentMethod === 'efw' ? {
          routingNumber: bankDetails.routingNumber,
          accountNumber: bankDetails.accountNumber, // Note: Should be encrypted in production
          accountType: bankDetails.accountType,
          phoneNumber: bankDetails.phoneNumber
        } : null,
        couponCode: couponApplied ? couponCode : null,
        couponDiscount: couponApplied ? pricing.couponDiscount || 0 : 0,
        couponType: couponApplied ? couponType : null
      };

      // Create or Update filing
      let finalFilingId = filingId;
      const filingPayload = {
        userId: user.uid,
        businessId: businessIdToUse,
        vehicleIds: vehicleIdsToUse,
        taxYear: filingData.taxYear,
        firstUsedMonth: filingData.firstUsedMonth,
        filingType: filingType,
        amendmentType: filingType === 'amendment' ? amendmentType : null,
        amendmentDetails: filingType === 'amendment' ? amendmentDetails : {},
        amendmentDueDate: amendmentDueDate,
        refundDetails: filingType === 'refund' ? refundDetails : {},
        inputDocuments: preUploadedDocuments || [],
        pricing: pricing,
        paymentDetails: paymentDetails,
        status: 'awaiting_schedule_1', // Update status to reflect payment is done and awaiting agent action
        paymentStatus: 'paid',
        updatedAt: new Date().toISOString()
      };

      // Always use existing filingId if available (from draft or previous step)
      // This prevents duplicate filings if user refreshes or navigates back
      if (finalFilingId) {
        const { updateFiling } = await import('@/lib/db');
        await updateFiling(finalFilingId, filingPayload);
      } else if (filingId) {
        // Use filingId from state if finalFilingId is not set
        const { updateFiling } = await import('@/lib/db');
        await updateFiling(filingId, filingPayload);
        finalFilingId = filingId;
      } else {
        // Create new filing (duplicate detection disabled)
        finalFilingId = await createFiling(filingPayload);
        setFilingId(finalFilingId); // Save to state for future updates
      }


      // Upload documents if any
      const documentUrls = [];
      for (let i = 0; i < documents.length; i++) {
        const url = await uploadInputDocument(documents[i], finalFilingId, `document-${i}`);
        documentUrls.push(url);
      }

      // Update filing with all document URLs (pre-uploaded + new uploads)
      if (documentUrls.length > 0 || preUploadedDocuments.length > 0) {
        const { updateFiling } = await import('@/lib/db');
        const allDocuments = [...(preUploadedDocuments || []), ...documentUrls];
        await updateFiling(finalFilingId, { inputDocuments: allDocuments });
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

      router.push(`/dashboard/filings/${finalFilingId}`);

    } catch (error) {
      console.error('Error creating filing:', error);
      const filingTypeLabel = filingType === 'amendment' ? 'amendment filing' : filingType === 'refund' ? 'refund claim' : 'filing';
      setError(`Unable to submit your ${filingTypeLabel}. Please check your internet connection and verify all required information is complete, then try again. If the problem persists, contact support.`);
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
      case 4: return 'Documents'; // Hidden but kept for internal step numbering
      case 5: return 'Review';
      case 6: return 'Select IRS Payment Method';
      default: return '';
    }
  };

  const handleContinue = () => {
    if (step === 1 && filingType) {
      setStep(2);
    } else if (step === 2 && selectedBusinessId) {
      setStep(3);
    } else if (step === 3 && selectedVehicleIds.length > 0) {
      const validation = validateVehicleTypeCombination(selectedVehicleIds);
      if (validation.isValid) {
        setVehicleTypeError('');
        setStep(5); // Skip step 4 (Documents), go directly to Review
      } else {
        setVehicleTypeError(validation.error);
      }
    } else if (step === 5) {
      setStep(6);
    } else {
      // Show error if can't continue
      if (step === 2 && !selectedBusinessId) {
        const filingTypeLabel = filingType === 'amendment' ? 'amendment' : filingType === 'refund' ? 'refund' : 'filing';
        setError(`To proceed with your ${filingTypeLabel}, please select an existing business from the list above or click "Add New Business" to create one.`);
      } else if (step === 3 && selectedVehicleIds.length === 0) {
        const filingTypeLabel = filingType === 'amendment' ? 'amendment' : filingType === 'refund' ? 'refund claim' : 'filing';
        const vehicleAction = filingType === 'refund' ? 'select vehicles for refund' : 'select vehicles to include';
        setError(`To proceed with your ${filingTypeLabel}, please ${vehicleAction}. You can select existing vehicles or add new ones using the "Add Vehicle" button.`);
      }
    }
  };

  // Apply Coupon Code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponError('');

    // Mock coupon validation (replace with actual API call)
    // For testing, use dummy coupon codes
    const validCoupons = {
      'SAVE10': { type: 'percentage', value: 10 },
      'SAVE20': { type: 'percentage', value: 20 },
      'FIXED5': { type: 'fixed', value: 5 },
      'FIXED10': { type: 'fixed', value: 10 },
      'TEST50': { type: 'percentage', value: 50 } // For testing
    };

    const coupon = validCoupons[couponCode.toUpperCase()];

    if (coupon) {
      setCouponType(coupon.type);
      setCouponDiscount(coupon.value);
      setCouponApplied(true);
      setCouponError('');

      // Recalculate pricing with coupon
      await recalculatePricingWithCoupon(coupon.type, coupon.value);
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
      setCouponDiscount(0);
    }
  };

  // Recalculate pricing with coupon discount
  const recalculatePricingWithCoupon = async (type, value) => {
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

    try {
      const filingDataForPricing = {
        filingType,
        firstUsedMonth: filingData.firstUsedMonth
      };

      // Sanitize vehicles to remove complex objects (like Firestore Timestamps)
      // Include vehicleType, logging, and creditDate for proper tax calculation
      const sanitizedVehicles = selectedVehiclesList.map(v => ({
        id: v.id,
        vin: v.vin,
        grossWeightCategory: v.grossWeightCategory,
        isSuspended: v.isSuspended || false,
        vehicleType: v.vehicleType || (v.isSuspended ? 'suspended' : 'taxable'),
        logging: v.logging !== undefined ? v.logging : null,
        creditDate: v.creditDate || null // Include creditDate for credit vehicle proration
      }));

      const result = await calculateFilingCost(
        filingDataForPricing,
        sanitizedVehicles,
        { state }
      );

      if (result.success) {
        let discountAmount = 0;
        if (type === 'percentage') {
          // Apply percentage discount to service fee only
          discountAmount = (result.breakdown.serviceFee * value) / 100;
        } else if (type === 'fixed') {
          discountAmount = Math.min(value, result.breakdown.serviceFee);
        }

        setPricing({
          ...result.breakdown,
          couponDiscount: parseFloat(discountAmount.toFixed(2)),
          grandTotal: parseFloat((result.breakdown.grandTotal - discountAmount).toFixed(2))
        });
      }
    } catch (err) {
      console.error('Error recalculating pricing:', err);
    }
  };

  // Defer console.log to avoid blocking render
  useEffect(() => {
    console.log('[COMPONENT] Rendering NewFilingPage', {
      renderCount: renderCount.current,
      user: !!user,
      draftParam,
      dataLoaded,
      loadingRef: loadingRef.current,
      loadingDraftRef: loadingDraftRef.current
    });
  });

  // Show full-page loader while resuming draft to prevent Step 1 flash
  if (draftParam && !dataLoaded) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-midnight mb-1">Resuming your filing...</h2>
              <p className="text-slate-500">We're loading your saved progress, please wait a moment.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 pb-28 xl:pb-10 max-w-[1400px] mx-auto">
        {/* Compact Professional Header */}
        <div className="mb-4 sm:mb-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between gap-6 mb-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-midnight tracking-tight">Form 2290 Filing</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {getStepTitle(step)}
              </p>
            </div>

            {/* Compact Desktop Stepper */}
            <div className="flex items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200">
              {[1, 2, 3, 5, 6].map((s, idx) => {
                const displayStep = s > 4 ? s - 1 : s;
                const isCurrentStep = s === step;
                const isCompleted = s < step || (step === 4 && s === 3);
                const stepLabels = ['Type', 'Business', 'Vehicles', 'Review', 'Payment'];

                return (
                  <div key={s} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                        ${isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrentStep
                            ? 'bg-midnight text-white ring-2 ring-midnight ring-offset-2'
                            : 'bg-white border border-slate-300 text-slate-400'
                        }
                      `}>
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : displayStep}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium ${isCurrentStep ? 'text-midnight' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {stepLabels[idx]}
                      </span>
                    </div>
                    {s < 6 && (
                      <div className={`w-8 h-0.5 mx-1.5 mb-4 transition-colors ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-midnight">Form 2290 Filing</h1>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                {step === 4 ? 4 : step > 4 ? step - 1 : step}/5
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              {[1, 2, 3, 5, 6].map((s) => {
                const isCurrentStep = s === step;
                const isCompleted = s < step || (step === 4 && s === 3);
                return (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : isCurrentStep ? 'bg-midnight' : 'bg-slate-200'
                      }`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-slate-500 font-medium">{getStepTitle(step)}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div ref={errorRef} className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Main Content */}
        <div className={`w-full ${step === 6 ? 'grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 lg:gap-6' : 'max-w-4xl mx-auto'}`}>
          {/* Form Content */}
          <div className="space-y-4">
            {/* Step 1: Filing Type */}
            {step === 1 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="bg-slate-50/80 border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5">
                  <h2 className="text-base sm:text-lg font-bold text-midnight">What are you filing today?</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">Select the type of Form 2290 filing to begin</p>
                </div>

                <div className="p-4 sm:p-6 space-y-6">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {/* Standard 2290 */}
                    <button
                      onClick={() => {
                        setFilingType('standard');
                        setAmendmentType('');
                        setShowBusinessForm(false);
                      }}
                      className={`group relative p-5 rounded-xl border transition-all duration-200 text-left ${filingType === 'standard'
                        ? 'border-indigo-600 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white'
                        }`}
                    >
                      {filingType !== 'standard' && (
                        <div className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                          Most Popular
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${filingType === 'standard' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-midnight">Standard 2290</h3>
                            {filingType === 'standard' && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            Complete your regular annual filing for highway vehicles
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Amendment */}
                    <button
                      onClick={() => setFilingType('amendment')}
                      className={`group relative p-5 rounded-xl border transition-all duration-200 text-left ${filingType === 'amendment'
                        ? 'border-indigo-600 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white'
                        }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${filingType === 'amendment' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                          <RefreshCw className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-midnight">Amendment</h3>
                            {filingType === 'amendment' && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            VIN corrections, weight changes, or mileage updates
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Amendment Type Sub-Selection */}
                  {filingType === 'amendment' && (
                    <div className="mt-4 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <Info className="w-4 h-4 text-indigo-600" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select Amendment Type</p>
                      </div>
                      <div className="grid gap-3">
                        {/* VIN Correction */}
                        <button
                          onClick={() => {
                            setAmendmentType('vin_correction');
                            setVinInputMode('select');
                            setVinCorrectionData({ originalVIN: '', correctedVIN: '', originalFilingId: '' });
                          }}
                          className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${amendmentType === 'vin_correction'
                            ? 'border-indigo-500 bg-indigo-50/50'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${amendmentType === 'vin_correction' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm ${amendmentType === 'vin_correction' ? 'text-indigo-900' : 'text-midnight'}`}>VIN Correction</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Correct details from a previous filing • No tax due</p>
                          </div>
                          {amendmentType === 'vin_correction' && <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                        </button>

                        {/* Weight Increase */}
                        <button
                          onClick={() => setAmendmentType('weight_increase')}
                          className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${amendmentType === 'weight_increase'
                            ? 'border-indigo-500 bg-indigo-50/50'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${amendmentType === 'weight_increase' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Truck className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm ${amendmentType === 'weight_increase' ? 'text-indigo-900' : 'text-midnight'}`}>Weight Increase</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Moving to a higher category • Additional tax may apply</p>
                          </div>
                          {amendmentType === 'weight_increase' && <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                        </button>

                        {/* Mileage Exceeded */}
                        <button
                          onClick={() => setAmendmentType('mileage_exceeded')}
                          className={`p-4 rounded-xl border transition-all flex items-center gap-4 ${amendmentType === 'mileage_exceeded'
                            ? 'border-indigo-500 bg-indigo-50/50'
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${amendmentType === 'mileage_exceeded' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold text-sm ${amendmentType === 'mileage_exceeded' ? 'text-indigo-900' : 'text-midnight'}`}>Mileage Exceeded</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Previously suspended vehicle exceeded limit</p>
                          </div>
                          {amendmentType === 'mileage_exceeded' && <CheckCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Secured with 256-bit encryption</span>
                    </div>
                    <button
                      onClick={handleNextFromStep1}
                      disabled={loading}
                      className="px-6 py-2.5 bg-[var(--color-orange)] text-white rounded-lg text-sm font-bold hover:bg-[var(--color-orange-hover)] shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Continue Process
                      {!loading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
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
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-2xl">
                          📝
                        </div>
                        <div>
                          <h3 className="font-bold text-midnight">VIN Correction</h3>
                          <p className="text-sm text-slate-500">Correct an incorrect VIN from a previously filed Form 2290</p>
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
                            className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono bg-white touch-manipulation"
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
                            className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono touch-manipulation"
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
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono touch-manipulation"
                        placeholder="1HGBH41JXMN109187"
                        maxLength="17"
                      />
                      <p className="mt-1 text-xs text-[var(--color-muted)]">Enter the correct VIN (must be different from original)</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <p className="text-sm text-emerald-700 font-medium">
                        VIN corrections are processed with no additional IRS tax due.
                      </p>
                    </div>
                  </div>
                )}

                {/* Weight Increase Details */}
                {amendmentType === 'weight_increase' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-2xl">
                          ⚖️
                        </div>
                        <div>
                          <h3 className="font-bold text-midnight">Taxable Gross Weight Increase</h3>
                          <p className="text-sm text-slate-500">Report when your vehicle moved to a higher weight category</p>
                        </div>
                      </div>
                    </div>

                    {/* Input Mode Toggle */}
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          setWeightIncreaseInputMode('select');
                          setWeightIncreaseData({ ...weightIncreaseData, vehicleId: '', vin: '' });
                        }}
                        className={`px-2 sm:px-3 py-1.5 text-xs rounded-lg transition touch-manipulation ${weightIncreaseInputMode === 'select'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-200'
                          }`}
                      >
                        <span className="hidden sm:inline">Select Existing Vehicle</span>
                        <span className="sm:hidden">Select</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setWeightIncreaseInputMode('manual');
                          setWeightIncreaseData({ ...weightIncreaseData, vehicleId: '', vin: '' });
                        }}
                        className={`px-2 sm:px-3 py-1.5 text-xs rounded-lg transition touch-manipulation ${weightIncreaseInputMode === 'manual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-200'
                          }`}
                      >
                        <span className="hidden sm:inline">Enter VIN Manually</span>
                        <span className="sm:hidden">Manual</span>
                      </button>
                    </div>

                    {/* Vehicle Selection or Manual VIN Entry */}
                    {weightIncreaseInputMode === 'select' ? (
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Select Vehicle *
                        </label>
                        <select
                          value={weightIncreaseData.vehicleId}
                          onChange={(e) => {
                            const selectedVehicleId = e.target.value;
                            const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

                            // Auto-populate original weight category and logging status from selected vehicle (read-only)
                            if (selectedVehicle) {
                              setWeightIncreaseData({
                                ...weightIncreaseData,
                                vehicleId: selectedVehicleId,
                                vin: selectedVehicle.vin || '',
                                originalWeightCategory: selectedVehicle.grossWeightCategory || '',
                                originalIsLogging: selectedVehicle.logging === true,
                                // Keep newIsLogging as is (user can change it)
                              });
                              // Recalculate tax if other fields are set
                              if (selectedVehicle.grossWeightCategory && weightIncreaseData.newWeightCategory && weightIncreaseData.amendedMonth && weightIncreaseData.firstUsedMonth) {
                                const additionalTax = calculateWeightIncreaseAdditionalTax(
                                  selectedVehicle.grossWeightCategory,
                                  weightIncreaseData.newWeightCategory,
                                  weightIncreaseData.amendedMonth,
                                  weightIncreaseData.firstUsedMonth,
                                  selectedVehicle.logging === true,
                                  weightIncreaseData.newIsLogging || false
                                );
                                setWeightIncreaseData(prev => ({ ...prev, additionalTaxDue: additionalTax }));
                              }
                            } else {
                              setWeightIncreaseData({ ...weightIncreaseData, vehicleId: '', vin: '', originalWeightCategory: '', originalIsLogging: false });
                            }
                          }}
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white touch-manipulation"
                        >
                          <option value="">Select a vehicle...</option>
                          {vehicles.filter(v => v.vehicleType === 'taxable' || !v.vehicleType).map(v => (
                            <option key={v.id} value={v.id}>{v.vin} {v.grossWeightCategory ? `(Category ${v.grossWeightCategory})` : ''}</option>
                          ))}
                        </select>
                        {vehicles.filter(v => v.vehicleType === 'taxable' || !v.vehicleType).length === 0 && (
                          <p className="mt-1 text-xs text-amber-600">No taxable vehicles found. You can enter the VIN manually using the "Manual" option above.</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Vehicle Identification Number (VIN) *
                        </label>
                        <input
                          type="text"
                          value={weightIncreaseData.vin}
                          onChange={(e) => setWeightIncreaseData({ ...weightIncreaseData, vin: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono touch-manipulation"
                          placeholder="1HGBH41JXMN109186"
                          maxLength="17"
                        />
                        <p className="mt-1 text-xs text-[var(--color-muted)]">Enter the VIN of the vehicle that increased in weight (17 characters)</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Original Weight Category *
                          {weightIncreaseData.vehicleId && (
                            <span className="text-xs text-[var(--color-muted)] ml-2">(From selected vehicle)</span>
                          )}
                        </label>
                        <select
                          value={weightIncreaseData.originalWeightCategory}
                          onChange={(e) => {
                            setWeightIncreaseData({ ...weightIncreaseData, originalWeightCategory: e.target.value });
                            // Recalculate tax if other fields are set
                            if (e.target.value && weightIncreaseData.newWeightCategory && weightIncreaseData.amendedMonth && weightIncreaseData.firstUsedMonth) {
                              const additionalTax = calculateWeightIncreaseAdditionalTax(
                                e.target.value,
                                weightIncreaseData.newWeightCategory,
                                weightIncreaseData.amendedMonth,
                                weightIncreaseData.firstUsedMonth,
                                weightIncreaseData.originalIsLogging,
                                weightIncreaseData.newIsLogging
                              );
                              setWeightIncreaseData(prev => ({ ...prev, additionalTaxDue: additionalTax }));
                            }
                          }}
                          disabled={!!weightIncreaseData.vehicleId}
                          className={`w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white touch-manipulation ${weightIncreaseData.vehicleId ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
                        >
                          <option value="">Select...</option>
                          {getWeightCategoryOptionsWithPricing(weightIncreaseData.originalIsLogging, false).map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        {weightIncreaseData.vehicleId && (
                          <p className="mt-1 text-xs text-blue-600">✓ Original category is pre-populated from the selected vehicle and cannot be changed</p>
                        )}
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
                            if (weightIncreaseData.originalWeightCategory && newCat && weightIncreaseData.amendedMonth && weightIncreaseData.firstUsedMonth) {
                              const additionalTax = calculateWeightIncreaseAdditionalTax(
                                weightIncreaseData.originalWeightCategory,
                                newCat,
                                weightIncreaseData.amendedMonth,
                                weightIncreaseData.firstUsedMonth,
                                weightIncreaseData.originalIsLogging,
                                weightIncreaseData.newIsLogging
                              );
                              setWeightIncreaseData(prev => ({ ...prev, newWeightCategory: newCat, additionalTaxDue: additionalTax }));
                            }
                          }}
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white touch-manipulation"
                        >
                          <option value="">Select...</option>
                          {getWeightCategoryOptionsWithPricing(weightIncreaseData.newIsLogging, true).map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-[var(--color-muted)]">Select the new (higher) weight category</p>
                      </div>
                    </div>

                    {/* Tax Year Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <h4 className="text-sm font-semibold text-blue-900">Current Year</h4>
                      </div>
                      <p className="text-xs text-blue-800 mb-3">
                        Tax Year 2025 - July 2025 to June 2026
                      </p>
                    </div>

                    {/* First Used Month */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        First Used Month *
                        <span className="text-xs text-[var(--color-muted)] ml-2">(From original filing)</span>
                      </label>
                      <select
                        value={weightIncreaseData.firstUsedMonth}
                        onChange={(e) => {
                          const month = e.target.value;
                          setWeightIncreaseData({ ...weightIncreaseData, firstUsedMonth: month });
                          // Recalculate tax if all fields are set
                          if (weightIncreaseData.originalWeightCategory && weightIncreaseData.newWeightCategory && weightIncreaseData.amendedMonth && month) {
                            const additionalTax = calculateWeightIncreaseAdditionalTax(
                              weightIncreaseData.originalWeightCategory,
                              weightIncreaseData.newWeightCategory,
                              weightIncreaseData.amendedMonth,
                              month, // Use the month being set as firstUsedMonth
                              weightIncreaseData.originalIsLogging,
                              weightIncreaseData.newIsLogging
                            );
                            setWeightIncreaseData(prev => ({ ...prev, additionalTaxDue: additionalTax }));
                          }
                        }}
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white touch-manipulation"
                      >
                        <option value="">Select the month of first use...</option>
                        {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => {
                          const year = (m === 'January' || m === 'February' || m === 'March' || m === 'April' || m === 'May' || m === 'June') ? '2026' : '2025';
                          const fullValue = `${m} ${year}`;
                          return <option key={m} value={fullValue}>{m} {year}</option>;
                        })}
                      </select>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Select the month of first use to indicate when the vehicle was first used during the tax period
                      </p>
                    </div>

                    {/* Amended Month */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Amended Month *
                        <span className="text-xs text-[var(--color-muted)] ml-2">(When weight increased)</span>
                      </label>
                      <select
                        value={weightIncreaseData.amendedMonth}
                        onChange={(e) => {
                          const month = e.target.value;
                          setWeightIncreaseData({ ...weightIncreaseData, amendedMonth: month });
                          // Calculate additional tax if all fields are set
                          if (weightIncreaseData.originalWeightCategory && weightIncreaseData.newWeightCategory && month && weightIncreaseData.firstUsedMonth) {
                            const additionalTax = calculateWeightIncreaseAdditionalTax(
                              weightIncreaseData.originalWeightCategory,
                              weightIncreaseData.newWeightCategory,
                              month,
                              weightIncreaseData.firstUsedMonth,
                              weightIncreaseData.originalIsLogging,
                              weightIncreaseData.newIsLogging
                            );
                            setWeightIncreaseData(prev => ({ ...prev, amendedMonth: month, additionalTaxDue: additionalTax }));
                          }
                        }}
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white touch-manipulation"
                      >
                        <option value="">Select the month when gross weight increased...</option>
                        {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => {
                          const year = (m === 'January' || m === 'February' || m === 'March' || m === 'April' || m === 'May' || m === 'June') ? '2026' : '2025';
                          const fullValue = `${m} ${year}`;
                          return <option key={m} value={fullValue}>{m} {year}</option>;
                        })}
                      </select>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        Select the month when the gross weight of the vehicle increased
                      </p>
                    </div>

                    {/* Logging Status - Original Weight Category */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                        Logging Status for Original Weight Category
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="weightIncreaseOriginalLogging"
                          checked={weightIncreaseData.originalIsLogging}
                          onChange={(e) => {
                            const isLogging = e.target.checked;
                            setWeightIncreaseData({ ...weightIncreaseData, originalIsLogging: isLogging });
                            // Recalculate tax if all fields are set
                            if (weightIncreaseData.originalWeightCategory && weightIncreaseData.newWeightCategory && weightIncreaseData.amendedMonth && weightIncreaseData.firstUsedMonth) {
                              const additionalTax = calculateWeightIncreaseAdditionalTax(
                                weightIncreaseData.originalWeightCategory,
                                weightIncreaseData.newWeightCategory,
                                weightIncreaseData.amendedMonth,
                                weightIncreaseData.firstUsedMonth,
                                isLogging,
                                weightIncreaseData.newIsLogging
                              );
                              setWeightIncreaseData(prev => ({ ...prev, additionalTaxDue: additionalTax }));
                            }
                          }}
                          disabled={!!weightIncreaseData.vehicleId}
                          className={`w-4 h-4 text-indigo-600/80 border-gray-300 rounded focus:ring-indigo-500/20 focus:border-indigo-500 ${weightIncreaseData.vehicleId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        <label htmlFor="weightIncreaseOriginalLogging" className={`text-sm text-[var(--color-text)] ${weightIncreaseData.vehicleId ? 'opacity-75' : ''}`}>
                          Original weight category was used for logging (75% tax rate)
                        </label>
                      </div>
                      {weightIncreaseData.vehicleId && (
                        <p className="mt-1 text-xs text-blue-600">✓ Pre-populated from selected vehicle</p>
                      )}
                    </div>

                    {/* Logging Status - New Weight Category */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
                        Logging Status for New Weight Category
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="weightIncreaseNewLogging"
                          checked={weightIncreaseData.newIsLogging}
                          onChange={(e) => {
                            const isLogging = e.target.checked;
                            setWeightIncreaseData({ ...weightIncreaseData, newIsLogging: isLogging });
                            // Recalculate tax if all fields are set
                            if (weightIncreaseData.originalWeightCategory && weightIncreaseData.newWeightCategory && weightIncreaseData.amendedMonth && weightIncreaseData.firstUsedMonth) {
                              const additionalTax = calculateWeightIncreaseAdditionalTax(
                                weightIncreaseData.originalWeightCategory,
                                weightIncreaseData.newWeightCategory,
                                weightIncreaseData.amendedMonth,
                                weightIncreaseData.firstUsedMonth,
                                weightIncreaseData.originalIsLogging,
                                isLogging
                              );
                              setWeightIncreaseData(prev => ({ ...prev, additionalTaxDue: additionalTax }));
                            }
                          }}
                          className="w-4 h-4 text-indigo-600/80 border-gray-300 rounded focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                        <label htmlFor="weightIncreaseNewLogging" className="text-sm text-[var(--color-text)]">
                          New weight category is used for logging (75% tax rate)
                        </label>
                      </div>
                    </div>

                    {weightIncreaseData.additionalTaxDue > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                          <span className="text-sm font-bold text-slate-700">Additional Tax Due:</span>
                          <span className="text-xl sm:text-2xl font-extrabold text-orange-600">${weightIncreaseData.additionalTaxDue.toFixed(2)}</span>
                        </div>
                        {weightIncreaseData.amendedMonth && (
                          <div className="mt-3 pt-3 border-t border-orange-100 flex items-center gap-2 text-xs text-orange-800 font-medium">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="break-words">Due Date: {calculateWeightIncreaseDueDate(weightIncreaseData.amendedMonth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Mileage Exceeded Details */}
                {amendmentType === 'mileage_exceeded' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 sm:p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-2xl">
                          🛣️
                        </div>
                        <div>
                          <h3 className="font-bold text-midnight">Mileage Use Limit Exceeded</h3>
                          <p className="text-sm text-slate-500">Report when a suspended vehicle exceeded its mileage limit</p>
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
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white touch-manipulation"
                      >
                        <option value="">Select a vehicle...</option>
                        {vehicles.filter(v => v.vehicleType === 'suspended' || (v.vehicleType === undefined && v.isSuspended === true)).map(v => (
                          <option key={v.id} value={v.id}>{v.vin} (Suspended)</option>
                        ))}
                      </select>
                      {vehicles.filter(v => v.vehicleType === 'suspended' || (v.vehicleType === undefined && v.isSuspended === true)).length === 0 && (
                        <p className="mt-1 text-xs text-amber-600">No suspended vehicles found. Please add a suspended vehicle first.</p>
                      )}
                      {vehicles.filter(v => v.vehicleType === 'suspended' || (v.vehicleType === undefined && v.isSuspended === true)).length > 0 && (
                        <p className="mt-1 text-xs text-[var(--color-muted)]">Only suspended vehicles are shown</p>
                      )}
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
                            className="w-5 h-5 text-indigo-600/80 flex-shrink-0 touch-manipulation"
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
                            className="w-5 h-5 text-indigo-600/80 flex-shrink-0 touch-manipulation"
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
                            className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 touch-manipulation"
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
                          className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white"
                        >
                          <option value="">Select month...</option>
                          {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => (
                            <option key={m} value={m}>{m} {m === 'January' || m === 'February' || m === 'March' || m === 'April' || m === 'May' || m === 'June' ? '2026' : '2025'}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Month Vehicle Was First Used in Tax Period *
                        <span className="text-xs text-[var(--color-muted)] ml-2">(Required for tax calculation per IRS)</span>
                      </label>
                      <select
                        value={mileageExceededData.firstUsedMonth}
                        onChange={(e) => setMileageExceededData({ ...mileageExceededData, firstUsedMonth: e.target.value })}
                        className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none bg-white"
                      >
                        <option value="">Select month...</option>
                        {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => (
                          <option key={m} value={m}>{m} {m === 'January' || m === 'February' || m === 'March' || m === 'April' || m === 'May' || m === 'June' ? '2026' : '2025'}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">
                        This is the month from your original Form 2290 filing where the vehicle was suspended. If you didn't file with us, enter the month from your original filing.
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 sm:p-5 flex gap-2 sm:gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      </div>
                      <div className="text-xs sm:text-sm text-purple-700 leading-relaxed">
                        <p className="font-semibold mb-1">IRS Tax Calculation:</p>
                        <p className="mb-2">Per IRS Form 2290 Instructions, the tax is calculated based on the <strong>month the vehicle was first used in the tax period</strong> (from your original filing), not the month the mileage limit was exceeded.</p>
                        <p className="text-xs mt-2 opacity-90">Example: If first used in July → full year tax. If first used in December → 7 months tax (Dec through June).</p>
                      </div>
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
                          const errorDetails = validation.errors.length > 0
                            ? validation.errors.join('. ')
                            : 'Please check that both the original and corrected VINs are valid 17-character VINs.';
                          setError(`VIN Correction Error: ${errorDetails}`);
                          return;
                        }
                      } else if (amendmentType === 'weight_increase') {
                        // Validate: either vehicleId (select mode) or vin (manual mode) must be provided
                        const hasVehicle = weightIncreaseInputMode === 'select' ? weightIncreaseData.vehicleId : weightIncreaseData.vin;
                        if (!hasVehicle || !weightIncreaseData.originalWeightCategory || !weightIncreaseData.newWeightCategory || !weightIncreaseData.firstUsedMonth || !weightIncreaseData.amendedMonth) {
                          const missingFields = [];
                          if (!hasVehicle) missingFields.push(weightIncreaseInputMode === 'select' ? 'Vehicle' : 'VIN');
                          if (!weightIncreaseData.originalWeightCategory) missingFields.push('Original Weight Category');
                          if (!weightIncreaseData.newWeightCategory) missingFields.push('New Weight Category');
                          if (!weightIncreaseData.firstUsedMonth) missingFields.push('First Used Month');
                          if (!weightIncreaseData.amendedMonth) missingFields.push('Amended Month');
                          setError(`Please complete all required fields for weight increase amendment: ${missingFields.join(', ')}. All fields are required to calculate the additional tax.`);
                          return;
                        }
                        // Validate VIN format if manual entry
                        if (weightIncreaseInputMode === 'manual' && weightIncreaseData.vin) {
                          const vinValidation = validateVIN(weightIncreaseData.vin);
                          if (!vinValidation.isValid) {
                            setError(`Invalid VIN: ${vinValidation.error}`);
                            return;
                          }
                        }
                        const validation = validateWeightIncrease(weightIncreaseData.originalWeightCategory, weightIncreaseData.newWeightCategory);
                        if (!validation.isValid) {
                          setError(validation.error);
                          return;
                        }
                      } else if (amendmentType === 'mileage_exceeded') {
                        if (!mileageExceededData.vehicleId || !mileageExceededData.actualMileageUsed || !mileageExceededData.exceededMonth || !mileageExceededData.firstUsedMonth) {
                          const missingFields = [];
                          if (!mileageExceededData.vehicleId) missingFields.push('Vehicle');
                          if (!mileageExceededData.actualMileageUsed) missingFields.push('Actual Mileage Used');
                          if (!mileageExceededData.exceededMonth) missingFields.push('Month Limit Was Exceeded');
                          if (!mileageExceededData.firstUsedMonth) missingFields.push('Month Vehicle Was First Used');
                          setError(`Please complete all required fields for mileage exceeded amendment: ${missingFields.join(', ')}. All fields are required to calculate the tax due per IRS requirements.`);
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
                    className="w-full sm:w-auto px-6 py-2.5 bg-[var(--color-orange)] text-white rounded-lg text-sm font-bold hover:bg-[var(--color-orange-hover)] shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Business (skip for amendments, renumber for non-amendments) */}
            {step === 2 && filingType !== 'amendment' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
                  <h2 className="text-base sm:text-lg font-bold text-midnight">Select Business</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Choose or add a business for this filing</p>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Existing Businesses List */}
                  {!showBusinessForm && businesses.length > 0 && (
                    <div className="mb-4">
                      <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                        {businesses.map((business) => (
                          <button
                            key={business.id}
                            onClick={() => setSelectedBusinessId(business.id)}
                            className={`p-4 rounded-xl border transition-all relative group active:scale-[0.99] ${selectedBusinessId === business.id
                              ? 'border-indigo-600 bg-indigo-50/30'
                              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 bg-white'
                              }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-base font-bold transition-all ${selectedBusinessId === business.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                                {business.businessName?.charAt(0).toUpperCase() || 'B'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-base text-midnight truncate">{business.businessName}</div>
                                <p className="text-xs font-mono text-slate-500 mt-1">EIN: {business.ein}</p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">{business.city}, {business.state}</p>
                              </div>
                              {selectedBusinessId === business.id && (
                                <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-200">
                                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}

                        {/* Add New Business Button */}
                        <button
                          onClick={() => {
                            setShowBusinessForm(true);
                            setSelectedBusinessId('');
                          }}
                          className="p-3 sm:p-4 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 hover:bg-slate-50 active:scale-[0.99] transition flex items-center justify-center gap-2 min-h-[80px]"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="font-semibold text-sm">Add New Business</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Add New Business Form */}
                  {(showBusinessForm || businesses.length === 0) && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-bold text-midnight">
                            {businesses.length > 0 ? 'Add New Business' : 'Enter Business Details'}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">All fields marked with * are required</p>
                        </div>
                        {businesses.length > 0 && (
                          <button
                            onClick={() => setShowBusinessForm(false)}
                            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {/* Business Name */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Business Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.businessName}
                              onChange={(e) => handleBusinessChange('businessName', e.target.value)}
                              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 ${businessErrors.businessName ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                              placeholder="e.g., ABC Trucking LLC"
                            />
                            {businessErrors.businessName && (
                              <p className="mt-1 text-xs text-red-600">{businessErrors.businessName}</p>
                            )}
                          </div>
                          {/* EIN */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              EIN <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.ein}
                              onChange={(e) => handleBusinessChange('ein', e.target.value)}
                              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 font-mono ${businessErrors.ein ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                              placeholder="12-3456789"
                              maxLength="10"
                            />
                            {businessErrors.ein && (
                              <p className="mt-1 text-xs text-red-600">{businessErrors.ein}</p>
                            )}
                          </div>

                          {/* Business Address */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Address <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.address}
                              onChange={(e) => handleBusinessChange('address', e.target.value)}
                              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 ${businessErrors.address ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                              placeholder="123 Main Street"
                            />
                            {businessErrors.address && (
                              <p className="mt-1 text-xs text-red-600">{businessErrors.address}</p>
                            )}
                          </div>

                          {/* City */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.city}
                              onChange={(e) => handleBusinessChange('city', e.target.value)}
                              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 ${businessErrors.city ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                              placeholder="Los Angeles"
                            />
                            {businessErrors.city && (
                              <p className="mt-1 text-xs text-red-600">{businessErrors.city}</p>
                            )}
                          </div>

                          {/* State */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              State <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.state}
                              onChange={(e) => handleBusinessChange('state', e.target.value)}
                              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 uppercase ${businessErrors.state ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                              placeholder="CA"
                              maxLength="2"
                            />
                            {businessErrors.state && (
                              <p className="mt-1 text-xs text-red-600">{businessErrors.state}</p>
                            )}
                          </div>

                          {/* ZIP Code */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              ZIP Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.zip}
                              onChange={(e) => handleBusinessChange('zip', e.target.value)}
                              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 font-mono ${businessErrors.zip ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                              placeholder="12345"
                              maxLength="10"
                            />
                            {businessErrors.zip && (
                              <p className="mt-1 text-xs text-red-600">{businessErrors.zip}</p>
                            )}
                          </div>

                          {/* Country */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Country <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.country}
                              onChange={(e) => handleBusinessChange('country', e.target.value)}
                              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 ${businessErrors.country ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                              placeholder="United States"
                            />
                            {businessErrors.country && (
                              <p className="mt-1 text-xs text-red-600">{businessErrors.country}</p>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={newBusiness.phone}
                              onChange={(e) => handleBusinessChange('phone', e.target.value)}
                              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 ${businessErrors.phone ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                              placeholder="(555) 123-4567"
                            />
                            {businessErrors.phone && (
                              <p className="mt-1 text-xs text-red-600">{businessErrors.phone}</p>
                            )}
                          </div>
                          {/* Signing Authority Section */}
                          <div className="sm:col-span-2 border-t border-slate-200 pt-4 mt-2">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Signing Authority</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                  Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={newBusiness.signingAuthorityName}
                                  onChange={(e) => handleBusinessChange('signingAuthorityName', e.target.value)}
                                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 ${businessErrors.signingAuthorityName ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                  placeholder="John Doe"
                                />
                                {businessErrors.signingAuthorityName && (
                                  <p className="mt-1 text-xs text-red-600">{businessErrors.signingAuthorityName}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                  Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="tel"
                                  value={newBusiness.signingAuthorityPhone}
                                  onChange={(e) => handleBusinessChange('signingAuthorityPhone', e.target.value)}
                                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 ${businessErrors.signingAuthorityPhone ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                  placeholder="(555) 123-4567"
                                />
                                {businessErrors.signingAuthorityPhone && (
                                  <p className="mt-1 text-xs text-red-600">{businessErrors.signingAuthorityPhone}</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                  PIN <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={newBusiness.signingAuthorityPIN}
                                  onChange={(e) => handleBusinessChange('signingAuthorityPIN', e.target.value)}
                                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition-all placeholder:text-slate-400 font-mono ${businessErrors.signingAuthorityPIN ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}
                                  placeholder="12345"
                                  maxLength="5"
                                />
                                {businessErrors.signingAuthorityPIN && (
                                  <p className="mt-1 text-xs text-red-600">{businessErrors.signingAuthorityPIN}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Third Party Designee */}
                          <div className="md:col-span-2 mt-6 pt-6 border-t-2 border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                              <label className="block text-sm font-semibold text-midnight">
                                Third Party Designee
                              </label>
                              <div className="group relative">
                                <Info className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-help transition-colors" />
                                <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-midnight text-white text-xs rounded-lg shadow-xl hidden group-hover:block z-10">
                                  A third party designee is someone you authorize to discuss your Form 2290 with the IRS. This is optional.
                                </div>
                              </div>
                              <span className="text-xs text-slate-500 font-normal">(Optional)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setNewBusiness({ ...newBusiness, hasThirdPartyDesignee: false, thirdPartyDesigneeName: '', thirdPartyDesigneePhone: '', thirdPartyDesigneePIN: '' })}
                                className={`relative flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-200 touch-manipulation w-fit font-bold ${newBusiness.hasThirdPartyDesignee === false
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                                  }`}
                              >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${newBusiness.hasThirdPartyDesignee === false
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-300 bg-white'
                                  }`}>
                                  {newBusiness.hasThirdPartyDesignee === false && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                  )}
                                </div>
                                <span className={`text-sm ${newBusiness.hasThirdPartyDesignee === false
                                  ? 'text-indigo-900'
                                  : 'text-slate-600'
                                  }`}>
                                  No
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewBusiness({ ...newBusiness, hasThirdPartyDesignee: true })}
                                className={`relative flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-200 touch-manipulation w-fit font-bold ${newBusiness.hasThirdPartyDesignee === true
                                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                                  }`}>
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${newBusiness.hasThirdPartyDesignee === true
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-300 bg-white'
                                  }`}>
                                  {newBusiness.hasThirdPartyDesignee === true && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                                  )}
                                </div>
                                <span className={`text-sm ${newBusiness.hasThirdPartyDesignee === true
                                  ? 'text-indigo-900'
                                  : 'text-slate-600'
                                  }`}>
                                  Yes
                                </span>
                              </button>
                            </div>

                            {newBusiness.hasThirdPartyDesignee && (
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100 shadow-sm">
                                <div>
                                  <label className="block text-sm font-semibold text-midnight mb-2">
                                    Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={newBusiness.thirdPartyDesigneeName}
                                    onChange={(e) => handleBusinessChange('thirdPartyDesigneeName', e.target.value)}
                                    className={`w-full px-4 py-3 text-base bg-white border-2 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all touch-manipulation placeholder:text-slate-400 placeholder:font-normal ${businessErrors.thirdPartyDesigneeName ? 'border-red-500 bg-red-50' : 'border-indigo-200 hover:border-indigo-300'}`}
                                    placeholder="e.g., Jane Smith"
                                  />
                                  {businessErrors.thirdPartyDesigneeName ? (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-start gap-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                      <span className="flex-1">{businessErrors.thirdPartyDesigneeName}</span>
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-xs text-slate-500">Designee's full name</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-midnight mb-2">
                                    Phone <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="tel"
                                    value={newBusiness.thirdPartyDesigneePhone}
                                    onChange={(e) => handleBusinessChange('thirdPartyDesigneePhone', e.target.value)}
                                    className={`w-full px-4 py-3 text-base bg-white border-2 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all touch-manipulation placeholder:text-slate-400 placeholder:font-normal ${businessErrors.thirdPartyDesigneePhone ? 'border-red-500 bg-red-50' : 'border-indigo-200 hover:border-indigo-300'}`}
                                    placeholder="e.g., (555) 123-4567"
                                  />
                                  {businessErrors.thirdPartyDesigneePhone ? (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-start gap-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                      <span className="flex-1">{businessErrors.thirdPartyDesigneePhone}</span>
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-xs text-slate-500">Designee's phone number</p>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-midnight mb-2">
                                    PIN <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={newBusiness.thirdPartyDesigneePIN}
                                    onChange={(e) => handleBusinessChange('thirdPartyDesigneePIN', e.target.value)}
                                    className={`w-full px-4 py-3 text-base bg-white border-2 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all touch-manipulation placeholder:text-slate-400 placeholder:font-normal font-mono ${businessErrors.thirdPartyDesigneePIN ? 'border-red-500 bg-red-50' : 'border-indigo-200 hover:border-indigo-300'}`}
                                    placeholder="e.g., 12345"
                                    maxLength="5"
                                  />
                                  {businessErrors.thirdPartyDesigneePIN ? (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-start gap-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                      <span className="flex-1">{businessErrors.thirdPartyDesigneePIN}</span>
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-xs text-slate-500">5-digit PIN</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-2 pt-4 border-t-2 border-slate-200 mt-4 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
                          <button
                            onClick={async () => {
                              // Run validations first
                              const nameVal = validateBusinessName(newBusiness.businessName);
                              const einVal = validateEIN(newBusiness.ein);
                              const addrVal = validateAddress(newBusiness.address, true); // Required
                              const phoneVal = validatePhone(newBusiness.phone, true); // Required

                              if (!nameVal.isValid || !einVal.isValid || !addrVal.isValid || !phoneVal.isValid) {
                                setBusinessErrors({
                                  businessName: nameVal.error,
                                  ein: einVal.error,
                                  address: addrVal.error,
                                  phone: phoneVal.error
                                });
                                // Create a detailed error message listing all issues
                                const errorFields = [];
                                if (!nameVal.isValid) errorFields.push('Business Name');
                                if (!einVal.isValid) errorFields.push('EIN');
                                if (!addrVal.isValid) errorFields.push('Business Address');
                                if (!phoneVal.isValid) errorFields.push('Phone Number');

                                setError(`Please correct the following required fields before saving: ${errorFields.join(', ')}. All fields marked with an asterisk (*) are required.`);
                                // Keep form visible - don't hide it
                                return;
                              }

                              // If validation passes, proceed with adding business
                              const success = await handleAddBusiness();
                              // Only hide form if business was successfully created
                              if (success) {
                                setShowBusinessForm(false);
                              }
                            }}
                            disabled={loading}
                            className="w-full bg-[var(--color-orange)] text-white py-4 rounded-xl text-base font-bold hover:bg-[var(--color-orange-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 hover:shadow-xl touch-manipulation flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            <span>Save & Add Business</span>
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-midnight transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      // If form is visible, check if there are unsaved changes
                      if (showBusinessForm) {
                        // Check if any required fields are filled (indicating user started filling the form)
                        if (newBusiness.businessName || newBusiness.ein || newBusiness.address || newBusiness.phone) {
                          // Validate the form before allowing to proceed
                          const nameVal = validateBusinessName(newBusiness.businessName);
                          const einVal = validateEIN(newBusiness.ein);
                          const addrVal = validateAddress(newBusiness.address, true);
                          const phoneVal = validatePhone(newBusiness.phone, true);

                          if (!nameVal.isValid || !einVal.isValid || !addrVal.isValid || !phoneVal.isValid) {
                            // Show validation errors and keep form visible
                            setBusinessErrors({
                              businessName: nameVal.error,
                              ein: einVal.error,
                              address: addrVal.error,
                              phone: phoneVal.error
                            });
                            const filingTypeLabel = filingType === 'amendment' ? 'amendment' : filingType === 'refund' ? 'refund' : 'filing';
                            setError(`Please complete all required business fields (marked with *) and click "Save & Add Business" to continue with your ${filingTypeLabel}. Alternatively, click "Cancel" to select an existing business from the list.`);
                            return;
                          } else {
                            // Form is valid but not saved - prompt to save first
                            const filingTypeLabel = filingType === 'amendment' ? 'amendment' : filingType === 'refund' ? 'refund' : 'filing';
                            setError(`Your business information looks complete. Please click "Save & Add Business" to save it before proceeding with your ${filingTypeLabel}.`);
                            return;
                          }
                        }
                      }

                      // If no business selected, show error
                      if (!selectedBusinessId) {
                        const filingTypeLabel = filingType === 'amendment' ? 'amendment' : filingType === 'refund' ? 'refund' : 'filing';
                        setError(`To continue with your ${filingTypeLabel}, please select a business from the list above or create a new one. Business information is required for IRS filing.`);
                        return;
                      }

                      // All checks passed, proceed to next step
                      setStep(3);
                    }}
                    className="px-5 py-2.5 bg-[var(--color-orange)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-orange-hover)] transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vehicles */}
            {step === 3 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Section Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
                  <h2 className="text-base sm:text-lg font-bold text-midnight">Vehicle Information</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Add and select vehicles for this filing</p>
                </div>

                <div className="p-4 sm:p-6">
                  {/* Tax Year & Month Selection */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tax Year</label>
                      <select
                        value={filingData.taxYear}
                        onChange={(e) => setFilingData({ ...filingData, taxYear: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 bg-white"
                      >
                        <option value="2025-2026">2025-2026</option>
                        <option value="2024-2025">2024-2025</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Used Month</label>
                      <select
                        value={filingData.firstUsedMonth}
                        onChange={(e) => setFilingData({ ...filingData, firstUsedMonth: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-400 bg-white"
                      >
                        {['July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March', 'April', 'May', 'June'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Loading Vehicles State */}
                  {vehicles.length === 0 && (loadingRef.current || loadingDraftRef.current) && (
                    <div className="mb-4 sm:mb-6 md:mb-8">
                      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-8 md:p-10 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-midnight mb-2">Loading Vehicles...</h3>
                            <p className="text-sm sm:text-base text-slate-600">
                              Please wait while we fetch your vehicles
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Vehicles - Show Add Vehicle Button */}
                  {vehicles.length === 0 && !loadingRef.current && !loadingDraftRef.current && (
                    <div className="mb-4 sm:mb-6 md:mb-8">
                      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 sm:p-8 md:p-10 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                            <Truck className="w-8 h-8 text-slate-500" />
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-midnight mb-2">No Vehicles Added Yet</h3>
                            <p className="text-sm sm:text-base text-slate-600 mb-4">
                              Add your first vehicle to continue with your filing
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setNewVehicle(prev => ({ ...prev, businessId: selectedBusinessId || '' }));
                              setShowAddModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[var(--color-orange)] text-white rounded-xl text-sm sm:text-base font-bold hover:bg-[var(--color-orange-hover)] active:scale-95 transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl touch-manipulation"
                          >
                            <Plus className="w-5 h-5" />
                            <span>Add Vehicle</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Vehicles List - Compact Card Grid */}
                  {vehicles.length > 0 && (
                    <div className="mb-4 sm:mb-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-[var(--color-text)]">
                          Select Vehicles
                        </label>
                        <span className="text-xs text-[var(--color-muted)]">
                          {selectedVehicleIds.length} of {vehicles.length} selected
                        </span>
                      </div>

                      {/* Taxable Vehicles - Always Visible Compact Cards */}
                      {vehicleCategories.taxable.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border-l-4 border-green-500 rounded-lg">
                            <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm font-semibold text-green-900">Taxable Vehicles</span>
                            <span className="text-xs text-green-700 ml-auto">
                              ({selectedVehicleIds.filter(id => vehicleCategories.taxable.some(v => v.id === id)).length}/{vehicleCategories.taxable.length})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {vehicleCategories.taxable.map((vehicle) => {
                              const isSelected = selectedVehicleIds.includes(vehicle.id);
                              const estimatedAmount = vehicleCategories.isRefund
                                ? calculateRefundAmount(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth)
                                : calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);

                              return (
                                <label
                                  key={vehicle.id}
                                  className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${isSelected
                                    ? 'bg-green-50 border-green-400 shadow-sm'
                                    : 'bg-white border-green-100 hover:border-green-300 hover:bg-green-50/30'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      let newSelectedIds;
                                      if (e.target.checked) {
                                        newSelectedIds = [...selectedVehicleIds, vehicle.id];
                                      } else {
                                        newSelectedIds = selectedVehicleIds.filter(id => id !== vehicle.id);
                                      }

                                      const validation = validateVehicleTypeCombination(newSelectedIds);
                                      if (validation.isValid) {
                                        setSelectedVehicleIds(newSelectedIds);
                                        setVehicleTypeError('');
                                      } else {
                                        setVehicleTypeError(validation.error);
                                      }
                                    }}
                                    className="w-4 h-4 text-green-600 rounded mt-0.5 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-mono text-xs font-semibold text-midnight break-all">{vehicle.vin}</div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                        Cat {vehicle.grossWeightCategory}
                                      </span>
                                      <span className="text-[10px] font-semibold text-green-700">
                                        {vehicleCategories.isRefund ? 'Refund' : 'Tax'}: ${estimatedAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Suspended Vehicles - Always Visible Compact Cards */}
                      {vehicleCategories.suspended.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span className="text-sm font-semibold text-amber-900">Suspended (Low Mileage)</span>
                            <span className="text-xs text-amber-700 ml-auto">
                              ({selectedVehicleIds.filter(id => vehicleCategories.suspended.some(v => v.id === id)).length}/{vehicleCategories.suspended.length})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {vehicleCategories.suspended.map((vehicle) => {
                              const isSelected = selectedVehicleIds.includes(vehicle.id);
                              const estimatedAmount = vehicleCategories.isRefund
                                ? calculateRefundAmount(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth)
                                : calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);

                              return (
                                <label
                                  key={vehicle.id}
                                  className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${isSelected
                                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                                    : 'bg-white border-amber-100 hover:border-amber-300 hover:bg-amber-50/30'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      let newSelectedIds;
                                      if (e.target.checked) {
                                        newSelectedIds = [...selectedVehicleIds, vehicle.id];
                                      } else {
                                        newSelectedIds = selectedVehicleIds.filter(id => id !== vehicle.id);
                                      }

                                      const validation = validateVehicleTypeCombination(newSelectedIds);
                                      if (validation.isValid) {
                                        setSelectedVehicleIds(newSelectedIds);
                                        setVehicleTypeError('');
                                      } else {
                                        setVehicleTypeError(validation.error);
                                      }
                                    }}
                                    className="w-4 h-4 text-amber-600 rounded mt-0.5 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-mono text-xs font-semibold text-midnight break-all">{vehicle.vin}</div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                        Cat {vehicle.grossWeightCategory}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold">
                                        Suspended
                                      </span>
                                      <span className="text-[10px] font-semibold text-amber-700">
                                        {vehicleCategories.isRefund ? 'Refund' : 'Tax'}: ${estimatedAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Credit Vehicles - Always Visible Compact Cards */}
                      {vehicleCategories.credit.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                            <CreditCard className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm font-semibold text-blue-900">Credit Vehicles</span>
                            <span className="text-xs text-blue-700 ml-auto">
                              ({selectedVehicleIds.filter(id => vehicleCategories.credit.some(v => v.id === id)).length}/{vehicleCategories.credit.length})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {vehicleCategories.credit.map((vehicle) => {
                              const isSelected = selectedVehicleIds.includes(vehicle.id);

                              return (
                                <label
                                  key={vehicle.id}
                                  className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${isSelected
                                    ? 'bg-blue-50 border-blue-400 shadow-sm'
                                    : 'bg-white border-blue-100 hover:border-blue-300 hover:bg-blue-50/30'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      let newSelectedIds;
                                      if (e.target.checked) {
                                        newSelectedIds = [...selectedVehicleIds, vehicle.id];
                                      } else {
                                        newSelectedIds = selectedVehicleIds.filter(id => id !== vehicle.id);
                                      }

                                      const validation = validateVehicleTypeCombination(newSelectedIds);
                                      if (validation.isValid) {
                                        setSelectedVehicleIds(newSelectedIds);
                                        setVehicleTypeError('');
                                      } else {
                                        setVehicleTypeError(validation.error);
                                      }
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded mt-0.5 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-mono text-xs font-semibold text-midnight break-all">{vehicle.vin}</div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                        Cat {vehicle.grossWeightCategory}
                                      </span>
                                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">
                                        Credit
                                      </span>
                                      {vehicle.creditReason && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                                          {vehicle.creditReason}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Prior Year Sold - Always Visible Compact Cards */}
                      {vehicleCategories.priorYearSold.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border-l-4 border-purple-500 rounded-lg">
                            <RotateCcw className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            <span className="text-sm font-semibold text-purple-900">Prior Year Sold</span>
                            <span className="text-xs text-purple-700 ml-auto">
                              ({selectedVehicleIds.filter(id => vehicleCategories.priorYearSold.some(v => v.id === id)).length}/{vehicleCategories.priorYearSold.length})
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {vehicleCategories.priorYearSold.map((vehicle) => {
                              const isSelected = selectedVehicleIds.includes(vehicle.id);

                              return (
                                <label
                                  key={vehicle.id}
                                  className={`flex items-start gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${isSelected
                                    ? 'bg-purple-50 border-purple-400 shadow-sm'
                                    : 'bg-white border-purple-100 hover:border-purple-300 hover:bg-purple-50/30'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      let newSelectedIds;
                                      if (e.target.checked) {
                                        newSelectedIds = [...selectedVehicleIds, vehicle.id];
                                      } else {
                                        newSelectedIds = selectedVehicleIds.filter(id => id !== vehicle.id);
                                      }

                                      const validation = validateVehicleTypeCombination(newSelectedIds);
                                      if (validation.isValid) {
                                        setSelectedVehicleIds(newSelectedIds);
                                        setVehicleTypeError('');
                                      } else {
                                        setVehicleTypeError(validation.error);
                                      }
                                    }}
                                    className="w-4 h-4 text-purple-600 rounded mt-0.5 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-mono text-xs font-semibold text-midnight break-all">{vehicle.vin}</div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-semibold">
                                        Prior Year Sold
                                      </span>
                                      {vehicle.soldTo && (
                                        <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">
                                          Sold: {vehicle.soldTo}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Vehicle Type Combination Error */}
                      {vehicleTypeError && (
                        <div className="mt-4 p-5 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl shadow-sm">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-bold text-red-900 mb-2">Invalid Vehicle Type Combination</h4>
                              <p className="text-sm text-red-800 mb-3">The selected vehicle types cannot be combined. Please choose one of the following valid combinations:</p>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-4 border border-red-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">All 4 types together</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">Only Taxable</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">Only Suspended</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">Taxable + Suspended + Credit</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">Taxable + Suspended + Prior Year</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">Taxable + Credit</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">Taxable + Suspended</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">Taxable + Prior Year</span>
                              </div>
                              <div className="flex items-start gap-2 md:col-span-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-700 font-medium">Suspended + Prior Year Sold</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Selected Vehicles Summary */}
                      {selectedVehicleIds.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-blue-900">
                              Selected Vehicles ({selectedVehicleIds.length})
                            </span>
                            <button
                              onClick={() => {
                                setSelectedVehicleIds([]);
                                setVehicleTypeError('');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              Clear All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedVehicleIds.map((vehicleId) => {
                              const vehicle = vehicles.find(v => v.id === vehicleId);
                              if (!vehicle) return null;
                              return (
                                <div
                                  key={vehicleId}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 rounded-lg"
                                >
                                  <span className="text-xs font-mono font-semibold text-[var(--color-text)]">
                                    {vehicle.vin}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newSelectedIds = selectedVehicleIds.filter(id => id !== vehicleId);
                                      setSelectedVehicleIds(newSelectedIds);
                                      const validation = validateVehicleTypeCombination(newSelectedIds);
                                      if (validation.isValid) {
                                        setVehicleTypeError('');
                                      } else {
                                        setVehicleTypeError(validation.error);
                                      }
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Refund Details for Selected Vehicles */}
                      {vehicleCategories.isRefund && selectedVehicleIds.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="text-sm font-semibold text-[var(--color-text)]">Refund Details</h4>
                          {selectedVehicleIds.map((vehicleId) => {
                            const vehicle = vehicles.find(v => v.id === vehicleId);
                            if (!vehicle) return null;
                            return (
                              <div key={vehicleId} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                <div className="font-mono font-semibold text-sm text-[var(--color-text)] mb-3">
                                  {vehicle.vin}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-[var(--color-text)] mb-1">Refund Reason</label>
                                    <select
                                      className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                                      value={refundDetails[vehicleId]?.reason || ''}
                                      onChange={(e) => setRefundDetails(prev => ({
                                        ...prev,
                                        [vehicleId]: { ...prev[vehicleId], reason: e.target.value }
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
                                      className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                                      value={refundDetails[vehicleId]?.date || ''}
                                      onChange={(e) => setRefundDetails(prev => ({
                                        ...prev,
                                        [vehicleId]: { ...prev[vehicleId], date: e.target.value }
                                      }))}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Add Another Vehicle Button */}
                      <button
                        onClick={() => {
                          setNewVehicle(prev => ({ ...prev, businessId: selectedBusinessId || '' }));
                          setShowAddModal(true);
                        }}
                        className="w-full mt-4 p-3 sm:p-4 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-orange)] hover:text-indigo-600/80 hover:bg-[var(--color-page-alt)] active:scale-95 transition flex items-center justify-center gap-2 touch-manipulation"
                      >
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="font-bold text-sm sm:text-base">+</span>
                        </div>
                        <span className="font-semibold text-sm sm:text-base">Add Another Vehicle</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/50">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-midnight transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (selectedVehicleIds.length > 0) setStep(4);
                      else {
                        const filingTypeLabel = filingType === 'amendment' ? 'amendment' : filingType === 'refund' ? 'refund claim' : 'filing';
                        setError(`To proceed with your ${filingTypeLabel}, please select at least one vehicle from the list above or add a new vehicle using the "Add Vehicle" button.`);
                      }
                    }}
                    className="px-5 py-2.5 bg-[var(--color-orange)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-orange-hover)] transition-colors shadow-lg shadow-orange-500/20"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Documents - HIDDEN (skipped in navigation) */}
            {false && step === 4 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-600 font-bold text-lg">4</div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text)]">Documents (Optional)</h2>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--color-muted)] ml-13">Upload supporting documents to help us process your filing faster</p>
                </div>
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
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2 bg-[var(--color-orange)] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold hover:bg-[var(--color-orange-hover)] active:scale-95 transition shadow-lg shadow-orange-500/20 touch-manipulation"
                  >
                    Review & Pay
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-orange)] text-white font-bold text-lg">5</div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text)]">Review Your Filing</h2>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--color-muted)] ml-13">Please review all information before proceeding to payment</p>
                </div>

                <div className="space-y-4 sm:space-y-6">

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
                              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">First Used Month</p>
                              <p className="text-base sm:text-lg font-semibold break-words">{weightIncreaseData.firstUsedMonth || 'Not set'}</p>
                            </div>
                            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200">
                              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Amended Month</p>
                              <p className="text-base sm:text-lg font-semibold break-words">{weightIncreaseData.amendedMonth || 'Not set'}</p>
                            </div>
                          </div>
                          <div className="bg-white p-3 sm:p-4 rounded-xl border border-orange-200">
                            <p className="text-xs text-orange-700 uppercase tracking-wider mb-1">Additional Tax Due</p>
                            <p className="text-xl sm:text-2xl font-bold text-orange-600">${weightIncreaseData.additionalTaxDue?.toFixed(2) || '0.00'}</p>
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
                                <p className="text-xs text-[var(--color-muted)] mb-1">First Used Month</p>
                                <p className="font-semibold text-sm sm:text-base break-words">{mileageExceededData.firstUsedMonth || 'Not specified'}</p>
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


                  {/* Filing Details Summary */}
                  <div className="bg-slate-50 rounded-lg p-4 sm:p-5 border border-slate-200">
                    <h3 className="font-bold text-base sm:text-lg text-[var(--color-text)] mb-3 sm:mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600/80" />
                      Filing Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">Filing Type</p>
                        <p className="font-bold text-lg capitalize text-[var(--color-text)]">{filingData.filingType || filingType}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">Tax Year</p>
                        <p className="font-bold text-lg text-[var(--color-text)]">{filingData.taxYear}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">First Used Month</p>
                        <p className="font-bold text-lg text-[var(--color-text)]">{filingData.firstUsedMonth}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-slate-200">
                        <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-2">Total Vehicles</p>
                        <p className="font-bold text-lg text-[var(--color-text)]">
                          {filingType === 'amendment'
                            ? (amendmentType === 'vin_correction' ? 'N/A' : '1')
                            : selectedVehicles.length
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business & Vehicle Summary */}
                  {selectedBusiness && (
                    <div className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200">
                      <h3 className="font-bold text-base sm:text-lg text-[var(--color-text)] mb-4 sm:mb-5 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-orange)]/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600/80" />
                        </div>
                        Business Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Business Name</p>
                          <p className="font-bold text-base text-[var(--color-text)] break-words">{selectedBusiness.businessName}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-slate-200">
                          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">EIN</p>
                          <p className="font-bold text-base font-mono text-[var(--color-text)]">{selectedBusiness.ein}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-slate-200 md:col-span-2">
                          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Address</p>
                          <p className="font-semibold text-sm text-[var(--color-text)] break-words">
                            {selectedBusiness.address}
                            {selectedBusiness.city && `, ${selectedBusiness.city}`}
                            {selectedBusiness.state && `, ${selectedBusiness.state}`}
                            {selectedBusiness.zip && ` ${selectedBusiness.zip}`}
                            {selectedBusiness.country && `, ${selectedBusiness.country}`}
                          </p>
                        </div>
                        {selectedBusiness.phone && (
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Phone</p>
                            <p className="font-semibold text-sm text-[var(--color-text)]">{selectedBusiness.phone}</p>
                          </div>
                        )}
                        {(selectedBusiness.signingAuthorityName || selectedBusiness.signingAuthorityPhone) && (
                          <div className="bg-white rounded-lg p-4 border border-slate-200">
                            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">Signing Authority</p>
                            <p className="font-semibold text-sm text-[var(--color-text)]">
                              {selectedBusiness.signingAuthorityName}
                              {selectedBusiness.signingAuthorityPhone && ` • ${selectedBusiness.signingAuthorityPhone}`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Vehicles Summary - Enhanced */}
                  {selectedVehicles.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-4 sm:p-5 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-base sm:text-lg text-[var(--color-text)] flex items-center gap-2">
                          <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600/80" />
                          Selected Vehicles
                        </h3>
                        <span className="px-2.5 py-1 bg-indigo-600 text-white">
                          {selectedVehicles.length} {selectedVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
                        </span>
                      </div>

                      {/* Group vehicles by type */}
                      {(() => {
                        const groupedVehicles = {
                          taxable: selectedVehicles.filter(v => v.vehicleType === 'taxable' || (!v.vehicleType && !v.isSuspended)),
                          suspended: selectedVehicles.filter(v => v.vehicleType === 'suspended' || (v.vehicleType === undefined && v.isSuspended)),
                          credit: selectedVehicles.filter(v => v.vehicleType === 'credit'),
                          priorYearSold: selectedVehicles.filter(v => v.vehicleType === 'priorYearSold')
                        };

                        const getVehicleTypeLabel = (vehicle) => {
                          if (vehicle.vehicleType === 'taxable') return 'Taxable Vehicle';
                          if (vehicle.vehicleType === 'suspended') return 'Suspended Vehicle';
                          if (vehicle.vehicleType === 'credit') return 'Credit Vehicle';
                          if (vehicle.vehicleType === 'priorYearSold') return 'Prior Year Sold Suspended Vehicle';
                          return vehicle.isSuspended ? 'Suspended Vehicle' : 'Taxable Vehicle';
                        };

                        const getVehicleTypeColor = (vehicle) => {
                          if (vehicle.vehicleType === 'taxable' || (!vehicle.vehicleType && !vehicle.isSuspended)) return 'green';
                          if (vehicle.vehicleType === 'suspended' || (vehicle.vehicleType === undefined && vehicle.isSuspended)) return 'amber';
                          if (vehicle.vehicleType === 'credit') return 'blue';
                          if (vehicle.vehicleType === 'priorYearSold') return 'purple';
                          return 'slate';
                        };

                        const getCreditReasonLabel = (reason) => {
                          const reasons = {
                            'sold': 'Sold',
                            'stolen': 'Stolen',
                            'destroyed': 'Destroyed',
                            'lowMileage': 'Low Mileage'
                          };
                          return reasons[reason] || reason || 'N/A';
                        };

                        return (
                          <div className="space-y-4">
                            {/* Taxable Vehicles */}
                            {groupedVehicles.taxable.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Taxable Vehicles ({groupedVehicles.taxable.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {groupedVehicles.taxable.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white rounded-lg p-3 border-2 border-l-4 border-green-200 border-l-green-500 hover:border-green-300 transition-all shadow-sm">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono text-xs font-semibold text-midnight break-all mb-1">{vehicle.vin}</p>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold">
                                              {getVehicleTypeLabel(vehicle)}
                                            </span>
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                              Cat: {vehicle.grossWeightCategory || 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      {vehicle.logging !== null && vehicle.logging !== undefined && (
                                        <div className="pt-2 border-t border-slate-100">
                                          <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-slate-600">Logging:</span>
                                            <span className="font-semibold text-slate-700">{vehicle.logging ? 'Yes' : 'No'}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suspended Vehicles */}
                            {groupedVehicles.suspended.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Suspended Vehicles ({groupedVehicles.suspended.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {groupedVehicles.suspended.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white rounded-lg p-3 border-2 border-l-4 border-amber-200 border-l-amber-500 hover:border-amber-300 transition-all shadow-sm">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono text-xs font-semibold text-midnight break-all mb-1">{vehicle.vin}</p>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-semibold">
                                              {getVehicleTypeLabel(vehicle)}
                                            </span>
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                              Cat: {vehicle.grossWeightCategory || 'W'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      {(vehicle.logging !== null && vehicle.logging !== undefined) || (vehicle.agricultural !== null && vehicle.agricultural !== undefined) ? (
                                        <div className="pt-2 border-t border-slate-100 space-y-1">
                                          {vehicle.logging !== null && vehicle.logging !== undefined && (
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="text-slate-600">Logging:</span>
                                              <span className="font-semibold text-slate-700">{vehicle.logging ? 'Yes' : 'No'}</span>
                                            </div>
                                          )}
                                          {vehicle.agricultural !== null && vehicle.agricultural !== undefined && (
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="text-slate-600">Agricultural:</span>
                                              <span className="font-semibold text-slate-700">{vehicle.agricultural ? 'Yes' : 'No'}</span>
                                            </div>
                                          )}
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Credit Vehicles */}
                            {groupedVehicles.credit.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Credit Vehicles ({groupedVehicles.credit.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {groupedVehicles.credit.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white rounded-lg p-3 border-2 border-l-4 border-blue-200 border-l-blue-500 hover:border-blue-300 transition-all shadow-sm">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono text-xs font-semibold text-midnight break-all mb-1">{vehicle.vin}</p>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-semibold">
                                              {getVehicleTypeLabel(vehicle)}
                                            </span>
                                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                              Cat: {vehicle.grossWeightCategory || 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      {(vehicle.logging !== null && vehicle.logging !== undefined) || vehicle.creditReason || vehicle.creditDate ? (
                                        <div className="pt-2 border-t border-slate-100 space-y-1">
                                          {vehicle.logging !== null && vehicle.logging !== undefined && (
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="text-slate-600">Logging:</span>
                                              <span className="font-semibold text-slate-700">{vehicle.logging ? 'Yes' : 'No'}</span>
                                            </div>
                                          )}
                                          {vehicle.creditReason && (
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="text-slate-600">Reason:</span>
                                              <span className="font-semibold text-blue-700">{getCreditReasonLabel(vehicle.creditReason)}</span>
                                            </div>
                                          )}
                                          {vehicle.creditDate && (
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="text-slate-600">Date:</span>
                                              <span className="font-semibold text-slate-700">
                                                {new Date(vehicle.creditDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Prior Year Sold Vehicles */}
                            {groupedVehicles.priorYearSold.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                                    Prior Year Sold ({groupedVehicles.priorYearSold.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {groupedVehicles.priorYearSold.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white rounded-lg p-3 border-2 border-l-4 border-purple-200 border-l-purple-500 hover:border-purple-300 transition-all shadow-sm">
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono text-xs font-semibold text-midnight break-all mb-1">{vehicle.vin}</p>
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-semibold">
                                              {getVehicleTypeLabel(vehicle)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      {(vehicle.soldTo || vehicle.soldDate) ? (
                                        <div className="pt-2 border-t border-slate-100 space-y-1">
                                          {vehicle.soldTo && (
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="text-slate-600">Sold To:</span>
                                              <span className="font-semibold text-slate-700 text-right max-w-[60%] break-words">{vehicle.soldTo}</span>
                                            </div>
                                          )}
                                          {vehicle.soldDate && (
                                            <div className="flex items-center justify-between text-[10px]">
                                              <span className="text-slate-600">Sold Date:</span>
                                              <span className="font-semibold text-slate-700">
                                                {new Date(vehicle.soldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-3 sm:pt-4 md:pt-6 border-t border-slate-200">
                  <button
                    onClick={() => setStep(3)}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base text-[var(--color-text)] hover:bg-slate-50 active:bg-slate-100 transition font-medium touch-manipulation"
                  >
                    Previous Step
                  </button>
                  <button
                    onClick={initiatePaymentFlow}
                    disabled={loading}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 bg-[var(--color-orange)] text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base lg:text-lg hover:bg-[var(--color-orange-hover)] active:scale-95 transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue Filing'}
                  </button>

                </div>
              </div>
            )}

            {/* Step 6: Payment Methods */}
            {step === 6 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 md:p-8 shadow-sm">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-orange)] text-white font-bold text-lg">6</div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text)]">Payment Methods</h2>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--color-muted)] ml-13">
                    {((filingType === 'amendment' && amendmentType === 'vin_correction') ||
                      (filingType === 'amendment' && amendmentType === 'mileage_exceeded' && (pricing?.totalTax || 0) === 0) ||
                      (filingType === 'standard' && (pricing?.totalTax || 0) === 0))
                      ? 'Complete the service fee payment below to proceed with your filing'
                      : 'Complete both payment sections to proceed with your filing'}
                  </p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* Section 1: IRS Payment Method - Always show for standard filings, show for amendments with tax */}
                  {(() => {
                    // Calculate IRS tax due for weight increase amendments
                    const weightIncreaseTax = (filingType === 'amendment' && amendmentType === 'weight_increase')
                      ? (weightIncreaseData?.additionalTaxDue || 0)
                      : 0;

                    // Get total tax from pricing or weight increase data
                    const totalTaxDue = weightIncreaseTax > 0
                      ? weightIncreaseTax
                      : (pricing?.totalTax || 0);

                    // Check if IRS payment is required
                    const isVinCorrection = filingType === 'amendment' && amendmentType === 'vin_correction';
                    const isMileageExceededNoTax = filingType === 'amendment' && amendmentType === 'mileage_exceeded' && totalTaxDue === 0;
                    const isStandardFilingNoTax = filingType === 'standard' && totalTaxDue === 0;
                    const isIRSRequired = totalTaxDue > 0;

                    // Show "Not Required" section for amendments with no tax or standard filings with $0 tax
                    if (isVinCorrection || isMileageExceededNoTax || isStandardFilingNoTax) {
                      return (
                        <div className="border-2 border-blue-200 rounded-xl p-4 sm:p-6 bg-blue-50/30">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                            <h3 className="text-lg sm:text-xl font-bold text-blue-900">IRS Tax Payment</h3>
                            <span className="text-xs sm:text-sm text-green-700 bg-green-100 px-2 py-1 rounded">Not Required</span>
                          </div>
                          <div className="ml-0 sm:ml-10">
                            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-green-900 mb-1">No IRS Payment Required</p>
                                  <p className="text-sm text-green-800">
                                    {isVinCorrection
                                      ? 'VIN corrections are FREE with no additional HVUT tax due. You only need to pay the service fee below.'
                                      : isMileageExceededNoTax
                                        ? 'For this mileage exceeded amendment, no additional HVUT tax is due. You only need to pay the service fee below.'
                                        : `Your selected vehicles (suspended and/or prior year sold) have $0.00 IRS tax due. Total IRS Payment: $${totalTaxDue.toFixed(2)}. You only need to pay the service fee below.`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (isIRSRequired) {
                      return (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">1</div>
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-midnight">IRS Tax Payment</h3>
                              <p className="text-xs text-slate-500">Total Tax Due: <span className="font-semibold text-midnight">${totalTaxDue.toFixed(2)}</span></p>
                            </div>
                            <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">Required</span>
                          </div>

                          <div className="p-4 sm:p-5 space-y-3">
                            {/* Option 1: EFW (Electronic Fund Withdrawal) */}
                            <label className={`block relative bg-white border rounded-lg transition-all cursor-pointer group ${irsPaymentMethod === 'efw' ? 'border-green-500 ring-1 ring-green-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                              <div className="p-4 flex items-start gap-4">
                                <div className="mt-0.5">
                                  <input
                                    type="radio"
                                    name="irsPaymentMethod"
                                    value="efw"
                                    checked={irsPaymentMethod === 'efw'}
                                    onChange={(e) => setIrsPaymentMethod(e.target.value)}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${irsPaymentMethod === 'efw' ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                    {irsPaymentMethod === 'efw' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`font-semibold text-sm sm:text-base ${irsPaymentMethod === 'efw' ? 'text-green-800' : 'text-slate-700'}`}>Pay by Bank Account (EFW)</span>
                                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
                                  </div>
                                  <p className="text-xs text-slate-500">Direct withdrawal from your checking or savings account. Secure & free.</p>

                                  {irsPaymentMethod === 'efw' && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-1">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="col-span-1 sm:col-span-2">
                                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Account Type
                                          </label>
                                          <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                              <input
                                                type="radio"
                                                name="accountType"
                                                value="checking"
                                                checked={bankDetails.accountType === 'checking'}
                                                onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                                                className="text-green-600 focus:ring-green-500"
                                              />
                                              <span className="text-sm text-slate-700">Checking</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                              <input
                                                type="radio"
                                                name="accountType"
                                                value="savings"
                                                checked={bankDetails.accountType === 'savings'}
                                                onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                                                className="text-green-600 focus:ring-green-500"
                                              />
                                              <span className="text-sm text-slate-700">Savings</span>
                                            </label>
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Routing Number <Info className="w-3 h-3 inline ml-0.5 text-slate-400" />
                                          </label>
                                          <input
                                            type="text"
                                            value={bankDetails.routingNumber}
                                            onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                                            placeholder="9 digits"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            maxLength="9"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Phone Number
                                          </label>
                                          <input
                                            type="tel"
                                            value={bankDetails.phoneNumber}
                                            onChange={(e) => {
                                              const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                              setBankDetails({ ...bankDetails, phoneNumber: value });
                                              if (bankDetailsErrors.phoneNumber) setBankDetailsErrors({ ...bankDetailsErrors, phoneNumber: '' });
                                            }}
                                            placeholder="(555) 123-4567"
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${bankDetailsErrors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                                          />
                                          {bankDetailsErrors.phoneNumber && (
                                            <p className="mt-1 text-[10px] text-red-500">{bankDetailsErrors.phoneNumber}</p>
                                          )}
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Account Number
                                          </label>
                                          <input
                                            type="text"
                                            value={bankDetails.accountNumber}
                                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '') })}
                                            placeholder="Account Number"
                                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Confirm Account Number
                                          </label>
                                          <input
                                            type="text"
                                            value={bankDetails.confirmAccountNumber}
                                            onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                                            placeholder="Re-enter Account Number"
                                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${bankDetails.accountNumber && bankDetails.confirmAccountNumber && bankDetails.accountNumber !== bankDetails.confirmAccountNumber
                                              ? 'border-red-300 bg-red-50'
                                              : 'border-slate-300'
                                              }`}
                                          />
                                          {bankDetails.accountNumber && bankDetails.confirmAccountNumber && bankDetails.accountNumber !== bankDetails.confirmAccountNumber && (
                                            <p className="mt-1 text-[10px] text-red-500">Mismatch</p>
                                          )}
                                        </div>
                                      </div>

                                      <div className="mt-3 flex items-start gap-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                                        <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-slate-500 leading-snug">
                                          Your account will be debited by the IRS for <strong>${totalTaxDue.toFixed(2)}</strong> after acceptance.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>

                            {/* Option 2: EFTPS */}
                            <label className={`block relative bg-white border rounded-lg transition-all cursor-pointer group ${irsPaymentMethod === 'eftps' ? 'border-blue-500 ring-1 ring-blue-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                              <div className="p-4 flex items-start gap-4">
                                <div className="mt-0.5">
                                  <input
                                    type="radio"
                                    name="irsPaymentMethod"
                                    value="eftps"
                                    checked={irsPaymentMethod === 'eftps'}
                                    onChange={(e) => setIrsPaymentMethod(e.target.value)}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${irsPaymentMethod === 'eftps' ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                    {irsPaymentMethod === 'eftps' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                  </div>
                                </div>
                                <div>
                                  <span className={`font-semibold text-sm sm:text-base block mb-1 ${irsPaymentMethod === 'eftps' ? 'text-blue-800' : 'text-slate-700'}`}>EFTPS (Federal Tax Payment System)</span>
                                  <p className="text-xs text-slate-500">You will arrange payment through the EFTPS website after filing.</p>
                                </div>
                              </div>
                            </label>

                            {/* Option 3: Credit or Debit Card */}
                            <label className={`block relative bg-white border rounded-lg transition-all cursor-pointer group ${irsPaymentMethod === 'credit_card' ? 'border-purple-500 ring-1 ring-purple-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                              <div className="p-4 flex items-start gap-4">
                                <div className="mt-0.5">
                                  <input
                                    type="radio"
                                    name="irsPaymentMethod"
                                    value="credit_card"
                                    checked={irsPaymentMethod === 'credit_card'}
                                    onChange={(e) => setIrsPaymentMethod(e.target.value)}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${irsPaymentMethod === 'credit_card' ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                    {irsPaymentMethod === 'credit_card' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <span className={`font-semibold text-sm sm:text-base block mb-1 ${irsPaymentMethod === 'credit_card' ? 'text-purple-800' : 'text-slate-700'}`}>Credit or Debit Card</span>
                                  <p className="text-xs text-slate-500">Pay via IRS-approved service provider (extra fees apply).</p>

                                  {irsPaymentMethod === 'credit_card' && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in">
                                      <label className="flex items-start gap-2 cursor-pointer">
                                        <input type="checkbox" className="mt-0.5 w-3.5 h-3.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500" />
                                        <span className="text-[11px] text-slate-600">
                                          I understand I must pay the tax due within 10 days to avoid penalties.
                                        </span>
                                      </label>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>

                            {/* Option 4: Check or Money Order */}
                            <label className={`block relative bg-white border rounded-lg transition-all cursor-pointer group ${irsPaymentMethod === 'check' ? 'border-orange-500 ring-1 ring-orange-500 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                              <div className="p-4 flex items-start gap-4">
                                <div className="mt-0.5">
                                  <input
                                    type="radio"
                                    name="irsPaymentMethod"
                                    value="check"
                                    checked={irsPaymentMethod === 'check'}
                                    onChange={(e) => setIrsPaymentMethod(e.target.value)}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${irsPaymentMethod === 'check' ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                    {irsPaymentMethod === 'check' && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <span className={`font-semibold text-sm sm:text-base block mb-1 ${irsPaymentMethod === 'check' ? 'text-orange-800' : 'text-slate-700'}`}>Check or Money Order</span>
                                  <p className="text-xs text-slate-500">Mail a check with the payment voucher.</p>

                                  {irsPaymentMethod === 'check' && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in">
                                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-[10px] sm:text-xs text-slate-600">
                                        Internal Revenue Service<br />
                                        P.O. Box 932500<br />
                                        Louisville, KY 40293-2500
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Section 2: Service Fee Payment */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${serviceFeePaid ? 'bg-green-600' : 'bg-emerald-600'} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>2</div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-midnight">Service Fee Payment</h3>
                        <p className="text-xs text-slate-500">
                          {serviceFeePaid ? 'Payment completed' : 'Payment required to submit'}
                        </p>
                      </div>
                      {serviceFeePaid ? (
                        <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Required</span>
                      )}
                    </div>

                    <div className="p-4 sm:p-5">
                      <p className="text-sm text-slate-600 mb-5">
                        {filingType === 'amendment' && (amendmentType === 'vin_correction' || amendmentType === 'mileage_exceeded' || amendmentType === 'weight_increase') ? (
                          <>
                            Total service fee: <span className="font-bold text-midnight">${(() => {
                              // For amendments with fixed $10 fee, calculate with sales tax
                              const baseFee = 10.00;
                              // Estimate sales tax (typically 7-10%, we'll use 7% as conservative estimate)
                              const estimatedSalesTax = baseFee * 0.07;
                              const fee = pricing.serviceFee > 0 ? pricing.serviceFee : baseFee;
                              const tax = pricing.salesTax > 0 ? pricing.salesTax : estimatedSalesTax;
                              return (fee + tax).toFixed(2);
                            })()}</span>. This must be paid before submission.
                            {(amendmentType === 'mileage_exceeded' || amendmentType === 'weight_increase') && (
                              (() => {
                                const weightIncreaseTax = amendmentType === 'weight_increase' ? (weightIncreaseData?.additionalTaxDue || 0) : 0;
                                const mileageTax = amendmentType === 'mileage_exceeded' ? (pricing?.totalTax || 0) : 0;
                                const taxDue = weightIncreaseTax || mileageTax;
                                return taxDue > 0 ? (
                                  <span className="block mt-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-100">
                                    <strong>Note:</strong> You will also need to pay the IRS tax amount (${taxDue.toFixed(2)}) shown above.
                                  </span>
                                ) : null;
                              })()
                            )}
                          </>
                        ) : (
                          <>
                            Please pay the platform service fee of <span className="font-bold text-midnight">${((pricing.serviceFee || 0) + (pricing.salesTax || 0)).toFixed(2)}</span> to process your filing.
                          </>
                        )}
                      </p>

                      {!serviceFeePaid ? (
                        <div className="max-w-xl">
                          <StripeWrapper
                            amount={(() => {
                              // For amendments with fixed $10 fee, ensure we use at least $10
                              if (filingType === 'amendment' && (amendmentType === 'vin_correction' || amendmentType === 'mileage_exceeded' || amendmentType === 'weight_increase')) {
                                const baseFee = 10.00;
                                const fee = pricing.serviceFee > 0 ? pricing.serviceFee : baseFee;
                                const tax = pricing.salesTax > 0 ? pricing.salesTax : (fee * 0.07); // Estimate 7% sales tax if not calculated
                                return fee + tax;
                              }
                              return (pricing.serviceFee || 0) + (pricing.salesTax || 0);
                            })()}
                            metadata={{
                              filingType: filingType,
                              userId: user.uid,
                              filingId: filingId,
                              businessId: selectedBusinessId
                            }}

                            onSuccess={async (paymentIntent) => {
                              console.log('Service Fee Payment Succeeded:', paymentIntent);

                              // Capture Acquisition & Analytics Data
                              try {
                                const acquisitionDataStr = localStorage.getItem('acquisition_data');
                                const acquisitionData = acquisitionDataStr ? JSON.parse(acquisitionDataStr) : {};

                                const pricingData = {
                                  amount: pricing.grandTotal, // Actual paid amount
                                  baseAmount: selectedVehicleIds.length > 1 ? (34.99 * selectedVehicleIds.length) : 34.99,
                                  serviceFee: pricing.serviceFee,
                                  salesTax: pricing.salesTax,
                                  totalTax: pricing.totalTax,
                                  discountAmount: pricing.bulkSavings + (pricing.couponDiscount || 0),
                                  couponCode: filingData?.couponCode || null,
                                  currency: 'USD',
                                  status: 'success'
                                };

                                const userLogData = {
                                  userId: user?.uid,
                                  userInfo: {
                                    email: user?.email,
                                    name: user?.displayName || 'User',
                                    phone: user?.phoneNumber || null
                                  },
                                  orderId: paymentIntent.id,
                                  paymentId: paymentIntent.payment_method,
                                  userAgent: navigator.userAgent,
                                  filingId: filingId,
                                  filingType: filingType,
                                  businessId: selectedBusinessId
                                };

                                // Combine and Log
                                await logPayment({
                                  ...acquisitionData,
                                  ...pricingData,
                                  ...userLogData
                                });

                                // Clear acquisition data after successful payment (optional, usually better to keep until session ends)
                                // localStorage.removeItem('acquisition_data');
                              } catch (logErr) {
                                console.error('Failed to log payment for analytics:', logErr);
                              }

                              setServiceFeePaid(true);
                              setError('');
                              // Only call handleSubmit if filingId is not already set (to prevent duplicate)
                              // The webhook will handle the final update, but we need to ensure filingId exists
                              if (!filingId) {
                                await handleSubmit();
                              } else {
                                // Update existing filing with payment status
                                const { updateFiling } = await import('@/lib/db');
                                await updateFiling(filingId, {
                                  paymentStatus: 'paid',
                                  status: 'processing',
                                  updatedAt: new Date().toISOString()
                                });
                                router.push(`/dashboard/filings/${filingId}`);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-green-800">Payment Successful</p>
                            <p className="text-xs text-green-700">Your service fee has been paid.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => setStep(5)}
                      className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border border-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base text-[var(--color-text)] hover:bg-slate-50 active:bg-slate-100 transition font-medium touch-manipulation"
                    >
                      Previous Step
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={
                        loading ||
                        (!irsPaymentMethod && (() => {
                          // Check IRS tax due for weight increase amendments
                          const weightIncreaseTax = (filingType === 'amendment' && amendmentType === 'weight_increase')
                            ? (weightIncreaseData?.additionalTaxDue || 0)
                            : 0;
                          const totalTaxDue = weightIncreaseTax > 0
                            ? weightIncreaseTax
                            : (pricing?.totalTax || 0);
                          return totalTaxDue > 0;
                        })()) ||
                        !serviceFeePaid ||
                        (irsPaymentMethod === 'efw' && (!bankDetails.routingNumber || !bankDetails.accountNumber || !bankDetails.confirmAccountNumber || !bankDetails.accountType || !bankDetails.phoneNumber || bankDetails.accountNumber !== bankDetails.confirmAccountNumber))
                      }
                      className="w-full sm:w-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 bg-[var(--color-orange)] text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base lg:text-lg hover:bg-[var(--color-orange-hover)] active:scale-95 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="hidden sm:inline">Processing...</span>
                          <span className="sm:hidden">Processing</span>
                        </>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Submit Filing</span>
                          <span className="sm:hidden">Submit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Sidebar - Right Side (Only shown on Step 6 - Payment) */}
          {step === 6 && (
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
                hideSubmitButton={step === 5 || step === 6}
                couponCode={couponCode}
                couponApplied={couponApplied}
                couponDiscount={couponDiscount}
                couponType={couponType}
                couponError={couponError}
                pricing={pricing}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={() => {
                  setCouponCode('');
                  setCouponApplied(false);
                  setCouponDiscount(0);
                  setCouponType('');
                  recalculatePricingWithCoupon('percentage', 0);
                }}
                onCouponCodeChange={(value) => setCouponCode(value.toUpperCase())}
              />
            </div>
          )}
        </div>

        {/* Mobile Pricing Summary - Sticky Bottom (Only shown on Step 6 - Payment) */}
        {
          step === 6 && (
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
                hideSubmitButton={step === 5 || step === 6}
              />
            </div>
          )
        }

        {/* Add Vehicle Modal */}
        <VehicleFormModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setVehicleErrors({});
          }}
          onSubmit={async (vehicleData) => {
            const success = await handleAddVehicle(vehicleData);
            if (success) {
              setShowAddModal(false);
            }
          }}
          businesses={businesses}
          initialBusinessId={selectedBusinessId || ''}
          loading={loading}
          submitButtonText="Add Vehicle"
          title="Add New Vehicle"
          externalErrors={vehicleErrors}
        />

        {/* Draft Warning Modal */}
        {
          showDraftWarningModal && existingDraft && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-white/20 animate-in zoom-in-95 duration-200">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shadow-sm">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-midnight leading-tight">
                        {existingDraft.isProcessingOrCompleted
                          ? 'Draft Order Already Available'
                          : existingDraft.isDeletable
                            ? 'Draft Filing Found'
                            : existingDraft.isSubmitted
                              ? 'Filing Already Submitted'
                              : 'Draft Filing Found'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {existingDraft.isProcessingOrCompleted
                          ? 'You have a draft order that is Processing or Completed'
                          : existingDraft.isDeletable
                            ? existingDraft.status === 'pending_payment'
                              ? 'Filing awaiting payment'
                              : 'Incomplete filing in progress'
                            : existingDraft.isSubmitted
                              ? 'Return currently processing'
                              : 'Incomplete filing in progress'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDraftWarningModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Draft Details */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <FileText className="w-24 h-24 text-slate-400" />
                    </div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Filing Details</h3>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm relative z-10">
                      <div>
                        <span className="text-xs text-slate-500 block mb-0.5">Filing Type</span>
                        <span className="font-semibold text-midnight">
                          {existingDraft.filingType === 'amendment'
                            ? existingDraft.amendmentType === 'vin_correction' ? 'VIN Correction'
                              : existingDraft.amendmentType === 'weight_increase' ? 'Weight Increase'
                                : existingDraft.amendmentType === 'mileage_exceeded' ? 'Mileage Exceeded'
                                  : 'Amendment'
                            : existingDraft.filingType === 'refund' ? 'Refund (8849)'
                              : 'Form 2290'}
                        </span>
                      </div>

                      {(existingDraft.filingData?.taxYear || existingDraft.taxYear) && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-0.5">Tax Year</span>
                          <span className="font-semibold text-midnight">
                            {existingDraft.filingData?.taxYear || existingDraft.taxYear}
                          </span>
                        </div>
                      )}

                      {(existingDraft.selectedBusinessId || existingDraft.businessId) && (
                        <div className="col-span-2">
                          <span className="text-xs text-slate-500 block mb-0.5">Business</span>
                          <span className="font-semibold text-midnight truncate block">
                            {businesses.find(b => b.id === (existingDraft.selectedBusinessId || existingDraft.businessId))?.businessName || 'Loading...'}
                          </span>
                        </div>
                      )}

                      {existingDraft.status && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-0.5">Status</span>
                          <span className={`font-semibold ${existingDraft.status === 'processing' || existingDraft.status === 'completed'
                              ? 'text-red-600'
                              : existingDraft.status === 'pending_payment'
                                ? 'text-orange-600'
                                : 'text-midnight'
                            }`}>
                            {existingDraft.status === 'processing' ? 'Processing' :
                              existingDraft.status === 'completed' ? 'Completed (IRS Acceptance)' :
                                existingDraft.status === 'pending_payment' ? 'Awaiting Payment' :
                                  existingDraft.status === 'awaiting_schedule_1' ? 'Awaiting Schedule 1' :
                                    existingDraft.status === 'submitted' ? 'Submitted' :
                                      existingDraft.status === 'draft' ? 'Draft' :
                                        existingDraft.status}
                          </span>
                        </div>
                      )}

                      {!existingDraft.isSubmitted && existingDraft.step && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-0.5">Progress</span>
                          <span className="font-semibold text-midnight">
                            Step {existingDraft.step === 4 ? 4 : existingDraft.step > 4 ? existingDraft.step - 1 : existingDraft.step} of 5
                          </span>
                        </div>
                      )}

                      {existingDraft.updatedAt && (
                        <div>
                          <span className="text-xs text-slate-500 block mb-0.5">Last Updated</span>
                          <span className="font-semibold text-midnight">
                            {existingDraft.updatedAt instanceof Date
                              ? existingDraft.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : new Date(existingDraft.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      {/* Vehicles Display */}
                      {(existingDraft.selectedVehicleIds || existingDraft.vehicleIds) && (existingDraft.selectedVehicleIds || existingDraft.vehicleIds).length > 0 && (
                        <div className="col-span-2">
                          <span className="text-xs text-slate-500 block mb-2">Vehicles ({((existingDraft.selectedVehicleIds || existingDraft.vehicleIds) || []).length})</span>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {((existingDraft.selectedVehicleIds || existingDraft.vehicleIds) || []).slice(0, 5).map((vehicleId, idx) => {
                              const vehicle = modalVehicles.find(v => v.id === vehicleId);
                              const typeLabel = vehicle ? (
                                vehicle.vehicleType === 'suspended' ? 'Suspended' :
                                  vehicle.vehicleType === 'credit' ? 'Credit' :
                                    vehicle.vehicleType === 'priorYearSold' ? 'Prior Year Sold' : 'Taxable'
                              ) : '';

                              return (
                                <div key={idx} className="flex flex-col p-2 rounded-lg bg-blue-50/50 border border-blue-100 shadow-sm min-w-[140px]">
                                  <span className="text-blue-800 text-xs font-mono font-bold mb-1 break-all">
                                    {vehicle?.vin || vehicleId?.slice(-8) || 'Loading...'}
                                  </span>
                                  {vehicle ? (
                                    <div className="flex flex-wrap gap-1">
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${vehicle.vehicleType === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                          vehicle.vehicleType === 'credit' ? 'bg-blue-100 text-blue-700' :
                                            vehicle.vehicleType === 'priorYearSold' ? 'bg-purple-100 text-purple-700' :
                                              'bg-emerald-100 text-emerald-700'
                                        }`}>
                                        {typeLabel}
                                      </span>
                                      {vehicle.grossWeightCategory && (
                                        <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">
                                          Cat: {vehicle.grossWeightCategory}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-slate-400 italic">Loading...</span>
                                  )}
                                </div>
                              );
                            })}
                            {((existingDraft.selectedVehicleIds || existingDraft.vehicleIds) || []).length > 5 && (
                              <div className="flex items-center justify-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 text-xs font-medium">
                                +{((existingDraft.selectedVehicleIds || existingDraft.vehicleIds) || []).length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning Message */}
                  <div className={`text-sm p-3 rounded-lg border ${existingDraft.isProcessingOrCompleted ||
                      (existingDraft.status === 'processing' || existingDraft.status === 'completed' || existingDraft.status === 'submitted') ||
                      existingDraft.filingId ||
                      (existingDraft.step >= 5)
                      ? 'bg-red-50 border-red-100 text-red-800'
                      : existingDraft.isDeletable && !existingDraft.isSubmitted
                        ? 'bg-amber-50 border-amber-100 text-amber-800'
                        : existingDraft.isSubmitted
                          ? 'bg-blue-50 border-blue-100 text-blue-800'
                          : 'bg-amber-50 border-amber-100 text-amber-800'
                    }`}>
                    {existingDraft.isProcessingOrCompleted ||
                      (existingDraft.status === 'processing' || existingDraft.status === 'completed' || existingDraft.status === 'submitted') ||
                      existingDraft.filingId ||
                      (existingDraft.step >= 5)
                      ? `You have a ${existingDraft.status === 'completed' ? 'completed' : existingDraft.status === 'submitted' ? 'submitted' : existingDraft.step >= 5 ? 'paid' : 'processing'} order for tax year ${existingDraft.filingData?.taxYear || existingDraft.taxYear || 'N/A'}. This order has already been paid and is being processed by our agent with the IRS. You can view this order or start a new filing for a different period.`
                      : existingDraft.status === 'pending_payment' || existingDraft.status === 'awaiting_schedule_1' || (existingDraft.isDeletable && !existingDraft.isSubmitted)
                        ? 'You have a draft filing that has not been paid. Starting a new filing will delete this draft filing.'
                        : existingDraft.isSubmitted && existingDraft.status !== 'pending_payment' && existingDraft.status !== 'awaiting_schedule_1'
                          ? 'You have already submitted a filing for this period. Starting a new filing will not affect this one.'
                          : 'Starting a new filing will delete this draft.'}
                  </div>
                </div>

                <div className="p-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end bg-slate-50/30">
                  {/* Show "Start New Filing" button for all cases */}
                  {/* For processing/completed orders, it won't delete (just closes modal and starts new) */}
                  {/* For deletable drafts, it will delete the draft */}
                  <button
                    onClick={async () => {
                      try {
                        // Delete if it's a deletable draft/filing (pending_payment, awaiting_schedule_1, draft status)
                        // Don't delete if it's processing/completed/submitted or has been paid (step >= 5)
                        const status = existingDraft.status || 'draft';
                        const isDeletable = !existingDraft.isProcessingOrCompleted &&
                          status !== 'processing' &&
                          status !== 'completed' &&
                          status !== 'submitted' &&
                          !existingDraft.filingId &&
                          (existingDraft.step === undefined || existingDraft.step < 5) &&
                          (status === 'pending_payment' ||
                            status === 'awaiting_schedule_1' ||
                            status === 'draft' ||
                            existingDraft.isDeletable);

                        console.log('[START NEW] Checking deletion:', {
                          status,
                          isSubmitted: existingDraft.isSubmitted,
                          isDeletable,
                          id: existingDraft.id,
                          draftId: existingDraft.draftId,
                          isFromFilingsCollection: existingDraft.isFromFilingsCollection,
                          isProcessingOrCompleted: existingDraft.isProcessingOrCompleted,
                          step: existingDraft.step
                        });

                        if (isDeletable) {
                          // Use the flag to determine which collection to delete from
                          if (existingDraft.isFromFilingsCollection || existingDraft.isSubmitted || status === 'pending_payment' || status === 'awaiting_schedule_1') {
                            // It's a filing with deletable status, delete from filings collection
                            const filingId = existingDraft.id;
                            console.log('[START NEW] Deleting filing from filings collection, status:', status, 'ID:', filingId);
                            try {
                              await deleteFiling(filingId);
                              console.log('[START NEW] Successfully deleted filing:', filingId);
                            } catch (error) {
                              console.error('[START NEW] Error deleting filing:', error);
                              throw error; // Re-throw to show error to user
                            }
                          } else {
                            // It's a draft, delete from draftFilings collection
                            const draftIdToDelete = existingDraft.draftId || existingDraft.id;
                            console.log('[START NEW] Deleting draft from draftFilings collection, ID:', draftIdToDelete);
                            try {
                              await deleteDraftFiling(draftIdToDelete);
                              console.log('[START NEW] Successfully deleted draft:', draftIdToDelete);
                            } catch (error) {
                              console.error('[START NEW] Error deleting draft:', error);
                              throw error; // Re-throw to show error to user
                            }
                          }
                        } else {
                          console.log('[START NEW] Not deletable, skipping deletion');
                        }
                        // For processing/completed orders, just close modal and start new (don't delete)

                        setShowDraftWarningModal(false);
                        setExistingDraft(null);
                        // Reset form state and proceed to Step 2
                        setDraftId(null);
                        setFilingId(null);
                        setStep(2);
                        setFilingType('standard');
                        setSelectedBusinessId('');
                        setSelectedVehicleIds([]);
                        setAmendmentType('');
                      } catch (error) {
                        console.error('Error handling start new:', error);
                        setError('Failed to process request. Please try again.');
                      }
                    }}
                    className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-colors text-sm shadow-sm"
                  >
                    Start New Filing
                  </button>
                  <button
                    onClick={() => {
                      setShowDraftWarningModal(false);
                      // If it's processing/completed/submitted, or has filingId, or step >= 5, go to filings detail page
                      if (existingDraft.isProcessingOrCompleted ||
                        existingDraft.status === 'processing' ||
                        existingDraft.status === 'completed' ||
                        existingDraft.status === 'submitted' ||
                        existingDraft.filingId ||
                        existingDraft.step >= 5) {
                        // If it has a filingId, use that; otherwise use the draft id
                        const filingIdToUse = existingDraft.filingId || existingDraft.id;
                        router.push(`/dashboard/filings/${filingIdToUse}`);
                      }
                      // If it's a deletable filing (pending_payment, awaiting_schedule_1), resume the filing process
                      else if (existingDraft.isDeletable && existingDraft.isSubmitted) {
                        // It's a filing with deletable status, resume it
                        router.push(`/dashboard/new-filing?draft=${existingDraft.id}`);
                      }
                      // If it's a true draft, resume it
                      else {
                        router.push(`/dashboard/new-filing?draft=${existingDraft.id || existingDraft.draftId}`);
                      }
                    }}
                    className="px-4 py-2.5 bg-[var(--color-orange)] text-white rounded-lg font-semibold hover:bg-[var(--color-orange-hover)] transition-all shadow-lg shadow-orange-500/20 hover:shadow-xl text-sm flex items-center justify-center gap-2"
                  >
                    {existingDraft.isProcessingOrCompleted ||
                      existingDraft.status === 'processing' ||
                      existingDraft.status === 'completed' ||
                      existingDraft.status === 'submitted' ||
                      existingDraft.filingId ||
                      existingDraft.step >= 5
                      ? 'View Existing Order'
                      : existingDraft.isDeletable && existingDraft.isSubmitted
                        ? 'Continue Filing'
                        : existingDraft.isSubmitted
                          ? 'View Existing Filing'
                          : 'Continue Draft'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </div >
    </ProtectedRoute >
  );
}

export default function NewFilingPage() {
  console.log('[PAGE] NewFilingPage component rendering');

  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      }>
        <NewFilingContent />
      </Suspense>
    </ProtectedRoute>
  );
}
