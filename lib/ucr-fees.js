/**
 * UCR (Unified Carrier Registration) Official Fee Schedule
 * 49 CFR Part 367. Source: UCR Plan, 2025-2026 fees (unchanged for 2026).
 * Brokers, freight forwarders, leasing companies: minimum tier ($46).
 */

export const UCR_FEE_BRACKETS_2026 = [
  { min: 0, max: 2, label: '0-2 power units', fee: 46 },
  { min: 3, max: 5, label: '3-5 power units', fee: 144 },
  { min: 6, max: 20, label: '6-20 power units', fee: 359 },
  { min: 21, max: 100, label: '21-100 power units', fee: 1224 },
  { min: 101, max: 1000, label: '101-1,000 power units', fee: 5835 },
  { min: 1001, max: Infinity, label: '1,001+ power units', fee: 56977 },
];

export const UCR_ENTITY_TYPES = [
  { value: 'carrier', label: 'Motor Carrier', description: 'For-hire or private carrier' },
  { value: 'broker', label: 'Broker', description: 'Flat $46 regardless of fleet' },
  { value: 'freight_forwarder', label: 'Freight Forwarder', description: 'Flat $46 regardless of fleet' },
  { value: 'leasing', label: 'Leasing Company', description: 'Flat $46 regardless of fleet' },
];

/**
 * Get official UCR fee for a given fleet size (power units) and entity type.
 * @param {number} powerUnits - Number of commercial motor vehicles (power units)
 * @param {string} entityType - 'carrier' | 'broker' | 'freight_forwarder' | 'leasing'
 * @returns {{ bracket: object, fee: number }}
 */
export function getUcrFee(powerUnits, entityType = 'carrier') {
  const flatFeeTypes = ['broker', 'freight_forwarder', 'leasing'];
  if (flatFeeTypes.includes(entityType)) {
    const bracket = UCR_FEE_BRACKETS_2026[0];
    return { bracket, fee: bracket.fee };
  }

  const units = Math.max(0, Math.floor(Number(powerUnits) || 0));
  const bracket = UCR_FEE_BRACKETS_2026.find(b => units >= b.min && units <= b.max) || UCR_FEE_BRACKETS_2026[UCR_FEE_BRACKETS_2026.length - 1];
  return { bracket, fee: bracket.fee };
}

/**
 * Service fee for UCR Filing ($79) and UCR Pro ($99).
 */
export const UCR_SERVICE_PLANS = {
  filing: { name: 'UCR Filing Service', price: 79, features: ['Fee calculation', 'Registration submission assistance', 'Confirmation tracking', 'Compliance record storage', 'Email proof archive'] },
  pro: { name: 'UCR Pro', price: 99, features: ['Everything in Filing', 'Deadline reminders', 'DOT status check', 'Next-year auto-reminder', 'Compliance dashboard access'] },
};

export const UCR_REGISTRATION_YEAR = 2026;
export const UCR_OPENS_OCT = 1;
export const UCR_DEADLINE_DEC = 31;
