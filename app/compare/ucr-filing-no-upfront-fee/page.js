import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export const metadata = {
  title: 'UCR Filing with No Upfront Fee — How EasyUCR Works | EasyUCR',
  description: 'Only EasyUCR charges you after your UCR is filed. No upfront payment, no risk. Pay $79 only when you have your confirmation number.',
};

const FAQ = [
  { question: 'How does pay-after-filing work?', answer: 'You enter your DOT number and fleet info. We file your UCR with the government. Only when your confirmation number is issued do we charge you the $79 service fee plus government fee.' },
  { question: 'What if my filing fails?', answer: 'If filing fails for any reason, you pay nothing. Ever. We only charge when your UCR is successfully filed and you have your confirmation number.' },
  { question: 'Do other UCR services offer this?', answer: 'No. EasyUCR is the only UCR filing service that charges you after filing. All others require upfront payment.' },
];

export default function UCRFilingNoUpfrontFee() {
  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/compare" className="hover:text-[var(--color-orange)]">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR Filing No Upfront Fee</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">UCR Filing with No Upfront Fee</h1>
        <p className="text-lg text-slate-600 mb-8">
          Only EasyUCR charges you after your UCR is filed. No upfront payment, no risk. Pay $79 only when you have your confirmation number.
        </p>
        <h2 className="text-xl font-bold text-slate-900 mb-4">How It Works</h2>
        <ol className="list-decimal pl-6 space-y-4 text-slate-600 mb-12">
          <li>Enter your DOT number and fleet info (2 minutes)</li>
          <li>We file your UCR with the government using AI automation</li>
          <li>Pay $79 service fee only after your confirmation number is issued</li>
        </ol>
        <FAQAccordion faqs={FAQ} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
