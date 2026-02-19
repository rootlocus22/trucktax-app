/**
 * UCR programmatic SEO: state slugs and operator types for URL generation.
 */

import usStates from '@/data/us-states.json';

export function stateToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function slugToState(slug) {
  const found = usStates.find((s) => stateToSlug(s.name) === slug);
  return found || null;
}

/** All state slugs for generateStaticParams (50 states) */
export const UCR_STATE_SLUGS = usStates.map((s) => stateToSlug(s.name));

/** State names by slug for page titles */
export const UCR_STATES_BY_SLUG = Object.fromEntries(
  usStates.map((s) => [stateToSlug(s.name), s])
);

/** Fleet sizes for programmatic pages (1–50 trucks) */
export const UCR_FLEET_SIZES = Array.from({ length: 50 }, (_, i) => i + 1);

/** Operator types for /ucr-for/[type] */
export const UCR_OPERATOR_TYPES = [
  { slug: 'brokers', title: 'Brokers', description: 'UCR registration for freight brokers' },
  { slug: 'freight-forwarders', title: 'Freight Forwarders', description: 'UCR for freight forwarders' },
  { slug: 'owner-operators', title: 'Owner-Operators', description: 'UCR filing for owner-operators' },
  { slug: 'leased-operators', title: 'Leased Operators', description: 'UCR for leased operators' },
];
