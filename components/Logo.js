'use client';

import Image from 'next/image';

/**
 * Logo: mark + "EasyUCR". Brand name only — never .com in header.
 * @param {boolean} dark - when true, use light text (for dark header)
 * @param {boolean} compact - when true, hide tagline and use smaller text
 * @param {string} size - 'sm' | 'md' | 'lg' - logo scale (lg for auth/hero)
 */
export default function Logo({ dark = false, compact = false, size = 'md', className = '' }) {
  const textClass = dark ? 'text-white' : 'text-[var(--color-navy)]';
  const muteClass = dark ? 'text-blue-200' : 'text-slate-500';
  const markSize = size === 'lg' ? 'w-12 h-12 sm:w-14 sm:h-14' : size === 'sm' ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-9 sm:h-9';
  const imgSize = size === 'lg' ? 56 : size === 'sm' ? 32 : 36;
  const textSize = size === 'lg' ? (compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl') : compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl';
  const taglineSize = size === 'lg' ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]';
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-3 ${className}`}>
      <span className={`flex-shrink-0 ${markSize} rounded-xl overflow-hidden shadow-md bg-white flex items-center justify-center ring-2 ring-white/20`}>
        <Image
          src="/easyucr-logo-mark.png"
          alt="EasyUCR"
          width={imgSize}
          height={imgSize}
          className="w-full h-full object-contain"
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`font-bold tracking-tight ${textSize} ${textClass}`}>
          EasyUCR
        </span>
        {!compact && (
          <span className={`${taglineSize} font-semibold uppercase tracking-widest ${muteClass}`}>
            Compliance Simplified
          </span>
        )}
      </span>
    </span>
  );
}
