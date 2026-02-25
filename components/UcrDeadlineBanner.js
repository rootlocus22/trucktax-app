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
    <div className={`bg-amber-500 text-white py-3 px-4 text-center text-sm font-semibold ${className}`}>
      {showBanner ? (
        isDecember && (isLastWeek || daysLeft <= 14) ? (
          <>
            🚛 <strong>Last chance</strong> to file UCR before the December 31 deadline. $0 upfront — pay when your certificate is ready.{' '}
            <Link href="/ucr/file" className="underline ml-1 inline-block py-2 touch-manipulation font-bold">Start UCR Filing →</Link>
            {' · '}
            <Link href="/insights/ucr-deadlines-penalties-explained" className="underline inline-block py-2 touch-manipulation">UCR penalties</Link>
          </>
        ) : (
          <>
            🚛 {daysLeft > 0 ? (
              <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</strong>
            ) : (
              <strong>Deadline today</strong>
            )}{' '}
            to file UCR for {registrationYear} — Dec 31 deadline. $0 upfront.{' '}
            <Link href="/ucr/file" className="underline ml-1 inline-block py-2 touch-manipulation font-bold">Start UCR Filing →</Link>
            {' · '}
            <Link href="/insights/ucr-registration-opens-october-1" className="underline inline-block py-2 touch-manipulation">What to prepare</Link>
          </>
        )
      ) : (
        <>
          🚛 UCR registration is open. File before Dec 31 with $0 upfront — pay when your certificate is ready.{' '}
          <Link href="/ucr/file" className="underline ml-1 inline-block py-2 touch-manipulation font-bold">Start UCR Filing →</Link>
          {' · '}
          <Link href="/insights/ucr-registration-opens-october-1" className="underline inline-block py-2 touch-manipulation">UCR opens Oct 1 — what to prepare</Link>
        </>
      )}
    </div>
  );
}
