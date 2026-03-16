/**
 * UCR fee calculator for SEO pages.
 * Official 2026 brackets per UCR Plan.
 */

export const UCR_BRACKETS = [
  { min: 0, max: 2, fee: 46, label: '0–2 trucks' },
  { min: 3, max: 5, fee: 138, label: '3–5 trucks' },
  { min: 6, max: 20, fee: 276, label: '6–20 trucks' },
  { min: 21, max: 100, fee: 963, label: '21–100 trucks' },
  { min: 101, max: 1000, fee: 4592, label: '101–1000 trucks' },
  { min: 1001, max: Infinity, fee: 44836, label: '1001+ trucks' },
];

export const SERVICE_FEE = 79;

export function getUCRFee(fleetSize) {
  const size = Math.max(0, Math.floor(Number(fleetSize) || 0));
  const bracket = UCR_BRACKETS.find((b) => size >= b.min && size <= b.max);
  return bracket?.fee ?? 46;
}
