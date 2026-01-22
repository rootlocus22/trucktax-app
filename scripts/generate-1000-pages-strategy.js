/**
 * Generate 1000 High-Value PSEO Pages Strategy
 * Systematic approach to capture Form 2290 market
 */

// High-value combinations based on search volume and commercial intent

const strategy = {
  // Priority 1: State + Vehicle Type (High Commercial Intent)
  // 50 states × 7 vehicle types = 350 pages
  stateVehicleType: {
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming"
    ],
    vehicleTypes: [
      "semi-truck",
      "dump-truck",
      "box-truck",
      "tow-truck",
      "concrete-mixer",
      "logging-truck",
      "agricultural-vehicle"
    ],
    priority: 1,
    estimatedPages: 350
  },

  // Priority 2: State + Popular Weights (High Search Volume)
  // 50 states × 5 popular weights = 250 pages
  statePopularWeights: {
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming"
    ],
    weights: ["55000", "60000", "65000", "70000", "75000"], // Most searched weights
    priority: 2,
    estimatedPages: 250
  },

  // Priority 3: Top States + All Weights (Comprehensive Coverage)
  // 10 top states × 21 weights = 210 pages
  topStatesAllWeights: {
    states: [
      "Texas", "California", "Florida", "Ohio", "Pennsylvania", "Illinois", "Georgia",
      "North Carolina", "Michigan", "New York"
    ],
    weights: [
      "55000", "56000", "57000", "58000", "59000", "60000", "61000", "62000", "63000", "64000",
      "65000", "66000", "67000", "68000", "69000", "70000", "71000", "72000", "73000", "74000", "75000"
    ],
    priority: 3,
    estimatedPages: 210
  },

  // Priority 4: Vehicle Type + Popular Weights (Vehicle-Specific)
  // 7 vehicle types × 5 popular weights = 35 pages
  vehicleTypeWeights: {
    vehicleTypes: [
      "semi-truck",
      "dump-truck",
      "box-truck",
      "tow-truck",
      "concrete-mixer",
      "logging-truck",
      "agricultural-vehicle"
    ],
    weights: ["55000", "60000", "65000", "70000", "75000"],
    priority: 4,
    estimatedPages: 35
  },

  // Priority 5: State Filing Deadlines (Geographic Intent)
  // 50 states = 50 pages
  stateDeadlines: {
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming"
    ],
    priority: 5,
    estimatedPages: 50
  },

  // Priority 6: Monthly Deadlines (Temporal Intent)
  // 12 months × 1 year = 12 pages
  monthlyDeadlines: {
    months: [
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ],
    year: "2026",
    priority: 6,
    estimatedPages: 12
  },

  // Priority 7: Manufacturer VIN Decoding (Technical Intent)
  // 7 manufacturers = 7 pages
  manufacturers: {
    makes: [
      "freightliner",
      "kenworth",
      "peterbilt",
      "international",
      "volvo",
      "mack",
      "western-star"
    ],
    priority: 7,
    estimatedPages: 7
  },

  // Priority 8: Top Cities (Hyper-Local Intent)
  // 86 top trucking cities = 86 pages
  topCities: {
    cities: [
      { city: "Houston", state: "Texas" },
      { city: "Dallas", state: "Texas" },
      { city: "Los Angeles", state: "California" },
      { city: "Chicago", state: "Illinois" },
      { city: "Phoenix", state: "Arizona" },
      { city: "Philadelphia", state: "Pennsylvania" },
      { city: "San Antonio", state: "Texas" },
      { city: "San Diego", state: "California" },
      { city: "Jacksonville", state: "Florida" },
      { city: "Columbus", state: "Ohio" },
      { city: "Fort Worth", state: "Texas" },
      { city: "Charlotte", state: "North Carolina" },
      { city: "Seattle", state: "Washington" },
      { city: "Denver", state: "Colorado" },
      { city: "Boston", state: "Massachusetts" },
      { city: "El Paso", state: "Texas" },
      { city: "Detroit", state: "Michigan" },
      { city: "Nashville", state: "Tennessee" },
      { city: "Memphis", state: "Tennessee" },
      { city: "Portland", state: "Oregon" },
      { city: "Oklahoma City", state: "Oklahoma" },
      { city: "Las Vegas", state: "Nevada" },
      { city: "Louisville", state: "Kentucky" },
      { city: "Baltimore", state: "Maryland" },
      { city: "Milwaukee", state: "Wisconsin" },
      { city: "Albuquerque", state: "New Mexico" },
      { city: "Tucson", state: "Arizona" },
      { city: "Fresno", state: "California" },
      { city: "Sacramento", state: "California" },
      { city: "Kansas City", state: "Missouri" },
      { city: "Mesa", state: "Arizona" },
      { city: "Atlanta", state: "Georgia" },
      { city: "Omaha", state: "Nebraska" },
      { city: "Colorado Springs", state: "Colorado" },
      { city: "Raleigh", state: "North Carolina" },
      { city: "Virginia Beach", state: "Virginia" },
      { city: "Miami", state: "Florida" },
      { city: "Oakland", state: "California" },
      { city: "Minneapolis", state: "Minnesota" },
      { city: "Tulsa", state: "Oklahoma" },
      { city: "Cleveland", state: "Ohio" },
      { city: "Wichita", state: "Kansas" },
      { city: "Arlington", state: "Texas" },
      { city: "Tampa", state: "Florida" },
      { city: "New Orleans", state: "Louisiana" },
      { city: "Honolulu", state: "Hawaii" },
      { city: "Anaheim", state: "California" },
      { city: "Santa Ana", state: "California" },
      { city: "St. Louis", state: "Missouri" },
      { city: "Corpus Christi", state: "Texas" },
      { city: "Riverside", state: "California" },
      { city: "Lexington", state: "Kentucky" },
      { city: "Pittsburgh", state: "Pennsylvania" },
      { city: "Anchorage", state: "Alaska" },
      { city: "Stockton", state: "California" },
      { city: "Cincinnati", state: "Ohio" },
      { city: "St. Paul", state: "Minnesota" },
      { city: "Toledo", state: "Ohio" },
      { city: "Greensboro", state: "North Carolina" },
      { city: "Newark", state: "New Jersey" },
      { city: "Plano", state: "Texas" },
      { city: "Henderson", state: "Nevada" },
      { city: "Lincoln", state: "Nebraska" },
      { city: "Buffalo", state: "New York" },
      { city: "Jersey City", state: "New Jersey" },
      { city: "Chula Vista", state: "California" },
      { city: "Fort Wayne", state: "Indiana" },
      { city: "Orlando", state: "Florida" },
      { city: "St. Petersburg", state: "Florida" },
      { city: "Chandler", state: "Arizona" },
      { city: "Laredo", state: "Texas" },
      { city: "Norfolk", state: "Virginia" },
      { city: "Durham", state: "North Carolina" },
      { city: "Madison", state: "Wisconsin" },
      { city: "Lubbock", state: "Texas" },
      { city: "Irvine", state: "California" },
      { city: "Winston-Salem", state: "North Carolina" },
      { city: "Glendale", state: "Arizona" },
      { city: "Garland", state: "Texas" },
      { city: "Hialeah", state: "Florida" },
      { city: "Reno", state: "Nevada" },
      { city: "Chesapeake", state: "Virginia" },
      { city: "Gilbert", state: "Arizona" },
      { city: "Baton Rouge", state: "Louisiana" },
      { city: "Irving", state: "Texas" },
      { city: "Scottsdale", state: "Arizona" },
      { city: "North Las Vegas", state: "Nevada" },
      { city: "Fremont", state: "California" },
      { city: "Boise", state: "Idaho" },
      { city: "Richmond", state: "Virginia" }
    ],
    priority: 8,
    estimatedPages: 86
  }
};

// Calculate total pages
function calculateTotalPages() {
  let total = 0;
  Object.values(strategy).forEach(category => {
    if (category.estimatedPages) {
      total += category.estimatedPages;
    }
  });
  return total;
}

// Generate all page combinations
function generateAllPages() {
  const allPages = [];

  // Priority 1: State + Vehicle Type
  strategy.stateVehicleType.states.forEach(state => {
    strategy.stateVehicleType.vehicleTypes.forEach(vehicleType => {
      const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
      allPages.push({
        slug: `2290-tax-for-${vehicleType}-in-${stateSlug}`,
        type: 'state-type',
        context: { state, vehicle_type: vehicleType },
        priority: 1,
        category: 'state-vehicle-type'
      });
    });
  });

  // Priority 2: State + Popular Weights
  strategy.statePopularWeights.states.forEach(state => {
    strategy.statePopularWeights.weights.forEach(weight => {
      const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
      allPages.push({
        slug: `2290-tax-for-${weight}-lb-truck-in-${stateSlug}`,
        type: 'state-calculator',
        context: { state, weight },
        priority: 2,
        category: 'state-weight'
      });
    });
  });

  // Priority 3: Top States + All Weights
  strategy.topStatesAllWeights.states.forEach(state => {
    strategy.topStatesAllWeights.weights.forEach(weight => {
      const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
      allPages.push({
        slug: `2290-tax-for-${weight}-lb-truck-in-${stateSlug}`,
        type: 'state-calculator',
        context: { state, weight },
        priority: 3,
        category: 'top-state-weight'
      });
    });
  });

  // Priority 4: Vehicle Type + Popular Weights
  strategy.vehicleTypeWeights.vehicleTypes.forEach(vehicleType => {
    strategy.vehicleTypeWeights.weights.forEach(weight => {
      allPages.push({
        slug: `2290-tax-for-${weight}-lb-${vehicleType}`,
        type: 'calculator',
        context: { weight, vehicle_type: vehicleType },
        priority: 4,
        category: 'vehicle-weight'
      });
    });
  });

  // Priority 5: State Filing Deadlines
  strategy.stateDeadlines.states.forEach(state => {
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    allPages.push({
      slug: `filing-2290-in-${stateSlug}`,
      type: 'state-deadline',
      context: { state },
      priority: 5,
      category: 'state-deadline'
    });
  });

  // Priority 6: Monthly Deadlines
  strategy.monthlyDeadlines.months.forEach(month => {
    allPages.push({
      slug: `filing-2290-${month}-${strategy.monthlyDeadlines.year}`,
      type: 'deadline',
      context: { month, year: strategy.monthlyDeadlines.year },
      priority: 6,
      category: 'monthly-deadline'
    });
  });

  // Priority 7: Manufacturer VIN Decoding
  strategy.manufacturers.makes.forEach(make => {
    allPages.push({
      slug: `${make}-vin-decoding`,
      type: 'vin',
      context: { make },
      priority: 7,
      category: 'vin-decoding'
    });
  });

  // Priority 8: Top Cities
  strategy.topCities.cities.forEach(({ city, state }) => {
    const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    allPages.push({
      slug: `form-2290-filing-in-${citySlug}-${stateSlug.substring(0, 2)}`,
      type: 'state-deadline', // Using state-deadline type for city pages
      context: { state, city },
      priority: 8,
      category: 'city-filing'
    });
  });

  // Remove duplicates (some combinations might overlap)
  const uniquePages = [];
  const seen = new Set();
  
  allPages.forEach(page => {
    if (!seen.has(page.slug)) {
      seen.add(page.slug);
      uniquePages.push(page);
    }
  });

  // Sort by priority
  uniquePages.sort((a, b) => a.priority - b.priority);

  return uniquePages;
}

// Export for use in generation script
if (require.main !== module) {
  module.exports = { strategy, generateAllPages, calculateTotalPages };
} else {
  const allPages = generateAllPages();
  const total = allPages.length;
  
  console.log('📊 1000-Page Generation Strategy');
  console.log('='.repeat(60));
  console.log(`Total Unique Pages: ${total}`);
  console.log('\nBreakdown by Priority:');
  
  const byPriority = {};
  allPages.forEach(page => {
    if (!byPriority[page.priority]) {
      byPriority[page.priority] = [];
    }
    byPriority[page.priority].push(page);
  });

  Object.keys(byPriority).sort().forEach(priority => {
    console.log(`\nPriority ${priority}: ${byPriority[priority].length} pages`);
    console.log(`  Categories: ${[...new Set(byPriority[priority].map(p => p.category))].join(', ')}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('✅ Strategy ready for generation!');
}
