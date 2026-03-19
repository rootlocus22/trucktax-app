import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'UCR vs DOT Number — Understanding the Difference | EasyUCR',
  description: 'UCR and DOT number are different. Learn what each is, when you need both, and how they work together for trucking compliance.',
  alternates: { canonical: 'https://www.easyucr.com/learn/ucr-vs-dot-number' },
};

const FAQ = [
  { question: 'What is the difference between UCR and DOT number?', answer: 'A DOT number identifies your company to FMCSA. UCR is a separate annual registration and fee for interstate operations. You need both if you operate in interstate commerce.' },
  { question: 'Do I need a DOT number to file UCR?', answer: 'Yes. UCR registration requires your USDOT number (or MC number for brokers). Your fleet size for UCR should match what you report to FMCSA.' },
];

export default function UCRVsDotNumber() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR vs DOT Number</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">UCR vs DOT Number</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          Your USDOT number identifies your company to FMCSA. UCR is a separate annual registration and fee required for interstate motor carriers, brokers, and freight forwarders. You need both if you operate across state lines.
        </p>
        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">How They Work Together</h2>
        <p className="text-slate-600 mb-8">
          When filing UCR, you provide your DOT number. Your UCR fleet size should match the power units you report to FMCSA. File UCR by December 31 each year to stay compliant.
        </p>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
