import { getRateForState } from './ifta-rates';

/**
 * Calculates IFTA tax liability.
 * 
 * @param {Array} tripEntries - Array of { state: 'CA', miles: 100 }
 * @param {Array} fuelPurchases - Array of { state: 'CA', gallons: 50, amount: 200 }
 * @returns {Object} Calculation result
 */
export function calculateIFTA(tripEntries, fuelPurchases) {
    // 1. Calculate Totals
    const totalMiles = tripEntries.reduce((sum, entry) => sum + Number(entry.miles), 0);
    const totalGallons = fuelPurchases.reduce((sum, entry) => sum + Number(entry.gallons), 0);

    // 2. Calculate Fleet MPG
    // If no fuel purchased, avoid division by zero (return 0 or handle logic)
    const mpg = totalGallons > 0 ? totalMiles / totalGallons : 0;

    // 3. Per-Jurisdiction Calculation
    const jurisdictionResults = [];

    // Get list of all unique states involved
    const states = new Set([
        ...tripEntries.map(e => e.state),
        ...fuelPurchases.map(e => e.state)
    ]);

    let totalTaxDue = 0;

    states.forEach(state => {
        const stateMiles = tripEntries
            .filter(e => e.state === state)
            .reduce((sum, e) => sum + Number(e.miles), 0);

        const stateTaxableGallons = mpg > 0 ? stateMiles / mpg : 0;

        // Tax Paid at Pump (Fuel purchased in this state)
        const stateFuelPurchased = fuelPurchases
            .filter(e => e.state === state)
            .reduce((sum, e) => sum + Number(e.gallons), 0);

        const taxRate = getRateForState(state);

        const taxOwed = stateTaxableGallons * taxRate;
        const taxPaid = stateFuelPurchased * taxRate;

        const netTax = taxOwed - taxPaid;

        totalTaxDue += netTax;

        jurisdictionResults.push({
            state,
            miles: stateMiles,
            taxableGallons: stateTaxableGallons,
            fuelPurchased: stateFuelPurchased,
            taxRate,
            taxOwed,
            taxPaid,
            netTax
        });
    });

    return {
        mpg,
        totalMiles,
        totalGallons,
        totalTaxDue,
        jurisdictionResults
    };
}
