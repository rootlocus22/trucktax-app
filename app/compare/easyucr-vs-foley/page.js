import Link from 'next/link';
import { ComparisonTable } from '@/components/ComparisonTable';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'EasyUCR vs Foley — UCR Filing Comparison 2026 | EasyUCR',
  description: 'Compare EasyUCR and Foley for UCR filing. EasyUCR: $79, pay after filing. Foley: ~$100, pay upfront.',
};

const FAQ = [
  { question: 'Is EasyUCR cheaper than Foley?', answer: 'Yes. EasyUCR charges $79 service fee vs Foley at approximately $100. EasyUCR also lets you pay only after your filing is confirmed.' },
  { question: 'Does Foley require upfront payment?', answer: 'Yes. Foley typically requires payment before filing. EasyUCR charges you only after your UCR confirmation number is issued.' },
];

export default function EasyUCRVsFoley() {
  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/compare" className="hover:text-[var(--color-orange)]">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">EasyUCR vs Foley</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">EasyUCR vs Foley</h1>
        <p className="text-lg text-slate-600 mb-8">
          Foley is a popular trucking compliance service. For UCR filing, EasyUCR offers a lower service fee ($79 vs ~$100) and the only pay-after-filing model. You pay only when your UCR is confirmed.
        </p>
        <div className="mb-12"><ComparisonTable /></div>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
