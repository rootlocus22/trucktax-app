
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

export const calculateTax = (category, isSuspended, firstUsedMonth) => {
    if (isSuspended) return 0.00;
    if (!category) return 0.00;

    const annualTax = getAnnualTax(category);

    // Calculate Proration
    // If first used in July, pay 100% (12/12)
    // If first used in August, pay 11/12
    // ...
    // If first used in June, pay 1/12

    const monthIndex = MONTHS.indexOf(firstUsedMonth);
    if (monthIndex === -1) return annualTax; // Default to full year if invalid

    const monthsRemaining = 12 - monthIndex;
    const proratedTax = (annualTax / 12) * monthsRemaining;

    return parseFloat(proratedTax.toFixed(2));
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
