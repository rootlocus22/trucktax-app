import Link from 'next/link';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';
import { UCRFeeCalculator } from '@/components/UCRFeeCalculator';
import { UCR_BRACKETS } from '@/lib/ucr-fees-spec';

export const metadata = {
  title: 'UCR Fees 2026 — Complete Fee Schedule by Fleet Size | EasyUCR',
  description: 'Official UCR fee schedule for 2026. See exact fees by fleet size from $46 to $44,836. Includes interactive fee calculator.',
  alternates: { canonical: 'https://www.easyucr.com/learn/ucr-fees-2026' },
};

const FAQ = [
  { question: 'What are the UCR fees for 2026?', answer: 'Official 2026 fees: 0–2 vehicles $46, 3–5 $138, 6–20 $276, 21–100 $963, 101–1,000 $4,592, 1,001+ $44,836. Brokers and freight forwarders pay $46.' },
  { question: 'Do UCR fees change every year?', answer: 'UCR fees are set by the UCR Board and have remained unchanged for 2025 and 2026. They may be adjusted in future years.' },
  { question: 'What is the EasyUCR service fee?', answer: 'EasyUCR charges a tiered service fee by fleet size (from $79 for 0–2 power units) plus the official government UCR fee. You see the full breakdown before you pay—see /ucr/pricing for the schedule.' },
];

export default function UCRFees2026() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/learn" className="hover:text-[var(--color-orange)]">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">UCR Fees 2026</span>
        </nav>

        <CTABanner />

        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">UCR Fees 2026 — Complete Fee Schedule</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">
          Official UCR fee schedule for 2026 (unchanged from 2025). Fees are based on the number of power units you operate in interstate commerce.
        </p>

        <div className="overflow-x-auto rounded-xl border border-slate-200 mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left font-semibold">Fleet Size</th>
                <th className="px-4 py-3 text-right font-semibold">Government Fee</th>
              </tr>
            </thead>
            <tbody>
              {UCR_BRACKETS.map((b, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-3">{b.label}</td>
                  <td className="px-4 py-3 text-right font-medium">${b.fee.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-12">
          <UCRFeeCalculator />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Broker & Freight Forwarder Rules</h2>
        <p className="text-slate-600 mb-8">
          Brokers, freight forwarders, and leasing companies that do not operate vehicles pay the minimum tier: $46. Your fleet size is zero for UCR purposes.
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
