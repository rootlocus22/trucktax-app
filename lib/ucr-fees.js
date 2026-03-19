/**
 * UCR (Unified Carrier Registration) Official Fee Schedule
 * 49 CFR Part 367. Source: UCR Plan; 2026 fees unchanged from 2025.
 * Brokers, freight forwarders, leasing companies: minimum tier ($46).
 */

export const UCR_FEE_BRACKETS_2026 = [
  { min: 0, max: 2, label: '0-2 power units', fee: 46 },
  { min: 3, max: 5, label: '3-5 power units', fee: 138 },
  { min: 6, max: 20, label: '6-20 power units', fee: 276 },
  { min: 21, max: 100, label: '21-100 power units', fee: 963 },
  { min: 101, max: 1000, label: '101-1,000 power units', fee: 4592 },
  { min: 1001, max: Infinity, label: '1,001+ power units', fee: 44836 },
];

export const UCR_ENTITY_TYPES = [
  { value: 'motor_carrier', label: 'Motor Carrier (For Hire)', description: 'For-hire carrier operating in interstate commerce' },
  { value: 'private_carrier', label: 'Motor Private Carrier (Not For Hire)', description: 'Private carrier transporting own goods' },
  { value: 'broker', label: 'Broker', description: 'Flat $46 regardless of fleet' },
  { value: 'freight_forwarder', label: 'Freight Forwarder', description: 'Flat $46 regardless of fleet' },
  { value: 'leasing', label: 'Leasing Company', description: 'Flat $46 regardless of fleet' },
];

/** Entity types that are classified as carriers (fee based on fleet size) */
export const CARRIER_ENTITY_TYPES = ['motor_carrier', 'private_carrier'];

/** Entity types with flat fee ($46) regardless of fleet size */
export const FLAT_FEE_ENTITY_TYPES = ['broker', 'freight_forwarder', 'leasing'];

/**
 * Get official UCR fee for a given fleet size (power units) and entity types.
 * When multiple entity types are selected, the fee is determined by the highest
 * applicable fee (carrier fleet-based fee or flat fee, whichever is greater).
 * UCR charges one fee per registration — based on the highest classification.
 * @param {number} powerUnits - Number of commercial motor vehicles (power units)
 * @param {string|string[]} entityTypes - Single type or array of selected types
 * @returns {{ bracket: object, fee: number }}
 */
export function getUcrFee(powerUnits, entityTypes = ['motor_carrier']) {
  const types = Array.isArray(entityTypes) ? entityTypes : [entityTypes];
  // Legacy support: map old 'carrier' value to 'motor_carrier'
  const normalized = types.map(t => t === 'carrier' ? 'motor_carrier' : t);

  const hasCarrier = normalized.some(t => CARRIER_ENTITY_TYPES.includes(t));

  if (!hasCarrier) {
    // All flat-fee types (broker, freight forwarder, leasing)
    const bracket = UCR_FEE_BRACKETS_2026[0];
    return { bracket, fee: bracket.fee };
  }

  // Carrier types: fee based on fleet size
  const units = Math.max(0, Math.floor(Number(powerUnits) || 0));
  const bracket = UCR_FEE_BRACKETS_2026.find(b => units >= b.min && units <= b.max) || UCR_FEE_BRACKETS_2026[UCR_FEE_BRACKETS_2026.length - 1];
  return { bracket, fee: bracket.fee };
}

/** Original list price shown before discount for UCR Filing Service */
export const UCR_FILING_ORIGINAL_PRICE = 99;

/** Base service fee (0-2 power units tier) */
export const UCR_SERVICE_FEE_BASE = 79;

/**
 * Tiered service fee by fleet size (power units).
 * Base starts at $79 (0-2 tier). Brokers, freight forwarders, leasing: use 0-2 tier.
 * 100+ power units: Contact Us (returns null).
 */
export const UCR_SERVICE_FEE_TIERS = [
  { min: 0, max: 2, label: '0-2', fee: UCR_SERVICE_FEE_BASE },
  { min: 3, max: 5, label: '3-5', fee: 129 },
  { min: 6, max: 20, label: '6-20', fee: 199 },
  { min: 21, max: 100, label: '21-100', fee: 349 },
  { min: 101, max: Infinity, label: '100+', fee: null }, // Contact Us
];

/**
 * Get service fee for a given fleet size (power units).
 * @param {number} powerUnits - Number of power units
 * @returns {{ fee: number|null, tier: object }} fee is null for 100+ (Contact Us)
 */
export function getServiceFee(powerUnits) {
  const units = Math.max(0, Math.floor(Number(powerUnits) || 0));
  const tier = UCR_SERVICE_FEE_TIERS.find(t => units >= t.min && units <= t.max) || UCR_SERVICE_FEE_TIERS[UCR_SERVICE_FEE_TIERS.length - 1];
  return { fee: tier.fee, tier };
}

/**
 * Legacy: Service plans (kept for backward compatibility; filing flow now uses tiered pricing)
 */
export const UCR_SERVICE_PLANS = {
  filing: { name: 'UCR Filing Service', price: UCR_SERVICE_FEE_BASE, originalPrice: 99, features: ['Fee calculation', 'Registration submission assistance', 'Confirmation tracking', 'Compliance record storage', 'Email proof archive'] },
  pro: { name: 'UCR Pro', price: 99, features: ['Everything in Filing', 'Deadline reminders', 'DOT status check', 'Next-year auto-reminder', 'Compliance dashboard access'] },
};

export const UCR_REGISTRATION_YEAR = 2026;
export const UCR_OPENS_OCT = 1;
export const UCR_DEADLINE_DEC = 31;
