import Link from 'next/link';
import { ComparisonTable } from '@/components/ComparisonTable';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'EasyUCR vs JJ Keller — UCR Filing Comparison 2026 | EasyUCR',
  description:
    'Compare speed, pay timing, and transparency for UCR filing. EasyUCR focuses on fast, guided registration with pricing you see upfront; JJ Keller is a broad compliance suite.',
  alternates: { canonical: 'https://www.easyucr.com/compare/easyucr-vs-jj-keller' },
};

const FAQ = [
  {
    question: 'What is the main difference for UCR filing?',
    answer:
      'EasyUCR is built around completing UCR quickly with built-in USDOT verification and a typical turnaround under 10 minutes. JJ Keller offers a wide range of compliance products; UCR is one of many services. Compare pay timing and total cost in the table below.',
  },
  {
    question: 'Does JJ Keller require upfront payment?',
    answer:
      'JJ Keller typically expects payment before or as part of service delivery. EasyUCR is structured so you are not paying service fees upfront in the same way—see current checkout terms when you file.',
  },
];

export default function EasyUCRVsJJKeller() {
  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/compare" className="hover:text-[var(--color-orange)]">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">EasyUCR vs JJ Keller</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">EasyUCR vs JJ Keller</h1>
        <p className="text-lg text-slate-600 mb-8">
          JJ Keller is a well-known name across trucking compliance. If your priority is <strong>finishing UCR quickly</strong> with clear steps and pricing you can see before you commit, EasyUCR is purpose-built for that workflow. Use the comparison for speed, transparency, and cost—then choose what fits your operation.
        </p>
        <div className="mb-12"><ComparisonTable /></div>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
