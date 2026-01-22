
/**
 * Pricing Engine for QuickTruckTax
 * Handles HVUT tax calculations and Platform Service Fees
 */

// IRS Tax Rates for 2025-2026 (Standard)
// Category A (55k) starts at $100, +$22 per 1,000 lbs over 55k
// Category W (75k+) is capped at $550
export const TAX_RATES = {
    A: { weight: 55000, baseTax: 100.00 },
    B: { weight: 56000, baseTax: 122.00 },
    C: { weight: 57000, baseTax: 144.00 },
    D: { weight: 58000, baseTax: 166.00 },
    E: { weight: 59000, baseTax: 188.00 },
    F: { weight: 60000, baseTax: 210.00 },
    G: { weight: 61000, baseTax: 232.00 },
    H: { weight: 62000, baseTax: 254.00 },
    I: { weight: 63000, baseTax: 276.00 },
    J: { weight: 64000, baseTax: 298.00 },
    K: { weight: 65000, baseTax: 320.00 },
    // ... intermediate weights would follow formula ...
    // For simplicity in this MVP, we map letters directly.
    // Real IRS table has specific values for each category.
    // Let's use the standard IRS table values for the letters provided in the UI.

    // Correct IRS Table for Form 2290 (Annual Rate)
    // A: 55,000 lbs = $100
    // B: 56,000 lbs = $122
    // ... +$22 per 1,000 lbs
    // V: 75,000 lbs = $540 (Category V is 75k)
    // W: Over 75,000 lbs = $550
};

// Helper to get full annual tax for a category
const getAnnualTax = (category) => {
    if (category === 'W') return 550.00;
    if (!category || category.length !== 1) return 0;

    const startChar = 'A'.charCodeAt(0);
    const currentChar = category.charCodeAt(0);
    const index = currentChar - startChar; // 0 for A, 1 for B...

    if (index < 0 || index > 21) return 0; // Out of range (A-V)

    // Formula: $100 + ($22 * index)
    // A (0) = 100
    // B (1) = 122
    return 100.00 + (22.00 * index);
};

// Proration Logic
const MONTHS = [
    'July', 'August', 'September', 'October', 'November', 'December',
    'January', 'February', 'March', 'April', 'May', 'June'
];

// Tax rates with logging support
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

export const calculateTax = (category, isSuspended, firstUsedMonth, isLogging = false) => {
    if (isSuspended) return 0.00;
    if (!category) return 0.00;

    // Get tax rate based on logging status
    const taxRates = isLogging ? TAX_RATES_LOGGING : TAX_RATES_NON_LOGGING;
    const normalizedCategory = category.toUpperCase().trim();
    
    let annualTax = 0;
    if (taxRates[normalizedCategory]) {
        annualTax = taxRates[normalizedCategory];
    } else {
        // Fallback to getAnnualTax for categories not in table
        annualTax = getAnnualTax(category);
        if (isLogging) {
            // Use exact logging rate from lookup table, truncate to 2 decimals if needed
            const calculatedLoggingTax = annualTax * 0.75;
            annualTax = parseFloat(calculatedLoggingTax.toFixed(2));
        }
    }

    // Calculate Proration
    // If first used in July, pay 100% (12/12)
    // If first used in August, pay 11/12
    // ...
    // If first used in June, pay 1/12

    const monthIndex = MONTHS.indexOf(firstUsedMonth);
    if (monthIndex === -1) return annualTax; // Default to full year if invalid

    const monthsRemaining = 12 - monthIndex;
    const proratedTax = (annualTax / 12) * monthsRemaining;

    // Truncate to 2 decimal places (no rounding)
    return Math.floor(proratedTax * 100) / 100;
};

export const calculateRefundAmount = (category, isSuspended, firstUsedMonth) => {
    // Logic is identical to tax calculation for this MVP (prorated amount based on months)
    return calculateTax(category, isSuspended, firstUsedMonth);
};

export const getServiceFee = (filingType, vehicleCount) => {
    // Pricing Strategy from Pricing Page
    // Standard: $34.99 per filing (Single Truck)
    // Fleet (2+ trucks): $29.99 per truck
    // Suspended: $24.99 per filing
    // Amendment: Free (handled as $0 or included in subscription, but for per-filing model let's say $0 if it's a correction, but usually platforms charge. 
    // The pricing page says "FREE VIN Corrections". Let's assume Amendment is $0 for now or a small fee. 
    // User request: "make sure the pricing are according the type of filing"

    if (filingType === 'amendment') return 0.00; // "FREE VIN Corrections"
    if (filingType === 'refund') return 34.99; // Standard filing fee for 8849

    // Standard 2290
    if (vehicleCount >= 2) {
        return 29.99 * vehicleCount;
    }

    return 34.99; // Single truck standard
};

export const calculateTotal = (filingData, vehicles) => {
    let totalTax = 0;
    let vehicleCount = 0;
    let suspendedCount = 0;

    vehicles.forEach(v => {
        if (filingData.filingType === 'refund') {
            // For refunds, tax due is 0
            // We could calculate estimated refund here if needed, but for totalTax it's 0
        } else {
            totalTax += calculateTax(v.grossWeightCategory, v.isSuspended, filingData.firstUsedMonth);
        }
        vehicleCount++;
        if (v.isSuspended) suspendedCount++;
    });

    // Special case: If ALL vehicles are suspended, use the lower "Suspended" tier pricing?
    // Pricing page says: "Low Mileage / Suspended ... $24.99 / filing"
    let serviceFee = 0;
    if (vehicleCount > 0 && vehicleCount === suspendedCount) {
        serviceFee = 24.99;
    } else {
        serviceFee = getServiceFee(filingData.filingType, vehicleCount);
    }

    return {
        totalTax: parseFloat(totalTax.toFixed(2)),
        serviceFee: parseFloat(serviceFee.toFixed(2)),
        grandTotal: parseFloat((totalTax + serviceFee).toFixed(2))
    };
};

/**
 * Calculate additional tax for a weight increase amendment
 * Returns the prorated additional tax based on remaining months in tax period
 * Per IRS guidelines: Pay prorated additional tax for months remaining from month of increase
 * 
 * @param {string} originalCategory - Original weight category (e.g., 'A', 'F')
 * @param {string} newCategory - New weight category (e.g., 'B', 'H')
 * @param {string} increaseMonth - Month of increase (e.g., 'September' or 'September 2025')
 * @returns {number} - Additional tax due
 */
export const calculateWeightIncreaseAdditionalTax = (originalCategory, newCategory, increaseMonth) => {
    if (!originalCategory || !newCategory || !increaseMonth) {
        return 0;
    }

    // Get full year tax amounts for both categories
    const originalTax = getAnnualTax(originalCategory);
    const newTax = getAnnualTax(newCategory);

    // Calculate the tax difference
    const taxDifference = newTax - originalTax;

    if (taxDifference <= 0) {
        return 0; // No additional tax if weight decreased or stayed same
    }

    // Extract just the month name if format is "Month YYYY"
    const monthName = increaseMonth.includes(' ') ? increaseMonth.split(' ')[0] : increaseMonth;

    // Calculate months remaining in tax period after increase
    // Tax period: July (index 0) to June (index 11)
    const monthIndex = MONTHS.indexOf(monthName);
    if (monthIndex === -1) {
        // Invalid month, return full difference as fallback
        return parseFloat(taxDifference.toFixed(2));
    }

    // Months remaining includes the month of increase and all subsequent months
    // Example: If increase in July (index 0), pay for 12 months (full year)
    // Example: If increase in December (index 5), pay for 7 months (Dec through Jun)
    const monthsRemaining = 12 - monthIndex;

    // Prorate the additional tax for the remaining months
    const proratedAdditionalTax = (taxDifference / 12) * monthsRemaining;

    // Truncate to 2 decimal places (no rounding)
    return Math.floor(proratedAdditionalTax * 100) / 100;
};

/**
 * Calculate tax for a mileage exceeded amendment
 * Returns full tax as if vehicle was never suspended, based on first-used month
 * 
 * @param {string} vehicleCategory - Weight category of the vehicle
 * @param {string} firstUsedMonth - Month vehicle was first used in tax period
 * @returns {number} - Full tax due
 */
export const calculateMileageExceededTax = (vehicleCategory, firstUsedMonth) => {
    // Calculate full tax as if vehicle was never suspended
    return calculateTax(vehicleCategory, false, firstUsedMonth);
};

/**
 * Calculate pricing for amendment filings
 * Per IRS Form 2290 Amendment guidelines:
 * - VIN Correction: $0 tax, $0 fee (FREE)
 * - Weight Increase: Prorated additional tax based on months remaining
 * - Mileage Exceeded: Full tax based on first-used month in tax period
 * 
 * @param {Object} amendmentData - Amendment details
 * @param {string} amendmentData.amendmentType - Type of amendment ('vin_correction', 'weight_increase', 'mileage_exceeded')
 * @param {Object} amendmentData.details - Type-specific details
 * @returns {Object} - { totalTax, serviceFee, grandTotal }
 */
export const calculateAmendmentPricing = (amendmentData) => {
    let totalTax = 0;
    const serviceFee = 0; // All amendments are free per IRS guidelines

    if (!amendmentData || !amendmentData.amendmentType) {
        return {
            totalTax: 0,
            serviceFee: 0,
            grandTotal: 0
        };
    }

    switch (amendmentData.amendmentType) {
        case 'vin_correction':
            // VIN corrections are free, no additional tax (IRS: "FREE VIN Corrections")
            totalTax = 0;
            break;

        case 'weight_increase':
            // Calculate prorated additional tax
            // IRS: Pay additional tax prorated for months remaining from month of increase
            const { originalWeightCategory, newWeightCategory, increaseMonth } = amendmentData.details || {};
            if (originalWeightCategory && newWeightCategory && increaseMonth) {
                totalTax = calculateWeightIncreaseAdditionalTax(
                    originalWeightCategory,
                    newWeightCategory,
                    increaseMonth
                );
            }
            break;

        case 'mileage_exceeded':
            // Calculate full tax based on first-used month
            // IRS: When suspended vehicle exceeds mileage limit, pay full HVUT tax based on first-used month
            const { vehicleCategory, firstUsedMonth } = amendmentData.details || {};
            if (vehicleCategory && firstUsedMonth) {
                totalTax = calculateMileageExceededTax(vehicleCategory, firstUsedMonth);
            }
            break;

        default:
            totalTax = 0;
    }

    return {
        totalTax: parseFloat(totalTax.toFixed(2)),
        serviceFee: parseFloat(serviceFee.toFixed(2)),
        grandTotal: parseFloat(totalTax.toFixed(2))
    };
};

// Export getAnnualTax for use in other modules
export { getAnnualTax };

