import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';
import { UCRFeeCalculator } from '@/components/UCRFeeCalculator';

export const metadata = {
  title: 'UCR for Owner Operators — Do You Need It? | EasyUCR',
  description: 'Owner operators: do you need UCR? If you cross state lines with a USDOT number, yes. See the $46 fee for 1–2 trucks and how to file in 10 minutes.',
  alternates: { canonical: 'https://www.easyucr.com/learn/ucr-for-owner-operators' },
};

const FAQ = [
  { question: 'Do owner operators need UCR?', answer: 'Yes. If you operate in interstate commerce (cross state lines) with a commercial vehicle, you must register for UCR regardless of fleet size.' },
  { question: 'How much does UCR cost for owner operators?', answer: 'Owner operators with 1–2 trucks pay the minimum $46 government fee plus our $79 service fee. Total: $125. You pay only after filing is confirmed.' },
  { question: 'Can I file UCR myself for free?', answer: 'You can file directly through a participating state, but the process can be complex. EasyUCR charges $79 to handle the filing and you pay only after confirmation.' },
];

export default function UCRForOwnerOperators() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR for Owner Operators</span>
        </nav>

        <CTABanner />

        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">UCR for Owner Operators</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          If you cross state lines with a commercial vehicle and have a USDOT number, you need UCR. Owner operators with 1–2 trucks pay the minimum $46 government fee. File in under 10 minutes with EasyUCR.
        </p>

        <div className="mb-12">
          <UCRFeeCalculator />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Do You Need UCR?</h2>
        <p className="text-slate-600 mb-4">
          If you haul freight across state lines (interstate commerce), you need UCR. This applies whether you own one truck or a small fleet. Leased operators may be covered under the carrier&apos;s UCR—check your lease.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Frequently Asked Questions</h2>
        <FAQAccordion faqs={FAQ} />

        <div className="mt-12">
          <CTABanner />
        </div>
      </article>
    </div>
  );
}
