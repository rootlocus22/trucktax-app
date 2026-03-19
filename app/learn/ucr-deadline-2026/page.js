import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'UCR Deadline 2026 — Filing Dates, Enforcement & Late Penalties | EasyUCR',
  description: 'UCR 2026 filing deadline is December 31, 2025. Enforcement starts January 1, 2026. Learn what happens if you miss the deadline and how to fix it.',
  alternates: { canonical: 'https://www.easyucr.com/learn/ucr-deadline-2026' },
};

const FAQ = [
  { question: 'When is the UCR deadline for 2026?', answer: 'You must file and pay for 2026 UCR by December 31, 2025. Registration opens October 1, 2025.' },
  { question: 'When does UCR enforcement start?', answer: 'Enforcement begins January 1, 2026. States can issue fines and out-of-service orders for vehicles operating without valid UCR.' },
  { question: 'What happens if I miss the UCR deadline?', answer: 'File as soon as possible. You may face state fines ($100–$5,000 per violation) and vehicles can be placed out of service. EasyUCR files same day.' },
  { question: 'Can I file UCR after December 31?', answer: 'Yes. You can still file after the deadline to get back in compliance. Payment must be received and processed; enforcement will apply until you have proof.' },
];

export default function UCRDeadline2026() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR Deadline 2026</span>
        </nav>

        <CTABanner variant="urgent" />

        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">UCR Deadline 2026</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          The 2026 UCR filing deadline is December 31, 2025. Registration opens October 1, 2025. Enforcement begins January 1, 2026.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <h2 className="font-bold text-amber-900 mb-2">Key Dates</h2>
          <ul className="space-y-2 text-amber-800">
            <li><strong>October 1, 2025</strong> — 2026 UCR registration opens</li>
            <li><strong>December 31, 2025</strong> — Deadline to file and pay for 2026 UCR</li>
            <li><strong>January 1, 2026</strong> — Enforcement begins</li>
          </ul>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Late Filing Consequences</h2>
        <p className="text-slate-600 mb-4">
          If you miss the December 31 deadline, states can assess fines ranging from $100 to $5,000 per violation. Vehicles may be placed out of service until proof of UCR payment is provided at roadside.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">How to Cure Non-Compliance</h2>
        <p className="text-slate-600 mb-8">
          File your UCR as soon as possible. EasyUCR processes filings in under 10 minutes. You pay only after your confirmation number is issued. Once you have proof of payment, you are back in compliance.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Frequently Asked Questions</h2>
        <FAQAccordion faqs={FAQ} />

        <div className="mt-12">
          <CTABanner variant="urgent" />
        </div>
      </article>
    </div>
  );
}
