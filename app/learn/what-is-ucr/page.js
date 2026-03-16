import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';
import { UCRFeeCalculator } from '@/components/UCRFeeCalculator';

export const metadata = {
  title: 'What is UCR Registration? Complete 2026 Guide | EasyUCR',
  description: 'UCR (Unified Carrier Registration) explained: who needs it, what it costs, and how to file. Complete guide for motor carriers, brokers, and freight forwarders.',
};

const FAQ = [
  { question: 'What is UCR Registration?', answer: 'UCR (Unified Carrier Registration) is a federally-mandated program requiring individuals and companies that operate commercial motor vehicles in interstate commerce to register and pay an annual fee based on fleet size.' },
  { question: 'Who must register for UCR?', answer: 'Motor carriers, freight brokers, freight forwarders, and leasing companies that operate in interstate commerce must register. Intrastate-only carriers are generally exempt.' },
  { question: 'Who is exempt from UCR?', answer: 'Carriers that operate exclusively within one state (intrastate) and never cross state lines are typically exempt. Government vehicles and certain agricultural operations may also be exempt.' },
  { question: 'How do UCR fees work?', answer: 'Fees are based on fleet size (power units). 0–2 vehicles: $46, 3–5: $138, 6–20: $276, 21–100: $963, 101–1,000: $4,592, 1,001+: $44,836. Brokers and freight forwarders pay $46.' },
  { question: 'What are the penalties for non-compliance?', answer: 'States can assess fines from $100 to $5,000 per violation. Vehicles may be placed out of service until proof of UCR payment is provided.' },
];

export default function WhatIsUCR() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">What is UCR</span>
        </nav>

        <CTABanner />

        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">What is UCR Registration?</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          UCR (Unified Carrier Registration) is a federally-mandated program established under the UCR Act of 2005. It requires individuals and companies that operate commercial motor vehicles in interstate commerce to register their business and pay an annual fee based on fleet size.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Who Must Register</h2>
        <p className="text-slate-600 mb-4">
          Motor carriers, freight brokers, freight forwarders, and leasing companies engaged in interstate commerce must register. If you cross state lines with a commercial vehicle or arrange interstate freight, you need UCR.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Who Is Exempt</h2>
        <p className="text-slate-600 mb-4">
          Carriers that operate exclusively within one state (intrastate) are generally exempt. Government vehicles and certain agricultural operations may also qualify for exemptions.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">How Fees Work</h2>
        <p className="text-slate-600 mb-4">
          Fees are tiered by fleet size. The smallest bracket (0–2 power units) pays $46. Brokers and freight forwarders who do not operate vehicles pay the minimum $46. Larger fleets pay progressively more.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Enforcement & Penalties</h2>
        <p className="text-slate-600 mb-4">
          Enforcement begins January 1 each year. States can assess fines from $100 to $5,000 per violation. Vehicles may be placed out of service until proof of UCR payment is provided at roadside.
        </p>

        <div className="my-12">
          <UCRFeeCalculator />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-12 mb-4">Frequently Asked Questions</h2>
        <FAQAccordion faqs={FAQ} />

        <div className="mt-12">
          <CTABanner variant="urgent" />
        </div>
      </article>
    </div>
  );
}
