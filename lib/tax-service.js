
/**
 * TaxService - Handles US Sales Tax Calculations
 * 
 * Integrated with TaxJar API for accurate sales tax calculations.
 * Falls back to mock data for testing when TaxJar API key is not configured.
 */

// Mock Tax Rates by State (fallback for testing)
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
 * Calculate Sales Tax using TaxJar API (with dummy data fallback for testing)
 * @param {number} amount - The taxable amount (Service Fee)
 * @param {object} address - The customer's address { line1, city, state, postal_code, country }
 * @returns {Promise<object>} - { rate: 0.06, amount: 1.80, provider: 'taxjar' | 'mock' }
 */
export async function calculateSalesTax(amount, address) {
    // 1. Validate inputs
    if (!amount || amount < 0) return { rate: 0, amount: 0, provider: 'mock' };
    if (!address || !address.state) {
        console.warn('TaxService: No state provided, defaulting to 0 tax.');
        return { rate: 0, amount: 0, provider: 'mock' };
    }

    // 2. Normalize State Code
    const stateCode = address.state.toUpperCase().trim();
    
    // Extract ZIP code from address if available
    let zipCode = '';
    if (address.postal_code) {
        zipCode = address.postal_code;
    } else if (address.address) {
        // Try to extract ZIP from address string (format: "City, State ZIP")
        const zipMatch = address.address.match(/\b\d{5}(-\d{4})?\b/);
        if (zipMatch) zipCode = zipMatch[0];
    }

    // 3. Try TaxJar API if configured (for production)
    const TAXJAR_API_KEY = process.env.TAXJAR_API_KEY;
    
    if (TAXJAR_API_KEY && TAXJAR_API_KEY !== 'dummy') {
        try {
            // Dynamic import to avoid bundling issues if TaxJar package not installed
            const Taxjar = require('taxjar');
            const client = new Taxjar({ apiKey: TAXJAR_API_KEY });

            // Parse address components
            const addressParts = address.address ? address.address.split(',') : [];
            const city = address.city || (addressParts.length > 0 ? addressParts[0].trim() : '');
            const stateZip = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : '';
            const extractedState = stateZip.split(' ')[0] || stateCode;
            const extractedZip = zipCode || (stateZip.split(' ')[1] || '');

            // Use your business address as origin (configure in env vars)
            const originZip = process.env.TAXJAR_ORIGIN_ZIP || '90210';
            const originState = process.env.TAXJAR_ORIGIN_STATE || 'CA';

            const taxResult = await client.taxForOrder({
                from_country: 'US',
                from_zip: originZip,
                from_state: originState,
                to_country: 'US',
                to_zip: extractedZip || '00000', // Fallback ZIP if not available
                to_state: extractedState || stateCode,
                amount: amount,
                shipping: 0, // No shipping for service fees
                line_items: [
                    {
                        quantity: 1,
                        unit_price: amount,
                        product_tax_code: '30070' // General software/services tax code
                    }
                ]
            });

            return {
                rate: taxResult.tax.rate || 0,
                amount: parseFloat((taxResult.tax.amount_to_collect || 0).toFixed(2)),
                provider: 'taxjar',
                breakdown: taxResult.tax.breakdown
            };
        } catch (error) {
            console.error('TaxJar API error, falling back to mock:', error.message);
            // Fall through to mock calculation
        }
    }

    // 4. Fallback to Mock Provider (for testing/development)
    // This uses dummy data matching TaxJar format
    const taxRate = MOCK_TAX_RATES[stateCode] || 0.00;
    const taxAmount = amount * taxRate;

    return {
        rate: taxRate,
        amount: parseFloat(taxAmount.toFixed(2)),
        provider: 'mock',
        note: 'Using mock tax rates for testing. Configure TAXJAR_API_KEY for production.'
    };
}
