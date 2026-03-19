import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'Do I Need UCR? Quick Checklist | EasyUCR',
  description: 'Not sure if you need UCR? Use our quick checklist. Motor carriers, brokers, and freight forwarders in interstate commerce must file.',
  alternates: { canonical: 'https://www.easyucr.com/learn/do-i-need-ucr' },
};

const FAQ = [
  { question: 'Do I need UCR if I only haul intrastate?', answer: 'No. If you operate exclusively within one state and never cross state lines, you are generally exempt from UCR.' },
  { question: 'Do I need UCR if I am leased to a carrier?', answer: 'It depends on your lease. Some carriers cover UCR for their leased operators. Check your lease agreement.' },
  { question: 'Do brokers need UCR?', answer: 'Yes. Freight brokers engaged in interstate commerce must register for UCR and pay the annual fee.' },
];

export default function DoINeedUCR() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">Do I Need UCR</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">Do I Need UCR?</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Use this checklist: Do you operate commercial vehicles in interstate commerce? Are you a motor carrier, broker, freight forwarder, or leasing company? If yes, you need UCR.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li>Motor carriers crossing state lines — Yes</li>
          <li>Freight brokers — Yes</li>
          <li>Freight forwarders — Yes</li>
          <li>Leasing companies — Yes</li>
          <li>Intrastate-only carriers — No</li>
        </ul>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
