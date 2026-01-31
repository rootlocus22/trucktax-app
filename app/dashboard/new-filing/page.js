'use client';

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getBusinessesByUser, createBusiness, getVehiclesByUser, createVehicle, createFiling, getFilingsByUser, getVehicle } from '@/lib/db';
import { saveDraftFiling, getDraftFiling, deleteDraftFiling } from '@/lib/draftHelpers';
// Duplicate filing detection imports removed - functionality disabled
import { uploadInputDocument } from '@/lib/storage';
import { calculateFilingCost } from '@/app/actions/pricing'; // Server Action
import { calculateTax, calculateRefundAmount, calculateWeightIncreaseAdditionalTax, calculateMileageExceededTax } from '@/lib/pricing'; // Keep for client-side estimation only
import { validateBusinessName, validateEIN, formatEIN, validateVIN, validateAddress, validatePhone, validateState, validateZip, validateCity, validateCountry, validatePIN } from '@/lib/validation';
import { validateVINCorrection, validateWeightIncrease, validateMileageExceeded, calculateWeightIncreaseDueDate, getAmendmentTypeConfig } from '@/lib/amendmentHelpers';
import { FileText, AlertTriangle, RefreshCw, Truck, Info, CreditCard, CheckCircle, ShieldCheck, AlertCircle, RotateCcw, Clock, Building2, ChevronUp, ChevronDown, Loader2, X, Plus } from 'lucide-react';
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
                <span className={`text-base sm:text-lg md:text-xl font-bold ${hasData && filingType === 'refund' ? 'text-emerald-600' : hasData ? 'text-slate-900' : 'text-slate-400'}`}>
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
                className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-[var(--color-orange)] text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-[var(--color-orange-hover)] active:scale-95 transition touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5 sm:gap-2"
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
                    <div className="pb-2 border-b border-slate-200">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-blue-700">Payment to IRS</span>
                          <p className="text-xs text-slate-500 mt-0.5">IRS Tax Amount</p>
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
                    <div className="pb-2 border-b border-slate-200">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-orange-700">Service Fee</span>
                          <p className="text-xs text-slate-500 mt-0.5">Platform service fee</p>
                        </div>
                        <span className="text-sm font-bold text-orange-700">
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
                        <span className="text-xs font-bold text-orange-700">Total Due Now</span>
                        <span className="text-sm font-bold text-orange-700">
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
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filingId, setFilingId] = useState(null);

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
    const loadDraft = async () => {
      if (!searchParams || !user) return;
      const draftParam = searchParams.get('draft');
      if (draftParam) {
        try {
          const draft = await getDraftFiling(draftParam);
          if (draft && draft.userId === user.uid) {
            // Restore draft state
            setDraftId(draft.id);
            // Skip step 4 (Documents) - redirect to step 5 if draft was on step 4
            if (draft.step) {
              setStep(draft.step === 4 ? 5 : draft.step);
            }
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
            if (draft.filingId) setFilingId(draft.filingId);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    };
    loadDraft();
  }, [user, searchParams]);

  // Auto-redirect from step 4 (Documents) to step 5 (Review) since step 4 is hidden
  useEffect(() => {
    if (step === 4) {
      setStep(5);
    }
  }, [step]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Reload vehicles when business selection changes
  useEffect(() => {
    if (user && selectedBusinessId) {
      const reloadVehicles = async () => {
        try {
          const filteredVehicles = await getVehiclesByUser(user.uid, selectedBusinessId);
          setVehicles(filteredVehicles);
          // Clear selected vehicles if they're not in the filtered list
          const filteredIds = filteredVehicles.map(v => v.id);
          setSelectedVehicleIds(prev => prev.filter(id => filteredIds.includes(id)));
        } catch (error) {
          console.error('Error reloading vehicles:', error);
        }
      };
      reloadVehicles();
    } else if (user && !selectedBusinessId) {
      // If no business selected, load all vehicles
      const reloadVehicles = async () => {
        try {
          const allVehicles = await getVehiclesByUser(user.uid);
          setVehicles(allVehicles);
        } catch (error) {
          console.error('Error reloading vehicles:', error);
        }
      };
      reloadVehicles();
    }
  }, [selectedBusinessId, user]);

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

  // Fetch Pricing from Server - Now runs on all steps for real-time pricing
  useEffect(() => {
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
  }, [step, selectedVehicleIds, filingType, filingData.firstUsedMonth, filingData, vehicles, selectedBusinessId, businesses, amendmentType, weightIncreaseData, mileageExceededData]);

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
      // Load vehicles filtered by selected business if one is selected
      const userVehicles = selectedBusinessId
        ? await getVehiclesByUser(user.uid, selectedBusinessId)
        : await getVehiclesByUser(user.uid);
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
      await loadData();
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

      // Reload vehicles from database to get the new vehicle
      await loadData();

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
        inputDocuments: [],
        pricing: pricing,
        paymentDetails: paymentDetails,
        status: 'processing', // Start as 'processing' since eform is in progress
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

      // Update filing with document URLs
      if (documentUrls.length > 0) {
        const { updateFiling } = await import('@/lib/db');
        await updateFiling(finalFilingId, { inputDocuments: documentUrls });
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

  return (
    <ProtectedRoute>
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6 lg:py-8 pb-24 xl:pb-8 max-w-[1600px] xl:mx-auto">
        {/* Header - Mobile Optimized */}
        <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-10 w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            <div className="w-full md:w-auto">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-1 sm:mb-2">New Filing Request</h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 font-medium">
                Step {step === 4 ? 4 : step > 4 ? step - 1 : step} of 5: <span className="text-[var(--color-orange)] font-bold">{getStepTitle(step)}</span>
              </p>
            </div>
            {/* Desktop Stepper */}
            <div className="hidden md:flex items-center">
              {[1, 2, 3, 5, 6].map((s) => {
                // Map step numbers for display (skip step 4)
                const displayStep = s > 4 ? s - 1 : s;
                const isCurrentStep = s === step;
                const isCompleted = s < step || (step === 4 && s === 3); // If we're on step 4 (hidden), step 3 is completed

                return (
                  <div key={s} className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2
                      ${isCompleted
                        ? 'bg-[var(--color-orange)] border-[var(--color-orange)] text-white'
                        : isCurrentStep
                          ? 'bg-white border-[var(--color-orange)] text-[var(--color-orange)] shadow-lg scale-110'
                          : 'bg-white border-slate-200 text-slate-400'
                      }
                    `}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : displayStep}
                    </div>
                    {s < 6 && (
                      <div className={`w-12 h-1 transition-colors duration-300 ${isCompleted ? 'bg-[var(--color-orange)]' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Mobile Progress Bar with Label */}
          <div className="md:hidden mb-3 sm:mb-4 md:mb-6">
            <div className="flex justify-between items-center mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900">Step {step === 4 ? 4 : step > 4 ? step - 1 : step} of 5</span>
              <span className="text-xs sm:text-sm font-medium text-[var(--color-orange)]">{getStepTitle(step)}</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-orange)] transition-all duration-500 ease-out"
                style={{ width: `${((step === 4 ? 4 : step > 4 ? step - 1 : step) / 5) * 100}%` }}
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

        </div>

        {/* Main Content - Full width for steps 1-5, Grid for step 6 */}
        <div className={`w-full ${step === 6 ? 'grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-3 sm:gap-4 md:gap-6 lg:gap-8' : 'mx-auto'}`}>
          {/* Form Content */}
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Step 1: Filing Type */}
            {step === 1 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-lg">1</div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Select Filing Type</h2>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--color-muted)] ml-13">Choose the type of Form 2290 filing you need</p>
                </div>

                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  <button
                    onClick={() => {
                      setFilingType('standard');
                      setAmendmentType('');
                      setShowBusinessForm(false); // Reset business form visibility to show existing businesses
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
                        setError('Please select the type of amendment you need: VIN Correction, Weight Increase, or Mileage Exceeded. Each amendment type has different requirements.');
                        return;
                      }
                      setError('');
                      setStep(2);
                    }}
                    className="px-6 py-3 bg-[#ff8b3d] text-white rounded-xl font-semibold hover:bg-[var(--color-orange-hover)] transition shadow-sm"
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
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
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
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono touch-manipulation"
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
                          className={`w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation ${weightIncreaseData.vehicleId ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
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
                          className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
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
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
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
                        className="w-full px-4 py-3 text-base border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white touch-manipulation"
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
                          className={`w-4 h-4 text-[var(--color-orange)] border-gray-300 rounded focus:ring-[var(--color-orange)] ${weightIncreaseData.vehicleId ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          className="w-4 h-4 text-[var(--color-orange)] border-gray-300 rounded focus:ring-[var(--color-orange)]"
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

                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                        Month Vehicle Was First Used in Tax Period *
                        <span className="text-xs text-[var(--color-muted)] ml-2">(Required for tax calculation per IRS)</span>
                      </label>
                      <select
                        value={mileageExceededData.firstUsedMonth}
                        onChange={(e) => setMileageExceededData({ ...mileageExceededData, firstUsedMonth: e.target.value })}
                        className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] appearance-none bg-white"
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
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-[#ff8b3d] text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-[var(--color-orange-hover)] active:scale-95 transition shadow-sm touch-manipulation"
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
                            Business Name <span className="text-[var(--color-orange)]">*</span>
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
                          <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.businessName}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          EIN (Employer Identification Number) <span className="text-[var(--color-orange)]">*</span>
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
                          <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.ein}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Business Address <span className="text-[var(--color-orange)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={newBusiness.address}
                          onChange={(e) => handleBusinessChange('address', e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.address ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                          placeholder="123 Main St"
                        />
                        {businessErrors.address && (
                          <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.address}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          City <span className="text-[var(--color-orange)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={newBusiness.city}
                          onChange={(e) => handleBusinessChange('city', e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.city ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                          placeholder="Los Angeles"
                        />
                        {businessErrors.city && (
                          <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.city}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          State <span className="text-[var(--color-orange)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={newBusiness.state}
                          onChange={(e) => handleBusinessChange('state', e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] uppercase ${businessErrors.state ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                          placeholder="CA"
                          maxLength="2"
                        />
                        {businessErrors.state && (
                          <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.state}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          ZIP Code <span className="text-[var(--color-orange)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={newBusiness.zip}
                          onChange={(e) => handleBusinessChange('zip', e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono ${businessErrors.zip ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                          placeholder="12345"
                          maxLength="10"
                        />
                        {businessErrors.zip && (
                          <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.zip}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Country <span className="text-[var(--color-orange)]">*</span>
                        </label>
                        <input
                          type="text"
                          value={newBusiness.country}
                          onChange={(e) => handleBusinessChange('country', e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.country ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                          placeholder="United States"
                        />
                        {businessErrors.country && (
                          <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.country}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                          Phone <span className="text-[var(--color-orange)]">*</span>
                        </label>
                        <input
                          type="tel"
                          value={newBusiness.phone}
                          onChange={(e) => handleBusinessChange('phone', e.target.value)}
                          className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] ${businessErrors.phone ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                          placeholder="(555) 123-4567"
                        />
                        {businessErrors.phone && (
                          <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.phone}</span>
                          </p>
                        )}
                      </div>
                      {/* Signing Authority Section */}
                      <div className="md:col-span-2 border-t border-[var(--color-border)] pt-4 mt-2">
                        <div className="flex items-center gap-2 mb-4">
                          <h3 className="text-base font-semibold text-[var(--color-text)]">Signing Authority</h3>
                          <div className="group relative">
                            <Info className="w-4 h-4 text-[var(--color-muted)] cursor-help" />
                            <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                              The person authorized to sign Form 2290 on behalf of the business. This person must have the legal authority to sign tax returns.
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                              Name <span className="text-[var(--color-orange)]">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.signingAuthorityName}
                              onChange={(e) => handleBusinessChange('signingAuthorityName', e.target.value)}
                              className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation ${businessErrors.signingAuthorityName ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                              placeholder="John Doe"
                            />
                            {businessErrors.signingAuthorityName && (
                              <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityName}</span>
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                              Phone <span className="text-[var(--color-orange)]">*</span>
                            </label>
                            <input
                              type="tel"
                              value={newBusiness.signingAuthorityPhone}
                              onChange={(e) => handleBusinessChange('signingAuthorityPhone', e.target.value)}
                              className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation ${businessErrors.signingAuthorityPhone ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                              placeholder="(555) 123-4567"
                            />
                            {businessErrors.signingAuthorityPhone && (
                              <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityPhone}</span>
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                              PIN <span className="text-[var(--color-orange)]">*</span>
                            </label>
                            <input
                              type="text"
                              value={newBusiness.signingAuthorityPIN}
                              onChange={(e) => handleBusinessChange('signingAuthorityPIN', e.target.value)}
                              className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono touch-manipulation ${businessErrors.signingAuthorityPIN ? 'border-red-500' : 'border-[var(--color-border)]'}`}
                              placeholder="12345"
                              maxLength="5"
                            />
                            {businessErrors.signingAuthorityPIN && (
                              <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.signingAuthorityPIN}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Third Party Designee */}
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <label className="block text-sm font-medium text-[var(--color-text)]">
                              Third Party Designee
                            </label>
                            <div className="group relative">
                              <Info className="w-4 h-4 text-[var(--color-muted)] cursor-help" />
                              <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-gray-800 text-white text-xs rounded shadow-lg hidden group-hover:block z-10">
                                A third party designee is someone you authorize to discuss your Form 2290 with the IRS. This is optional.
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setNewBusiness({ ...newBusiness, hasThirdPartyDesignee: false, thirdPartyDesigneeName: '', thirdPartyDesigneePhone: '', thirdPartyDesigneePIN: '' })}
                              className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-200 touch-manipulation w-fit ${newBusiness.hasThirdPartyDesignee === false
                                ? 'border-[var(--color-orange)] bg-orange-50 shadow-md scale-[1.02]'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]'
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${newBusiness.hasThirdPartyDesignee === false
                                ? 'border-[var(--color-orange)] bg-[var(--color-orange)]'
                                : 'border-slate-300 bg-white'
                                }`}>
                                {newBusiness.hasThirdPartyDesignee === false && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className={`text-sm font-semibold ${newBusiness.hasThirdPartyDesignee === false
                                ? 'text-[var(--color-orange)]'
                                : 'text-slate-600'
                                }`}>
                                No
                              </span>
                              {newBusiness.hasThirdPartyDesignee === false && (
                                <CheckCircle className="w-4 h-4 text-[var(--color-orange)] absolute top-2 right-2" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewBusiness({ ...newBusiness, hasThirdPartyDesignee: true })}
                              className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all duration-200 touch-manipulation w-fit ${newBusiness.hasThirdPartyDesignee === true
                                ? 'border-[var(--color-orange)] bg-orange-50 shadow-md scale-[1.02]'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]'
                                }`}
                            >
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${newBusiness.hasThirdPartyDesignee === true
                                ? 'border-[var(--color-orange)] bg-[var(--color-orange)]'
                                : 'border-slate-300 bg-white'
                                }`}>
                                {newBusiness.hasThirdPartyDesignee === true && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span className={`text-sm font-semibold ${newBusiness.hasThirdPartyDesignee === true
                                ? 'text-[var(--color-orange)]'
                                : 'text-slate-600'
                                }`}>
                                Yes
                              </span>
                              {newBusiness.hasThirdPartyDesignee === true && (
                                <CheckCircle className="w-4 h-4 text-[var(--color-orange)] absolute top-2 right-2" />
                              )}
                            </button>
                          </div>

                          {newBusiness.hasThirdPartyDesignee && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                              <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                  Name <span className="text-[var(--color-orange)]">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={newBusiness.thirdPartyDesigneeName}
                                  onChange={(e) => handleBusinessChange('thirdPartyDesigneeName', e.target.value)}
                                  className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation ${businessErrors.thirdPartyDesigneeName ? 'border-red-500' : 'border-blue-300'}`}
                                  placeholder="Jane Smith"
                                />
                                {businessErrors.thirdPartyDesigneeName && (
                                  <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneeName}</span>
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                  Phone <span className="text-[var(--color-orange)]">*</span>
                                </label>
                                <input
                                  type="tel"
                                  value={newBusiness.thirdPartyDesigneePhone}
                                  onChange={(e) => handleBusinessChange('thirdPartyDesigneePhone', e.target.value)}
                                  className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation ${businessErrors.thirdPartyDesigneePhone ? 'border-red-500' : 'border-blue-300'}`}
                                  placeholder="(555) 123-4567"
                                />
                                {businessErrors.thirdPartyDesigneePhone && (
                                  <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneePhone}</span>
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                  PIN <span className="text-[var(--color-orange)]">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={newBusiness.thirdPartyDesigneePIN}
                                  onChange={(e) => handleBusinessChange('thirdPartyDesigneePIN', e.target.value)}
                                  className={`w-full px-4 py-3 text-base border rounded-xl focus:ring-2 focus:ring-[var(--color-orange)] font-mono touch-manipulation ${businessErrors.thirdPartyDesigneePIN ? 'border-red-500' : 'border-blue-300'}`}
                                  placeholder="12345"
                                  maxLength="5"
                                />
                                {businessErrors.thirdPartyDesigneePIN && (
                                  <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{businessErrors.thirdPartyDesigneePIN}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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
                        className="w-full md:col-span-2 bg-[#ff8b3d] text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:bg-[var(--color-orange-hover)] active:scale-95 transition disabled:opacity-50 mt-2 sm:mt-4 shadow-sm touch-manipulation"
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
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#ff8b3d] text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-[var(--color-orange-hover)] active:scale-95 transition shadow-sm touch-manipulation"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vehicles */}
            {step === 3 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 md:p-8 lg:p-10 shadow-sm">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold text-lg">3</div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--color-text)]">Vehicle Information</h2>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--color-muted)] ml-13">Add and select vehicles for this filing</p>
                </div>

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

                {/* Existing Vehicles List - Categorized Dropdowns */}
                {vehicles.length > 0 && (
                  <div className="mb-4 sm:mb-6 md:mb-8 space-y-4">
                    <label className="block text-sm font-bold text-[var(--color-text)] mb-3 sm:mb-4">
                      Select Vehicles to File
                    </label>

                    {/* Taxable Vehicles Dropdown */}
                    {vehicleCategories.taxable.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setTaxableDropdownOpen(!taxableDropdownOpen);
                            setSuspendedDropdownOpen(false);
                            setCreditDropdownOpen(false);
                            setPriorYearSoldDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 sm:py-4 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-300 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 text-green-600" />
                            <div>
                              <div className="font-bold text-green-900">Taxable Vehicles</div>
                              <div className="text-xs text-green-700">
                                {selectedVehicleIds.filter(id => vehicleCategories.taxable.some(v => v.id === id)).length} of {vehicleCategories.taxable.length} selected
                              </div>
                            </div>
                          </div>
                          {taxableDropdownOpen ? (
                            <ChevronUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-green-600" />
                          )}
                        </button>

                        {taxableDropdownOpen && (
                          <div className="mt-2 border-2 border-green-200 rounded-xl bg-white shadow-lg max-h-[400px] overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {vehicleCategories.taxable.map((vehicle) => {
                                const isSelected = selectedVehicleIds.includes(vehicle.id);
                                const estimatedAmount = vehicleCategories.isRefund
                                  ? calculateRefundAmount(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth)
                                  : calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);

                                return (
                                  <label
                                    key={vehicle.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-green-50 transition ${isSelected ? 'bg-green-100 border border-green-300' : ''}`}
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
                                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-mono font-bold text-sm text-[var(--color-text)] break-all">
                                        {vehicle.vin}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                          Cat: {vehicle.grossWeightCategory}
                                        </span>
                                        <span className={`text-xs font-semibold ${vehicleCategories.isRefund ? 'text-green-600' : 'text-[var(--color-text)]'}`}>
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
                      </div>
                    )}

                    {/* Suspended Vehicles Dropdown */}
                    {vehicleCategories.suspended.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setSuspendedDropdownOpen(!suspendedDropdownOpen);
                            setTaxableDropdownOpen(false);
                            setCreditDropdownOpen(false);
                            setPriorYearSoldDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 sm:py-4 bg-amber-50 border-2 border-amber-200 rounded-xl hover:border-amber-300 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-amber-600" />
                            <div>
                              <div className="font-bold text-amber-900">Suspended Vehicles (Low Mileage)</div>
                              <div className="text-xs text-amber-700">
                                {selectedVehicleIds.filter(id => vehicleCategories.suspended.some(v => v.id === id)).length} of {vehicleCategories.suspended.length} selected • $0 Tax
                              </div>
                            </div>
                          </div>
                          {suspendedDropdownOpen ? (
                            <ChevronUp className="w-5 h-5 text-amber-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-amber-600" />
                          )}
                        </button>

                        {suspendedDropdownOpen && (
                          <div className="mt-2 border-2 border-amber-200 rounded-xl bg-white shadow-lg max-h-[400px] overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {vehicleCategories.suspended.map((vehicle) => {
                                const isSelected = selectedVehicleIds.includes(vehicle.id);
                                const estimatedAmount = vehicleCategories.isRefund
                                  ? calculateRefundAmount(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth)
                                  : calculateTax(vehicle.grossWeightCategory, vehicle.isSuspended, filingData.firstUsedMonth);

                                return (
                                  <label
                                    key={vehicle.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-amber-50 transition ${isSelected ? 'bg-amber-100 border border-amber-300' : ''}`}
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
                                      className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-mono font-bold text-sm text-[var(--color-text)] break-all">
                                        {vehicle.vin}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                          Cat: {vehicle.grossWeightCategory}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold">
                                          Suspended
                                        </span>
                                        <span className={`text-xs font-semibold ${vehicleCategories.isRefund ? 'text-green-600' : 'text-[var(--color-text)]'}`}>
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
                      </div>
                    )}

                    {/* Credit Vehicles Dropdown */}
                    {vehicleCategories.credit.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setCreditDropdownOpen(!creditDropdownOpen);
                            setTaxableDropdownOpen(false);
                            setSuspendedDropdownOpen(false);
                            setPriorYearSoldDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 sm:py-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-300 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <div>
                              <div className="font-bold text-blue-900">Credit Vehicles</div>
                              <div className="text-xs text-blue-700">
                                {selectedVehicleIds.filter(id => vehicleCategories.credit.some(v => v.id === id)).length} of {vehicleCategories.credit.length} selected
                              </div>
                            </div>
                          </div>
                          {creditDropdownOpen ? (
                            <ChevronUp className="w-5 h-5 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-blue-600" />
                          )}
                        </button>

                        {creditDropdownOpen && (
                          <div className="mt-2 border-2 border-blue-200 rounded-xl bg-white shadow-lg max-h-[400px] overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {vehicleCategories.credit.map((vehicle) => {
                                const isSelected = selectedVehicleIds.includes(vehicle.id);

                                return (
                                  <label
                                    key={vehicle.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition ${isSelected ? 'bg-blue-100 border border-blue-300' : ''}`}
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
                                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-mono font-bold text-sm text-[var(--color-text)] break-all">
                                        {vehicle.vin}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                          Cat: {vehicle.grossWeightCategory}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">
                                          Credit
                                        </span>
                                        {vehicle.creditReason && (
                                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
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
                      </div>
                    )}

                    {/* Prior Year Sold Suspended Vehicles Dropdown */}
                    {vehicleCategories.priorYearSold.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setPriorYearSoldDropdownOpen(!priorYearSoldDropdownOpen);
                            setTaxableDropdownOpen(false);
                            setSuspendedDropdownOpen(false);
                            setCreditDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 sm:py-4 bg-purple-50 border-2 border-purple-200 rounded-xl hover:border-purple-300 transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <RotateCcw className="w-5 h-5 text-purple-600" />
                            <div>
                              <div className="font-bold text-purple-900">Prior Year Sold Suspended Vehicles</div>
                              <div className="text-xs text-purple-700">
                                {selectedVehicleIds.filter(id => vehicleCategories.priorYearSold.some(v => v.id === id)).length} of {vehicleCategories.priorYearSold.length} selected
                              </div>
                            </div>
                          </div>
                          {priorYearSoldDropdownOpen ? (
                            <ChevronUp className="w-5 h-5 text-purple-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-purple-600" />
                          )}
                        </button>

                        {priorYearSoldDropdownOpen && (
                          <div className="mt-2 border-2 border-purple-200 rounded-xl bg-white shadow-lg max-h-[400px] overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {vehicleCategories.priorYearSold.map((vehicle) => {
                                const isSelected = selectedVehicleIds.includes(vehicle.id);

                                return (
                                  <label
                                    key={vehicle.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-purple-50 transition ${isSelected ? 'bg-purple-100 border border-purple-300' : ''}`}
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
                                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-mono font-bold text-sm text-[var(--color-text)] break-all">
                                        {vehicle.vin}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-semibold">
                                          Prior Year Sold
                                        </span>
                                        {vehicle.soldTo && (
                                          <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded">
                                            Sold To: {vehicle.soldTo}
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
                      className="w-full mt-4 p-3 sm:p-4 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-orange)] hover:text-[var(--color-orange)] hover:bg-[var(--color-page-alt)] active:scale-95 transition flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-bold text-sm sm:text-base">+</span>
                      </div>
                      <span className="font-semibold text-sm sm:text-base">Add Another Vehicle</span>
                    </button>
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
                      if (selectedVehicleIds.length > 0) setStep(4);
                      else {
                        const filingTypeLabel = filingType === 'amendment' ? 'amendment' : filingType === 'refund' ? 'refund claim' : 'filing';
                        setError(`To proceed with your ${filingTypeLabel}, please select at least one vehicle from the list above or add a new vehicle using the "Add Vehicle" button.`);
                      }
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2 bg-[#ff8b3d] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold hover:bg-[var(--color-orange-hover)] active:scale-95 transition shadow-sm touch-manipulation"
                  >
                    Next Step
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
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-2 bg-[#ff8b3d] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold hover:bg-[var(--color-orange-hover)] active:scale-95 transition shadow-sm touch-manipulation"
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
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 sm:p-6 md:p-8 border border-slate-200">
                    <h3 className="font-bold text-lg sm:text-xl text-[var(--color-text)] mb-4 sm:mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-orange)]" />
                      Filing Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-5 sm:p-6 md:p-8 border-2 border-slate-200 shadow-sm">
                      <h3 className="font-bold text-lg sm:text-xl text-[var(--color-text)] mb-6 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-orange)]/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-orange)]" />
                        </div>
                        Business Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 sm:p-6 md:p-8 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg sm:text-xl text-[var(--color-text)] flex items-center gap-2">
                          <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-orange)]" />
                          Selected Vehicles
                        </h3>
                        <span className="px-3 py-1 bg-[var(--color-orange)] text-white rounded-full text-sm font-bold">
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
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                    Taxable Vehicles ({groupedVehicles.taxable.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {groupedVehicles.taxable.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-300 transition-all shadow-sm">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono font-bold text-base text-slate-900 break-all mb-1">{vehicle.vin}</p>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                                              {getVehicleTypeLabel(vehicle)}
                                            </span>
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                              Cat: {vehicle.grossWeightCategory || 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                        {vehicle.logging !== null && vehicle.logging !== undefined && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">Logging:</span>
                                            <span className="font-semibold text-slate-700">{vehicle.logging ? 'Yes' : 'No'}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Suspended Vehicles */}
                            {groupedVehicles.suspended.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                    Suspended Vehicles ({groupedVehicles.suspended.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {groupedVehicles.suspended.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white rounded-xl p-4 border-2 border-amber-200 hover:border-amber-300 transition-all shadow-sm">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono font-bold text-base text-slate-900 break-all mb-1">{vehicle.vin}</p>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
                                              {getVehicleTypeLabel(vehicle)}
                                            </span>
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                              Cat: {vehicle.grossWeightCategory || 'W'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                        {vehicle.logging !== null && vehicle.logging !== undefined && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">Logging:</span>
                                            <span className="font-semibold text-slate-700">{vehicle.logging ? 'Yes' : 'No'}</span>
                                          </div>
                                        )}
                                        {vehicle.agricultural !== null && vehicle.agricultural !== undefined && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">Agricultural:</span>
                                            <span className="font-semibold text-slate-700">{vehicle.agricultural ? 'Yes' : 'No'}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Credit Vehicles */}
                            {groupedVehicles.credit.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                    Credit Vehicles ({groupedVehicles.credit.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {groupedVehicles.credit.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono font-bold text-base text-slate-900 break-all mb-1">{vehicle.vin}</p>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                                              {getVehicleTypeLabel(vehicle)}
                                            </span>
                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                              Cat: {vehicle.grossWeightCategory || 'N/A'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                        {vehicle.logging !== null && vehicle.logging !== undefined && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">Logging:</span>
                                            <span className="font-semibold text-slate-700">{vehicle.logging ? 'Yes' : 'No'}</span>
                                          </div>
                                        )}
                                        {vehicle.creditReason && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">Reason:</span>
                                            <span className="font-semibold text-blue-700">{getCreditReasonLabel(vehicle.creditReason)}</span>
                                          </div>
                                        )}
                                        {vehicle.creditDate && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">Date:</span>
                                            <span className="font-semibold text-slate-700">
                                              {new Date(vehicle.creditDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Prior Year Sold Vehicles */}
                            {groupedVehicles.priorYearSold.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                                    Prior Year Sold Suspended Vehicles ({groupedVehicles.priorYearSold.length})
                                  </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {groupedVehicles.priorYearSold.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white rounded-xl p-4 border-2 border-purple-200 hover:border-purple-300 transition-all shadow-sm">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-mono font-bold text-base text-slate-900 break-all mb-1">{vehicle.vin}</p>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                                              {getVehicleTypeLabel(vehicle)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                        {vehicle.soldTo && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">Sold To:</span>
                                            <span className="font-semibold text-slate-700 text-right max-w-[60%] break-words">{vehicle.soldTo}</span>
                                          </div>
                                        )}
                                        {vehicle.soldDate && (
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">Sold Date:</span>
                                            <span className="font-semibold text-slate-700">
                                              {new Date(vehicle.soldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                          </div>
                                        )}
                                      </div>
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
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 bg-[var(--color-orange)] text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base lg:text-lg hover:bg-[var(--color-orange-hover)] active:scale-95 transition shadow-lg flex items-center justify-center gap-2 touch-manipulation disabled:opacity-50"
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
                    {(filingType === 'amendment' && amendmentType === 'vin_correction') ||
                      (filingType === 'amendment' && amendmentType === 'mileage_exceeded' && (pricing?.totalTax || 0) === 0)
                      ? 'Complete the service fee payment below to proceed with your filing'
                      : 'Complete both payment sections to proceed with your filing'}
                  </p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* Section 1: IRS Payment Method - Only show if tax is due */}
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
                    const isIRSRequired = totalTaxDue > 0;
                    
                    if (isVinCorrection || isMileageExceededNoTax) {
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
                                    {amendmentType === 'vin_correction'
                                      ? 'VIN corrections are FREE with no additional HVUT tax due. You only need to pay the service fee below.'
                                      : 'For this mileage exceeded amendment, no additional HVUT tax is due. You only need to pay the service fee below.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (isIRSRequired) {
                      return (
                    <div className="border-2 border-blue-200 rounded-xl p-4 sm:p-6 bg-blue-50/30">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                        <h3 className="text-lg sm:text-xl font-bold text-blue-900">IRS Tax Payment</h3>
                        <span className="text-xs sm:text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">Required</span>
                      </div>
                      <>
                        <p className="text-sm text-blue-800 mb-4 ml-0 sm:ml-10">Choose how you'd like to pay the IRS tax amount (${totalTaxDue.toFixed(2)})</p>
                        <div className="space-y-3 sm:space-y-4 ml-0 sm:ml-10">
                          {/* Option 1: EFW (Electronic Fund Withdrawal) */}
                          <div className={`w-full border-2 rounded-lg p-4 sm:p-5 transition-all ${irsPaymentMethod === 'efw' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300'}`}>
                            <label className="flex items-start gap-3 cursor-pointer w-full">
                              <input
                                type="radio"
                                name="irsPaymentMethod"
                                value="efw"
                                checked={irsPaymentMethod === 'efw'}
                                onChange={(e) => setIrsPaymentMethod(e.target.value)}
                                className="mt-1 w-5 h-5 text-green-600"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-base sm:text-lg">Option 1: EFW (Electronic Fund Withdrawal)</span>
                                  {irsPaymentMethod === 'efw' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Direct bank withdrawal - Free & Fast (Recommended)</p>
                                {irsPaymentMethod === 'efw' && (
                                  <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Routing Number <span className="text-red-500">*</span>
                                        <Info className="w-4 h-4 inline ml-1 text-slate-400" />
                                      </label>
                                      <input
                                        type="text"
                                        value={bankDetails.routingNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                                        placeholder="Enter Routing Number*"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        maxLength="9"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Account Number <span className="text-red-500">*</span>
                                        <Info className="w-4 h-4 inline ml-1 text-slate-400" />
                                      </label>
                                      <input
                                        type="text"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value.replace(/\D/g, '') })}
                                        placeholder="Enter Account Number*"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Confirm Account Number <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        value={bankDetails.confirmAccountNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value.replace(/\D/g, '') })}
                                        placeholder="Re-enter Account Number*"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                      />
                                      {bankDetails.accountNumber && bankDetails.confirmAccountNumber && bankDetails.accountNumber !== bankDetails.confirmAccountNumber && (
                                        <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">Account numbers do not match</span>
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Account Type <span className="text-red-500">*</span>
                                      </label>
                                      <select
                                        value={bankDetails.accountType}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                      >
                                        <option value="">Select the Account Type*</option>
                                        <option value="checking">Checking</option>
                                        <option value="savings">Savings</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Phone Number <span className="text-[var(--color-orange)]">*</span>
                                      </label>
                                      <input
                                        type="tel"
                                        value={bankDetails.phoneNumber}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                                          setBankDetails({ ...bankDetails, phoneNumber: value });
                                          // Clear error when user starts typing
                                          if (bankDetailsErrors.phoneNumber) {
                                            setBankDetailsErrors({ ...bankDetailsErrors, phoneNumber: '' });
                                          }
                                        }}
                                        placeholder="(555) 123-4567"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-orange)] ${bankDetailsErrors.phoneNumber ? 'border-red-500' : 'border-slate-300'}`}
                                      />
                                      {bankDetailsErrors.phoneNumber && (
                                        <p className="mt-1 w-full text-xs text-red-600 flex items-center gap-1">
                                          <AlertCircle className="w-3 h-3 flex-shrink-0" /> <span className="flex-1">{bankDetailsErrors.phoneNumber}</span>
                                        </p>
                                      )}
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                                      <p className="text-xs sm:text-sm text-red-700">
                                        <strong>Notice:</strong> The IRS will automatically deduct the tax amount payable directly from your account after your filing is accepted.
                                      </p>
                                      <div className="mt-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-green-600" />
                                        <span className="text-xs text-green-700 font-semibold">Ident Trust Secured</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>

                          {/* Option 2: EFTPS */}
                          <div className={`w-full border-2 rounded-lg p-4 sm:p-5 transition-all ${irsPaymentMethod === 'eftps' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'}`}>
                            <label className="flex items-start gap-3 cursor-pointer w-full">
                              <input
                                type="radio"
                                name="irsPaymentMethod"
                                value="eftps"
                                checked={irsPaymentMethod === 'eftps'}
                                onChange={(e) => setIrsPaymentMethod(e.target.value)}
                                className="mt-1 w-5 h-5 text-blue-600"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-base sm:text-lg">Option 2: EFTPS</span>
                                  {irsPaymentMethod === 'eftps' && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Electronic Federal Tax Payment System</p>
                                {irsPaymentMethod === 'eftps' && (
                                  <p className="text-sm text-slate-600 mt-2">
                                    Once the IRS accepts your filing you will receive the payment link via email.
                                  </p>
                                )}
                              </div>
                            </label>
                          </div>

                          {/* Option 3: Credit or Debit Card */}
                          <div className={`w-full border-2 rounded-lg p-4 sm:p-5 transition-all ${irsPaymentMethod === 'credit_card' ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-purple-300'}`}>
                            <label className="flex items-start gap-3 cursor-pointer w-full">
                              <input
                                type="radio"
                                name="irsPaymentMethod"
                                value="credit_card"
                                checked={irsPaymentMethod === 'credit_card'}
                                onChange={(e) => setIrsPaymentMethod(e.target.value)}
                                className="mt-1 w-5 h-5 text-purple-600"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-base sm:text-lg">Option 3: Credit or Debit Card</span>
                                  {irsPaymentMethod === 'credit_card' && <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Pay via credit/debit card (3rd party fee applies)</p>
                                {irsPaymentMethod === 'credit_card' && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-sm text-slate-600">
                                      Once the IRS accepts your filing, you will receive the payment link. The IRS uses service providers that may charge an additional service fee additional to the tax amount payable.
                                    </p>
                                    <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                      <strong>Note:</strong> The IRS imposes a limit on the frequency of credit card payments for Form 2290.
                                    </p>
                                    <label className="flex items-center gap-2 mt-3">
                                      <input type="checkbox" className="w-4 h-4" />
                                      <span className="text-sm text-slate-600">
                                        I understand that if I fail to pay the tax due within 10 business days, the IRS may assess penalties.
                                      </span>
                                    </label>
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>

                          {/* Option 4: Check or Money Order */}
                          <div className={`w-full border-2 rounded-lg p-4 sm:p-5 transition-all ${irsPaymentMethod === 'check' ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}>
                            <label className="flex items-start gap-3 cursor-pointer w-full">
                              <input
                                type="radio"
                                name="irsPaymentMethod"
                                value="check"
                                checked={irsPaymentMethod === 'check'}
                                onChange={(e) => setIrsPaymentMethod(e.target.value)}
                                className="mt-1 w-5 h-5 text-orange-600"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-base sm:text-lg">Option 4: Check or Money Order</span>
                                  {irsPaymentMethod === 'check' && <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />}
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Mail a check or money order with voucher</p>
                                {irsPaymentMethod === 'check' && (
                                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                                    <p>
                                      Make the tax amount payable to the 'United States Treasury'. Please mention your EIN, phone number, and 'Form 2290' on the money order/check. Print your money order voucher, enclose it, and mail it to:
                                    </p>
                                    <div className="bg-white p-3 rounded border border-slate-200 font-mono text-sm">
                                      Internal Revenue Service<br />
                                      P.O. Box 932500<br />
                                      Louisville, KY 40293-2500
                                    </div>
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>
                        </div>
                      </>
                    </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Section 2: Service Fee Payment */}
                  <div className={`border-2 rounded-xl p-4 sm:p-6 transition-all ${serviceFeePaid ? 'border-green-500 bg-green-50' : 'border-orange-200 bg-orange-50/30'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-full ${serviceFeePaid ? 'bg-green-600' : 'bg-orange-600'} text-white flex items-center justify-center font-bold text-sm`}>2</div>
                      <h3 className="text-lg sm:text-xl font-bold text-orange-900">Service Fee Payment</h3>
                      {serviceFeePaid ? (
                        <span className="text-xs sm:text-sm text-green-700 bg-green-100 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="text-xs sm:text-sm text-orange-700 bg-orange-100 px-2 py-1 rounded">Required</span>
                      )}
                    </div>
                    <p className="text-sm text-orange-800 mb-4 ml-0 sm:ml-10">
                      {filingType === 'amendment' && (amendmentType === 'vin_correction' || amendmentType === 'mileage_exceeded' || amendmentType === 'weight_increase') ? (
                        <>
                          Pay the platform service fee (${(() => {
                            // For amendments with fixed $10 fee, calculate with sales tax
                            const baseFee = 10.00;
                            // Estimate sales tax (typically 7-10%, we'll use 7% as conservative estimate)
                            const estimatedSalesTax = baseFee * 0.07;
                            const fee = pricing.serviceFee > 0 ? pricing.serviceFee : baseFee;
                            const tax = pricing.salesTax > 0 ? pricing.salesTax : estimatedSalesTax;
                            return fee + tax;
                          })().toFixed(2)}) using a US payment method. This payment must be completed before your filing can be submitted.
                          {(amendmentType === 'mileage_exceeded' || amendmentType === 'weight_increase') && (
                            (() => {
                              const weightIncreaseTax = amendmentType === 'weight_increase' ? (weightIncreaseData?.additionalTaxDue || 0) : 0;
                              const mileageTax = amendmentType === 'mileage_exceeded' ? (pricing?.totalTax || 0) : 0;
                              const taxDue = weightIncreaseTax || mileageTax;
                              return taxDue > 0 ? (
                                <span className="block mt-2 text-xs text-orange-700">
                                  Note: You will also need to pay the IRS tax amount (${taxDue.toFixed(2)}) shown above.
                                </span>
                              ) : null;
                            })()
                          )}
                        </>
                      ) : (
                        <>
                          Pay the platform service fee (${((pricing.serviceFee || 0) + (pricing.salesTax || 0)).toFixed(2)}) using a US payment method. This payment must be completed before your filing can be submitted.
                        </>
                      )}
                    </p>

                    {!serviceFeePaid ? (
                      <div className="ml-0 sm:ml-10 space-y-4">
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
                      <div className="ml-0 sm:ml-10 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Service fee payment completed successfully!</span>
                        </div>
                      </div>
                    )}
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
        {step === 6 && (
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
        )}

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
      </div>
    </ProtectedRoute>
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
