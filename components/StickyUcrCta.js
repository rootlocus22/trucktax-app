'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, FileCheck } from 'lucide-react';

/**
 * Sticky bottom CTA for UCR filing. Shown after scroll on relevant pages.
 * Hide on /ucr/file, /login, /signup, /dashboard (dashboard has its own UCR card).
 */
export default function StickyUcrCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const hidePaths = ['/ucr/file', '/login', '/signup', '/dashboard', '/agent'];
  const shouldHide = hidePaths.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (shouldHide) {
      setVisible(false);
      return;
    }
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [shouldHide]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-safe bg-[var(--color-midnight)] border-t border-white/10 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-white min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-orange)]/20 flex items-center justify-center">
            <FileCheck className="w-5 h-5 text-[var(--color-orange)]" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm sm:text-base">Ready to file UCR?</p>
            <p className="text-xs text-white/70">Simple. Fast. Smart UCR filing.</p>
          </div>
        </div>
        <Link
          href="/ucr/file"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[52px] bg-[var(--color-orange)] !text-white font-bold px-6 py-3 rounded-xl hover:bg-[#e66a15] transition text-sm sm:text-base touch-manipulation"
        >
          Start UCR Filing <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
