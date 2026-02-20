'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Schedule1Listener } from '@/components/Schedule1Listener';

export function ConsumerLayout({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed by default

  // Check if we're on the landing page
  const isLandingPage = pathname === '/';

  // Check if user is authenticated and on dashboard routes
  const isDashboardRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/tools') || pathname?.startsWith('/blog') || pathname?.startsWith('/insights');
  // Sidebar is disabled in favor of header navigation, so we disable the fixed-height layout
  const showSidebar = false;

  // Update state when user changes - collapsed if logged in, expanded if not
  useEffect(() => {
    setIsExpanded(!user);
  }, [user]);

  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`flex flex-col bg-[var(--color-page)] w-full ${showSidebar ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Schedule1Listener />
      {/* Always show header - fixed height */}
      <Header />

      {/* Main Layout Area - fills remaining height */}
      <div className={`flex-1 flex w-full relative ${showSidebar ? 'overflow-hidden' : ''}`}>
        {/* Show sidebar for authenticated users on dashboard routes */}
        {/* Sidebar removed - using Header navigation for all users */}
        <MainContent isLandingPage={isLandingPage}>
          {children}
        </MainContent>
      </div>

      {/* Footer - Fixed height at bottom */}
      <footer className="border-t border-[var(--color-border)] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex-shrink-0 z-40 w-full">
        {/* Collapsed Footer (when logged in) */}
        {user && !isExpanded && (
          <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <button
              onClick={toggleFooter}
              className="w-full flex items-center justify-between text-sm text-white/70 hover:text-white transition"
            >
              <span>&copy; {new Date().getFullYear()} QuickTruckTax, All Rights Reserved.</span>
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Expanded Footer */}
        {(isExpanded || !user) && (
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {user && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={toggleFooter}
                  className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition"
                >
                  <ChevronUp className="h-4 w-4" />
                  <span>Collapse</span>
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-4">QuickTruckTax</h3>
                <p className="text-sm text-white/70">
                  Form 2290 and trucking compliance guides and resources.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><Link href="/how-it-works" className="hover:text-white transition">How it Works</Link></li>
                  <li><Link href="/resources" className="hover:text-white transition">Resources</Link></li>
                  <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Resources</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><Link href="/insights/trucking-compliance-calendar" className="hover:text-white transition">Compliance Calendar</Link></li>
                  <li><Link href="/insights/form-2290-checklist-download" className="hover:text-white transition">Form 2290 Checklist</Link></li>
                  <li><Link href="/tools/hvut-calculator" className="hover:text-white transition">HVUT Calculator</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                  <li><Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-8 space-y-6">
              <div className="text-xs text-white/60 leading-relaxed space-y-2 text-center max-w-3xl mx-auto">
                <p>The information and images on this website are the property of QuickTruckTax and may not be reproduced, reused, or appropriated without the express written consent of the owner.</p>
                <p>QuickTruckTax is a private third-party provider offering services for a fee. This website serves as a commercial solicitation and advertisement. We are not a government agency and are not affiliated with any government authority such as the UCR Board, IRS, USDOT, or FMCSA.</p>
              </div>
              <p className="text-center text-sm text-white/50">&copy; 2026 QuickTruckTax, All Rights Reserved.</p>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

// MainContent component for pages without sidebar
function MainContent({ isLandingPage, children }) {
  return (
    <main className={`flex-1 overflow-visible ${isLandingPage
      ? ''
      : 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6'
      }`}>
      {children}
    </main>
  );
}

