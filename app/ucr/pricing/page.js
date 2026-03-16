import Link from 'next/link';
import { UCR_SERVICE_PLANS } from '@/lib/ucr-fees';
import DiscountedPrice from '@/components/DiscountedPrice';
import { CheckCircle, ArrowRight } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

const UCR_PRICING_FAQ = [
    { question: "What is the UCR renewal cost?", answer: "UCR cost is based on fleet size. Official 2026 fees: 0–2 vehicles $46, 3–5 $138, 6–20 $276, 21–100 $963, 101–1,000 $4,592, 1,001+ $44,836. Our filing service is $79 plus the official UCR fee." },
    { question: "What is the UCR fee schedule for 2026?", answer: "The 2026 UCR fee schedule by fleet size: Tier 1 (0–2 vehicles) $46, Tier 2 (3–5) $138, Tier 3 (6–20) $276, Tier 4 (21–100) $963, Tier 5 (101–1,000) $4,592, Tier 6 (1,001+) $44,836." },
    { question: "How much does UCR filing cost with easyucr.com?", answer: "Our UCR filing service is $79 (discounted from $99) plus the official UCR fee based on your fleet size. File with $0 upfront—you pay when your certificate is ready." },
];

export const metadata = {
  title: 'UCR Fee Schedule 2026 & Pricing – Official Brackets + $79 Filing',
  description: '2026 UCR fee schedule by fleet size (official brackets). Our UCR filing service $79. See your total cost and file with $0 upfront.',
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

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 shadow-sm">
          <div className="mb-6">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">UCR Filing Service</span>
            <p className="text-4xl font-bold text-[var(--color-text)] mt-2 flex items-center gap-3 flex-wrap">
              <DiscountedPrice price={79} originalPrice={99} className="text-4xl" />
            </p>
            <p className="text-sm text-slate-500 mt-1">+ official UCR fee (by fleet size)</p>
          </div>
          <ul className="space-y-3 mb-8">
            {(UCR_SERVICE_PLANS.filing.features || []).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-600">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/ucr/file"
            className="block w-full text-center py-4 rounded-xl font-bold border-2 border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:!text-white transition"
          >
            Get Started
          </Link>
        </div>

        <div className="bg-[var(--color-midnight)] text-white rounded-2xl border-2 border-[var(--color-orange)] p-8 shadow-xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-orange)] text-white text-xs font-bold px-3 py-1 rounded-full">Most popular</div>
          <div className="mb-6">
            <span className="text-sm font-bold text-white/70 uppercase tracking-wider">UCR Pro</span>
            <p className="text-4xl font-bold mt-2">$99</p>
            <p className="text-sm text-white/70 mt-1">+ official UCR fee (by fleet size)</p>
          </div>
          <ul className="space-y-3 mb-8">
            {(UCR_SERVICE_PLANS.pro.features || []).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-white/90">
                <CheckCircle className="w-5 h-5 text-[var(--color-orange)] flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/ucr/file"
            className="block w-full text-center py-4 rounded-xl font-bold bg-[var(--color-orange)] text-white hover:bg-[#e66a15] transition flex items-center justify-center gap-2"
          >
            Start UCR Filing <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 mt-8">Official UCR fees vary by fleet size ($46–$56,977). Use our <Link href="/tools/ucr-calculator" className="text-[var(--color-orange)] font-medium">UCR Fee Calculator</Link> to see your total.</p>
    </div>
  );
}
