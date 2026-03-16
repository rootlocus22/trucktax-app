import Image from "next/image";
import Link from "next/link";
import { complianceGuides } from "@/lib/guides";
import { ShieldCheck, ChevronRight, Calculator, CheckCircle, Lock, Award, FileText, Download, Clock, Edit3, Users, LayoutGrid, ArrowRight, Search, MessageSquare, Calendar, AlertTriangle, Globe } from "lucide-react";
import HomepageUcrCalculator from "@/components/HomepageUcrCalculator";
import { ComparisonTable } from "@/components/ComparisonTable";
import { EmailCapture } from "@/components/EmailCapture";
import RedirectLoggedInToDashboard from "@/components/RedirectLoggedInToDashboard";
import UcrDeadlineBanner from "@/components/UcrDeadlineBanner";

export const metadata = {
  title: "UCR Filing Service — $79 Flat, Pay After Filing | EasyUCR",
  description: "Cheapest UCR filing service in the US. $79 service fee, no upfront payment. File your 2026 unified carrier registration in under 10 minutes.",
  alternates: { canonical: "https://www.easyucr.com" },
  openGraph: {
    title: "EasyUCR — File UCR for $79, Pay After Filing",
    description: "No upfront fees. Flat $79 service fee. We file your UCR and you only pay after it is confirmed.",
    url: "https://www.easyucr.com",
  },
};

const spotlightSlugs = [
  "ucr-renewal-guide",
  "ucr-registration-opens-october-1"
];

export default function Home() {
  const spotlightGuides = complianceGuides.filter((guide) =>
    spotlightSlugs.includes(guide.slug),
  );

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'easyucr.com',
    url: 'https://www.easyucr.com',
    logo: 'https://www.easyucr.com/easyucr-logo.png',
    image: 'https://www.easyucr.com/easyucr-logo.png',
    description: 'easyucr.com helps carriers, owner-operators, and brokers stay compliant with their annual UCR filings.',
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'easyucr.com UCR Filing Service',
    url: 'https://www.easyucr.com',
    description: 'Fast, easy UCR registration and renewals for the trucking industry.',
    brand: {
      '@type': 'Brand',
      name: 'easyucr.com'
    },
    applicationCategory: 'BusinessApplication',
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EasyUCR',
    url: 'https://www.easyucr.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://www.easyucr.com/ucr/file?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is UCR registration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UCR (Unified Carrier Registration) is a federally-mandated program that requires individuals and companies that operate commercial motor vehicles in interstate commerce to register their business and pay an annual fee based on their fleet size.'
        }
      },
      {
        '@type': 'Question',
        name: 'Who needs to file UCR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Motor carriers, brokers, freight forwarders, and leasing companies operating in interstate commerce must register for UCR and pay the annual fee.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does UCR cost in 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'UCR fees are set by fleet size, from $46 (0–2 trucks) up to $44,836 (1001+ trucks). Use our UCR Fee Calculator to see your exact cost. EasyUCR adds a flat $79 service fee.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the UCR deadline for 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The 2026 UCR filing deadline is December 31, 2025. Enforcement starts January 1, 2026. File early to avoid penalties.'
        }
      },
      {
        '@type': 'Question',
        name: 'What happens if I don\'t file UCR?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Failure to register for UCR can result in fines, roadside detentions, and out-of-service orders. State enforcement is active from January 1.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is EasyUCR affiliated with the government?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. EasyUCR is an independent filing service. We submit your UCR to the correct state on your behalf. We are not a government agency.'
        }
      },
      {
        '@type': 'Question',
        name: 'Why do I pay after filing and not before?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We file your UCR first. You pay only when your confirmation number is issued. If filing fails, you owe nothing. This removes risk and ensures you only pay for successful service.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I file UCR myself for free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You still pay the government UCR fee. You can file directly through your state\'s UCR portal, but it can be confusing. EasyUCR handles the process for $79 and you pay only after confirmation.'
        }
      }
    ]
  };

  return (
    <RedirectLoggedInToDashboard>
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, productJsonLd, websiteJsonLd, faqJsonLd]) }}
        />

        <div className="flex flex-col gap-0">
          <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden bg-[var(--color-midnight)] text-white">
            <div className="absolute inset-0 z-0">
              <Image
                src="/quicktruck-hero.webp"
                alt="easyucr.com Hero Background"
                fill
                priority
                fetchPriority="high"
                quality={90}
                className="object-cover"
                sizes="100vw"
              />
              {/* Trust & Road: layered gradient for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d2137] via-[#0d2137]/95 to-[#153a5e]/90" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)]/95 via-[var(--color-midnight)]/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)] via-transparent to-transparent" />
              {/* Subtle road lines pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 80px, white 80px, white 82px)' }} />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 grid gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-600/20 border border-orange-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white-300">
                  Cheapest UCR Filing in the US
                </div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-white">
                  File Your UCR Registration — <span className="text-[var(--color-orange)]">$79 Service Fee</span>, <span className="block text-blue-200">Pay After Filing</span>
                </h1>
                <p className="text-lg leading-8 text-slate-300 max-w-xl">
                  Cheapest UCR filing service in the US. We file, you pay only after it&apos;s confirmed.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:items-center">
                  <Link
                    href="/ucr/file"
                    className="group inline-flex items-center justify-between gap-3 min-h-[54px] sm:min-h-[50px] rounded-xl sm:rounded-2xl bg-[var(--color-orange)] px-5 sm:px-6 py-3.5 sm:py-3 text-white shadow-[0_8px_24px_rgba(255,122,46,0.4)] transition-all duration-300 hover:bg-[var(--color-orange-hover)] hover:shadow-[0_10px_32px_rgba(255,122,46,0.45)] touch-manipulation w-full sm:w-auto overflow-hidden relative"
                  >
                    <span className="flex items-center gap-2.5 leading-tight z-10">
                      <span className="text-base sm:text-[15px] font-bold text-white tracking-tight">File Now →</span>
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30 text-white z-10">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </Link>
                  <a
                    href="#calculator"
                    className="inline-flex items-center justify-center gap-2 min-h-[54px] sm:min-h-[50px] rounded-xl sm:rounded-2xl border border-white/30 bg-white/10 backdrop-blur px-5 sm:px-6 py-3.5 sm:py-3 text-white font-medium hover:bg-white/20 transition w-full sm:w-auto"
                  >
                    <Calculator className="w-5 h-5" />
                    Calculate Your Fee
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-white-400" /> No upfront fees
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-white-400" /> Filed in under 10 min
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-white-400" /> Confirmation number provided
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-white-400" /> 100% compliance rate
                  </div>
                </div>
              </div>

              <div id="calculator" className="relative">
                <div className="hidden lg:block max-w-md">
                  <HomepageUcrCalculator />
                </div>
                <div className="lg:hidden mt-8 max-w-sm mx-auto">
                  <HomepageUcrCalculator />
                </div>
              </div>
            </div>
          </section>

          <UcrDeadlineBanner />

          {/* Security Bar - Compact & Integrated */}
          <section className="bg-[var(--color-page)] py-8 border-b border-slate-100">
            <div className="max-w-5xl mx-auto px-6">
              <div className="relative rounded-xl bg-white border border-slate-100 p-4 shadow-card">
                <div className="flex flex-col sm:flex-row items-center justify-around gap-8 sm:gap-4">
                  <div className="flex items-center gap-4 group transition-all duration-300 w-full sm:w-auto justify-start sm:justify-start">
                    <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500/80 border border-slate-100 shrink-0">
                      <ShieldCheck className="w-6 h-6 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">McAfee</span>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider leading-none">Secured</span>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-6 bg-slate-200/60" />

                  <div className="flex items-center gap-4 group transition-all duration-300 w-full sm:w-auto justify-start sm:justify-start">
                    <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-500/80 border border-slate-100 shrink-0">
                      <Lock className="w-6 h-6 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">256-Bit</span>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider leading-none">SSL Encrypted</span>
                    </div>
                  </div>

                  <div className="hidden sm:block w-px h-6 bg-slate-200/60" />

                  <div className="flex items-center gap-4 group transition-all duration-300 w-full sm:w-auto justify-start sm:justify-start">
                    <div className="w-10 h-10 sm:w-8 sm:h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-amber-500/80 border border-slate-100 shrink-0">
                      <Award className="w-6 h-6 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Verified</span>
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider leading-none">Accuracy Hub</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3 Simple Steps - Light Background */}
          <section className="relative py-20 bg-[var(--color-page)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-4">Get UCR Compliant in 3 Simple Steps</h2>
                <p className="text-lg text-[var(--color-muted)]">No complicated state websites. We make it easy.</p>
              </div>
              <div className="relative grid md:grid-cols-3 gap-8 pb-12">
                <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-10"></div>
                {[
                  { title: "1. Basic DOT Info", desc: "Start by entering your USDOT number.", icon: Search },
                  { title: "2. Verify Fleet Size", desc: "Confirm your fleet details for accurate FMCSA fee calculation.", icon: Calculator },
                  { title: "3. Direct Download", desc: "Download the UCR certificate instantly once the payment gets finalized.", icon: Download }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center text-center bg-white p-8 rounded-2xl 
                    border border-slate-100 shadow-card shadow-card-hover
                    transform transition-transform duration-500 ease-out
                    hover:-translate-y-2
                    group cursor-default"
                  >

                    <div className="w-20 h-20 rounded-2xl bg-orange-50/50 flex items-center justify-center mb-8 text-[var(--color-orange)] 
                    transition-transform transition-colors duration-500 ease-out 
                    group-hover:scale-110 group-hover:bg-orange-100/80 group-hover:rotate-3">
                      <step.icon className="w-10 h-10" />
                    </div>

                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                      {step.title}
                    </h3>

                    <p className="text-base leading-relaxed text-[var(--color-muted)]">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* UCR Renewal Window - White Background */}
          <section className="py-24 bg-white border-b border-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" /> Compliance Schedule
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                      UCR Registration Window: <br />
                      <span className="text-orange-600">
                        When to File Your Renewal
                      </span>
                    </h2>
                    <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                      <p>
                        For motor carriers, brokers, and freight forwarders operating in interstate commerce, the annual Unified Carrier Registration (UCR) must be filed between <strong className="text-slate-900 underline decoration-orange-500/30 decoration-4 underline-offset-4">October 1st and December 31st</strong>.
                      </p>
                      <p>
                        Since transition to digital-only filing, all registrations must be submitted through authorized online portals. We recommend filing early to maintain seamless active status for your fleet.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Link href="/insights/ucr-registration-opens-october-1" className="group inline-flex items-center gap-3 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                      <span className="relative">
                        View the Detailed Compliance Calendar
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500/20 group-hover:w-0 transition-all duration-300" />
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300" />
                      </span>
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  <div className="relative bg-white rounded p-8 sm:p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-600" />

                    <h3 className="text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Clock className="w-6 h-6" />
                      </div>
                      Key Filing Dates
                    </h3>

                    <div className="relative space-y-12">
                      {/* Vertical Line */}
                      <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100" />

                      <div className="relative flex gap-6 group">
                        <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center font-bold text-orange-600 transition-transform group-hover:scale-110 duration-500">
                          OCT
                        </div>
                        <div className="py-1">
                          <p className="font-bold text-slate-900 text-lg mb-1">Registration Opens</p>
                          <p className="text-slate-500 leading-relaxed">Official filing window opens for the upcoming registration year.</p>
                        </div>
                      </div>

                      <div className="relative flex gap-6 group">
                        <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-600 shadow-lg shadow-orange-600/10 flex items-center justify-center font-bold text-white transition-transform group-hover:scale-110 duration-500">
                          DEC
                        </div>
                        <div className="py-1">
                          <p className="font-bold text-slate-900 text-lg mb-1">Mandatory Deadline</p>
                          <p className="text-slate-500 leading-relaxed">All filings must be finalized and paid to avoid penalties.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 p-6 rounded-2xl bg-slate-50 border border-slate-100/50">
                      <p className="text-sm text-slate-600 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        easyucr.com ensures 100% compliance accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Risks of Non-Compliance - Light Background */}
          <section className="py-24 bg-[var(--color-page)] border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-5 space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-600/20 text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                    <AlertTriangle className="w-3.5 h-3.5" /> Impact Alert
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                      The Risks of Non-Compliance: <br />
                      <span className="text-orange-600">Why Timely UCR Filing Matters</span>
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                      Missing the December 31st deadline isn't just a minor oversight—it can trigger significant enforcement actions that disrupt your trucking operations.
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link href="/insights/ucr-deadlines-penalties-explained" className="group inline-flex items-center gap-3 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">
                      <span className="relative">
                        Read Our Full Guide on Violations & Fees
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500/20 group-hover:w-0 transition-all duration-300" />
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300" />
                      </span>
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7 grid gap-6">
                  {[
                    {
                      title: "Escalating Fines",
                      desc: "State-level penalties can range from $100 up to $5,000 per violation depending on your operating jurisdiction.",
                      icon: FileText
                    },
                    {
                      title: "Roadside Detentions",
                      desc: "Enforcement officers can place vehicles out-of-service or detain them during inspections for UCR violations.",
                      icon: Users
                    },
                    {
                      title: "Regulatory Scrutiny",
                      desc: "Non-compliance can flag your authority for comprehensive DOT audits and increased scrutiny from safety agencies.",
                      icon: ShieldCheck
                    }
                  ].map((risk, idx) => (
                    <div key={idx} className="group flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-white p-6 rounded border-l-[6px] border-orange-600 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1">
                      <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-orange-600 shrink-0 transition-transform group-hover:scale-110">
                        <risk.icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <h3 className="text-xl font-bold text-slate-900 leading-none">{risk.title}</h3>
                        <p className="text-base text-slate-600 leading-relaxed">{risk.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* International Carriers - White Background */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-16 items-center">
                <div className="lg:col-span-7 space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <Globe className="w-3.5 h-3.5" /> Global Compliance
                  </div>
                  <div className="space-y-6">
                    <h2 className="text-4xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                      Non-Participating States & <br />
                      <span className="text-[var(--color-midnight)]">International Carriers</span>
                    </h2>
                    <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                      <p>
                        A common misconception is that carriers in non-participating states are exempt. <strong className="text-slate-900 underline decoration-[var(--color-midnight)]/20 decoration-4 underline-offset-4">This is false.</strong> If your commercial vehicles travel through any of the participating states, you are federally required to register under the UCR Agreement.
                      </p>
                      <div className="p-6 bg-slate-50 border-l-4 border-[var(--color-midnight)] rounded-r-2xl">
                        <p className="font-bold text-slate-900 italic">
                          "This mandate applies to all interstate operators, including carriers based in Canada and Mexico."
                        </p>
                      </div>
                      <p>
                        If your base state does not participate, you must register through another participating jurisdiction. Our system simplifies this by automatically selecting the correct route for your business.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-[var(--color-midnight)] rounded blur-2xl opacity-10 group-hover:opacity-15 transition-opacity duration-500" />
                    <div className="relative bg-[var(--color-midnight)] rounded p-10 text-white shadow-2xl border border-white/10 overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-3xl -ml-16 -mb-16" />

                      <div className="space-y-8 relative z-10">
                        <div className="w-16 h-16 rounded bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white">
                          <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold leading-tight">UCR is Mandatory</h3>
                          <p className="text-slate-300 text-lg leading-relaxed">
                            Don't let cross-border jurisdiction confuse you. Our platform handles the complexity of non-participating state filings automatically.
                          </p>
                        </div>
                        <Link href="/ucr/file" className="inline-flex items-center justify-center w-full py-5 bg-[var(--color-orange)] text-slate-900 rounded-2xl font-bold hover:bg-[#e66a15] transition-all duration-300 shadow-lg shadow-black/10 group">
                          Start Filing Now
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* UCR Service Comparison - Light Background */}
          <section className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Compare UCR Filing Services</h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">See why EasyUCR is the cheapest with $79 service fee and pay-after-filing.</p>
              </div>
              <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-card">
                <ComparisonTable />
              </div>
            </div>
          </section>

          {/* Trucking Guides - Light Background */}
          <section className="py-24 bg-[var(--color-page)] border-t border-slate-100">
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
                    className="flex h-full flex-col justify-between rounded-xl sm:rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-[var(--color-orange)]/50 group"
                  >
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition-colors line-clamp-2">
                        <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                      </h3>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">{guide.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs font-medium text-[var(--color-muted)] border-t border-slate-100 pt-4">
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

          {/* Email Capture - Reminder for 2027 */}
          <section className="py-16 bg-slate-100 border border-slate-200">
            <div className="max-w-2xl mx-auto px-4">
              <EmailCapture />
            </div>
          </section>

          {/* FAQ Section - White Background */}
          <section className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-midnight)]/5 border border-[var(--color-midnight)]/10 text-[var(--color-midnight)] text-[10px] font-bold uppercase tracking-widest mb-4">
                  <MessageSquare className="w-3.5 h-3.5" /> Common Questions
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  Everything you need to know about UCR registration and compliance.
                </p>
              </div>

              <div className="space-y-6">
                {faqJsonLd.mainEntity.map((faq, index) => (
                  <details
                    key={index}
                    open
                    className="group border border-slate-200/60 rounded-2xl bg-white transition-all duration-300 hover:border-[var(--color-orange)]/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-default list-none focus:outline-none">
                      <h2 className="text-lg font-bold text-slate-800 pr-8 group-open:text-[var(--color-midnight)] group-hover:text-[var(--color-orange)] transition-colors">
                        {faq.name}
                      </h2>
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--color-orange)] group-hover:text-white group-open:bg-[var(--color-midnight)] group-open:text-white">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </summary>
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-6">
                      {faq.acceptedAnswer.text}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-[var(--color-midnight)] py-20 lg:py-32">
            <div className="absolute inset-0 z-0">
              <Image
                src="/ucr-filing.webp"
                alt="easyucr.com UCR Filing background"
                fill
                className="object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-midnight)] via-transparent to-[var(--color-midnight)]" />
            </div>
            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Simplify Your UCR Compliance?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-slate-200 mb-8 sm:mb-10 leading-relaxed">
                Join thousands of truckers who trust easyucr.com.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
                <Link
                  href="/ucr/file"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-medium !text-white shadow-[0_10px_30px_rgba(255,122,46,0.35)] transition-all duration-300 hover:bg-[var(--color-orange-hover)] hover:shadow-[0_12px_40px_rgba(255,122,46,0.45)] hover:-translate-y-1 active:scale-95 transform touch-manipulation min-h-[48px] sm:min-h-[56px]"
                >
                  Start Filing Now
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/tools/ucr-calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white backdrop-blur-md border border-white/20 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-medium text-white shadow-lg transition-all duration-300 hover:bg-white/50 hover:-translate-y-1 active:scale-95 transform touch-manipulation min-h-[48px] sm:min-h-[56px]"
                >
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                  Calculate UCR Fees
                </Link>
              </div>
            </div>
          </section>
        </div>
      </>
    </RedirectLoggedInToDashboard >
  );
}
