'use server';

/**
 * UCR-only. Stub for legacy compatibility.
 * UCR pricing uses lib/ucr-fees.js.
 */
export async function calculateFilingCost(filingData, vehicles, businessAddress) {
  return {
    success: true,
    breakdown: {
      totalTax: 0,
      serviceFee: 0,
      salesTax: 0,
      grandTotal: 0,
      totalRefund: 0,
      vehicleBreakdown: [],
      bulkSavings: 0,
      standardRate: 0,
      vehicleCount: vehicles?.length || 0,
    },
  };
}
