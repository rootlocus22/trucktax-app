'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';

/**
 * Phase 3: Persistent UCR CTA on compliance guides and service pages.
 * Sticky bottom bar — "UCR Filing Due by December 31" / "File in minutes. $0 upfront."
 * Mobile-friendly, appears after scroll.
 */
export default function UcrCtaBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 400;
      setIsVisible(shouldShow);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] border-t border-white/10 backdrop-blur-sm shadow-2xl">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-white">
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-[var(--color-orange)]/20 items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[var(--color-orange)]" />
              </div>
              <div className="text-center sm:text-left">
                <p className="font-semibold text-sm sm:text-base">UCR Filing Due by December 31</p>
                <p className="text-xs sm:text-sm text-white/70">File in minutes. $0 upfront — pay when your certificate is ready.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href="/ucr/guides"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-white/90 hover:text-white text-sm font-medium py-2.5 px-4 rounded-xl border border-white/30 hover:border-white/50 transition min-h-[44px] sm:min-h-0"
              >
                Guides
              </Link>
              <Link
                href="/ucr/file"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] hover:bg-[#e66a15] text-white font-bold px-5 py-3 sm:py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-[0.98] min-h-[48px] text-sm sm:text-base group"
              >
                Start UCR Filing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
