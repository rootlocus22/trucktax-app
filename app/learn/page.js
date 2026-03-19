import Link from 'next/link';

export const metadata = {
  title: 'UCR Guides & Education | easyucr.com',
  description: 'Learn about UCR registration, fees, deadlines, and who needs to file. Complete guides for motor carriers, brokers, and owner-operators.',
  alternates: { canonical: 'https://www.easyucr.com/learn' },
};

const LEARN_PAGES = [
  { slug: 'what-is-ucr', title: 'What is UCR Registration?', excerpt: 'Complete guide to Unified Carrier Registration.' },
  { slug: 'ucr-fees-2026', title: 'UCR Fees 2026', excerpt: 'Official fee schedule by fleet size.' },
  { slug: 'ucr-deadline-2026', title: 'UCR Deadline 2026', excerpt: 'Filing dates, enforcement & late penalties.' },
  { slug: 'ucr-vs-dot-number', title: 'UCR vs DOT Number', excerpt: 'Understanding the difference.' },
  { slug: 'ucr-for-owner-operators', title: 'UCR for Owner Operators', excerpt: 'Do you need it? How to file.' },
  { slug: 'ucr-for-brokers', title: 'UCR for Brokers', excerpt: 'Broker UCR requirements.' },
  { slug: 'ucr-for-freight-forwarders', title: 'UCR for Freight Forwarders', excerpt: 'Freight forwarder UCR rules.' },
  { slug: 'do-i-need-ucr', title: 'Do I Need UCR?', excerpt: 'Quick checklist to determine if you must file.' },
  { slug: 'late-ucr-filing', title: 'Late UCR Filing', excerpt: 'Penalties, fines & how to fix it.' },
  { slug: 'non-ucr-states', title: 'Non-UCR States', excerpt: 'What to do if your state does not participate.' },
];

export default function LearnHub() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">UCR Education Hub</h1>
        <p className="text-lg text-slate-600 mb-12">
          Everything you need to know about Unified Carrier Registration. Who needs it, what it costs, and how to file.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {LEARN_PAGES.map((page) => (
            <Link
              key={page.slug}
              href={`/learn/${page.slug}`}
              className="block p-6 rounded-xl border border-slate-100 bg-white shadow-card hover:border-[var(--color-orange)] hover:shadow-card-hover transition"
            >
              <h2 className="font-semibold text-slate-900">{page.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{page.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
