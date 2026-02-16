
export const PRICING_CONFIG = {
    form2290: {
        title: "Form 2290 E-filing",
        description: "Instant Schedule 1 for Heavy Vehicle Use Tax",
        tiers: [
            { label: "Single Vehicle", count: "1 Vehicle", price: 34.99, perTruck: false },
            { label: "Fleet (2 Vehicles)", count: "2 Vehicles", price: 49.99, perTruck: false },
            { label: "Small Fleet", count: "3 to 24 Vehicles", price: 79.99, perTruck: false },
            { label: "Medium Fleet", count: "25 to 100 Vehicles", price: 139.99, perTruck: false },
            { label: "Large Fleet", count: "101 to 500 Vehicles", price: 249.99, perTruck: false },
            { label: "Enterprise", count: "Above 500 Vehicles", price: 399.99, perTruck: false }
        ]
    },
    amendments: {
        title: "Amendments & Corrections",
        description: "Professional corrections for your filings",
        items: [
            { label: "VIN Correction", description: "Electronic VIN Correction (Form 2290)", price: 0.00, badge: "FREE" },
            { label: "Weight Increase", description: "Gross Weight increase (2290 Amendment)", price: 29.90 },
            { label: "Mileage Exceeded", description: "Mileage Limit Exceeded (2290 Amendment)", price: 29.90 }
        ]
    },
    annual: {
        title: "Annual Unlimited Filing",
        description: "Best for high-volume businesses and tax pros",
        items: [
            {
                label: "Unlimited 2290",
                description: "Unlimited Tax filing of Form 2290 for the entire season for single business",
                price: 379.90
            },
            {
                label: "Unlimited Pro Suite",
                description: "Unlimited Form 2290 + All Amendments for the entire season",
                price: 498.90
            }
        ]
    },
    otherServices: [
        { label: "MCS-150 Update", price: 99.99, description: "Mandatory Biennial Update for DOT" },
        { label: "UCR Registration", price: 149.00, description: "Unified Carrier Registration (Tier 1)" }
    ]
};

/**
 * Calculates service fee based on filing type and vehicle count using config
 */
export const getServiceFeeFromConfig = (filingType, vehicleCount) => {
    if (filingType === 'amendment') return 0.00; // Simplified for now as per "FREE VIN Corrections"

    const tiers = PRICING_CONFIG.form2290.tiers;

    if (vehicleCount <= 1) return tiers[0].price;
    if (vehicleCount === 2) return tiers[1].price;
    if (vehicleCount >= 3 && vehicleCount <= 24) return tiers[2].price;
    if (vehicleCount >= 25 && vehicleCount <= 100) return tiers[3].price;
    if (vehicleCount >= 101 && vehicleCount <= 500) return tiers[4].price;
    return tiers[5].price;
};
