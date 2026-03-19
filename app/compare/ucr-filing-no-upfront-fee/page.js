import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'All-Inclusive UCR Filing — Transparent Pricing | EasyUCR',
  description: 'EasyUCR offers transparent UCR filing. $79 service fee + official government UCR fee — one payment, we pay the government fee on your behalf.',
};

const FAQ = [
  { question: 'What does all-inclusive UCR filing mean?', answer: 'You enter your DOT number and fleet info. We file your UCR and pay the government fee on your behalf. One payment covers our $79 service fee plus the official government UCR fee (which varies by fleet size, starting at $46). No separate charges or surprises.' },
  { question: 'Are there any hidden fees?', answer: 'No. Your payment covers two things: our $79 service fee and the official government UCR fee based on your fleet size. Both are combined into one Stripe checkout. We pay the government fee on your behalf.' },
  { question: 'How does EasyUCR pricing compare to other services?', answer: 'EasyUCR charges a flat $79 service fee — one of the lowest in the industry. You also pay the government UCR fee (starting at $46), which every carrier must pay regardless of which service they use.' },
];

export default function UCRFilingNoUpfrontFee() {
  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/compare" className="hover:text-[var(--color-orange)]">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR Filing All-Inclusive Pricing</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">All-Inclusive UCR Filing — Transparent Pricing</h1>
        <p className="text-lg text-slate-600 mb-8">
          EasyUCR offers all-inclusive pricing. One payment covers our $79 service fee plus the official government UCR fee (starting at $46 based on fleet size). Pay once, we handle the rest.
        </p>
        <h2 className="text-xl font-bold text-slate-900 mb-4">How It Works</h2>
        <ol className="list-decimal pl-6 space-y-4 text-slate-600 mb-12">
          <li>Enter your DOT number and fleet info (2 minutes)</li>
          <li>We file your UCR with the government using AI automation</li>
          <li>One payment of $79 covers everything — we pay the government fee on your behalf</li>
        </ol>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
