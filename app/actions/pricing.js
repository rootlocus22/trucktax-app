'use server';

import { calculateSalesTax } from '@/lib/tax-service';
import { calculateAmendmentPricing, calculateWeightIncreaseAdditionalTax, calculateMileageExceededTax, getAnnualTax } from '@/lib/pricing';

// HVUT Tax Rates (Annual)
const TAX_RATES = {
    'A': 100.00, 'B': 122.00, 'C': 144.00, 'D': 166.00, 'E': 188.00,
    'F': 210.00, 'G': 232.00, 'H': 254.00, 'I': 276.00, 'J': 298.00,
    'K': 320.00, 'W': 550.00
};

const MONTHS = [
    'July', 'August', 'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April', 'May', 'June'
];

/**
 * Calculate HVUT Tax for a single vehicle
 */
function calculateVehicleTax(category, isSuspended, firstUsedMonth) {
    if (isSuspended) return 0.00;
    if (!category || !TAX_RATES[category]) return 0.00;

    const annualTax = TAX_RATES[category];
    const monthIndex = MONTHS.indexOf(firstUsedMonth);

    // If month not found or July (index 0), full tax
    if (monthIndex === -1 || monthIndex === 0) return annualTax;

    const monthsRemaining = 12 - monthIndex;
    const proratedTax = (annualTax / 12) * monthsRemaining;

    return parseFloat(proratedTax.toFixed(2));
}

/**
 * Calculate Service Fee based on filing type and volume
 */
function calculateServiceFee(filingType, vehicleCount) {
    if (filingType === 'amendment') return 0.00; // Amendments are free per IRS guidelines
    if (filingType === 'refund') return 34.99;

    // Standard Filing
    if (vehicleCount >= 25) return 19.99 * vehicleCount; // Enterprise
    if (vehicleCount >= 10) return 24.99 * vehicleCount; // Fleet
    if (vehicleCount >= 2) return 29.99 * vehicleCount;  // Multi-vehicle

    return 34.99; // Single vehicle
}

/**
 * Server Action: Calculate Total Filing Cost
 * @param {object} filingData - { filingType, firstUsedMonth, amendmentType?, amendmentData? }
 * @param {array} vehicles - Array of vehicle objects
 * @param {object} businessAddress - { state, ... } for sales tax
 */
export async function calculateFilingCost(filingData, vehicles, businessAddress) {
    try {
        let totalTax = 0;
        let totalRefund = 0;
        let vehicleBreakdown = [];

        // Handle Amendment filings separately
        if (filingData.filingType === 'amendment' && filingData.amendmentType && filingData.amendmentData) {
            // Use the amendment-specific pricing calculation
            const amendmentPricing = calculateAmendmentPricing({
                amendmentType: filingData.amendmentType,
                details: filingData.amendmentData
            });

            totalTax = amendmentPricing.totalTax;

            // Create a minimal vehicle breakdown for amendments
            vehicleBreakdown = [];
        }
        // Handle Refund filings
        else if (filingData.filingType === 'refund') {
            vehicleBreakdown = vehicles.map(v => {
                // For refunds, Tax Due is $0. We calculate the *Refund Amount* the user gets back.
                const tax = calculateVehicleTax(v.grossWeightCategory, v.isSuspended, filingData.firstUsedMonth);
                totalRefund += tax;

                return { ...v, taxAmount: 0, refundAmount: tax };
            });
        }
        // Handle Standard filings
        else {
            vehicleBreakdown = vehicles.map(v => {
                const tax = calculateVehicleTax(v.grossWeightCategory, v.isSuspended, filingData.firstUsedMonth);
                totalTax += tax;
                return { ...v, taxAmount: tax };
            });
        }

        // 2. Calculate Service Fee
        const serviceFee = calculateServiceFee(filingData.filingType, vehicles.length);

        // 3. Calculate Sales Tax on Service Fee
        // Note: IRS Tax itself is not subject to sales tax, only the service fee is.
        const salesTaxResult = await calculateSalesTax(serviceFee, businessAddress);

        // 4. Calculate Grand Total
        const grandTotal = totalTax + serviceFee + salesTaxResult.amount;

        return {
            success: true,
            breakdown: {
                totalTax: parseFloat(totalTax.toFixed(2)),
                serviceFee: parseFloat(serviceFee.toFixed(2)),
                salesTax: salesTaxResult.amount,
                salesTaxRate: salesTaxResult.rate,
                grandTotal: parseFloat(grandTotal.toFixed(2)),
                totalRefund: parseFloat(totalRefund.toFixed(2)),
                vehicleBreakdown
            }
        };
    } catch (error) {
        console.error('Error calculating filing cost:', error);
        return { success: false, error: 'Failed to calculate pricing' };
    }
}
