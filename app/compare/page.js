import Link from 'next/link';
import { ComparisonTable } from '@/components/ComparisonTable';
import { CTABanner } from '@/components/CTABanner';

export const metadata = {
  title: 'UCR Filing Service Comparison — EasyUCR vs Competitors | EasyUCR',
  description: 'Compare UCR filing services: EasyUCR vs JJ Keller, Foley, CNS. See why EasyUCR offers the best value — $79 all-inclusive, government fee included.',
};

const comparePages = [
  { slug: 'easyucr-vs-jj-keller', title: 'EasyUCR vs JJ Keller' },
  { slug: 'easyucr-vs-foley', title: 'EasyUCR vs Foley' },
  { slug: 'cheapest-ucr-filing-service', title: 'Cheapest UCR Filing Service' },
  { slug: 'ucr-filing-no-upfront-fee', title: 'UCR Filing with All-Inclusive Pricing' },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/" className="hover:text-[var(--color-orange)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">Compare</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">UCR Service Comparison</h1>
        <p className="text-lg text-slate-600 mb-12">
          Compare EasyUCR to other UCR filing services. We offer the lowest all-inclusive price ($79 — government fee included) and transparent pricing.
        </p>
        <div className="mb-12">
          <ComparisonTable />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Detailed Comparisons</h2>
        <ul className="space-y-3 mb-12">
          {comparePages.map((p) => (
            <li key={p.slug}>
              <Link href={`/compare/${p.slug}`} className="text-[var(--color-orange)] hover:underline font-medium">
                {p.title} →
              </Link>
            </li>
          ))}
        </ul>
        <CTABanner />
      </div>
    </div>
  );
}
