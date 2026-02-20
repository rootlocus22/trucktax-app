import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getUcrFee, UCR_FEE_BRACKETS_2026, UCR_REGISTRATION_YEAR, UCR_SERVICE_PLANS } from '@/lib/ucr-fees';
import { UCR_FLEET_SIZES } from '@/lib/ucr-seo-data';
import { Calculator, Truck, CheckCircle } from 'lucide-react';

function parseTrucksParam(trucks) {
  const match = (trucks || '').match(/^(\d+)-truck(s)?$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return n >= 1 && n <= 100 ? n : null;
}

export function generateStaticParams() {
  return UCR_FLEET_SIZES.map((n) => ({
    trucks: n === 1 ? '1-truck' : `${n}-trucks`,
  }));
}

export async function generateMetadata({ params }) {
  const n = parseTrucksParam(params.trucks);
  if (!n) return { title: 'UCR Fee | QuickTruckTax' };
  const { fee } = getUcrFee(n, 'carrier');
  return {
    title: `UCR Fee for ${n} Truck${n === 1 ? '' : 's'} – ${UCR_REGISTRATION_YEAR} Registration | QuickTruckTax`,
    description: `UCR fee for ${n} power unit${n === 1 ? '' : 's'}: $${fee.toLocaleString()} (${UCR_REGISTRATION_YEAR}). See bracket, total with filing service. Start your UCR filing.`,
    alternates: { canonical: `https://www.quicktrucktax.com/ucr-fee/for/${n === 1 ? '1-truck' : n + '-trucks'}` },
  };
}

export default function UcrFeeForTrucksPage({ params }) {
  const n = parseTrucksParam(params.trucks);
  if (!n) notFound();

  const { fee, bracket } = getUcrFee(n, 'carrier');
  const servicePrice = UCR_SERVICE_PLANS.filing.price;
  const total = fee + servicePrice;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How much is UCR for ${n} truck${n === 1 ? '' : 's'}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The ${UCR_REGISTRATION_YEAR} UCR registration fee for ${n} power unit${n === 1 ? '' : 's'} is $${fee.toLocaleString()} (bracket: ${bracket.label}). With our filing service ($79), your total is $${total.toLocaleString()}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Do I need UCR for ${n} truck${n === 1 ? '' : 's'}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `If you operate ${n} commercial motor vehicle${n === 1 ? '' : 's'} in interstate commerce, you must register for UCR. The fee is based on the number of power units you have.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <nav className="text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-[var(--color-navy)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tools/ucr-calculator" className="hover:text-[var(--color-navy)]">UCR Calculator</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700 font-medium">UCR fee for {n} truck{n === 1 ? '' : 's'}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-navy)] mb-4">
          UCR Fee for {n} Truck{n === 1 ? '' : 's'} – {UCR_REGISTRATION_YEAR}
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          See the official UCR registration fee for {n} power unit{n === 1 ? '' : 's'}, plus our filing service total. High-intent, straight to the number.
        </p>

        <section className="bg-white border border-slate-200 rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Your UCR fee</h2>
              <p className="text-slate-500 text-sm">Bracket: {bracket.label}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">UCR registration ({UCR_REGISTRATION_YEAR})</p>
              <p className="text-2xl font-bold text-slate-800">${fee.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Filing service</p>
              <p className="text-2xl font-bold text-slate-800">${servicePrice}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-[var(--color-orange)]">${total.toLocaleString()}</p>
            </div>
          </div>
          <Link
            href="/ucr/file"
            className="mt-6 inline-flex items-center gap-2 bg-[var(--color-navy)] hover:bg-[var(--color-navy-soft)] !text-white font-bold px-6 py-3 rounded-xl transition"
          >
            Start UCR Filing – $79 <CheckCircle className="w-5 h-5" />
          </Link>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">{UCR_REGISTRATION_YEAR} UCR fee brackets (carriers)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-semibold text-slate-700">Power units</th>
                  <th className="text-right py-2 font-semibold text-slate-700">Fee</th>
                </tr>
              </thead>
              <tbody>
                {UCR_FEE_BRACKETS_2026.map((row) => (
                  <tr key={row.min} className={`border-b border-slate-100 ${row.min <= n && n <= row.max ? 'bg-teal-50 font-semibold' : ''}`}>
                    <td className="py-2 text-slate-700">{row.label}</td>
                    <td className="py-2 text-right text-slate-800">${row.fee.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-slate-200">
          <p className="w-full text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">More UCR resources</p>
          <Link href="/insights/complete-guide-ucr-filing-2026" className="text-[var(--color-navy)] font-semibold hover:underline">Complete 2026 UCR Guide</Link>
          <Link href="/insights/who-needs-ucr-registration" className="text-[var(--color-navy)] font-semibold hover:underline">Who Needs a UCR?</Link>
          <Link href="/insights/ucr-deadlines-penalties-explained" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Penalties Explained</Link>
          <Link href="/tools/ucr-calculator" className="text-[var(--color-navy)] font-semibold hover:underline flex items-center gap-1">
            <Calculator className="w-4 h-4" /> UCR Fee Calculator
          </Link>
          <Link href="/ucr/file" className="text-[var(--color-navy)] font-semibold hover:underline">Start UCR Filing</Link>
          <Link href="/ucr/pricing" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Pricing</Link>
        </div>
      </div>
    </>
  );
}
