import Image from "next/image";
import Link from "next/link";
import { complianceGuides } from "@/lib/guides";
import { ShieldCheck, ChevronRight, Calculator, CheckCircle, Lock, Award, FileText, Download, Clock, Edit3, Users, LayoutGrid, ArrowRight, Search, MessageSquare } from "lucide-react";
import HomepageUcrCalculator from "@/components/HomepageUcrCalculator";
import RedirectLoggedInToDashboard from "@/components/RedirectLoggedInToDashboard";
import UcrDeadlineBanner from "@/components/UcrDeadlineBanner";

export const metadata = {
  title: "UCR Filing & Renewal – $0 Upfront | QuickTruckTax",
  description: "File your 2026 UCR registration online with $0 upfront. We complete your filing first, then you pay when your UCR certificate is ready.",
  alternates: { canonical: "https://www.quicktrucktax.com" },
  openGraph: {
    title: "UCR Filing & Renewal – $0 Upfront | QuickTruckTax",
    description: "File your 2026 UCR registration online with $0 upfront. We complete your filing first; pay when your certificate is ready.",
    url: "https://www.quicktrucktax.com",
  },
};

const spotlightSlugs = [
  "ucr-renewal-guide",
  "trucking-compliance-calendar"
];

export default function Home() {
  const spotlightGuides = complianceGuides.filter((guide) =>
    spotlightSlugs.includes(guide.slug),
  );

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'QuickTruckTax',
    url: 'https://www.quicktrucktax.com',
    logo: 'https://www.quicktrucktax.com/quicktrucktax-logo-new.png',
    image: 'https://www.quicktrucktax.com/quicktrucktax-logo-new.png',
    description: 'QuickTruckTax helps carriers, owner-operators, and brokers stay compliant with their annual UCR filings.',
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'QuickTruckTax UCR Filing Service',
    url: 'https://www.quicktrucktax.com',
    description: 'Fast, easy UCR registration and renewals for the trucking industry.',
    brand: {
      '@type': 'Brand',
      name: 'QuickTruckTax'
    },
    applicationCategory: 'BusinessApplication',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Do I need to file UCR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'If you operate a commercial motor vehicle in interstate commerce, you must register for the UCR and pay the annual fee.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does UCR registration cost?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UCR fees are based on the number of commercial motor vehicles you operate. You can use our UCR Fee Calculator to determine your exact cost.'
        }
      },
      {
        '@type': 'Question',
        name: 'When is the UCR deadline?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UCR registration must be renewed annually by December 31st for the upcoming year.'
        }
      }
    ]
  };

  return (
    <RedirectLoggedInToDashboard>
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, productJsonLd, faqJsonLd]) }}
        />

        <div className="flex flex-col gap-20 sm:gap-24">
          <section className="relative overflow-hidden rounded-3xl bg-[var(--color-midnight)] text-white shadow-2xl">
            <div className="absolute inset-0 z-0">
              <Image
                src="/hero-bg-truck.jpg"
                alt="Highway and trucks at golden hour"
                fill
                priority
                fetchPriority="high"
                quality={60}
                className="object-cover opacity-50"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/85 to-[var(--color-midnight)]/40" />
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[var(--color-orange)]/60 to-transparent opacity-80" />
            </div>

            <div className="relative z-10 px-4 sm:px-6 py-14 sm:py-20 lg:px-16 grid gap-10 sm:gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  The Fastest Way to File Your 2026 UCR
                </div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-white">
                  Get Your <span className="text-[var(--color-orange)]">2026 UCR</span> <span className="block text-blue-200">Done in Minutes</span>
                </h1>
                <p className="text-lg leading-8 text-slate-300 max-w-xl">
                  File your UCR with zero hassle. Ensure your fleet is compliant with the FMCSA today. We complete your filing first—pay only when your certificate is ready.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:items-center">
                  <Link
                    href="/ucr/file"
                    className="group inline-flex items-center justify-between gap-3 min-h-[54px] sm:min-h-[50px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#ff8b3d] to-[#f07a2d] px-5 sm:px-6 py-3.5 sm:py-3 text-[var(--color-navy)] shadow-[0_8px_22px_rgba(255,139,61,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,139,61,0.4)] active:translate-y-0 touch-manipulation w-full sm:w-auto"
                  >
                    <span className="flex items-center gap-2.5 leading-tight">
                      <span className="text-base sm:text-[15px] font-extrabold text-[#0f2647] tracking-tight">Start UCR Filing</span>
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30 transition-transform duration-200 group-hover:translate-x-0.5 text-[#0f2647]">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Instant Pricing
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Fast processing
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Direct download
                  </div>
                </div>
              </div>

              <div className="hidden lg:block relative max-w-md">
                <HomepageUcrCalculator />
              </div>
              <div className="lg:hidden mt-8 max-w-sm mx-auto">
                <HomepageUcrCalculator />
              </div>
            </div>
          </section>

          <UcrDeadlineBanner />

          <div className="bg-white border-y border-slate-100 py-8">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Trusted by Independent Truckers Nationwide</p>
              <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> McAfee SECURE</span>
                <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><Lock className="w-6 h-6" /> 256-Bit SSL</span>
                <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><Award className="w-6 h-6" /> Guaranteed Accurate</span>
              </div>
            </div>
          </div>

          <section className="relative py-16 sm:py-20">
            <div className="absolute inset-0 bg-[var(--color-page)]" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-50/50 to-transparent pointer-events-none" />
            <div className="relative text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-4">Get UCR Compliant in 3 Simple Steps</h2>
              <p className="text-lg text-[var(--color-muted)]">No complicated state websites. We make it easy.</p>
            </div>
            <div className="relative grid md:grid-cols-3 gap-12">
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-slate-100 -z-10"></div>
              {[
                { title: "1. Basic DOT Info", desc: "Start by entering your USDOT number.", icon: Search },
                { title: "2. Verify Fleet Size", desc: "Confirm your fleet details for accurate FMCSA fee calculation.", icon: Calculator },
                { title: "3. Direct Download", desc: "Download the UCR certificate instantly once the payment gets finalized.", icon: Download }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                  <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center mb-6 text-[var(--color-navy)] text-indigo-600">
                    <step.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 sm:mb-4">
                    UCR & Trucking Guides
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)]">
                    Learn everything you need to know about keeping your fleet compliant
                  </p>
                </div>
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 text-base sm:text-lg font-bold text-[var(--color-orange)] hover:text-[var(--color-navy)] transition-colors group"
                >
                  View All Guides <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {spotlightGuides.map((guide) => (
                  <article
                    key={guide.slug}
                    className="flex h-full flex-col justify-between rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition-all hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-xl hover:border-[var(--color-orange)]/50 group"
                  >
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition-colors line-clamp-2">
                        <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                      </h3>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">{guide.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs font-medium text-[var(--color-muted)] border-t border-slate-200 pt-4">
                      <span>Guide</span>
                      <Link
                        href={`/insights/${guide.slug}`}
                        className="text-[var(--color-orange)] group-hover:text-[var(--color-navy)] transition-colors font-bold flex items-center gap-1"
                      >
                        Read <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-midnight)] py-12 sm:py-16 lg:py-24">
            <div className="absolute inset-0">
              <Image
                src="/hero-truck-sunset.png"
                alt="Truck on highway"
                fill
                className="object-cover opacity-10"
              />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Simplify Your UCR Compliance?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-slate-200 mb-8 sm:mb-10 leading-relaxed">
                Join thousands of truckers who trust QuickTruckTax.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/ucr/file"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-[var(--color-navy)] shadow-xl shadow-orange-500/30 transition hover:bg-[#e66a15] active:scale-95 transform duration-200 touch-manipulation min-h-[48px] sm:min-h-[56px]"
                >
                  Start Filing Now
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-navy)]" />
                </Link>
                <Link
                  href="/tools/ucr-calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-[var(--color-navy)] shadow-lg transition hover:bg-slate-100 active:scale-95 touch-manipulation min-h-[48px] sm:min-h-[56px]"
                >
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                  Calculate UCR Fees
                </Link>
              </div>
            </div>
          </section>
        </div>
      </>
    </RedirectLoggedInToDashboard>
  );
}
