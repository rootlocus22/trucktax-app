
/**
 * TaxService - Handles US Sales Tax Calculations
 * 
 * This service is designed to be provider-agnostic.
 * Currently uses a Mock Provider for demonstration.
 * Can be swapped with Stripe Tax or Avalara AvaTax.
 */

// Mock Tax Rates by State (for demonstration)
const MOCK_TAX_RATES = {
    'AL': 0.0400, 'AK': 0.0000, 'AZ': 0.0560, 'AR': 0.0650, 'CA': 0.0725,
    'CO': 0.0290, 'CT': 0.0635, 'DE': 0.0000, 'FL': 0.0600, 'GA': 0.0400,
    'HI': 0.0400, 'ID': 0.0600, 'IL': 0.0625, 'IN': 0.0700, 'IA': 0.0600,
    'KS': 0.0650, 'KY': 0.0600, 'LA': 0.0445, 'ME': 0.0550, 'MD': 0.0600,
    'MA': 0.0625, 'MI': 0.0600, 'MN': 0.0688, 'MS': 0.0700, 'MO': 0.0423,
    'MT': 0.0000, 'NE': 0.0550, 'NV': 0.0685, 'NH': 0.0000, 'NJ': 0.0663,
    'NM': 0.0513, 'NY': 0.0400, 'NC': 0.0475, 'ND': 0.0500, 'OH': 0.0575,
    'OK': 0.0450, 'OR': 0.0000, 'PA': 0.0600, 'RI': 0.0700, 'SC': 0.0600,
    'SD': 0.0450, 'TN': 0.0700, 'TX': 0.0625, 'UT': 0.0610, 'VT': 0.0600,
    'VA': 0.0530, 'WA': 0.0650, 'WV': 0.0600, 'WI': 0.0500, 'WY': 0.0400,
    'DC': 0.0600
};

/**
 * Calculate Sales Tax
 * @param {number} amount - The taxable amount (Service Fee)
 * @param {object} address - The customer's address { line1, city, state, postal_code, country }
 * @returns {Promise<object>} - { rate: 0.06, amount: 1.80 }
 */
export async function calculateSalesTax(amount, address) {
    // 1. Validate inputs
    if (!amount || amount < 0) return { rate: 0, amount: 0 };
    if (!address || !address.state) {
        console.warn('TaxService: No state provided, defaulting to 0 tax.');
        return { rate: 0, amount: 0 };
    }

    // 2. Normalize State Code
    const stateCode = address.state.toUpperCase().trim();

    // 3. Get Tax Rate (Mock Provider)
    // In a real app, this would call Stripe.tax.calculations.create() or Avalara API
    const taxRate = MOCK_TAX_RATES[stateCode] || 0.00;

    // 4. Calculate Tax Amount
    const taxAmount = amount * taxRate;

    return {
        rate: taxRate,
        amount: parseFloat(taxAmount.toFixed(2)),
        provider: 'mock-local'
    };
}
