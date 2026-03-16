import Link from 'next/link';
import { ComparisonTable } from '@/components/ComparisonTable';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'Cheapest UCR Filing Service 2026 — Price Comparison | EasyUCR',
  description: 'Compare UCR filing service fees: EasyUCR ($79, pay after) vs JJ Keller, Foley, CNS, and others. See why EasyUCR is the cheapest with no upfront payment.',
};

const FAQ = [
  { question: 'What is the cheapest UCR filing service?', answer: 'EasyUCR offers the lowest service fee at $79, with no upfront payment required. You pay only after your UCR is confirmed.' },
  { question: 'Why does EasyUCR cost less?', answer: 'We use AI automation to file UCR efficiently. We also don\'t charge you until your filing is complete, which reduces our overhead and lets us pass savings to you.' },
  { question: 'Are there hidden fees with EasyUCR?', answer: 'No. You pay the government UCR fee (based on fleet size) plus our flat $79 service fee. Nothing else.' },
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
          EasyUCR is the cheapest UCR filing service in the US. $79 flat service fee, no upfront payment. Compare us to JJ Keller, Foley, CNS, and others.
        </p>
        <div className="mb-12"><ComparisonTable /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Why Does EasyUCR Cost Less?</h2>
        <p className="text-slate-600 mb-8">
          We use AI automation to file UCR in under 10 minutes. We don&apos;t charge you until your filing is confirmed, which reduces our overhead and lets us offer the lowest service fee.
        </p>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
