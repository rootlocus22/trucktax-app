'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Schedule1Listener } from '@/components/Schedule1Listener';

export function ConsumerLayout({ children }) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed by default

  // Update state when user changes - collapsed if logged in, expanded if not
  useEffect(() => {
    setIsExpanded(!user);
  }, [user]);

  const toggleFooter = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex min-h-screen flex-col overflow-visible">
      <Schedule1Listener />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-visible">
        {children}
      </main>
      <footer className="border-t border-[var(--color-border)] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Collapsed Footer (when logged in) */}
        {user && !isExpanded && (
          <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <button
              onClick={toggleFooter}
              className="w-full flex items-center justify-between text-sm text-white/70 hover:text-white transition"
            >
              <span>&copy; {new Date().getFullYear()} QuickTruckTax. All rights reserved.</span>
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
                  The Done-For-You Form 2290 filing service for owner-operators.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  <li><Link href="/how-it-works" className="hover:text-white transition">How it Works</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
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
                  <li><Link href="/terms#refunds" className="hover:text-white transition">Refund Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-white/50">
              &copy; {new Date().getFullYear()} QuickTruckTax. All rights reserved.
            </div>
            <p className="text-xs text-center text-white/50 mt-2">
              Delaware, USA • Secure & Compliant Tax Filing
            </p>
          </div>
        )}
      </footer>
    </div>
  );
}

