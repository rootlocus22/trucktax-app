'use server';

import { calculateSalesTax } from '@/lib/tax-service';
import { calculateAmendmentPricing, calculateWeightIncreaseAdditionalTax, calculateMileageExceededTax, getAnnualTax } from '@/lib/pricing';

// HVUT Tax Rates (Annual) - Non-Logging Tax
// Categories A-U: Non-logging tax rates
// Logging tax is 75% of non-logging tax
const TAX_RATES_NON_LOGGING = {
    'A': 100.00, 'B': 122.00, 'C': 144.00, 'D': 166.00, 'E': 188.00,
    'F': 210.00, 'G': 232.00, 'H': 254.00, 'I': 276.00, 'J': 298.00,
    'K': 320.00, 'L': 342.00, 'M': 364.00, 'N': 386.00, 'O': 408.00,
    'P': 430.00, 'Q': 452.00, 'R': 474.00, 'S': 496.00, 'T': 518.00,
    'U': 550.00, 'V': 550.00, 'W': 550.00 // Category U and above capped at $550
};

// Logging Tax Rates (75% of non-logging)
const TAX_RATES_LOGGING = {
    'A': 75.00, 'B': 91.50, 'C': 108.00, 'D': 124.50, 'E': 141.00,
    'F': 157.50, 'G': 174.00, 'H': 190.50, 'I': 207.00, 'J': 223.50,
    'K': 240.00, 'L': 256.50, 'M': 273.00, 'N': 289.50, 'O': 306.00,
    'P': 322.50, 'Q': 339.00, 'R': 355.50, 'S': 372.00, 'T': 388.50,
    'U': 412.50, 'V': 412.50, 'W': 412.50 // Category U and above capped at $412.50
};

// Helper function to calculate tax for any category (including missing ones)
function getAnnualTaxForCategory(category, isLogging = false) {
    if (!category) return 0.00;
    const normalizedCategory = category.toUpperCase().trim();
    
    const taxRates = isLogging ? TAX_RATES_LOGGING : TAX_RATES_NON_LOGGING;
    
    // Check direct lookup first
    if (taxRates[normalizedCategory]) {
        return taxRates[normalizedCategory];
    }
    
    // Use formula for categories A-V: $100 + ($22 * index) for non-logging
    // Logging is 75% of non-logging
    if (normalizedCategory === 'W') {
        return isLogging ? 412.50 : 550.00;
    }
    
    const startChar = 'A'.charCodeAt(0);
    const currentChar = normalizedCategory.charCodeAt(0);
    const index = currentChar - startChar;
    
    if (index < 0 || index > 21) return 0.00; // Out of range
    
    // Categories U and V both map to 75,000 lbs = $550 (non-logging) or $412.50 (logging)
    if (index === 20 || index === 21) {
        return isLogging ? 412.50 : 550.00;
    }
    
    const nonLoggingTax = 100.00 + (22.00 * index);
    return isLogging ? nonLoggingTax * 0.75 : nonLoggingTax;
}

const MONTHS = [
    'July', 'August', 'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April', 'May', 'June'
];

/**
 * Calculate HVUT Tax for a single vehicle
 * @param {string} category - Weight category (A-V, W)
 * @param {boolean} isSuspended - Whether vehicle is suspended
 * @param {string} firstUsedMonth - First used month
 * @param {boolean} isLogging - Whether vehicle is used for logging (75% tax rate)
 * @returns {number} Tax amount
 */
function calculateVehicleTax(category, isSuspended, firstUsedMonth, isLogging = false) {
    // Suspended vehicles have $0 tax
    if (isSuspended) return 0.00;
    if (!category) return 0.00;
    
    const annualTax = getAnnualTaxForCategory(category, isLogging);
    if (annualTax === 0) return 0.00;

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
            // Separate vehicles by type
            // Handle both new vehicleType field and legacy isSuspended field
            const taxableVehicles = vehicles.filter(v => {
                if (v.vehicleType === 'taxable') return true;
                if (v.vehicleType === 'suspended' || v.vehicleType === 'credit' || v.vehicleType === 'priorYearSold') return false;
                // Legacy: if no vehicleType, check isSuspended
                return !v.isSuspended;
            });
            
            const creditVehicles = vehicles.filter(v => v.vehicleType === 'credit');
            const suspendedVehicles = vehicles.filter(v => {
                if (v.vehicleType === 'suspended') return true;
                // Legacy: if no vehicleType but isSuspended is true
                return !v.vehicleType && v.isSuspended === true;
            });
            const priorYearSoldVehicles = vehicles.filter(v => v.vehicleType === 'priorYearSold');

            // Check if only suspended or prior year sold vehicles (tax = $0)
            const hasOnlySuspendedOrPriorYear = 
                vehicles.length > 0 && 
                taxableVehicles.length === 0 && 
                creditVehicles.length === 0 &&
                (suspendedVehicles.length > 0 || priorYearSoldVehicles.length > 0);

            let taxableTaxTotal = 0;
            let creditTaxTotal = 0;

            // Calculate tax for taxable vehicles (add)
            taxableVehicles.forEach(v => {
                const isLogging = v.logging === true;
                const tax = calculateVehicleTax(
                    v.grossWeightCategory, 
                    false, // Not suspended
                    filingData.firstUsedMonth,
                    isLogging
                );
                taxableTaxTotal += tax;
            });

            // Calculate tax for credit vehicles (subtract - they were previously taxed)
            creditVehicles.forEach(v => {
                const isLogging = v.logging === true;
                const tax = calculateVehicleTax(
                    v.grossWeightCategory,
                    false, // Not suspended
                    filingData.firstUsedMonth,
                    isLogging
                );
                creditTaxTotal += tax;
            });

            // Total IRS Tax = Taxable vehicles tax - Credit vehicles tax
            // If only suspended/prior year sold, tax = $0
            totalTax = hasOnlySuspendedOrPriorYear ? 0.00 : Math.max(0, taxableTaxTotal - creditTaxTotal);

            // Create vehicle breakdown
            vehicleBreakdown = vehicles.map(v => {
                let taxAmount = 0;
                
                // Determine vehicle type (handle both new vehicleType and legacy isSuspended)
                const vehicleType = v.vehicleType || (v.isSuspended === true ? 'suspended' : 'taxable');
                
                if (vehicleType === 'taxable') {
                    const isLogging = v.logging === true;
                    taxAmount = calculateVehicleTax(v.grossWeightCategory, false, filingData.firstUsedMonth, isLogging);
                } else if (vehicleType === 'credit') {
                    const isLogging = v.logging === true;
                    taxAmount = -calculateVehicleTax(v.grossWeightCategory, false, filingData.firstUsedMonth, isLogging); // Negative for credit
                }
                // Suspended and Prior Year Sold vehicles have $0 tax

                return { ...v, taxAmount };
            });
        }

        // 2. Calculate Service Fee
        // Service fee is always charged based on total number of vehicles (all types)
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
