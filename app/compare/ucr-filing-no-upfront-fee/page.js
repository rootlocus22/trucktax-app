import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'All-Inclusive UCR Filing — Transparent Pricing | EasyUCR',
  description: 'EasyUCR offers all-inclusive UCR filing. One payment covers everything — government fee included. Pay $79 and we handle the rest.',
};

const FAQ = [
  { question: 'What does all-inclusive UCR filing mean?', answer: 'You enter your DOT number and fleet info. We file your UCR with the government and pay the government fee on your behalf. One payment of $79 covers our service fee and the government UCR fee — no separate charges.' },
  { question: 'Are there any hidden fees?', answer: 'No. Your $79 payment covers everything — our service fee plus the government UCR fee. We pay the government on your behalf. That is the full cost.' },
  { question: 'How does EasyUCR pricing compare to other services?', answer: 'EasyUCR offers all-inclusive pricing at $79. Many other services charge their service fee separately on top of the government fee, making their true cost higher.' },
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
          EasyUCR offers all-inclusive pricing. One payment of $79 covers everything — government fee included. Pay once, we handle the rest.
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
