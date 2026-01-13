'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText } from 'lucide-react';

/**
 * StickyFileCTA - A floating bottom bar CTA that appears on scroll.
 * Designed to capture high-intent users reading blog content.
 * 
 * Based on Clarity insights showing users looking for "File Now" action on content pages.
 */
export default function StickyFileCTA({
    href = '/early-access',
    ctaText = 'Get Early Access',
    subtitle = 'Join 2,000+ truckers on the waitlist'
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling 400px (past hero section)
            const shouldShow = window.scrollY > 400;
            setIsVisible(shouldShow);
        };

        // Check initial position
        handleScroll();

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-full opacity-0 pointer-events-none'
                }`}
        >
            {/* Gradient background with blur */}
            <div className="bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] border-t border-white/10 backdrop-blur-sm shadow-2xl">
                <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Left: Icon + Text */}
                        <div className="flex items-center gap-3 text-white">
                            <div className="hidden sm:flex w-10 h-10 rounded-full bg-[var(--color-orange)]/20 items-center justify-center">
                                <FileText className="w-5 h-5 text-[var(--color-orange)]" />
                            </div>
                            <div className="text-center sm:text-left">
                                <p className="font-semibold text-sm sm:text-base">Ready to file your Form 2290?</p>
                                <p className="text-xs sm:text-sm text-white/70">{subtitle}</p>
                            </div>
                        </div>

                        {/* Right: CTA Button */}
                        <Link
                            href={href}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] hover:bg-[#ff7a20] text-white font-bold px-6 py-3 sm:py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-[0.98] min-h-[48px] text-sm sm:text-base group"
                        >
                            {ctaText}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
