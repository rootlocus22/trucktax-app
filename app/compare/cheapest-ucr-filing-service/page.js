import Link from 'next/link';
import { ComparisonTable } from '@/components/ComparisonTable';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'UCR Filing Cost Comparison 2026 — Fees & Value | EasyUCR',
  description: 'Compare UCR filing on speed, transparency, and pay-when-ready workflow—not just sticker price. EasyUCR tiered service fees from $79 + official government UCR fee.',
};

const FAQ = [
  { question: 'How should I compare UCR filing services?', answer: 'Look at total cost (government fee + service fee), when you pay, how clearly the bracket is explained, and how fast you get proof of registration. EasyUCR shows the full total before you pay and uses a tiered service fee that scales with fleet size (from $79 for small fleets).' },
  { question: 'What do I pay with EasyUCR?', answer: 'You pay the official government UCR fee for your fleet size plus EasyUCR’s tiered service fee for guided filing. Both are itemized and combined in one checkout. See easyucr.com/ucr/pricing for the full service-fee table.' },
  { question: 'Are there hidden fees with EasyUCR?', answer: 'No. Your payment covers our tiered service fee and the official government UCR fee. Both are shown before you complete payment. We pay the government fee on your behalf as part of the filing.' },
];

export default function CheapestUCRFilingService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/compare" className="hover:text-[var(--color-orange)]">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR filing cost comparison</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">UCR filing cost comparison (2026)</h1>
        <p className="text-lg text-slate-600 mb-8">
          Price matters for transparency—but carriers also care about accuracy, speed, and knowing the full total before they pay. EasyUCR combines official government fees with a tiered service fee (from $79 for small fleets) in one clear checkout. Use the table below to see how we stack up on workflow and pricing clarity, not just the headline rate.
        </p>
        <div className="mb-12"><ComparisonTable /></div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Why carriers choose EasyUCR</h2>
        <p className="text-slate-600 mb-8">
          We focus on UCR only: validated brackets, a guided filing flow, and your certificate in the dashboard. Automation keeps the experience fast—often under 10 minutes when your DOT and fleet data are ready—while pricing stays itemized so you always know what the government portion is versus the service fee.
        </p>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
