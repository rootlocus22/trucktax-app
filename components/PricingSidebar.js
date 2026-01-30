'use client';

import { useEffect, useState } from 'react';
import { calculateFilingCost } from '@/app/actions/pricing';
import { CreditCard, ShieldCheck, Loader2, Info, CheckCircle } from 'lucide-react';

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
  const [breakdown, setBreakdown] = useState([]);

  useEffect(() => {
    const fetchPricing = async () => {
      // Don't calculate if we don't have minimum required data
      if (!filingType || selectedVehicleIds.length === 0) {
        setPricing({
          totalTax: 0,
          serviceFee: 0,
          salesTax: 0,
          grandTotal: 0,
          totalRefund: 0
        });
        setBreakdown([]);
        return;
      }

      const selectedVehiclesList = vehicles.filter(v => selectedVehicleIds.includes(v.id));
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

        const result = await calculateFilingCost(
          filingDataForPricing,
          sanitizedVehicles,
          { state }
        );

        if (result.success) {
          setPricing(result.breakdown);

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

          breakdownItems.push({
            label: 'Service Fee',
            value: result.breakdown.serviceFee || 0,
            type: 'fee',
            description: selectedVehiclesList.length >= 2
              ? `Fleet pricing: $29.99 × ${selectedVehiclesList.length}`
              : selectedVehiclesList.every(v => v.isSuspended)
                ? 'Suspended vehicle pricing'
                : 'Single vehicle pricing'
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
  }, [filingType, filingData, selectedVehicleIds, vehicles, selectedBusinessId, businesses, amendmentType, weightIncreaseData, mileageExceededData]);

  const hasData = filingType && selectedVehicleIds.length > 0;

  return (
    <div className="sticky top-24 h-fit max-h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-col max-h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">Order Summary</h3>
          <p className="text-xs text-[var(--color-muted)]">Pricing updates as you make selections</p>
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
              {/* Breakdown - Always show fields */}
              <div className="space-y-3">
                {!hasData ? (
                  <>
                    {/* Show empty state with $0.00 values */}
                    <div className="pb-3 border-b border-slate-100">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--color-text)]">IRS Tax Amount</p>
                        </div>
                        <p className="text-sm font-bold text-[var(--color-muted)]">$0.00</p>
                      </div>
                    </div>
                    <div className="pb-3 border-b border-slate-100">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--color-text)]">Service Fee</p>
                        </div>
                        <p className="text-sm font-bold text-[var(--color-muted)]">$0.00</p>
                      </div>
                    </div>
                    <div className="pb-3 border-b border-slate-100">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--color-text)]">Sales Tax</p>
                        </div>
                        <p className="text-sm font-bold text-[var(--color-muted)]">$0.00</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Show actual breakdown when data is available */}
                    {breakdown.map((item, idx) => (
                      <div key={idx} className="pb-3 border-b border-slate-100 last:border-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[var(--color-text)]">{item.label}</p>
                            {item.description && (
                              <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.description}</p>
                            )}
                          </div>
                          <p className={`text-sm font-bold ${item.type === 'refund' ? 'text-emerald-600' : ''}`}>
                            {item.type === 'refund' ? '+' : ''}${item.value.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Total - Always show */}
              <div className="pt-4 border-t-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-bold text-[var(--color-text)]">Total</span>
                  <span className={`text-2xl font-bold ${hasData && filingType === 'refund' ? 'text-emerald-600' : hasData ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`}>
                    {hasData && filingType === 'refund' ? '+' : ''}${hasData ? pricing.grandTotal.toFixed(2) : '0.00'}
                  </span>
                </div>
                {hasData && filingType === 'refund' && (
                  <p className="text-xs text-emerald-600 font-medium">Estimated refund amount</p>
                )}
                {hasData && filingType === 'amendment' && amendmentType === 'vin_correction' && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      VIN corrections are FREE
                    </p>
                  </div>
                )}
                {!hasData && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">Select filing type and vehicles to calculate</p>
                )}
              </div>

              {/* Vehicle Breakdown */}
              {selectedVehicleIds.length > 0 && filingType !== 'amendment' && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Vehicles</p>
                  <div className="space-y-2">
                    {vehicles
                      .filter(v => selectedVehicleIds.includes(v.id))
                      .slice(0, 5)
                      .map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-[var(--color-text)] truncate">{vehicle.vin}</p>
                            <p className="text-[var(--color-muted)]">
                              {vehicle.grossWeightCategory} {vehicle.isSuspended && '(Suspended)'}
                            </p>
                          </div>
                        </div>
                      ))}
                    {selectedVehicleIds.length > 5 && (
                      <p className="text-xs text-[var(--color-muted)]">+{selectedVehicleIds.length - 5} more</p>
                    )}
                  </div>
                </div>
              )}
              {!hasData && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Vehicles</p>
                  <p className="text-xs text-[var(--color-muted)]">No vehicles selected</p>
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

        {/* Footer - Only show submit button on final step */}
        {step === 5 && onSubmit && !hideSubmitButton && (
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

