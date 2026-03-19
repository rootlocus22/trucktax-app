import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'UCR for Freight Forwarders | EasyUCR',
  description: 'Freight forwarders must register for UCR. Pay the minimum $46 fee. File in 10 minutes with EasyUCR.',
  alternates: { canonical: 'https://www.easyucr.com/learn/ucr-for-freight-forwarders' },
};

const FAQ = [
  { question: 'Do freight forwarders need UCR?', answer: 'Yes. Freight forwarders engaged in interstate commerce must register for UCR.' },
  { question: 'How much does UCR cost for freight forwarders?', answer: 'Freight forwarders pay the minimum $46 government fee. With EasyUCR, total is $125. Pay only after confirmation.' },
];

export default function UCRForFreightForwarders() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR for Freight Forwarders</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">UCR for Freight Forwarders</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Freight forwarders engaged in interstate commerce must register for UCR. You pay the minimum $46 fee. File in under 10 minutes with EasyUCR.
        </p>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
