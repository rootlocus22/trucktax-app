import Link from 'next/link';
import { notFound } from 'next/navigation';
import { slugToState, UCR_STATE_SLUGS } from '@/lib/ucr-seo-data';
import { getUcrFee, UCR_FEE_BRACKETS_2026, UCR_REGISTRATION_YEAR, UCR_DEADLINE_DEC } from '@/lib/ucr-fees';
import { ShieldCheck, Calculator, FileText, AlertTriangle, CheckCircle, MapPin, Truck, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

export async function generateStaticParams() {
  return UCR_STATE_SLUGS.map((state) => ({ state }));
}

export async function generateMetadata({ params }) {
  const stateInfo = slugToState(params.state);
  if (!stateInfo) return { title: 'UCR Filing | QuickTruckTax' };

  const name = stateInfo.name;
  return {
    title: `UCR Filing ${name} – ${UCR_REGISTRATION_YEAR} Registration & Fee | QuickTruckTax`,
    description: `File your Unified Carrier Registration (UCR) in ${name}. Instantly calculate ${UCR_REGISTRATION_YEAR} fees, review deadlines, and start your federal-compliant filing securely.`,
    alternates: { canonical: `https://www.quicktrucktax.com/ucr-filing/${params.state}` },
    openGraph: {
      title: `Complete ${name} UCR Filing Guide – ${UCR_REGISTRATION_YEAR} Edition`,
      description: `Understand the rules for operating interstate in ${name}. Calculate your exact UCR tier fee and process your federal registration securely.`,
      url: `https://www.quicktrucktax.com/ucr-filing/${params.state}`,
    },
  };
}

export default function UcrFilingStatePage({ params }) {
  const stateInfo = slugToState(params.state);
  if (!stateInfo) notFound();

  const stateName = stateInfo.name;
  const participates = ["Alaska", "Arizona", "DC", "Florida", "Hawaii", "Maryland", "Nevada", "New Jersey", "Oregon", "Vermont", "Wyoming"].includes(stateName) ? false : true;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Who needs a UCR in ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Any interstate motor carrier, broker, freight forwarder, or leasing company operating commercial vehicles in or through ${stateName} must register for UCR. Intrastate-only carriers in ${stateName} may be exempt depending on specific ${stateName} DOT state rules, but crossing the state line triggers the federal requirement.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the UCR deadline for ${stateName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The UCR registration deadline for ${UCR_REGISTRATION_YEAR} is December 31. Registration opens October 1 of the preceding year. You must file before the Jan 1st deadline to legally operate and avoid fines at weigh stations.`,
        },
      },
      {
        '@type': 'Question',
        name: `Does ${stateName} enforce UCR penalties?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, operating without a valid UCR can result in heavy roadside fines, citations, and out-of-service orders. Law enforcement and DOT weigh stations monitor UCR status electronically across state borders.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I file my UCR instantly online?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, you can calculate your exact fee tier and submit your ${UCR_REGISTRATION_YEAR} registration securely online using a third-party compliance platform like QuickTruckTax in under 5 minutes.`,
        }
      }
    ],
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* HERO SECTION - HIGH CONTRAST */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-midnight)] pt-20 pb-24 text-white">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
          <div className="mb-6">
            <Link href="/ucr/file" className="text-sm font-medium text-blue-300 hover:text-white transition flex items-center">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to UCR Portal
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-orange)] border border-white/10 mb-6">
                <MapPin className="w-4 h-4" />
                {stateName} Filing Guide
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight drop-shadow-lg">
                File Your <span className="text-[var(--color-orange)]">UCR</span> for <br /> {stateName} Operations
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-xl leading-relaxed">
                Avoid weigh station delays and severe DOT penalties. Secure your {UCR_REGISTRATION_YEAR} Federal Unified Carrier Registration instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/ucr/file" className="inline-flex items-center justify-center bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#ff7a20] transition shadow-lg hover:shadow-orange-500/25 text-lg group">
                  File {stateName} UCR Instantly
                  <CheckCircle className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Visual Callout Card */}
            <div className="hidden lg:block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-[var(--color-orange)] rounded-2xl blur opacity-30 animate-pulse"></div>
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
                  <div>
                    <h3 className="text-white font-bold text-xl m-0">{UCR_REGISTRATION_YEAR} UCR Status</h3>
                    <p className="text-blue-300 text-sm m-0 mt-1">Accepting Registrations</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                {!participates ? (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                    <p className="text-blue-200 text-sm m-0">
                      <strong className="text-white block mb-1">Notice for {stateName} Carriers:</strong>
                      {stateName} is a non-participating state. If you are based in {stateName} but cross state lines into participating states, you must still pay the federal UCR fee by selecting a neighboring participating base state.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4 text-blue-100">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span>State is an Active UCR Participant</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <span>Enforces Roadside UCR Mandates</span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Curvy divider bottom */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none rotate-180 transform translate-y-[1px]">
          <svg className="block w-full h-12 lg:h-16" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">

        {/* INTENT-FOCUSED CONTENT */}
        <div className="prose prose-lg prose-slate max-w-none mb-12">
          <h2>Who Needs to File in {stateName}?</h2>
          <p className="lead">
            If your business operates commercial vehicles, or arranges the transport of freight, you are legally obligated to file an annual Unified Carrier Registration if you engage in <strong>interstate commerce</strong>.
          </p>
          <p>
            In {stateName}, the mandate strictly applies to:
          </p>
          <div className="not-prose grid sm:grid-cols-2 gap-4 my-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
              <Truck className="w-6 h-6 text-[var(--color-navy)] shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900 m-0">Motor Carriers</h4>
                <p className="text-sm text-slate-600 m-0 mt-1">Both For-Hire and Private carriers hauling goods across the {stateName} border.</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
              <FileText className="w-6 h-6 text-[var(--color-navy)] shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900 m-0">Freight Brokers</h4>
                <p className="text-sm text-slate-600 m-0 mt-1">Brokers arranging interstate loads, even if they do not own trucks.</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-[var(--color-navy)] shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900 m-0">Freight Forwarders</h4>
                <p className="text-sm text-slate-600 m-0 mt-1">Entities organizing shipments involving interstate transport.</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
              <Calculator className="w-6 h-6 text-[var(--color-navy)] shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900 m-0">Leasing Companies</h4>
                <p className="text-sm text-slate-600 m-0 mt-1">Companies leasing trucks for interstate operations without drivers.</p>
              </div>
            </div>
          </div>

          <h2>How Much Does the {UCR_REGISTRATION_YEAR} UCR Cost in {stateName}?</h2>
          <p>
            The federal UCR fee is standardized across the country based on the size of your fleet. <strong>The fee is not prorated.</strong> Unlike state-specific fuel taxes, your UCR obligation is determined by the total number of commercial vehicles you operate in interstate commerce, regardless of where they are physically registered.
          </p>
        </div>

        {/* FEE TABLE - HIGH ENGAGEMENT */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-12">
          <div className="bg-slate-50 border-b border-slate-200 p-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[var(--color-navy)] m-0">Calculated Federal UCR Brackets</h3>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Official 2026 Rates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th scope="col" className="px-6 py-4 font-bold border-b border-slate-200">Tier / Fleet Size</th>
                  <th scope="col" className="px-6 py-4 font-bold border-b border-slate-200 text-right">Governing Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {UCR_FEE_BRACKETS_2026.map((row) => (
                  <tr key={row.min} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-800">{row.label}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-right text-base">${row.fee.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-blue-50 p-4 border-t border-blue-100 text-sm text-blue-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="m-0">
              <strong>Important:</strong> Brokers, Freight Forwarders, and Leasing companies pay the Tier 1 flat fee of <strong>$37.00</strong> regardless of revenue, plus processing.
            </p>
          </div>
        </section>

        {/* HOW TO FILE SECTION */}
        <div className="prose prose-lg prose-slate max-w-none mb-12">
          <h2>The Quickest Way to File Your {stateName} UCR Online</h2>
          <p>
            Instead of navigating clunky, outdated state DOT systems, you can process your registration directly through our trusted third-party interface. We sync directly with the federal FMCSA database to verify your DOT number on the spot.
          </p>

          <div className="not-prose my-10 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[var(--color-navy)] text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                1
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-lg">Enter Your DOT Number</h4>
                </div>
                <p className="text-slate-600 text-sm">We automatically pull your fleet information directly from the FMCSA registry. No manual data entry required.</p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[var(--color-orange)] text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                2
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-lg">Verify Fleet Bracket</h4>
                </div>
                <p className="text-slate-600 text-sm">Confirm that your truck count matches your MCS-150. Our software will automatically assign you to the correct fee tier.</p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-green-500 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                3
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-lg">Instant Compliance</h4>
                </div>
                <p className="text-slate-600 text-sm">Pay the federal UCR fee plus our service charge securely via Stripe. Your PDF receipt is delivered instantly to your inbox.</p>
              </div>
            </div>
          </div>
        </div>

        {/* DEADLINES AND PENALTIES */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
            <div className="w-12 h-12 bg-amber-200/50 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="font-bold text-amber-900 text-2xl mb-3">Critical Deadline</h3>
            <p className="text-amber-800 leading-relaxed mb-4">
              The absolute deadline to have your {UCR_REGISTRATION_YEAR} fee paid and logged in the federal database is <strong>December 31st</strong>. Enforcement technically begins January 1st.
            </p>
            <p className="text-amber-800 text-sm opacity-80 mb-0">
              * If you start operating after January 1st, you must file your UCR prior to crossing the state border on your first load.
            </p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-white relative overflow-hidden">
            <ShieldAlert className="absolute -right-6 -bottom-6 w-48 h-48 text-red-500/10 -rotate-12" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-bold text-white text-2xl mb-3">Enforcement Penalties</h3>
              <p className="text-slate-300 leading-relaxed">
                If caught operating in {stateName} or any participating state without valid registration:
              </p>
              <ul className="text-slate-300 space-y-2 mt-4 text-sm font-medium">
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Fines ranging from $100 to $5,000</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Vehicle impoundment (Out-of-Service Order)</li>
                <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Costly delays clearing loads</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FINAL CONVERSION CTA */}
        <section className="bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-midnight)] text-white rounded-3xl p-10 md:p-14 mb-16 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Secure Your Compliance?</h2>
            <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">
              Our 100% cloud-based checkout system is encrypted and interfaces directly with the FMCSA. Don't risk thousands in DOT fines over a simple filing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/ucr/file"
                className="bg-[var(--color-orange)] hover:bg-[#ff7a20] text-white text-lg font-bold px-10 py-4 rounded-xl transition shadow-[0_0_20px_rgba(255,139,61,0.3)] w-full sm:w-auto"
              >
                Start Official UCR Filing
              </Link>
              <Link
                href="/tools/ucr-calculator"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-8 py-4 rounded-xl transition w-full sm:w-auto text-lg"
              >
                Launch Fee Calculator
              </Link>
            </div>
            <p className="text-xs text-blue-300 mt-6 mt-8 opacity-80 uppercase tracking-widest font-semibold">
              Trusted by thousands of carriers nationwide
            </p>
          </div>
        </section>

        {/* FAQ - SEO ANCHOR */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqSchema.mainEntity.map((faq, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-slate-800 m-0 mb-2">{faq.name}</h3>
                <p className="text-slate-600 leading-relaxed m-0 text-sm">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
