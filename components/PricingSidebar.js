'use client';

import { useEffect, useState } from 'react';
import { calculateFilingCost } from '@/app/actions/pricing';
import { CreditCard, ShieldCheck, Loader2, Info, CheckCircle, FileText, Building2, Truck } from 'lucide-react';

export function PricingSidebar({
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
  onSubmit,
  loading = false,
  hideSubmitButton = false,
  // New props for coupon and pricing
  couponCode = '',
  couponApplied = false,
  couponDiscount = 0,
  couponType = '',
  couponError = '',
  pricing = {},
  onApplyCoupon = () => { },
  onRemoveCoupon = () => { },
  onCouponCodeChange = () => { }
}) {
  const [internalPricing, setInternalPricing] = useState({
    totalTax: 0,
    serviceFee: 0,
    salesTax: 0,
    grandTotal: 0,
    totalRefund: 0
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [breakdown, setBreakdown] = useState([]);
  const [vehicleBreakdown, setVehicleBreakdown] = useState([]);

  // Use provided pricing prop if available, otherwise use internal state
  const finalPricing = pricing && pricing.totalTax !== undefined ? pricing : internalPricing;

  // Get selected vehicles list for display purposes
  const selectedVehiclesList = vehicles.filter(v => selectedVehicleIds.includes(v.id));

  useEffect(() => {
    const fetchPricing = async () => {
      // On step 6 (payment step), always use pricing prop if provided - skip internal calculation
      if (step === 6 && pricing && pricing.totalTax !== undefined) {
        return;
      }

      // If pricing prop is provided and has been calculated (not just initial zeros), skip internal calculation
      // For VIN corrections, mileage exceeded, and weight increase, always allow calculation since they might not have vehicles
      const isVinCorrection = filingType === 'amendment' && amendmentType === 'vin_correction';
      const isMileageExceeded = filingType === 'amendment' && amendmentType === 'mileage_exceeded';
      const isWeightIncrease = filingType === 'amendment' && amendmentType === 'weight_increase';
      if (pricing && pricing.totalTax !== undefined && !isVinCorrection && !isMileageExceeded && !isWeightIncrease && (pricing.serviceFee > 0 || pricing.totalTax > 0 || pricing.totalRefund > 0)) {
        return;
      }

      // Don't calculate if we don't have minimum required data
      // Exception: VIN corrections, mileage exceeded, and weight increase don't require vehicles, so allow pricing calculation
      const hasMileageExceededVehicle = isMileageExceeded && mileageExceededData?.vehicleId;
      const hasWeightIncreaseData = isWeightIncrease && weightIncreaseData?.originalWeightCategory && weightIncreaseData?.newWeightCategory && weightIncreaseData?.amendedMonth;
      if (!filingType || (selectedVehicleIds.length === 0 && !isVinCorrection && !hasMileageExceededVehicle && !hasWeightIncreaseData)) {
        setInternalPricing({
          totalTax: 0,
          serviceFee: 0,
          salesTax: 0,
          grandTotal: 0,
          totalRefund: 0,
          bulkSavings: 0
        });
        setBreakdown([]);
        setVehicleBreakdown([]);
        return;
      }

      const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

      // Parse state from address
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
          { state }
        );

        if (result.success) {
          setInternalPricing({
            ...result.breakdown,
            bulkSavings: result.breakdown.bulkSavings || 0
          });

          // Store vehicle breakdown for detailed display
          if (result.breakdown.vehicleBreakdown) {
            setVehicleBreakdown(result.breakdown.vehicleBreakdown);
          }

          // Build breakdown for display
          const breakdownItems = [];

          if (filingType === 'refund') {
            breakdownItems.push({
              label: 'Estimated Refund',
              value: result.breakdown.totalRefund || 0,
              type: 'refund'
            });
          } else {
            breakdownItems.push({
              label: 'IRS Tax Amount',
              value: result.breakdown.totalTax || 0,
              type: 'tax'
            });
          }

          // Calculate service fee description based on vehicle count
          let serviceFeeDescription = '';
          let tierName = '';
          let pricePerVehicle = 0;

          // Special handling for amendment types with fixed service fees
          if (filingType === 'amendment' && amendmentType === 'vin_correction') {
            serviceFeeDescription = 'VIN correction service fee';
          } else if (filingType === 'amendment' && amendmentType === 'mileage_exceeded') {
            serviceFeeDescription = 'Mileage exceeded service fee';
          } else if (selectedVehiclesList.length >= 25) {
            tierName = 'Enterprise';
            pricePerVehicle = 21.99;
            serviceFeeDescription = `Enterprise pricing: $${pricePerVehicle.toFixed(2)} × ${selectedVehiclesList.length}`;
          } else if (selectedVehiclesList.length >= 10) {
            tierName = 'Fleet';
            pricePerVehicle = 25.99;
            serviceFeeDescription = `Fleet pricing: $${pricePerVehicle.toFixed(2)} × ${selectedVehiclesList.length}`;
          } else if (selectedVehiclesList.length >= 2) {
            tierName = 'Multi-vehicle';
            pricePerVehicle = 29.99;
            serviceFeeDescription = `Multi-vehicle pricing: $${pricePerVehicle.toFixed(2)} × ${selectedVehiclesList.length}`;
          } else {
            tierName = 'Single vehicle';
            pricePerVehicle = 34.99;
            serviceFeeDescription = `Single vehicle pricing: $${pricePerVehicle.toFixed(2)}`;
          }

          breakdownItems.push({
            label: 'Service Fee',
            value: result.breakdown.serviceFee || 0,
            type: 'fee',
            description: serviceFeeDescription
          });

          if (result.breakdown.salesTax > 0) {
            breakdownItems.push({
              label: 'Sales Tax',
              value: result.breakdown.salesTax || 0,
              type: 'tax',
              description: 'Estimated based on location'
            });
          }

          setBreakdown(breakdownItems);

          // Store vehicle breakdown for detailed tax calculation display
          if (result.breakdown.vehicleBreakdown && Array.isArray(result.breakdown.vehicleBreakdown)) {
            setVehicleBreakdown(result.breakdown.vehicleBreakdown);
          } else {
            setVehicleBreakdown([]);
          }
        }
      } catch (err) {
        console.error('Pricing fetch error:', err);
      } finally {
        setPricingLoading(false);
      }
    };

    // Debounce pricing calculation
    const timeoutId = setTimeout(fetchPricing, 300);
    return () => clearTimeout(timeoutId);
  }, [filingType, filingData, selectedVehicleIds, vehicles, selectedBusinessId, businesses, amendmentType, weightIncreaseData, mileageExceededData, pricing]);

  // For VIN corrections, mileage exceeded, and weight increase, hasData should be true even without vehicles
  const isVinCorrection = filingType === 'amendment' && amendmentType === 'vin_correction';
  const isMileageExceeded = filingType === 'amendment' && amendmentType === 'mileage_exceeded';
  const isWeightIncrease = filingType === 'amendment' && amendmentType === 'weight_increase';
  const hasData = filingType && (selectedVehicleIds.length > 0 || isVinCorrection || isMileageExceeded || isWeightIncrease);

  return (
    <div className="sticky top-24 h-fit max-h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-col max-h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--color-orange)]" />
            Order Summary
          </h3>
          <p className="text-xs text-[var(--color-muted)]">Complete filing details and pricing</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {pricingLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 className="w-8 h-8 text-[var(--color-navy)] animate-spin mb-3" />
              <p className="text-sm text-[var(--color-muted)]">Calculating pricing...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Payment Breakdown - Clear Separation */}
              {!hasData ? (
                <>
                  {/* Show empty state */}
                  <div className="pb-4 border-b-2 border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Payment to IRS</p>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--color-text)]">IRS Tax Amount</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">Paid directly to IRS</p>
                      </div>
                      <p className="text-sm font-bold text-[var(--color-muted)]">$0.00</p>
                    </div>
                  </div>
                  <div className="pb-4 border-b-2 border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Service Fee</p>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--color-text)]">Platform Service Fee</p>
                        <p className="text-xs text-[var(--color-muted)] mt-0.5">Paid to QuickTruckTax</p>
                      </div>
                      <p className="text-sm font-bold text-[var(--color-muted)]">$0.00</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Payment to IRS Section */}
                  <div className="pb-4 border-b-2 border-blue-200 bg-blue-50/30 rounded-lg p-4 -mx-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Payment to IRS</p>
                    </div>
                    {filingType === 'refund' ? (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">Estimated Refund</p>
                          <p className="text-xs text-blue-700 mt-0.5">Amount you'll receive from IRS</p>
                        </div>
                        <p className="text-lg font-bold text-emerald-600">+${(finalPricing.totalRefund || 0).toFixed(2)}</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-blue-900">IRS Tax Amount</p>
                            <p className="text-xs text-blue-700 mt-0.5">Paid directly to IRS via selected payment method</p>
                          </div>
                          <p className="text-lg font-bold text-blue-900">
                            ${(() => {
                              // For weight increase amendments, use additionalTaxDue if available
                              if (isWeightIncrease && weightIncreaseData?.additionalTaxDue) {
                                return weightIncreaseData.additionalTaxDue.toFixed(2);
                              }
                              return (finalPricing.totalTax || 0).toFixed(2);
                            })()}
                          </p>
                        </div>

                        {/* Weight Increase Amendment Breakdown */}
                        {isWeightIncrease && weightIncreaseData?.additionalTaxDue && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs font-semibold text-blue-800 mb-2">Tax Calculation Breakdown:</p>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center justify-between py-1">
                                <div className="flex-1 min-w-0">
                                  <span className="text-blue-600">
                                    Weight Increase: {weightIncreaseData.originalWeightCategory} → {weightIncreaseData.newWeightCategory}
                                  </span>
                                </div>
                                <span className="font-semibold text-blue-700">
                                  +${weightIncreaseData.additionalTaxDue.toFixed(2)}
                                </span>
                              </div>
                              <div className="pt-1.5 mt-1.5 border-t border-blue-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-900">Total IRS Tax:</span>
                                <span className="text-sm font-bold text-blue-900">${weightIncreaseData.additionalTaxDue.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Detailed Vehicle Tax Breakdown */}
                        {vehicleBreakdown && vehicleBreakdown.length > 0 && !isWeightIncrease && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs font-semibold text-blue-800 mb-2">Tax Calculation Breakdown:</p>
                            <div className="space-y-1.5 text-xs">
                              {vehicleBreakdown
                                .filter(v => v.taxAmount !== 0)
                                .map((vehicle, idx) => {
                                  const vehicleType = vehicle.vehicleType || (vehicle.isSuspended ? 'suspended' : 'taxable');
                                  const isTaxable = vehicleType === 'taxable';
                                  const isCredit = vehicleType === 'credit';
                                  const loggingLabel = vehicle.logging ? ' (Logging)' : '';

                                  return (
                                    <div key={idx} className="flex items-center justify-between py-1">
                                      <div className="flex-1 min-w-0">
                                        <span className="text-blue-700 font-mono text-xs truncate">{vehicle.vin?.substring(0, 8)}...</span>
                                        <span className="text-blue-600 ml-1">
                                          {isTaxable ? 'Taxable' : isCredit ? 'Credit' : ''} Cat {vehicle.grossWeightCategory}{loggingLabel}:
                                        </span>
                                      </div>
                                      <span className={`font-semibold ${isCredit ? 'text-red-600' : 'text-blue-700'}`}>
                                        {isCredit ? '-' : '+'}${(Math.abs(vehicle.taxAmount || 0)).toFixed(2)}
                                      </span>
                                    </div>
                                  );
                                })}
                              <div className="pt-1.5 mt-1.5 border-t border-blue-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-900">Total IRS Tax:</span>
                                <span className="text-sm font-bold text-blue-900">${(finalPricing.totalTax || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Service Fee Section */}
                  <div className="pb-4 border-b-2 border-emerald-200 bg-emerald-50/30 rounded-lg p-4 -mx-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                      <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide">Service Fee</p>
                    </div>
                    <div className="space-y-2">
                      {/* Show standard rate and bulk savings for multi-vehicle filings */}
                      {selectedVehiclesList.length > 1 && filingType !== 'amendment' && filingType !== 'refund' && (
                        <div className="mb-3 pb-3 border-b border-emerald-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-xs text-emerald-600">Standard Rate</p>
                              <p className="text-xs text-emerald-500 mt-0.5">($34.99 × {selectedVehiclesList.length})</p>
                            </div>
                            <p className="text-sm font-medium text-emerald-600 line-through">${(34.99 * selectedVehiclesList.length).toFixed(2)}</p>
                          </div>
                          {finalPricing.bulkSavings > 0 && (
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-emerald-700">Volume Discount</p>
                                <p className="text-xs text-emerald-600 mt-0.5">Bulk savings applied</p>
                              </div>
                              <p className="text-sm font-bold text-emerald-700">-${(finalPricing.bulkSavings || 0).toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-emerald-900">Platform Service Fee</p>
                          {breakdown.find(item => item.type === 'fee')?.description && (
                            <p className="text-xs text-emerald-700 mt-0.5">
                              {breakdown.find(item => item.type === 'fee')?.description}
                            </p>
                          )}
                          {!breakdown.find(item => item.type === 'fee')?.description && (
                            <p className="text-xs text-emerald-700 mt-0.5">
                              {isWeightIncrease || isVinCorrection || isMileageExceeded
                                ? 'Amendment service fee: $10.00'
                                : 'Paid to QuickTruckTax'}
                            </p>
                          )}
                        </div>
                        <p className="text-lg font-bold text-emerald-900">
                          ${(() => {
                            // For weight increase amendments, ensure $10 is shown if pricing hasn't been calculated
                            if (isWeightIncrease && (finalPricing.serviceFee || 0) === 0) {
                              return '10.00';
                            }
                            return (finalPricing.serviceFee || 0).toFixed(2);
                          })()}
                        </p>
                      </div>
                      {couponApplied && couponDiscount > 0 && (
                        <div className="flex items-start justify-between pt-2 border-t border-emerald-200">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-emerald-700">Coupon Discount</p>
                            <p className="text-xs text-emerald-600 mt-0.5">
                              {couponType === 'percentage' ? `${couponDiscount}% off` : `$${couponDiscount} off`}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-emerald-600">-${(finalPricing.couponDiscount || 0).toFixed(2)}</p>
                        </div>
                      )}
                      {(finalPricing.salesTax || 0) > 0 && (
                        <div className="flex items-start justify-between pt-2 border-t border-emerald-200">
                          <div className="flex-1">
                            <p className="text-xs font-medium text-emerald-700">Sales Tax</p>
                            <p className="text-xs text-emerald-600 mt-0.5">On service fee</p>
                          </div>
                          <p className="text-sm font-bold text-emerald-700">${(finalPricing.salesTax || 0).toFixed(2)}</p>
                        </div>
                      )}
                      <div className="pt-2 border-t-2 border-emerald-300 mt-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-emerald-900">Total Service Fee Due Now</p>
                          <p className="text-lg font-bold text-emerald-900">
                            ${(() => {
                              // For weight increase amendments, ensure $10 is used if pricing hasn't been calculated
                              let serviceFee = finalPricing.serviceFee || 0;
                              if (isWeightIncrease && serviceFee === 0) {
                                serviceFee = 10.00;
                              }
                              // Estimate sales tax if not calculated (7% of service fee)
                              const salesTax = finalPricing.salesTax || (serviceFee > 0 ? serviceFee * 0.07 : 0);
                              return (serviceFee + salesTax - (finalPricing.couponDiscount || 0)).toFixed(2);
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Coupon Section - Moved here after Service Fee */}
                  {step === 6 && (
                    <div className="pb-4 border-b border-slate-200 pt-2">
                      <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                        Coupon Code (Optional)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => onCouponCodeChange(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--color-orange)]"
                          disabled={couponApplied}
                        />
                        {!couponApplied ? (
                          <button
                            onClick={onApplyCoupon}
                            className="px-4 py-2 bg-[var(--color-orange)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-orange-hover)] transition whitespace-nowrap"
                          >
                            Apply
                          </button>
                        ) : (
                          <button
                            onClick={onRemoveCoupon}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition whitespace-nowrap"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {couponError && (
                        <p className="mt-2 text-xs text-red-600">{couponError}</p>
                      )}
                      {couponApplied && (
                        <p className="mt-2 text-xs text-green-600">
                          ✓ Coupon applied: {couponType === 'percentage' ? `${couponDiscount}%` : `$${couponDiscount}`} discount
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Business Information */}
              {selectedBusinessId && businesses.find(b => b.id === selectedBusinessId) && (
                <div className="pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-[var(--color-orange)]" />
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">Filing For</h4>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                      {businesses.find(b => b.id === selectedBusinessId)?.businessName}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] font-mono">
                      EIN: {businesses.find(b => b.id === selectedBusinessId)?.ein}
                    </p>
                  </div>
                </div>
              )}

              {/* Filing Details */}
              {filingData && (
                <div className="pb-4 border-b border-slate-200">
                  <h4 className="text-sm font-semibold text-[var(--color-text)] mb-2">Filing Details</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Form Type:</span>
                      <span className="font-semibold">2290</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Tax Period:</span>
                      <span className="font-semibold">July 1st, 2025 - June 30th, 2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">First Used Month:</span>
                      <span className="font-semibold">{filingData.firstUsedMonth || 'July'}-2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Vehicles:</span>
                      <span className="font-semibold">
                        {filingType === 'amendment'
                          ? (amendmentType === 'vin_correction' ? 'N/A' : amendmentType === 'mileage_exceeded' ? '1' : '1')
                          : selectedVehicleIds.length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}





              {/* Vehicle Breakdown - Simplified */}
              {selectedVehicleIds.length > 0 && filingType !== 'amendment' && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-2">
                    Vehicles ({selectedVehicleIds.length})
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {vehicles
                      .filter(v => selectedVehicleIds.includes(v.id))
                      .slice(0, 3)
                      .map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center gap-2 text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-[var(--color-text)] truncate">{vehicle.vin}</p>
                          </div>
                        </div>
                      ))}
                    {selectedVehicleIds.length > 3 && (
                      <p className="text-xs text-[var(--color-muted)] italic">+{selectedVehicleIds.length - 3} more vehicles</p>
                    )}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Pricing includes:</p>
                    <ul className="space-y-0.5 text-blue-600">
                      <li>• IRS tax calculation</li>
                      <li>• Expert review & filing</li>
                      <li>• Schedule 1 delivery</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Only show submit button on step 6 */}
        {step === 6 && onSubmit && !hideSubmitButton && (
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <button
              onClick={onSubmit}
              disabled={loading || !hasData}
              className="w-full bg-[var(--color-orange)] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#ff7a20] transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  Pay & Submit <CreditCard className="w-4 h-4" />
                </>
              )}
            </button>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--color-muted)]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure 256-bit SSL Encrypted
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

