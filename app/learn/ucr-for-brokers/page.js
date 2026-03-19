import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';
import { UCRFeeCalculator } from '@/components/UCRFeeCalculator';

export const metadata = {
  title: 'UCR for Brokers — Do Brokers Need UCR? | EasyUCR',
  description: 'Freight brokers must register for UCR. Brokers pay the minimum $46 fee. File in 10 minutes with EasyUCR.',
  alternates: { canonical: 'https://www.easyucr.com/learn/ucr-for-brokers' },
};

const FAQ = [
  { question: 'Do brokers need UCR?', answer: 'Yes. Freight brokers engaged in interstate commerce must register for UCR and pay the annual fee.' },
  { question: 'How much does UCR cost for brokers?', answer: 'Brokers pay the minimum tier: $46 government fee. With EasyUCR, total is $125. You pay only after filing is confirmed.' },
];

export default function UCRForBrokers() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR for Brokers</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">UCR for Brokers</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Freight brokers engaged in interstate commerce must register for UCR. Brokers pay the minimum $46 fee regardless of fleet size (you don&apos;t operate vehicles). File in under 10 minutes.
        </p>
        <div className="mb-12"><UCRFeeCalculator /></div>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
