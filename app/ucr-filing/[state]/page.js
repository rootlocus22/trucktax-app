import Link from 'next/link';
import { notFound } from 'next/navigation';
import { slugToState, UCR_STATE_SLUGS } from '@/lib/ucr-seo-data';
import { getUcrFee, UCR_FEE_BRACKETS_2026, UCR_REGISTRATION_YEAR, UCR_DEADLINE_DEC } from '@/lib/ucr-fees';
import { ShieldCheck, Calculator, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export async function generateStaticParams() {
  return UCR_STATE_SLUGS.map((state) => ({ state }));
}

export async function generateMetadata({ params }) {
  const stateInfo = slugToState(params.state);
  if (!stateInfo) return { title: 'UCR Filing | QuickTruckTax' };
  const name = stateInfo.name;
  return {
    title: `UCR Filing ${name} – ${UCR_REGISTRATION_YEAR} Registration & Fee | QuickTruckTax`,
    description: `File UCR in ${name}. Who needs UCR in ${name}, ${UCR_REGISTRATION_YEAR} fees, deadline (Dec 31), penalties. Start your UCR filing for ${name} in minutes.`,
    alternates: { canonical: `https://www.quicktrucktax.com/ucr-filing/${params.state}` },
    openGraph: {
      title: `UCR Filing ${name} – ${UCR_REGISTRATION_YEAR} | QuickTruckTax`,
      description: `File your UCR registration for ${name}. Fee calculator, deadline, and guided filing.`,
      url: `https://www.quicktrucktax.com/ucr-filing/${params.state}`,
    },
  };
}

export default function UcrFilingStatePage({ params }) {
  const stateInfo = slugToState(params.state);
  if (!stateInfo) notFound();

  const stateName = stateInfo.name;
  const stateCode = stateInfo.code;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Who needs UCR in ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Any interstate motor carrier, broker, freight forwarder, or leasing company operating in or through ${stateName} must register for UCR. Intrastate-only carriers in ${stateName} may be exempt depending on state rules.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the UCR deadline for ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The UCR registration deadline for ${UCR_REGISTRATION_YEAR} is December 31. Registration opens October 1. File before the deadline to avoid penalties.`,
        },
      },
      {
        '@type': 'Question',
        name: `What are UCR penalties in ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Operating without valid UCR can result in fines, roadside citations, and out-of-service orders. State enforcement varies; ${stateName} participates in UCR and enforces compliance.`,
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
          <span className="text-slate-700 font-medium">{stateName}</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-navy)] mb-4">
          UCR Filing {stateName} – {UCR_REGISTRATION_YEAR} Registration
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          File your Unified Carrier Registration (UCR) for operations in or through {stateName}. See who must register, {UCR_REGISTRATION_YEAR} fee brackets, deadline, and penalties. Start your UCR filing in minutes.
        </p>

        {/* Who needs UCR in this state */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Who Needs UCR in {stateName}?
          </h2>
          <p className="text-slate-600 mb-4">
            Interstate motor carriers, brokers, freight forwarders, and leasing companies that operate in or through {stateName} must register for UCR. This includes owner-operators, fleets, and entities based in {stateName} that cross state lines. Intrastate-only carriers in {stateName} may be exempt; check with {stateInfo.agency || 'your state agency'} for state-specific rules.
          </p>
          <ul className="list-disc list-inside text-slate-600 space-y-1">
            <li>Motor carriers (for-hire and private)</li>
            <li>Freight brokers</li>
            <li>Freight forwarders</li>
            <li>Leasing companies</li>
            <li>Owner-operators with interstate authority</li>
          </ul>
        </section>

        {/* Fee table */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{UCR_REGISTRATION_YEAR} UCR Fee Schedule (Carriers)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 font-semibold text-slate-700">Power units</th>
                  <th className="text-right py-3 font-semibold text-slate-700">UCR fee ({UCR_REGISTRATION_YEAR})</th>
                </tr>
              </thead>
              <tbody>
                {UCR_FEE_BRACKETS_2026.map((row) => (
                  <tr key={row.min} className="border-b border-slate-100">
                    <td className="py-2.5 text-slate-700">{row.label}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-800">${row.fee.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">Brokers, freight forwarders, and leasing companies pay a flat $46.</p>
        </section>

        {/* Deadline & penalties */}
        <section className="grid sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Filing Deadline
            </h2>
            <p className="text-amber-800">
              {UCR_REGISTRATION_YEAR} UCR registration opens October 1 and must be completed by <strong>December 31</strong>. File early to avoid last-minute issues and penalties.
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Penalties
            </h2>
            <p className="text-red-800">
              Operating without valid UCR can result in fines, roadside citations, and out-of-service orders. {stateName} participates in UCR enforcement; stay compliant by filing before the deadline.
            </p>
          </div>
        </section>

        {/* Calculator CTA */}
        <section className="bg-[var(--color-midnight)] text-white rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[var(--color-orange)]" />
            Calculate Your UCR Fee for {stateName}
          </h2>
          <p className="text-white/80 mb-6">
            Use our official {UCR_REGISTRATION_YEAR} fee calculator. Get your total including our filing service ($79) in seconds.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tools/ucr-calculator"
              className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              <Calculator className="w-5 h-5" /> Fee Calculator
            </Link>
            <Link
              href="/ucr/file"
              className="inline-flex items-center gap-2 bg-[var(--color-orange)] hover:bg-[#e66a15] text-white font-bold px-6 py-3 rounded-xl transition"
            >
              Start UCR Filing – $79 <CheckCircle className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Frequently Asked Questions – UCR in {stateName}</h2>
          <dl className="space-y-4">
            <div>
              <dt className="font-semibold text-slate-800">Who needs UCR in {stateName}?</dt>
              <dd className="text-slate-600 mt-1">Interstate carriers, brokers, freight forwarders, and leasing companies operating in or through {stateName} must register for UCR.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">What is the UCR deadline for {stateName}?</dt>
              <dd className="text-slate-600 mt-1">The {UCR_REGISTRATION_YEAR} UCR deadline is December 31. Registration opens October 1.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">What are UCR penalties in {stateName}?</dt>
              <dd className="text-slate-600 mt-1">Operating without UCR can lead to fines, citations, and out-of-service orders. {stateName} enforces UCR compliance.</dd>
            </div>
          </dl>
        </section>

        {/* Internal links */}
        <div className="mt-10 pt-8 border-t border-slate-200">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">More UCR resources</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/insights/complete-guide-ucr-filing-2026" className="text-[var(--color-navy)] font-semibold hover:underline">Complete 2026 UCR Guide</Link>
            <Link href="/insights/who-needs-ucr-registration" className="text-[var(--color-navy)] font-semibold hover:underline">Who Needs a UCR?</Link>
            <Link href="/insights/ucr-deadlines-penalties-explained" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Penalties Explained</Link>
            <Link href="/insights/form-2290-vs-ucr-difference" className="text-[var(--color-navy)] font-semibold hover:underline">UCR vs Form 2290</Link>
            <Link href="/ucr/file" className="text-[var(--color-navy)] font-semibold hover:underline">Start UCR Filing</Link>
            <Link href="/tools/ucr-calculator" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Fee Calculator</Link>
            <Link href="/ucr/pricing" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Pricing</Link>
          </div>
        </div>
      </div>
    </>
  );
}
