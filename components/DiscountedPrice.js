'use client';

/**
 * Renders a price as "original $99" crossed out + "discounted $79" when the price is the filing service discount.
 * Use for UCR Filing Service ($79) to show: $99 discounted to $79
 */
export default function DiscountedPrice({ price, originalPrice = 99, className = '' }) {
  const p = Number(price);
  const orig = Number(originalPrice);
  if (orig <= p || orig === p) {
    return <span className={className}>${p.toLocaleString()}</span>;
  }
  return (
    <span className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      <span className="text-slate-500 line-through text-lg">${orig.toLocaleString()}</span>
      <span className="font-bold text-[var(--color-orange)]">${p.toLocaleString()}</span>
      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Discounted</span>
    </span>
  );
}
