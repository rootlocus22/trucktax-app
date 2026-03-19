import Link from 'next/link';
import { UCR_SERVICE_FEE_TIERS, UCR_SERVICE_PLANS } from '@/lib/ucr-fees';
import { CheckCircle, ArrowRight } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

const UCR_PRICING_FAQ = [
    { question: "What is the UCR renewal cost?", answer: "UCR cost is based on fleet size. Official 2026 fees: 0–2 vehicles $46, 3–5 $138, 6–20 $276, 21–100 $963, 101–1,000 $4,592, 1,001+ $44,836. Our service fee starts at $79 (0–2 vehicles) and scales: 3–5 $129, 6–20 $199, 21–100 $349. Fleets of 100+ contact us for a quote." },
    { question: "What is the UCR fee schedule for 2026?", answer: "The 2026 UCR fee schedule by fleet size: Tier 1 (0–2 vehicles) $46, Tier 2 (3–5) $138, Tier 3 (6–20) $276, Tier 4 (21–100) $963, Tier 5 (101–1,000) $4,592, Tier 6 (1,001+) $44,836." },
    { question: "How much does UCR filing cost with easyucr.com?", answer: "Our service fee starts at $79 (0–2 vehicles) and scales by fleet size: 3–5 $129, 6–20 $199, 21–100 $349. You also pay the official government UCR fee. Total = service fee + government fee. $0 upfront — pay when your certificate is ready." },
];

export const metadata = {
  title: 'UCR Fee Schedule 2026 & Pricing – Tiered Service Fees',
  description: '2026 UCR fee schedule by fleet size. Service fees start at $79 (0–2 vehicles): 3–5 $129, 6–20 $199, 21–100 $349. Plus official government UCR fee.',
  alternates: { canonical: 'https://www.easyucr.com/ucr/pricing' },
};

export default function UcrPricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <SchemaMarkup type="FAQPage" data={UCR_PRICING_FAQ} />
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">UCR Pricing</h1>
        <p className="text-[var(--color-muted)]">Simple. No hidden fees. Official UCR fee + our service.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg mb-8">
        <table className="w-full">
          <thead className="bg-[var(--color-navy)] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">Number of Vehicles Owned or Operated</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Service Fee (Carrier or Forwarder)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {UCR_SERVICE_FEE_TIERS.filter(t => t.fee != null).map((tier) => (
              <tr key={tier.label} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-700 font-medium">{tier.label} power units</td>
                <td className="px-6 py-4 text-right font-bold text-[var(--color-navy)]">${tier.fee.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-amber-50">
              <td className="px-6 py-4 text-slate-700 font-medium">100+ power units</td>
              <td className="px-6 py-4 text-right font-semibold text-amber-700">
                <a href="mailto:support@vendaxsystemlabs.com" className="hover:underline">Contact Us</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 mb-8">
        <p className="text-slate-600 mb-4">
          Plus the official UCR government fee (set by FMCSA). <strong>Total = Service fee + Government fee.</strong> $0 upfront — pay when your certificate is ready.
        </p>
        <ul className="space-y-2 text-slate-600">
          {(UCR_SERVICE_PLANS.filing.features || []).map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-center">
        <Link
          href="/ucr/file"
          className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition"
        >
          Start UCR Filing <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <p className="text-center text-sm text-slate-500 mt-8">Official UCR fees vary by fleet size ($46–$56,977). Use our <Link href="/tools/ucr-calculator" className="text-[var(--color-orange)] font-medium">UCR Fee Calculator</Link> to see your total.</p>
    </div>
  );
}
