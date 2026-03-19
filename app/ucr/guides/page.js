import Link from 'next/link';
import { complianceGuides } from '@/lib/guides';
import GovernmentDisclaimer from '@/components/GovernmentDisclaimer';
import { FileText, Calculator, ArrowRight, BookOpen, ShieldCheck, Lock, Award, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'UCR Filing Guides & Deadlines | easyucr.com',
  description:
    'Expert guides on Unified Carrier Registration: who must file, 2026 deadlines, fees, renewal, and how to file UCR online. Guided filing with transparent tiered pricing.',
  alternates: {
    canonical: 'https://www.easyucr.com/ucr/guides',
  },
  openGraph: {
    title: 'UCR Filing Guides & Deadlines | easyucr.com',
    description:
      'Guides on UCR registration, deadlines, fees, and renewal. File UCR online with clear totals before you pay.',
    url: 'https://www.easyucr.com/ucr/guides',
  },
};

const ucrGuides = complianceGuides.filter((g) => g.category === 'UCR');

export default function UcrGuidesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] py-20 lg:py-28 text-white">
        <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-orange)]/20 blur-3xl opacity-50" />
        <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/4 translate-y-1/4 rounded-full bg-[var(--color-sky)]/10 blur-3xl opacity-30" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="max-w-4xl space-y-6">
            <span className="inline-flex rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-orange)] border border-white/10">
              UCR Knowledge Base
            </span>
            <h1 className="text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl xl:text-6xl tracking-tight">
              UCR Filing Guides &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">Deadlines</span>
            </h1>
            <p className="text-lg leading-relaxed text-blue-100/90 max-w-2xl">
              Everything you need to know about Unified Carrier Registration—who must file, 2026 fees, and how to stay compliant. When you file with us, you get guided steps and your certificate in one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/ucr/file"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg hover:-translate-y-0.5"
              >
                Start UCR Filing <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/tools/ucr-calculator"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition"
              >
                <Calculator className="w-5 h-5" /> UCR Fee Calculator
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        {/* Trust & Disclaimer */}
        <section className="space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-400 text-sm font-semibold tracking-wide uppercase">
            <span className="flex items-center gap-2 border-r border-slate-200 pr-6 last:border-0"><ShieldCheck className="w-5 h-5 text-[var(--color-orange)]" /> McAfee SECURE</span>
            <span className="flex items-center gap-2 border-r border-slate-200 pr-6 last:border-0"><Lock className="w-5 h-5 text-[var(--color-orange)]" /> 256-Bit SSL</span>
            <span className="flex items-center gap-2 last:border-0"><Award className="w-5 h-5 text-[var(--color-orange)]" /> Expert review</span>
          </div>
          <GovernmentDisclaimer className="max-w-4xl mx-auto" />
        </section>

        {/* Guide List */}
        <section className="space-y-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Essential UCR Resources</h2>
              <p className="text-lg text-slate-600">Updated for the 2026 registration year.</p>
            </div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              {ucrGuides.length} Guides Available
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {ucrGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/insights/${guide.slug}`}
                className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:border-[var(--color-orange)]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-[var(--color-midnight)] group-hover:bg-[var(--color-orange)] group-hover:text-white transition-colors duration-300">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[var(--color-orange)] transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-base text-slate-600 leading-relaxed line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-[var(--color-orange)] font-bold text-sm">
                      <span>Read Guide</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3 rotate-[270deg]" /> {guide.estimatedReadMinutes} Min Read</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>2026 Season</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Global CTA - Full Width Section */}
      <section className="relative bg-[var(--color-midnight)] py-20 text-white overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange)]/10 to-transparent opacity-50" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to secure your 2026 UCR?</h2>
            <p className="text-blue-100/80 text-lg leading-relaxed">
              See government + service fee before you pay, then keep proof of registration in your dashboard. Join carriers who trust easyucr.com for UCR season.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link
              href="/ucr/file"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#ff7a20] shadow-lg transition hover:-translate-y-0.5"
            >
              Start UCR Filing <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        {/* Secondary Links Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'UCR Pricing', href: '/ucr/pricing', icon: FileText },
            { label: 'Multiple Trucks', href: '/ucr/dispatcher', icon: BookOpen },
            { label: 'UCR Deadline', href: '/learn/ucr-deadline-2026', icon: Calculator },
            { label: 'All Compliance', href: '/insights', icon: ArrowRight }
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-slate-100 hover:border-[var(--color-orange)]/30 hover:shadow-md transition-all"
            >
              <item.icon className="w-6 h-6 text-slate-600 group-hover:text-[var(--color-orange)] transition-colors mb-2" />
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
            </Link>
          ))}
        </section>

        {/* External Sources */}
        <section className="pt-12 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Official Enforcement Sources</h3>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="flex flex-wrap gap-8">
            <a href="https://ucr.in.gov/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[var(--color-orange)] font-bold text-sm inline-flex items-center gap-2 transition-colors">
              UCR Plan (ucr.in.gov) <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
            <a href="https://www.fmcsa.dot.gov/registration/unified-carrier-registration" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-[var(--color-orange)] font-bold text-sm inline-flex items-center gap-2 transition-colors">
              FMCSA UCR Official Portal <ExternalLink className="w-4 h-4 opacity-50" />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

