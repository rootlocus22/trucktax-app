export const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
];

export const taxYears = ["2025", "2026"];

export const weights = [
    "55000", "56000", "57000", "58000", "59000",
    "60000", "61000", "62000", "63000", "64000",
    "65000", "66000", "67000", "68000", "69000",
    "70000", "71000", "72000", "73000", "74000", "75000"
];

export const vehicleTypes = [
    "logging-truck",
    "agricultural-vehicle",
    "semi-truck",
    "box-truck",
    "dump-truck",
    "tow-truck",
    "concrete-mixer"
];

export const manufacturers = [
    "freightliner",
    "kenworth",
    "peterbilt",
    "international",
    "volvo",
    "mack",
    "western-star"
];

// Simplified States List (or import from data/us-states.json if node compat allowed)
export const usStates = [
    { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }
];


// Helper to generate all combinations for sitemap
export function getPseoRoutes() {
    const routes = [];

    // Pattern A: filing-2290-[month]-[year] (Technical Deadlines)
    const relevantMonths = months;
    const relevantYears = ["2026"];

    for (const year of relevantYears) {
        for (const month of relevantMonths) {
            routes.push({
                url: `/filing-2290-${month}-${year}`,
                type: 'deadline',
                params: { month, year }
            });
        }
    }

    // Pattern B: 2290-tax-for-[weight]-lb-[vehicle-type] (Technical Calculator)
    for (const weight of weights) {
        for (const type of vehicleTypes) {
            routes.push({
                url: `/2290-tax-for-${weight}-lb-${type}`,
                type: 'calculator',
                params: { weight, type }
            });
        }
    }

    // Pattern C: [make]-vin-decoding (Technical VIN)
    for (const make of manufacturers) {
        routes.push({
            url: `/${make}-vin-decoding`,
            type: 'vin',
            params: { make }
        });
    }

    // Pattern D: filing-2290-in-[state] (Geographic Core)
    // 50 pages
    for (const state of usStates) {
        const stateSlug = state.name.toLowerCase().replace(/ /g, '-');
        routes.push({
            url: `/filing-2290-in-${stateSlug}`,
            type: 'state-deadline',
            params: { state: state.name }
        });
    }

    // Pattern E: 2290-tax-for-[weight]-lb-truck-in-[state] (Geographic Calculator)
    // 1300 pages (26 weights * 50 states)
    // We limit this to just "truck" type to avoid exploding to 15k pages
    for (const state of usStates) {
        const stateSlug = state.name.toLowerCase().replace(/ /g, '-');
        for (const weight of weights) {
            routes.push({
                url: `/2290-tax-for-${weight}-lb-truck-in-${stateSlug}`,
                type: 'state-calculator',
                params: { state: state.name, weight }
            });
        }
    }

    // Pattern F: 2290-tax-for-[vehicle-type]-in-[state] (New High Intent)
    // 600 pages (12 types * 50 states)
    for (const state of usStates) {
        const stateSlug = state.name.toLowerCase().replace(/ /g, '-');
        for (const type of vehicleTypes) {
            routes.push({
                url: `/2290-tax-for-${type}-in-${stateSlug}`,
                type: 'state-type',
                params: { state: state.name, type }
            });
        }
    }

    return routes;
}
