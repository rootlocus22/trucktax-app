import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'All-Inclusive UCR Filing — Transparent Pricing | EasyUCR',
  description: 'One payment covers EasyUCR’s tiered service fee plus the official government UCR fee—itemized before checkout. Guided filing, pay when your certificate is ready.',
  alternates: { canonical: 'https://www.easyucr.com/compare/ucr-filing-no-upfront-fee' },
};

const FAQ = [
  { question: 'What does all-inclusive UCR filing mean?', answer: 'You enter your DOT number and fleet info. We file your UCR and pay the government fee on your behalf. One payment covers our tiered service fee (from $79 for small fleets) plus the official government UCR fee for your bracket. Everything is itemized before you pay—no surprise add-ons.' },
  { question: 'Are there any hidden fees?', answer: 'No. Your payment covers our tiered service fee and the official government UCR fee. Both are shown in checkout. We pay the government fee on your behalf as part of the filing.' },
  { question: 'How does EasyUCR pricing compare to other services?', answer: 'Compare total cost, when you pay, and how clearly brackets are explained. EasyUCR uses tiered service fees that scale with fleet size; you always see government fee + service fee before committing. See easyucr.com/ucr/pricing for current tiers.' },
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
          EasyUCR offers all-inclusive pricing with the math shown up front: official government UCR fee for your fleet size plus our tiered service fee for guided filing. One payment—we route the government portion for you.
        </p>
        <h2 className="text-xl font-bold text-slate-900 mb-4">How It Works</h2>
        <ol className="list-decimal pl-6 space-y-4 text-slate-600 mb-12">
          <li>Enter your DOT number and fleet info (about 2 minutes)</li>
          <li>Review your full total (government + service fee) before checkout</li>
          <li>We complete filing and you get proof of registration in your dashboard</li>
        </ol>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
