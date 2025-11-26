'use client';

import Link from 'next/link';
import { Shield, Lock, Star, CheckCircle, ArrowRight, AlertCircle, Clock, FileText, Download } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-4 py-16 sm:px-6 lg:px-8 lg:py-24 text-white rounded-3xl sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl">
        <div className="absolute inset-0 bg-[url('/hero-truck.svg')] opacity-10 bg-cover bg-center"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Stop Fighting With Confusing Tax Forms.
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed">
              We are the <strong>Done-For-You</strong> 2290 Service. Upload your old Schedule 1, and our US-based experts file the new one for you. <span className="text-[var(--color-sand)]">No logins, no typing, no headaches.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
                style={{ color: '#ffffff' }}
              >
                Start Filing Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-white/70 text-sm mb-8">Gets your Stamped Schedule 1 in minutes.</p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[var(--color-sand)]" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--color-sand)]" />
                <span>Delaware, USA Company</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--color-amber)] fill-[var(--color-amber)]" />
                <span>5-Star Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-slate-900">
            Why do other tax sites make it so hard?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <h3 className="text-xl font-semibold text-slate-900">The Old Way</h3>
              </div>
              <p className="text-slate-700">
                You have to remember your VIN, Gross Weight, and EIN. You have to navigate 10+ confusing screens. If you make a typo, you get rejected.
              </p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <h3 className="text-xl font-semibold text-slate-900">The Risk</h3>
              </div>
              <p className="text-slate-700">
                One wrong click on "Suspended Vehicles" or "Credit Vehicles" can cost you thousands in IRS penalties.
              </p>
            </div>
            <div className="bg-[var(--color-page-alt)] border-2 border-[var(--color-orange)] rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-[var(--color-orange)]" />
                <h3 className="text-xl font-semibold text-[var(--color-text)]">The QuickTruckTax Way</h3>
              </div>
              <p className="text-[var(--color-muted)]">
                You snap a photo of last year's form. We type it. We verify it. We file it. You just pay and drive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[var(--color-page-alt)]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-3 text-[var(--color-text)]">
            How Our Service Works
          </h2>
          <p className="text-center text-sm text-[var(--color-muted)] mb-10 max-w-2xl mx-auto">
            From signup to stamped Schedule 1, we handle everything. Our AI and expert agents make filing effortless.
          </p>
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <div className="bg-[var(--color-card)] rounded-xl p-5 shadow-md text-center border border-[var(--color-border)]">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xs font-semibold text-blue-600 mb-1">Step 1</div>
              <h3 className="text-sm font-semibold mb-1 text-[var(--color-text)]">Sign Up / Login</h3>
              <p className="text-xs text-[var(--color-muted)]">
                One-click Google login or email signup
              </p>
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-5 shadow-md text-center border border-[var(--color-border)]">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-xs font-semibold text-purple-600 mb-1">Step 2</div>
              <h3 className="text-sm font-semibold mb-1 text-[var(--color-text)]">Upload Schedule 1</h3>
              <p className="text-xs text-[var(--color-muted)]">
                Upload PDF or photo of your Schedule 1
              </p>
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-5 shadow-md text-center border border-[var(--color-border)]">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-[var(--color-orange)]" />
              </div>
              <div className="text-xs font-semibold text-[var(--color-orange)] mb-1">Step 3</div>
              <h3 className="text-sm font-semibold mb-1 text-[var(--color-text)]">AI Extracts Data</h3>
              <p className="text-xs text-[var(--color-muted)]">
                AI automatically extracts all information
              </p>
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-5 shadow-md text-center border border-[var(--color-border)]">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-green-600 mb-1">Step 4</div>
              <h3 className="text-sm font-semibold mb-1 text-[var(--color-text)]">Agents File</h3>
              <p className="text-xs text-[var(--color-muted)]">
                Expert agents review and file with IRS
              </p>
            </div>
            <div className="bg-[var(--color-card)] rounded-xl p-5 shadow-md text-center border border-[var(--color-border)]">
              <div className="w-12 h-12 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-[var(--color-orange)]" />
              </div>
              <div className="text-xs font-semibold text-[var(--color-orange)] mb-1">Step 5</div>
              <h3 className="text-sm font-semibold mb-1 text-[var(--color-text)]">Get Schedule 1</h3>
              <p className="text-xs text-[var(--color-muted)]">
                Receive stamped Schedule 1 within hours
              </p>
            </div>
          </div>
          <div className="text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-navy)] font-medium hover:text-[var(--color-orange)] transition"
            >
              Learn More About Our Process
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[var(--color-text)]">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-[var(--color-muted)] mb-8">
            One flat rate. No hidden fees. Everything included.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
            style={{ color: '#ffffff' }}
          >
            View Full Pricing Details
          </Link>
        </div>
      </section>

      {/* Trust & Compliance */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 text-[var(--color-sand)]" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Authorized & Secure</h2>
          <p className="text-lg text-white/80 mb-4">
            QuickTruckTax is a registered US Company based in Delaware.
          </p>
          <div className="inline-block bg-white/10 px-6 py-3 rounded-lg mb-6">
            <p className="text-sm font-semibold">Authorized IRS E-File Provider (via Partner Network)</p>
          </div>
          <p className="text-white/70 text-sm">
            We employ PTIN-certified tax professionals to sign and review every single return for accuracy.
          </p>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[var(--color-page-alt)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[var(--color-text)]">
            Have Questions?
          </h2>
          <p className="text-lg text-[var(--color-muted)] mb-8">
            Get answers to common questions about Form 2290 filing.
          </p>
          <Link
            href="/faq"
            className="inline-block bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg hover:shadow-xl"
            style={{ color: '#ffffff' }}
          >
            View FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}

