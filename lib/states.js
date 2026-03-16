/**
 * UCR state data for programmatic SEO pages.
 * 41 participating states + non-participating (FL, NJ, OR, HI) — still need UCR if crossing state lines.
 */

export const UCR_STATES = [
  { slug: 'alabama', name: 'Alabama', participates: true, abbr: 'AL' },
  { slug: 'alaska', name: 'Alaska', participates: true, abbr: 'AK' },
  { slug: 'arizona', name: 'Arizona', participates: true, abbr: 'AZ' },
  { slug: 'arkansas', name: 'Arkansas', participates: true, abbr: 'AR' },
  { slug: 'california', name: 'California', participates: true, abbr: 'CA' },
  { slug: 'colorado', name: 'Colorado', participates: true, abbr: 'CO' },
  { slug: 'connecticut', name: 'Connecticut', participates: true, abbr: 'CT' },
  { slug: 'delaware', name: 'Delaware', participates: true, abbr: 'DE' },
  { slug: 'florida', name: 'Florida', participates: false, abbr: 'FL' },
  { slug: 'georgia', name: 'Georgia', participates: true, abbr: 'GA' },
  { slug: 'hawaii', name: 'Hawaii', participates: false, abbr: 'HI' },
  { slug: 'idaho', name: 'Idaho', participates: true, abbr: 'ID' },
  { slug: 'illinois', name: 'Illinois', participates: true, abbr: 'IL' },
  { slug: 'indiana', name: 'Indiana', participates: true, abbr: 'IN' },
  { slug: 'iowa', name: 'Iowa', participates: true, abbr: 'IA' },
  { slug: 'kansas', name: 'Kansas', participates: true, abbr: 'KS' },
  { slug: 'kentucky', name: 'Kentucky', participates: true, abbr: 'KY' },
  { slug: 'louisiana', name: 'Louisiana', participates: true, abbr: 'LA' },
  { slug: 'maine', name: 'Maine', participates: true, abbr: 'ME' },
  { slug: 'maryland', name: 'Maryland', participates: true, abbr: 'MD' },
  { slug: 'massachusetts', name: 'Massachusetts', participates: true, abbr: 'MA' },
  { slug: 'michigan', name: 'Michigan', participates: true, abbr: 'MI' },
  { slug: 'minnesota', name: 'Minnesota', participates: true, abbr: 'MN' },
  { slug: 'mississippi', name: 'Mississippi', participates: true, abbr: 'MS' },
  { slug: 'missouri', name: 'Missouri', participates: true, abbr: 'MO' },
  { slug: 'montana', name: 'Montana', participates: true, abbr: 'MT' },
  { slug: 'nebraska', name: 'Nebraska', participates: true, abbr: 'NE' },
  { slug: 'nevada', name: 'Nevada', participates: true, abbr: 'NV' },
  { slug: 'new-hampshire', name: 'New Hampshire', participates: true, abbr: 'NH' },
  { slug: 'new-jersey', name: 'New Jersey', participates: false, abbr: 'NJ' },
  { slug: 'new-mexico', name: 'New Mexico', participates: true, abbr: 'NM' },
  { slug: 'new-york', name: 'New York', participates: true, abbr: 'NY' },
  { slug: 'north-carolina', name: 'North Carolina', participates: true, abbr: 'NC' },
  { slug: 'north-dakota', name: 'North Dakota', participates: true, abbr: 'ND' },
  { slug: 'ohio', name: 'Ohio', participates: true, abbr: 'OH' },
  { slug: 'oklahoma', name: 'Oklahoma', participates: true, abbr: 'OK' },
  { slug: 'oregon', name: 'Oregon', participates: false, abbr: 'OR' },
  { slug: 'pennsylvania', name: 'Pennsylvania', participates: true, abbr: 'PA' },
  { slug: 'rhode-island', name: 'Rhode Island', participates: true, abbr: 'RI' },
  { slug: 'south-carolina', name: 'South Carolina', participates: true, abbr: 'SC' },
  { slug: 'south-dakota', name: 'South Dakota', participates: true, abbr: 'SD' },
  { slug: 'tennessee', name: 'Tennessee', participates: true, abbr: 'TN' },
  { slug: 'texas', name: 'Texas', participates: true, abbr: 'TX' },
  { slug: 'utah', name: 'Utah', participates: true, abbr: 'UT' },
  { slug: 'vermont', name: 'Vermont', participates: true, abbr: 'VT' },
  { slug: 'virginia', name: 'Virginia', participates: true, abbr: 'VA' },
  { slug: 'washington', name: 'Washington', participates: true, abbr: 'WA' },
  { slug: 'west-virginia', name: 'West Virginia', participates: true, abbr: 'WV' },
  { slug: 'wisconsin', name: 'Wisconsin', participates: true, abbr: 'WI' },
  { slug: 'wyoming', name: 'Wyoming', participates: true, abbr: 'WY' },
];

export function getStateBySlug(slug) {
  return UCR_STATES.find((s) => s.slug === slug) || null;
}

export const PARTICIPATING_STATES = UCR_STATES.filter((s) => s.participates);
export const NON_PARTICIPATING_STATES = UCR_STATES.filter((s) => !s.participates);
