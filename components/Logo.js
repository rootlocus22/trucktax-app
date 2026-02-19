'use client';

import Image from 'next/image';

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
      {/* Logo mark - professional brand icon */}
      <span className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden shadow-sm bg-white flex items-center justify-center">
        <Image
          src="/quicktrucktax-logo-mark.png"
          alt="QuickTruckTax"
          width={36}
          height={36}
          className="w-full h-full object-contain"
        />
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
