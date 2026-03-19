import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';
import { NON_PARTICIPATING_STATES } from '@/lib/states';

export const metadata = {
  title: 'Non-UCR States — What to Do If Your State Does Not Participate | EasyUCR',
  description: 'Florida, New Jersey, Oregon, Hawaii do not participate in UCR. You still need UCR if you cross state lines. File through a neighboring state.',
  alternates: { canonical: 'https://www.easyucr.com/learn/non-ucr-states' },
};

const FAQ = [
  { question: 'What are the non-participating UCR states?', answer: 'Florida, New Jersey, Oregon, and Hawaii do not participate in UCR. Carriers based there must file through a participating state.' },
  { question: 'Do I still need UCR if I am in a non-participating state?', answer: 'Yes. If you operate in interstate commerce, you must register for UCR regardless of your base state. File through a neighboring participating state.' },
  { question: 'How do I file UCR from a non-participating state?', answer: 'Use a participating state where you have operations or a registered agent. EasyUCR handles this—you just enter your DOT number and we file with the correct state.' },
];

export default function NonUCRStates() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">Non-UCR States</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">Non-UCR States</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Some states do not participate in UCR. If you are based in one of these states, you still need UCR if you operate in interstate commerce. You file through a neighboring participating state.
        </p>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Non-Participating States</h2>
        <p className="text-slate-600 mb-4">
          {NON_PARTICIPATING_STATES.map((s) => s.name).join(', ')}. Carriers in these states file through a participating state (e.g., Georgia for Florida-based carriers).
        </p>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
