import Link from 'next/link';
import { UCRFeeCalculator } from '@/components/UCRFeeCalculator';
import { CTABanner } from '@/components/CTABanner';
import { UCR_FEE_BRACKETS_2026, UCR_SERVICE_FEE_TIERS } from '@/lib/ucr-fees';

/** Map each government bracket to service fee tier (same fleet ranges up to 21–100; 101+ uses contact) */
function serviceFeeForBracket(bracket) {
  const mid = bracket.min === 1001 ? 1001 : Math.max(bracket.min, Math.min(bracket.max, bracket.min + 1));
  const tier = UCR_SERVICE_FEE_TIERS.find((t) => mid >= t.min && mid <= t.max);
  return tier?.fee ?? null;
}

export const metadata = {
  title: 'UCR Filing Cost 2026 — Full Fee Breakdown | EasyUCR',
  description:
    'See what UCR costs in 2026: official government fees by fleet size plus EasyUCR’s tiered service fee. No hidden charges—pay when your filing is confirmed.',
  alternates: { canonical: 'https://www.easyucr.com/pricing' },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/" className="hover:text-[var(--color-orange)]">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">Pricing</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Exactly what UCR filing costs in 2026</h1>
        <p className="text-lg text-slate-600 mb-12">
          The value is an accurate, defensible registration. The table below is transparency: official government brackets plus our tiered service fee so you can sanity-check the total. For the live breakdown, use the{' '}
          <Link href="/ucr/pricing" className="text-[var(--color-orange)] font-medium hover:underline">
            UCR pricing page
          </Link>{' '}
          or calculator.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mb-4">Full fee table (illustrative totals)</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-card mb-12">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[var(--color-page-alt)] border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-900">Fleet size</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Government fee</th>
                <th className="px-4 py-3 font-semibold text-slate-900">EasyUCR service fee</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Total (excl. 100+)</th>
              </tr>
            </thead>
            <tbody>
              {UCR_FEE_BRACKETS_2026.map((b, i) => {
                const svc = serviceFeeForBracket(b);
                const total = svc != null ? b.fee + svc : null;
                return (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{b.label}</td>
                    <td className="px-4 py-3">${b.fee.toLocaleString()}.00</td>
                    <td className="px-4 py-3">
                      {svc != null ? `$${svc.toLocaleString()}.00` : <span className="text-amber-700 font-medium">Contact us</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {total != null ? `$${total.toLocaleString()}.00` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mb-12">
          <UCRFeeCalculator />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-4">What you are not charged for</h2>
        <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-8">
          <li>No setup fees</li>
          <li>No annual membership</li>
          <li>No hidden processing fees</li>
          <li>No charge if filing fails</li>
        </ul>

        <div className="rounded-xl bg-green-50 border border-green-200 p-6 mb-12">
          <h3 className="font-semibold text-green-900 mb-2">Refund policy</h3>
          <p className="text-green-800">If filing fails, you pay nothing. Ever.</p>
        </div>

        <CTABanner />
      </div>
    </div>
  );
}
