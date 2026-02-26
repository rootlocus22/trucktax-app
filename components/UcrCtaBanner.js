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
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
    >
      <div className="bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] border-t border-white/10 backdrop-blur-md shadow-2xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-white text-center sm:text-left">
              <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[var(--color-orange)]/10 border border-[var(--color-orange)]/20 items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-[var(--color-orange)]" />
              </div>
              <div className="space-y-0.5">
                <p className="font-black text-sm sm:text-lg tracking-tight">Need to file your 2026 UCR?</p>
                <p className="text-xs sm:text-sm text-white/50 font-medium tracking-wide">Get it done in minutes. <span className="text-[var(--color-orange)] font-bold">$0 Upfront to start.</span></p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/ucr/file"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-3 bg-[var(--color-orange)] hover:bg-[#ff7a20] text-[#0f2647] font-black px-8 py-3.5 sm:py-4 rounded-xl transition-all shadow-xl shadow-orange-500/30 active:scale-95 text-sm sm:text-base group uppercase tracking-tight"
              >
                File 2026 UCR Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
