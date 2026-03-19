import Link from 'next/link';
import { ComparisonTable } from '@/components/ComparisonTable';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'Cheapest UCR Filing Service 2026 — Price Comparison | EasyUCR',
  description: 'Compare UCR filing service fees: EasyUCR ($79 all-inclusive, government fee included) vs JJ Keller, Foley, CNS, and others. See why EasyUCR offers the best value.',
};

const FAQ = [
  { question: 'What is the cheapest UCR filing service?', answer: 'EasyUCR offers the best value at $79 all-inclusive — government fee included. One payment covers everything. We pay the government fee on your behalf.' },
  { question: 'Why does EasyUCR cost less?', answer: 'We use AI automation to file UCR efficiently. Our all-inclusive pricing means no surprise charges — your $79 covers both our service fee and the government UCR fee.' },
  { question: 'Are there hidden fees with EasyUCR?', answer: 'No. Your $79 all-inclusive payment covers everything — our service fee and the government UCR fee. Nothing else. We pay the government on your behalf.' },
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
          EasyUCR is the best-value UCR filing service in the US. $79 all-inclusive — government fee included. Compare us to JJ Keller, Foley, CNS, and others.
        </p>
        <div className="mb-12"><ComparisonTable /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Why Does EasyUCR Cost Less?</h2>
        <p className="text-slate-600 mb-8">
          We use AI automation to file UCR in under 10 minutes. Our all-inclusive pricing — government fee included — means no surprise charges and the best value for your filing.
        </p>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
