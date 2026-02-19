import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UCR_OPERATOR_TYPES } from '@/lib/ucr-seo-data';
import { getUcrFee, UCR_REGISTRATION_YEAR, UCR_DEADLINE_DEC } from '@/lib/ucr-fees';
import { ShieldCheck, Calculator, CheckCircle, FileText } from 'lucide-react';

export function generateStaticParams() {
  return UCR_OPERATOR_TYPES.map((t) => ({ type: t.slug }));
}

export async function generateMetadata({ params }) {
  const op = UCR_OPERATOR_TYPES.find((t) => t.slug === params.type);
  if (!op) return { title: 'UCR | QuickTruckTax' };
  return {
    title: `UCR for ${op.title} – ${UCR_REGISTRATION_YEAR} Registration | QuickTruckTax`,
    description: `${op.description}. ${UCR_REGISTRATION_YEAR} UCR fee, deadline (Dec 31), and how to file. Start your UCR filing.`,
    alternates: { canonical: `https://www.quicktrucktax.com/ucr-for/${op.slug}` },
    openGraph: {
      title: `UCR for ${op.title} – ${UCR_REGISTRATION_YEAR} | QuickTruckTax`,
      description: `${op.description}. File UCR in minutes.`,
      url: `https://www.quicktrucktax.com/ucr-for/${op.slug}`,
    },
  };
}

export default function UcrForTypePage({ params }) {
  const op = UCR_OPERATOR_TYPES.find((t) => t.slug === params.type);
  if (!op) notFound();

  const isFlatFee = ['brokers', 'freight-forwarders', 'leased-operators'].includes(op.slug);
  const { fee } = getUcrFee(0, op.slug === 'brokers' ? 'broker' : op.slug === 'freight-forwarders' ? 'freight_forwarder' : op.slug === 'leased-operators' ? 'leasing' : 'carrier');

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Do ${op.title} need UCR?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. ${op.title} operating in interstate commerce must register for UCR. The fee for brokers, freight forwarders, and leasing companies is a flat $46 for ${UCR_REGISTRATION_YEAR}. Carriers pay based on power units.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the UCR fee for ${op.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: isFlatFee ? `The ${UCR_REGISTRATION_YEAR} UCR fee for ${op.title} is $46 (flat rate). With our filing service ($79), your total is $125.` : `UCR fees for ${op.title} depend on the number of power units. Use our calculator to get your exact fee.`,
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
          <Link href="/ucr/file" className="hover:text-[var(--color-navy)]">UCR Filing</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700 font-medium">UCR for {op.title}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-navy)] mb-4">
          UCR for {op.title} – {UCR_REGISTRATION_YEAR}
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          {op.description}. {UCR_REGISTRATION_YEAR} fee, deadline, and how to file. Low competition, high intent.
        </p>

        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Do {op.title} Need UCR?
          </h2>
          <p className="text-slate-600 mb-4">
            Yes. Any {op.title.toLowerCase()} that participates in interstate commerce must register for the Unified Carrier Registration (UCR) program. The {UCR_REGISTRATION_YEAR} registration period opens October 1 and runs through December 31. Operating without valid UCR can result in fines and out-of-service orders.
          </p>
          {isFlatFee && (
            <p className="text-slate-600">
              <strong>Good news:</strong> {op.title} pay a flat UCR fee of $46 for {UCR_REGISTRATION_YEAR}, regardless of fleet size. With our filing service ($79), your total is $125.
            </p>
          )}
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Deadline & Filing
          </h2>
          <p className="text-slate-600">
            The {UCR_REGISTRATION_YEAR} UCR deadline is <strong>December 31</strong>. File early to avoid last-minute issues. We guide you through the process and store your confirmation for compliance records.
          </p>
        </section>

        <section className="bg-[var(--color-midnight)] text-white rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[var(--color-orange)]" />
            Get Your UCR Fee
          </h2>
          <p className="text-white/80 mb-6">
            Use our {UCR_REGISTRATION_YEAR} fee calculator. {isFlatFee ? `Flat $46 + $79 filing = $125 total.` : 'Enter your power units to see your fee.'}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/tools/ucr-calculator" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition">
              <Calculator className="w-5 h-5" /> Fee Calculator
            </Link>
            <Link href="/ucr/file" className="inline-flex items-center gap-2 bg-[var(--color-orange)] hover:bg-[#e66a15] text-white font-bold px-6 py-3 rounded-xl transition">
              Start UCR Filing – $79 <CheckCircle className="w-5 h-5" />
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-4">
          <Link href="/ucr/file" className="text-[var(--color-navy)] font-semibold hover:underline">Start UCR Filing</Link>
          <Link href="/tools/ucr-calculator" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Fee Calculator</Link>
          <Link href="/ucr/pricing" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Pricing</Link>
          <Link href="/services/ucr-registration" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Registration Guide</Link>
        </div>
      </div>
    </>
  );
}
