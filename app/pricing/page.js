import Link from 'next/link';
import { UCRFeeCalculator } from '@/components/UCRFeeCalculator';
import { CTABanner } from '@/components/CTABanner';
import { UCR_BRACKETS, SERVICE_FEE } from '@/lib/ucr-fees-spec';

export const metadata = {
  title: 'UCR Filing Cost 2026 — Full Fee Breakdown | EasyUCR',
  description: 'See exactly what UCR costs in 2026. Government fee by fleet size + our flat $79 service fee. No hidden charges. Pay only after successful filing.',
  alternates: { canonical: 'https://www.easyucr.com/pricing' },
};

export default function PricingPage() {
    return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/" className="hover:text-[var(--color-orange)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">Pricing</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Exactly What UCR Filing Costs in 2026</h1>
        <p className="text-lg text-slate-600 mb-12">
          UCR has two parts: the government fee (set by fleet size) and our service fee. We charge a flat $79 service fee. No hidden charges. You pay only after your filing is confirmed.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mb-4">Full Fee Table</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-card mb-12">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[var(--color-page-alt)] border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-900">Fleet Size</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Government Fee</th>
                <th className="px-4 py-3 font-semibold text-slate-900">EasyUCR Service Fee</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {UCR_BRACKETS.map((b, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{b.label}</td>
                  <td className="px-4 py-3">${b.fee.toLocaleString()}.00</td>
                  <td className="px-4 py-3">$79.00</td>
                  <td className="px-4 py-3 font-semibold">${(b.fee + SERVICE_FEE).toLocaleString()}.00</td>
                </tr>
              ))}
            </tbody>
          </table>
                        </div>

        <div className="mb-12">
          <UCRFeeCalculator />
                </div>

        <h2 className="text-xl font-bold text-slate-900 mb-4">What You Are NOT Charged For</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li>No setup fees</li>
          <li>No annual membership</li>
          <li>No hidden processing fees</li>
          <li>No charge if filing fails</li>
        </ul>

        <div className="rounded-xl bg-green-50 border border-green-200 p-6 mb-12">
          <h3 className="font-semibold text-green-900 mb-2">Refund Policy</h3>
          <p className="text-green-800">If filing fails, you pay nothing. Ever.</p>
            </div>

        <CTABanner />
                </div>
        </div>
    );
}
