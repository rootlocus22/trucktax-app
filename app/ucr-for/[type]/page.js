import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UCR_OPERATOR_TYPES } from '@/lib/ucr-seo-data';
import { getUcrFee, UCR_REGISTRATION_YEAR, UCR_FEE_BRACKETS_2026 } from '@/lib/ucr-fees';
import { ShieldCheck, Calculator, CheckCircle, FileText, ArrowRight, Truck, DollarSign, AlertCircle, Building2 } from 'lucide-react';
import Image from 'next/image';

export function generateStaticParams() {
  return UCR_OPERATOR_TYPES.map((t) => ({ type: t.slug }));
}

export async function generateMetadata({ params }) {
  const op = UCR_OPERATOR_TYPES.find((t) => t.slug === params.type);
  if (!op) return { title: 'UCR Registration Services | QuickTruckTax' };

  return {
    title: `UCR Registration for ${op.title} – ${UCR_REGISTRATION_YEAR} Federal Rules | QuickTruckTax`,
    description: `Complete ${UCR_REGISTRATION_YEAR} UCR compliance guide for ${op.title}. Understand your specific tier fee, the Dec 31st deadline, and process your federal registration online.`,
    alternates: { canonical: `https://www.quicktrucktax.com/ucr-for/${op.slug}` },
    openGraph: {
      title: `The ${op.title} Guide to UCR Registration (${UCR_REGISTRATION_YEAR})`,
      description: `Do ${op.title.toLowerCase()} need a UCR? Discover your exact ${UCR_REGISTRATION_YEAR} federal fee bracket and avoid heavy DOT non-compliance penalties.`,
      url: `https://www.quicktrucktax.com/ucr-for/${op.slug}`,
    },
  };
}

export default function UcrForTypePage({ params }) {
  const op = UCR_OPERATOR_TYPES.find((t) => t.slug === params.type);
  if (!op) notFound();

  // Determine pricing structure based on slug
  const isFlatFeeType = ['brokers', 'freight-forwarders', 'leased-operators'].includes(op.slug);
  const isBrokerOrForwarder = ['brokers', 'freight-forwarders'].includes(op.slug);

  const { fee, serviceFee } = getUcrFee(
    0,
    op.slug === 'brokers' ? 'broker' :
      op.slug === 'freight-forwarders' ? 'freight_forwarder' :
        op.slug === 'leased-operators' ? 'leasing' : 'carrier'
  );

  const flatTotal = isFlatFeeType ? fee + serviceFee : null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Why do ${op.title.toLowerCase()} need a Unified Carrier Registration?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Under federal law (49 U.S.C. 14504a), if you operate as a ${op.title.toLowerCase()} and participate in interstate commerce, you must register for the UCR program. ${isBrokerOrForwarder ? 'Even if you do not physically own or operate the trucks, arranging the transportation of freight across state lines triggers the federal UCR requirement.' : 'Crossing state lines with commercial equipment subjects you to UCR fees based on your fleet size.'}`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the exact ${UCR_REGISTRATION_YEAR} UCR fee for ${op.title.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: isFlatFeeType ? `The ${UCR_REGISTRATION_YEAR} UCR fee for ${op.title.toLowerCase()} is $46.00 (Tier 1 flat rate). This is a fixed fee regardless of how much revenue you generate. Using QuickTruckTax's expedited service adds a small processing fee for instant database syncing.` : `UCR fees for ${op.title.toLowerCase()} depend entirely on the number of commercial power units operated in interstate commerce over the last year. The fees range from $46 for 0-2 power units up to thousands for massive fleets.`,
        },
      },
      {
        '@type': 'Question',
        name: `When is the UCR deadline for ${op.title.toLowerCase()}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `To secure your ${UCR_REGISTRATION_YEAR} registration without penalty, you must file by December 31st. State DOT audits and weigh station enforcement begins firmly on January 1st.`,
        }
      }
    ],
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* DYNAMIC PREMIUM HERO */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-midnight)] to-[var(--color-navy)] pt-20 pb-24 text-white">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-20 bg-[url('/hero-truck.svg')] bg-repeat" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
          <div className="mb-6">
            <Link href="/ucr/file" className="text-sm font-medium text-blue-300 hover:text-white transition flex items-center">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Return to Calculator
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-orange)] border border-white/10 mb-6 shadow-[0_0_15px_rgba(255,139,61,0.2)]">
                {isBrokerOrForwarder ? <Building2 className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                {op.title} Division
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold mb-6 leading-tight tracking-tight drop-shadow-lg">
                UCR Filing Requirements for <br /><span className="text-[var(--color-orange)]">{op.title}</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-xl leading-relaxed">
                {op.description} Discover exactly what you owe for the {UCR_REGISTRATION_YEAR} season and process your federal compliance in under 5 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/ucr/file" className="inline-flex items-center justify-center bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#ff7a20] transition shadow-lg hover:shadow-orange-500/25 text-lg group">
                  File {op.title.split(' ')[0]} UCR
                  <CheckCircle className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Visual Pricing Card */}
            <div className="hidden lg:block relative perspective-1000">
              <div className="relative transform rotate-y-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-[var(--color-orange)] rounded-2xl blur opacity-30"></div>
                <div className="relative bg-[var(--color-card)]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xl m-0">{UCR_REGISTRATION_YEAR} Fee Bracket</p>
                      <p className={`${isFlatFeeType ? 'text-green-400' : 'text-blue-300'} text-sm m-0 mt-1`}>
                        {isFlatFeeType ? 'Fixed Flat Rate' : 'Variable per power unit'}
                      </p>
                    </div>
                  </div>

                  {isFlatFeeType ? (
                    <div className="text-center py-4">
                      <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-2">Required Base Fee</p>
                      <div className="text-5xl font-black text-white">$37<span className="text-2xl text-slate-500">.00</span></div>
                      <p className="text-sm text-slate-400 mt-4 leading-relaxed bg-white/5 rounded-lg p-3 border border-white/5">
                        You are legally placed in UCR Tier 1. You do not pay more based on your revenue or the number of loads you arrange.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-4 text-blue-100">
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-navy)] border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-blue-300">1</div>
                        <span>Locate your Federal DOT Number</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-navy)] border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-blue-300">2</div>
                        <span>Verify fleet count via our FMCSA sync</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-orange)]/20 border border-[var(--color-orange)]/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-[var(--color-orange)]">3</div>
                        <span>Pay calculated tier fee securely</span>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full overflow-hidden leading-none rotate-180 transform translate-y-[1px]">
          <svg className="block w-full h-12 lg:h-16" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 lg:py-20">

        {/* CONDITIONAL INTENT CONTENT */}
        <div className="prose prose-lg prose-slate max-w-none mb-12">

          {isBrokerOrForwarder ? (
            <>
              <h2>Why do {op.title.toLowerCase()} need a UCR?</h2>
              <p className="lead border-l-4 border-[var(--color-navy)] pl-5 bg-blue-50 py-3 italic">
                "Wait, I don't own any commercial trucks. Why is the government forcing me to pay a trucking registration fee?"
              </p>
              <p>
                This is the most common question we get from <strong>{op.title.toLowerCase()}</strong>. The reality is that the Unified Carrier Registration Act of 2005 (49 U.S.C. 14504a) explicitly encompasses entities that <em>coordinate</em> interstate transport, not just those operating the physical steering wheel.
              </p>
              <p>
                Because your business arranges for the interstate movement of freight across state borders, you are operating in interstate commerce. Therefore, the FMCSA strictly requires you to file a UCR every single year.
              </p>
              <div className="not-prose bg-green-50 border border-green-200 rounded-xl p-6 my-8 flex gap-4 items-start shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                <div>
                  <h4 className="text-green-900 font-bold m-0 text-lg mb-1">The Silver Lining: Fixed Flat Rates</h4>
                  <p className="text-green-800 m-0 text-sm leading-relaxed">
                    Because you do not operate vehicles, the UCR board places all brokers and freight forwarders strictly into <strong>Tier 1</strong>. For {UCR_REGISTRATION_YEAR}, your federal base fee is legally capped at <strong>$46.00</strong>. You will never pay the massive fleet fees that carriers are forced to pay.
                  </p>
                </div>
              </div>
            </>
          ) : isFlatFeeType ? (
            <>
              <h2>UCR Rules for {op.title}</h2>
              <p className="lead">
                Leasing companies occupy a unique space in federal compliance. As a leasing company, your liability for UCR depends heavily on the structure of your leases.
              </p>
              <p>
                If you lease equipment <em>without</em> drivers to interstate motor carriers, you are still considered a motor carrier under UCR definitions. However, if your lease agreements stipulate that the lessee (the company renting the truck) is responsible for UCR fees and compliance, you might not have to include those specific leased vehicles in your count.
              </p>
              <p>
                Regardless of your lessee counting, the FMCSA typically requires the leasing corporation itself to maintain a baseline UCR registration. By default, leasing companies are placed into the highly affordable <strong>Tier 1 Bracket ($46.00 base fee)</strong>.
              </p>
            </>
          ) : (
            <>
              <h2>UCR Requirements for {op.title}</h2>
              <p className="lead">
                If you operate as an {op.title.toLowerCase()} moving freight or passengers across state lines, the FMCSA requires you to file a Unified Carrier Registration annually. This applies equally to private carriers and for-hire operations.
              </p>
              <p>
                The most critical aspect of filing as an {op.title.toLowerCase()} is ensuring your <strong>fleet count accuracy</strong>.
              </p>
              <div className="bg-slate-100 p-6 rounded-xl border border-slate-200 my-8">
                <h4 className="font-bold text-slate-900 mt-0 mb-3 text-lg">How is my fee calculated?</h4>
                <p className="text-slate-700 m-0 text-sm leading-relaxed mb-4">
                  Your UCR fee bracket is purely defined by how many commercial motor vehicles you operate. To determine this number, the federal system looks at the number of interstate vehicles you reported on your most recent MCS-150 (Biennial Update).
                </p>
                <p className="text-slate-700 m-0 text-sm leading-relaxed">
                  If you have purchased a new truck or downsized your fleet, you <strong>must</strong> update your MCS-150 before renewing your UCR. A mismatch between your UCR filing tier and your DOT census data will instantly trigger a compliance audit.
                </p>
              </div>
            </>
          )}

          <h2>Consequences of Missing the Deadline</h2>
          <p>
            The {UCR_REGISTRATION_YEAR} UCR deadline is legally set for <strong>December 31st</strong>. While state enforcement varies, all participating states enforce UCR aggressively via the electronic DOT network at weigh stations and roadside inspections starting January 1st.
          </p>
          <ul>
            <li><strong>Roadside Fines:</strong> Ranging from moderate slaps on the wrist to $5,000 penalties.</li>
            <li><strong>Detention:</strong> Authorities can issue an Out-of-Service (OOS) order, legally preventing you or your drivers from moving the load until the fee is paid and verified.</li>
          </ul>
        </div>

        {/* BRACKET PRICING - EITHER CONDENSED OR FULL TABLE */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-12">
          <div className="bg-[var(--color-navy)] px-6 py-4 flex items-center justify-between text-white">
            <h3 className="text-xl font-bold m-0 flex items-center gap-2"><FileText className="w-5 h-5 text-[var(--color-orange)]" /> {UCR_REGISTRATION_YEAR} Fee Breakdown</h3>
          </div>

          {isFlatFeeType ? (
            <div className="p-8 text-center bg-slate-50">
              <p className="text-slate-600 mb-6 max-w-lg mx-auto">As recognized {op.title.toLowerCase()}, you bypass variable tier structures and qualify entirely for the flat Tier 1 fee scale.</p>
              <div className="inline-flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Fee</div>
                <div className="text-4xl font-black text-slate-900 mb-2">${flatTotal}<span className="text-xl text-slate-500">.00</span></div>
                <div className="text-sm text-slate-500 font-medium">Includes federal tax + expedited processing</div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold border-b border-slate-200">Power Units</th>
                    <th scope="col" className="px-6 py-4 font-bold border-b border-slate-200 text-right">Governing Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {UCR_FEE_BRACKETS_2026.map((row) => (
                    <tr key={row.min} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-slate-700">{row.label}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900 text-right">${row.fee.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FINAL CONVERSION CTA  */}
        <div className="bg-[url('/hero-truck.svg')] bg-cover bg-center rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-navy)] via-[var(--color-navy)]/95 to-blue-900/90 mix-blend-multiply"></div>
          <div className="relative z-10 p-10 md:p-14 sm:flex items-center justify-between text-white text-center sm:text-left">
            <div className="mb-8 sm:mb-0 sm:pr-8">
              <h2 className="text-3xl font-bold mb-3">Execute Your {UCR_REGISTRATION_YEAR} Filing</h2>
              <p className="text-blue-200 text-lg max-w-lg">
                Use QuickTruckTax's authorized third-party portal to securely sync your data with FMCSA databases.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/ucr/file"
                className="inline-flex items-center justify-center bg-[var(--color-orange)] hover:bg-[#ff7a20] text-white text-lg font-bold px-8 py-4 rounded-xl transition shadow-[0_0_20px_rgba(255,139,61,0.4)] w-full sm:w-auto"
              >
                Start UCR Filing <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ - SEO ANCHOR */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 mt-16 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-[var(--color-navy)]" />
            Compliance FAQ for {op.title}
          </h2>
          <div className="space-y-6">
            {faqSchema.mainEntity.map((faq, idx) => (
              <div key={idx} className="bg-slate-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-[var(--color-navy)] m-0 mb-2">{faq.name}</h3>
                <p className="text-slate-600 leading-relaxed m-0 text-sm">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
