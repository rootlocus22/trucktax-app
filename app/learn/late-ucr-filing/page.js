import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'Late UCR Filing — Penalties, Fines & How to Fix It | EasyUCR',
  description: 'Missed the UCR deadline? Learn the penalties for late UCR filing and how to file now to get back in compliance. EasyUCR files same day.',
};

const FAQ = [
  { question: 'What are the penalties for late UCR filing?', answer: 'States can assess fines from $100 to $5,000 per violation. Vehicles may be placed out of service until proof of UCR payment is provided.' },
  { question: 'Can I still file UCR after the deadline?', answer: 'Yes. File as soon as possible to get back in compliance. EasyUCR processes filings in under 10 minutes. You pay only after confirmation.' },
  { question: 'Will I get a confirmation number if I file late?', answer: 'Yes. Once your UCR is filed and paid, you receive a confirmation number. Keep proof of payment for roadside inspections.' },
];

export default function LateUCRFiling() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">Late UCR Filing</span>
        </nav>

        <CTABanner variant="urgent" />

        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">Late UCR Filing — Penalties & How to Fix It</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Missed the UCR deadline? You can still file. Learn the penalties for late UCR filing and how to get back in compliance. EasyUCR files same day—you pay only after your confirmation number is issued.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Penalties for Late UCR</h2>
        <p className="text-slate-600 mb-4">
          States enforce UCR at roadside. Fines range from $100 to $5,000 per violation depending on the state. Vehicles can be placed out of service until proof of UCR payment is provided.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">How to Fix It</h2>
        <p className="text-slate-600 mb-8">
          File your UCR immediately. EasyUCR processes filings in under 10 minutes. No upfront payment—you pay $79 only when your confirmation number is issued. Once you have proof, you are back in compliance.
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
