'use client';

import { useMemo } from 'react';
import Link from 'next/link';

/**
 * Phase 5: Seasonal UCR urgency banner.
 * Shows Oct–Dec: "X days left to file UCR" or "Last chance before December 31".
 * Renders nothing outside UCR season (Oct 1 – Dec 31) so the parent can show a static line instead.
 */
export default function UcrDeadlineBanner({ className = '' }) {
  const { showBanner, daysLeft, isDecember, registrationYear } = useMemo(() => {
    const now = new Date();
    const month = now.getMonth(); // 0–11
    const octThroughDec = month >= 9; // Oct=9, Nov=10, Dec=11
    if (!octThroughDec) {
      return { showBanner: false, daysLeft: 0, isDecember: false, registrationYear: now.getFullYear() + 1 };
    }
    const year = now.getFullYear();
    const dec31 = new Date(year, 11, 31);
    const msPerDay = 24 * 60 * 60 * 1000;
    const days = Math.ceil((dec31 - now) / msPerDay);
    return {
      showBanner: true,
      daysLeft: Math.max(0, days),
      isDecember: month === 11,
      registrationYear: year + 1, // filing for next calendar year
    };
  }, []);

  const isLastWeek = daysLeft <= 7;

  return (
    <div className={`w-full bg-orange-50 border-y border-orange-100 py-3 sm:py-4 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left">
        <div className="flex items-center gap-2 sm:gap-3 text-slate-700 text-sm sm:text-[15px] font-medium">
          <span className="text-xl">🚛</span>
          <span>
            {showBanner ? (
              isDecember && (isLastWeek || daysLeft <= 14) ? (
                <>
                  🚛 <strong>Last chance</strong> to file UCR before the December 31 deadline. All-inclusive pricing — one payment, we handle everything.
                </>
              ) : (
                <>
                  🚛 <strong>{daysLeft > 0 ? `${daysLeft} days left` : 'Deadline today'}</strong> to file UCR for {registrationYear} — Dec 31 deadline. All-inclusive pricing.
                </>
              )
            ) : (
              <>
                UCR registration is open. File before Dec 31 — all-inclusive pricing, one payment covers everything.
              </>
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/ucr/file"
            className="inline-flex items-center justify-center bg-[var(--color-orange)] !text-white px-5 py-2 rounded-xl font-bold text-sm transition hover:bg-[#f07a2d] hover:shadow-lg hover:shadow-orange-500/20 active:scale-95"
          >
            Start UCR Filing →
          </Link>
          <div className="hidden sm:block h-4 w-px bg-orange-200" />
          <Link
            href={showBanner && isDecember && (isLastWeek || daysLeft <= 14) ? "/insights/ucr-deadlines-penalties-explained" : "/insights/ucr-registration-opens-october-1"}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors underline sm:no-underline"
          >
            {showBanner && isDecember && (isLastWeek || daysLeft <= 14) ? "UCR penalties" : "UCR opens Oct 1 — what to prepare"}
          </Link>
        </div>
      </div>
    </div>
  );
}
