import Link from 'next/link';
import { ComparisonTable } from '@/components/ComparisonTable';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'Cheapest UCR Filing Service 2026 — Price Comparison | EasyUCR',
  description: 'Compare UCR filing service fees: EasyUCR ($79 service fee + government UCR fee) vs JJ Keller, Foley, CNS, and others. See why EasyUCR offers the best value.',
};

const FAQ = [
  { question: 'What is the cheapest UCR filing service?', answer: 'EasyUCR charges a flat $79 service fee — one of the lowest in the industry. You also pay the official government UCR fee (starting at $46), which every carrier must pay regardless of which service they use. Both are combined into one Stripe payment.' },
  { question: 'Why does EasyUCR cost less?', answer: 'We use AI automation to file UCR efficiently. Our $79 service fee is among the lowest available. You pay the government UCR fee separately (starting at $46), but both charges are combined into a single payment — no separate transactions or surprises.' },
  { question: 'Are there hidden fees with EasyUCR?', answer: 'No. Your payment covers two things: our $79 service fee and the official government UCR fee based on your fleet size. Both are combined into one Stripe checkout. We pay the government fee on your behalf.' },
];

export default function CheapestUCRFilingService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/compare" className="hover:text-[var(--color-orange)]">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">Cheapest UCR Filing Service</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">Cheapest UCR Filing Service 2026</h1>
        <p className="text-lg text-slate-600 mb-8">
          EasyUCR is the best-value UCR filing service in the US. $79 service fee + official government UCR fee — one payment, we handle the rest. Compare us to JJ Keller, Foley, CNS, and others.
        </p>
        <div className="mb-12"><ComparisonTable /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Why Does EasyUCR Cost Less?</h2>
        <p className="text-slate-600 mb-8">
          We use AI automation to file UCR in under 10 minutes. Our flat $79 service fee is one of the lowest in the industry — and we combine it with the government UCR fee into one simple payment, so there are no surprises.
        </p>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
