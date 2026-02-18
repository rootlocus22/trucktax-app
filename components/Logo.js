'use client';

/**
 * Compact logo: mark + "QuickTruckTax". Use in header for consistent branding.
 * @param {boolean} dark - when true, use light text (for dark header)
 * @param {boolean} compact - when true, hide tagline and use smaller text
 */
export default function Logo({ dark = false, compact = false, className = '' }) {
  const textClass = dark ? 'text-white' : 'text-[var(--color-navy)]';
  const muteClass = dark ? 'text-blue-200' : 'text-slate-500';
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      {/* Icon: stylized Q / truck shield */}
      <span className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--color-orange)] flex items-center justify-center shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
          <path d="M5 17h2.5l1.5-4h5l1.5 4H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 13H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="17.5" cy="16.5" r="1.5" fill="currentColor"/>
          <circle cx="6.5" cy="16.5" r="1.5" fill="currentColor"/>
        </svg>
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`font-bold tracking-tight ${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} ${textClass}`}>
          QuickTruckTax
        </span>
        {!compact && (
          <span className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest ${muteClass}`}>
            Compliance Simplified
          </span>
        )}
      </span>
    </span>
  );
}
