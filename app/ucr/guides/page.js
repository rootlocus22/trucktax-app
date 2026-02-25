import Link from 'next/link';
import { complianceGuides } from '@/lib/guides';
import GovernmentDisclaimer from '@/components/GovernmentDisclaimer';
import { FileText, Calculator, ArrowRight, BookOpen, ShieldCheck, Lock, Award, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'UCR Filing Guides & Deadlines | QuickTruckTax',
  description:
    'Expert guides on Unified Carrier Registration: who must file, 2026 deadlines, fees, renewal, and how to file UCR online. File with $0 upfront.',
  alternates: {
    canonical: 'https://www.quicktrucktax.com/ucr/guides',
  },
  openGraph: {
    title: 'UCR Filing Guides & Deadlines | QuickTruckTax',
    description:
      'Guides on UCR registration, deadlines, fees, and renewal. File UCR online with $0 upfront.',
    url: 'https://www.quicktrucktax.com/ucr/guides',
  },
};

const ucrGuides = complianceGuides.filter((g) => g.category === 'UCR');

export default function UcrGuidesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-[var(--color-midnight)] text-white py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200 border border-white/20">
            UCR Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            UCR Filing Guides &amp; Deadlines
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            Everything you need to know about Unified Carrier Registration—who must file, 2026 fees, deadlines, renewal, and how to file online. File with us for $0 upfront.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ucr/file"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e66a15] transition shadow-lg"
            >
              Start UCR Filing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tools/ucr-calculator"
              className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/25 transition"
            >
              <Calculator className="w-5 h-5" /> UCR Fee Calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer + trust — Phase 2 E-E-A-T */}
      <section className="max-w-4xl mx-auto px-4 pt-6">
        <GovernmentDisclaimer className="mb-6" />
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-sm mb-2">
          <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> McAfee SECURE</span>
          <span className="flex items-center gap-2"><Lock className="w-5 h-5" /> 256-Bit SSL</span>
          <span className="flex items-center gap-2"><Award className="w-5 h-5" /> Expert review</span>
        </div>
        <p className="text-center text-xs text-slate-500">
          Guides reviewed by QuickTruckTax compliance team. Not legal or tax advice.
        </p>
      </section>

      {/* Guide list */}
      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-2">UCR guides</h2>
        <p className="text-slate-600 mb-8">
          Updated for the 2026 registration year. Read then file—we make UCR simple.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {ucrGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/insights/${guide.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[var(--color-navy)]/30 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[var(--color-navy)]">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-navy)] transition">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {guide.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-orange)] mt-3 group-hover:gap-2 transition-all">
                    Read guide <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
                <span>{guide.estimatedReadMinutes}-min read</span>
                <span>•</span>
                <span>
                  Updated {new Date(guide.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA + tools */}
      <section className="bg-white border-t border-slate-200 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-[var(--color-navy)] text-white p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold mb-2">Ready to file UCR?</h2>
            <p className="text-blue-100 mb-6">
              $0 upfront—pay only when your certificate is ready. File in minutes.
            </p>
            <Link
              href="/ucr/file"
              className="inline-flex items-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition"
            >
              Start UCR Filing <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/ucr/pricing"
              className="inline-flex items-center gap-2 text-[var(--color-navy)] font-semibold hover:underline"
            >
              <FileText className="w-4 h-4" /> UCR pricing
            </Link>
            <Link
              href="/ucr/dispatcher"
              className="inline-flex items-center gap-2 text-[var(--color-navy)] font-semibold hover:underline"
            >
              File UCR for multiple trucks
            </Link>
            <Link
              href="/resources/2290-due-date"
              className="inline-flex items-center gap-2 text-[var(--color-navy)] font-semibold hover:underline"
            >
              Form 2290 deadlines
            </Link>
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-[var(--color-navy)] font-semibold hover:underline"
            >
              All compliance guides
            </Link>
          </div>
          {/* Official UCR / FMCSA links — Phase 2 citations */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Official sources</h3>
            <ul className="flex flex-wrap gap-4 text-sm">
              <li>
                <a href="https://ucr.in.gov/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-navy)] hover:underline inline-flex items-center gap-1">
                  UCR Plan (ucr.in.gov) <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a href="https://www.fmcsa.dot.gov/registration/unified-carrier-registration" target="_blank" rel="noopener noreferrer" className="text-[var(--color-navy)] hover:underline inline-flex items-center gap-1">
                  FMCSA UCR <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
