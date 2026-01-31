
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
 * Get partial-period tax from IRS Table I (for vehicles first used after July)
 * Per IRS Form 2290 Instructions, Partial-Period Tax Tables
 * 
 * @param {string} category - Weight category (A-V)
 * @param {string} month - Month name (e.g., 'August', 'September')
 * @param {boolean} isLogging - Whether vehicle is used for logging
 * @returns {number} - Partial-period tax amount
 */
const getPartialPeriodTax = (category, month, isLogging = false) => {
    // Extract just the month name if format is "Month YYYY"
    const monthName = month.includes(' ') ? month.split(' ')[0] : month;
    
    // IRS Partial-Period Tax Table I (Non-Logging) and Table II (Logging)
    // From IRS Form 2290 Instructions (Rev. July 2025)
    // Table columns: AUG (11), SEP (10), OCT (9), NOV (8), DEC (7), JAN (6), FEB (5), MAR (4), APR (3), MAY (2), JUNE (1)
    // Numbers in parentheses are months remaining
    
    const partialPeriodTableNonLogging = {
        'A': { 'August': 91.67, 'September': 83.33, 'October': 75.00, 'November': 66.67, 'December': 58.33, 'January': 50.00, 'February': 41.67, 'March': 33.33, 'April': 25.00, 'May': 16.67, 'June': 8.33 },
        'B': { 'August': 111.83, 'September': 101.67, 'October': 91.50, 'November': 81.33, 'December': 71.17, 'January': 61.00, 'February': 50.83, 'March': 40.67, 'April': 30.50, 'May': 20.33, 'June': 10.17 },
        'C': { 'August': 132.00, 'September': 120.00, 'October': 108.00, 'November': 96.00, 'December': 84.00, 'January': 72.00, 'February': 60.00, 'March': 48.00, 'April': 36.00, 'May': 24.00, 'June': 12.00 },
        'D': { 'August': 152.17, 'September': 138.33, 'October': 124.50, 'November': 110.67, 'December': 96.83, 'January': 83.00, 'February': 69.17, 'March': 55.33, 'April': 41.50, 'May': 27.67, 'June': 13.83 },
        'E': { 'August': 172.33, 'September': 156.67, 'October': 141.00, 'November': 125.33, 'December': 109.67, 'January': 94.00, 'February': 78.33, 'March': 62.67, 'April': 47.00, 'May': 31.33, 'June': 15.67 },
        'F': { 'August': 192.50, 'September': 175.00, 'October': 157.50, 'November': 140.00, 'December': 122.50, 'January': 105.00, 'February': 87.50, 'March': 70.00, 'April': 52.50, 'May': 35.00, 'June': 17.50 },
        'G': { 'August': 212.67, 'September': 193.33, 'October': 174.00, 'November': 154.67, 'December': 135.33, 'January': 116.00, 'February': 96.67, 'March': 77.33, 'April': 58.00, 'May': 38.67, 'June': 19.33 },
        'H': { 'August': 232.83, 'September': 211.67, 'October': 190.50, 'November': 169.33, 'December': 148.17, 'January': 127.00, 'February': 105.83, 'March': 84.67, 'April': 63.50, 'May': 42.33, 'June': 21.17 },
        'I': { 'August': 253.00, 'September': 230.00, 'October': 207.00, 'November': 184.00, 'December': 161.00, 'January': 138.00, 'February': 115.00, 'March': 92.00, 'April': 69.00, 'May': 46.00, 'June': 23.00 },
        'J': { 'August': 273.17, 'September': 248.33, 'October': 223.50, 'November': 198.67, 'December': 173.83, 'January': 149.00, 'February': 124.17, 'March': 99.33, 'April': 74.50, 'May': 49.67, 'June': 24.83 },
        'K': { 'August': 293.33, 'September': 266.67, 'October': 240.00, 'November': 213.33, 'December': 186.67, 'January': 160.00, 'February': 133.33, 'March': 106.67, 'April': 80.00, 'May': 53.33, 'June': 26.67 },
        'L': { 'August': 313.50, 'September': 285.00, 'October': 256.50, 'November': 228.00, 'December': 199.50, 'January': 171.00, 'February': 142.50, 'March': 114.00, 'April': 85.50, 'May': 57.00, 'June': 28.50 },
        'M': { 'August': 333.67, 'September': 303.33, 'October': 273.00, 'November': 242.67, 'December': 212.33, 'January': 182.00, 'February': 151.67, 'March': 121.33, 'April': 91.00, 'May': 60.67, 'June': 30.33 },
        'N': { 'August': 353.83, 'September': 321.67, 'October': 289.50, 'November': 257.33, 'December': 225.17, 'January': 193.00, 'February': 160.83, 'March': 128.67, 'April': 96.50, 'May': 64.33, 'June': 32.17 },
        'O': { 'August': 374.00, 'September': 340.00, 'October': 306.00, 'November': 272.00, 'December': 238.00, 'January': 204.00, 'February': 170.00, 'March': 136.00, 'April': 102.00, 'May': 68.00, 'June': 34.00 },
        'P': { 'August': 394.17, 'September': 358.33, 'October': 322.50, 'November': 286.67, 'December': 250.83, 'January': 215.00, 'February': 179.17, 'March': 143.33, 'April': 107.50, 'May': 71.67, 'June': 35.83 },
        'Q': { 'August': 414.33, 'September': 376.67, 'October': 339.00, 'November': 301.33, 'December': 263.67, 'January': 226.00, 'February': 188.33, 'March': 150.67, 'April': 113.00, 'May': 75.33, 'June': 37.67 },
        'R': { 'August': 434.50, 'September': 395.00, 'October': 355.50, 'November': 316.00, 'December': 276.50, 'January': 237.00, 'February': 197.50, 'March': 158.00, 'April': 118.50, 'May': 79.00, 'June': 39.50 },
        'S': { 'August': 454.67, 'September': 413.33, 'October': 372.00, 'November': 330.67, 'December': 289.33, 'January': 248.00, 'February': 206.67, 'March': 165.33, 'April': 124.00, 'May': 82.67, 'June': 41.33 },
        'T': { 'August': 474.83, 'September': 431.67, 'October': 388.50, 'November': 345.33, 'December': 302.17, 'January': 259.00, 'February': 215.83, 'March': 172.67, 'April': 129.50, 'May': 86.33, 'June': 43.17 },
        'U': { 'August': 495.00, 'September': 450.00, 'October': 405.00, 'November': 360.00, 'December': 315.00, 'January': 270.00, 'February': 225.00, 'March': 180.00, 'April': 135.00, 'May': 90.00, 'June': 45.00 },
        'V': { 'August': 504.17, 'September': 458.33, 'October': 412.50, 'November': 366.67, 'December': 320.83, 'January': 275.00, 'February': 229.17, 'March': 183.33, 'April': 137.50, 'May': 91.67, 'June': 45.83 }
    };

    const partialPeriodTableLogging = {
        'A': { 'August': 68.75, 'September': 62.49, 'October': 56.25, 'November': 50.00, 'December': 43.74, 'January': 37.50, 'February': 31.25, 'March': 24.99, 'April': 18.75, 'May': 12.50, 'June': 6.24 },
        'B': { 'August': 83.87, 'September': 76.25, 'October': 68.62, 'November': 60.99, 'December': 53.37, 'January': 45.75, 'February': 38.12, 'March': 30.50, 'April': 22.87, 'May': 15.24, 'June': 7.62 },
        'C': { 'August': 99.00, 'September': 90.00, 'October': 81.00, 'November': 72.00, 'December': 63.00, 'January': 54.00, 'February': 45.00, 'March': 36.00, 'April': 27.00, 'May': 18.00, 'June': 9.00 },
        'D': { 'August': 114.12, 'September': 103.74, 'October': 93.37, 'November': 83.00, 'December': 72.62, 'January': 62.25, 'February': 51.87, 'March': 41.49, 'April': 31.12, 'May': 20.75, 'June': 10.37 },
        'E': { 'August': 129.24, 'September': 117.50, 'October': 105.75, 'November': 93.99, 'December': 82.25, 'January': 70.50, 'February': 58.74, 'March': 47.00, 'April': 35.25, 'May': 23.49, 'June': 11.75 },
        'F': { 'August': 144.37, 'September': 131.25, 'October': 118.12, 'November': 105.00, 'December': 91.87, 'January': 78.75, 'February': 65.62, 'March': 52.50, 'April': 39.37, 'May': 26.25, 'June': 13.12 },
        'G': { 'August': 159.50, 'September': 144.99, 'October': 130.50, 'November': 116.00, 'December': 101.49, 'January': 87.00, 'February': 72.50, 'March': 57.99, 'April': 43.50, 'May': 29.00, 'June': 14.49 },
        'H': { 'August': 174.62, 'September': 158.75, 'October': 142.87, 'November': 126.99, 'December': 111.12, 'January': 95.25, 'February': 79.37, 'March': 63.50, 'April': 47.62, 'May': 31.74, 'June': 15.87 },
        'I': { 'August': 189.75, 'September': 172.50, 'October': 155.25, 'November': 138.00, 'December': 120.75, 'January': 103.50, 'February': 86.25, 'March': 69.00, 'April': 51.75, 'May': 34.50, 'June': 17.25 },
        'J': { 'August': 204.87, 'September': 186.24, 'October': 167.62, 'November': 149.00, 'December': 130.37, 'January': 111.75, 'February': 93.12, 'March': 74.49, 'April': 55.87, 'May': 37.25, 'June': 18.62 },
        'K': { 'August': 219.99, 'September': 200.00, 'October': 180.00, 'November': 159.99, 'December': 140.00, 'January': 120.00, 'February': 99.99, 'March': 80.00, 'April': 60.00, 'May': 39.99, 'June': 20.00 },
        'L': { 'August': 235.12, 'September': 213.75, 'October': 192.37, 'November': 171.00, 'December': 149.62, 'January': 128.25, 'February': 106.87, 'March': 85.50, 'April': 64.12, 'May': 42.75, 'June': 21.37 },
        'M': { 'August': 250.25, 'September': 227.49, 'October': 204.75, 'November': 182.00, 'December': 159.24, 'January': 136.50, 'February': 113.75, 'March': 90.99, 'April': 68.25, 'May': 45.50, 'June': 22.74 },
        'N': { 'August': 265.37, 'September': 241.25, 'October': 217.12, 'November': 192.99, 'December': 168.87, 'January': 144.75, 'February': 120.62, 'March': 96.50, 'April': 72.37, 'May': 48.24, 'June': 24.12 },
        'O': { 'August': 280.50, 'September': 255.00, 'October': 229.50, 'November': 204.00, 'December': 178.50, 'January': 153.00, 'February': 127.50, 'March': 102.00, 'April': 76.50, 'May': 51.00, 'June': 25.50 },
        'P': { 'August': 295.62, 'September': 268.74, 'October': 241.87, 'November': 215.00, 'December': 188.12, 'January': 161.25, 'February': 134.37, 'March': 107.49, 'April': 80.62, 'May': 53.75, 'June': 26.87 },
        'Q': { 'August': 310.74, 'September': 282.50, 'October': 254.25, 'November': 225.99, 'December': 197.75, 'January': 169.50, 'February': 141.24, 'March': 113.00, 'April': 84.75, 'May': 56.49, 'June': 28.25 },
        'R': { 'August': 325.87, 'September': 296.25, 'October': 266.62, 'November': 237.00, 'December': 207.37, 'January': 177.75, 'February': 148.12, 'March': 118.50, 'April': 88.87, 'May': 59.25, 'June': 29.62 },
        'S': { 'August': 341.00, 'September': 309.99, 'October': 279.00, 'November': 248.00, 'December': 216.99, 'January': 186.00, 'February': 155.00, 'March': 123.99, 'April': 93.00, 'May': 62.00, 'June': 30.99 },
        'T': { 'August': 356.12, 'September': 323.75, 'October': 291.37, 'November': 258.99, 'December': 226.62, 'January': 194.25, 'February': 161.87, 'March': 129.50, 'April': 97.12, 'May': 64.74, 'June': 32.37 },
        'U': { 'August': 371.25, 'September': 337.50, 'October': 303.75, 'November': 270.00, 'December': 236.25, 'January': 202.50, 'February': 168.75, 'March': 135.00, 'April': 101.25, 'May': 67.50, 'June': 33.75 },
        'V': { 'August': 378.12, 'September': 343.74, 'October': 309.37, 'November': 275.00, 'December': 240.62, 'January': 206.25, 'February': 171.87, 'March': 137.50, 'April': 103.12, 'May': 68.75, 'June': 34.37 }
    };

    const table = isLogging ? partialPeriodTableLogging : partialPeriodTableNonLogging;
    const normalizedCategory = category.toUpperCase().trim();
    
    // If July, use full annual tax (from page 2, column 1)
    if (monthName === 'July') {
        return isLogging ? (TAX_RATES_LOGGING[normalizedCategory] || 0) : (TAX_RATES_NON_LOGGING[normalizedCategory] || 0);
    }
    
    // Look up in partial-period table
    if (table[normalizedCategory] && table[normalizedCategory][monthName]) {
        return table[normalizedCategory][monthName];
    }
    
    // Fallback: calculate from annual tax if not in table
    const annualTax = isLogging ? (TAX_RATES_LOGGING[normalizedCategory] || 0) : (TAX_RATES_NON_LOGGING[normalizedCategory] || 0);
    const monthIndex = MONTHS.indexOf(monthName);
    if (monthIndex === -1) return annualTax;
    const monthsRemaining = 12 - monthIndex;
    return Math.floor((annualTax / 12) * monthsRemaining * 100) / 100;
};

/**
 * Calculate additional tax for a weight increase amendment
 * Per IRS Form 2290 Instructions, Line 3:
 * "Figure the additional tax using the following worksheet..."
 * 1. Enter the month the taxable gross weight increased (amendedMonth)
 * 2. From Partial-Period Tax Tables, find the new tax for that month
 * 3. From Partial-Period Tax Tables, find the old tax for that month
 * 4. Additional tax = New tax - Old tax
 * 
 * IMPORTANT CALCULATION LOGIC:
 * - Both taxes use the Partial-Period Tax Tables for the amendedMonth (month of weight increase)
 * - This calculates the additional tax due from the month of increase forward
 * - The firstUsedMonth is collected for reference/record-keeping but is NOT used in the calculation
 * - If amendedMonth is July, full annual tax rates are used (from Form 2290 page 2, column 1)
 * - Logging status can differ between original and new weight categories
 * 
 * EXAMPLE:
 * Vehicle first used in July (paid full tax for Category A = $100)
 * Weight increased in September to Category B
 * Calculation:
 *   - New tax (Category B, September) = $101.67 (from Partial-Period Table)
 *   - Old tax (Category A, September) = $83.33 (from Partial-Period Table)
 *   - Additional tax = $101.67 - $83.33 = $18.34
 * 
 * This is correct per IRS instructions, even though the vehicle already paid $100 for Category A.
 * The worksheet calculates the difference in tax rates for the remaining period from September forward.
 * 
 * @param {string} originalCategory - Original weight category (e.g., 'A', 'F')
 * @param {string} newCategory - New weight category (e.g., 'B', 'H')
 * @param {string} amendedMonth - Month when gross weight increased (e.g., 'September' or 'September 2025')
 * @param {string} firstUsedMonth - Month vehicle was first used in tax period (for reference/record-keeping only)
 * @param {boolean} originalIsLogging - Whether original weight category was used for logging (default: false)
 * @param {boolean} newIsLogging - Whether new weight category is used for logging (default: false)
 * @returns {number} - Additional tax due (truncated to 2 decimal places, no rounding)
 */
export const calculateWeightIncreaseAdditionalTax = (originalCategory, newCategory, amendedMonth, firstUsedMonth = '', originalIsLogging = false, newIsLogging = false) => {
    if (!originalCategory || !newCategory || !amendedMonth) {
        return 0;
    }

    // Extract just the month name if format is "Month YYYY"
    const amendedMonthName = amendedMonth.includes(' ') ? amendedMonth.split(' ')[0] : amendedMonth;

    // Validate that new category is higher than original
    const validCategories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
    const originalIndex = validCategories.indexOf(originalCategory.toUpperCase());
    const newIndex = validCategories.indexOf(newCategory.toUpperCase());
    
    if (originalIndex === -1 || newIndex === -1 || newIndex <= originalIndex) {
        return 0; // Invalid categories or no increase
    }

    // Per IRS Instructions Line 3: Use Partial-Period Tax Tables for the amendedMonth
    // Get partial-period tax for NEW category for the amended month (using new logging status)
    const newTax = getPartialPeriodTax(newCategory, amendedMonthName, newIsLogging);
    
    // Get partial-period tax for ORIGINAL category for the amended month (using original logging status)
    const originalTax = getPartialPeriodTax(originalCategory, amendedMonthName, originalIsLogging);

    // Additional tax = New tax - Original tax
    // This represents the additional tax due from the month of increase forward
    const additionalTax = newTax - originalTax;

    // Truncate to 2 decimal places (no rounding) per IRS requirements
    return Math.floor(additionalTax * 100) / 100;
};

/**
 * Calculate tax for a mileage exceeded amendment
 * Per IRS Form 2290 Instructions (Rev. July 2025), page 7:
 * "Figure the tax on Form 2290, page 2, based on the month the vehicle was first used in the tax period."
 * 
 * IMPORTANT: The tax is calculated based on the FIRST-USED MONTH from the ORIGINAL filing
 * where the vehicle was suspended, NOT the month the mileage limit was exceeded.
 * 
 * @param {string} vehicleCategory - Weight category of the vehicle
 * @param {string} firstUsedMonth - Month vehicle was first used in tax period (from original filing)
 * @param {boolean} isLogging - Whether vehicle is used for logging (75% tax rate)
 * @returns {number} - Full tax due (prorated based on first-used month)
 */
export const calculateMileageExceededTax = (vehicleCategory, firstUsedMonth, isLogging = false) => {
    // Calculate tax as if vehicle was never suspended, using first-used month from original filing
    // This uses the standard proration tables based on when vehicle was first used in the tax period
    return calculateTax(vehicleCategory, false, firstUsedMonth, isLogging);
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

        case 'weight_increase': {
            // Calculate prorated additional tax using IRS Partial-Period Tax Tables
            // IRS Form 2290 Instructions, Line 3: Additional tax = New tax (from table) - Old tax (from table)
            const { originalWeightCategory, newWeightCategory, amendedMonth, firstUsedMonth, originalIsLogging, newIsLogging } = amendmentData.details || {};
            if (originalWeightCategory && newWeightCategory && amendedMonth) {
                totalTax = calculateWeightIncreaseAdditionalTax(
                    originalWeightCategory,
                    newWeightCategory,
                    amendedMonth,
                    firstUsedMonth || '',
                    originalIsLogging || false,
                    newIsLogging || false
                );
            }
            break;
        }

        case 'mileage_exceeded': {
            // Calculate tax based on first-used month from original filing
            // IRS Instructions (Rev. July 2025), page 7: "Figure the tax on Form 2290, page 2, 
            // based on the month the vehicle was first used in the tax period."
            // The tax is prorated based on first-used month, NOT the month exceeded.
            const { vehicleCategory, firstUsedMonth, isLogging } = amendmentData.details || {};
            if (vehicleCategory && firstUsedMonth) {
                totalTax = calculateMileageExceededTax(vehicleCategory, firstUsedMonth, isLogging || false);
            } else {
                console.warn('Mileage exceeded amendment missing required data:', { vehicleCategory, firstUsedMonth });
            }
            break;
        }

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

