import Image from "next/image";
import Link from "next/link";
import { complianceGuides } from "@/lib/guides";
import { ShieldCheck, ChevronRight, Calculator, CheckCircle, Lock, Award, FileText, Download, Clock, Edit3, Users, LayoutGrid, ArrowRight, Search, MessageSquare } from "lucide-react";
import HomepageUcrCalculator from "@/components/HomepageUcrCalculator";
import RedirectLoggedInToDashboard from "@/components/RedirectLoggedInToDashboard";
import UcrDeadlineBanner from "@/components/UcrDeadlineBanner";

export const metadata = {
  title: "UCR Filing & Renewal – $0 Upfront, Pay When Ready | QuickTruckTax",
  description: "File your UCR registration online with $0 upfront. We complete your filing first, then you pay when your UCR certificate is ready. Plus 2290, MCS-150, IFTA, compliance guides, due date calculators, and reminders.",
  alternates: { canonical: "https://www.quicktrucktax.com" },
  openGraph: {
    title: "UCR Filing & Renewal – $0 Upfront, Pay When Ready | QuickTruckTax",
    description: "File your UCR registration online with $0 upfront. We complete your filing first; pay when your certificate is ready. Plus 2290, MCS-150, IFTA, compliance guides, due date calculators, and reminders.",
    url: "https://www.quicktrucktax.com",
  },
};

const spotlightSlugs = [
  "form-2290-ultimate-guide",
  "ucr-renewal-guide",
  "mcs150-update-guide",
  "ifta-filing-basics",
];

const categoryOrder = [
  "Form 2290 / HVUT",
  "UCR",
  "FMCSA / MCS-150",
  "IFTA & Fuel Taxes",
  "Business & Administration",
  "Resources",
];

const services = [
  {
    title: "Form 2290 Guide",
    description: "Learn about HVUT, deadlines, and how to e-file. We focus on UCR filing; we don't file 2290.",
    price: "Free guide",
    image: "/schedule1-mockup.png",
    href: "/services/form-2290-filing",
    features: ["Deadlines & rates", "How to e-file", "IRS resources"]
  },
  {
    title: "UCR Registration",
    description: "File now with no upfront charge. Pay only when your UCR certificate is ready.",
    price: "$0 upfront",
    image: "/dashboard-mockup-v2.png",
    href: "/services/ucr-registration",
    features: ["Fast Processing", "Multi-State Support", "Bulk Renewals"]
  },
  {
    title: "MCS-150 Updates",
    description: "Keep your FMCSA registration current with easy online updates.",
    price: "Free",
    image: "/smart_filing_features_1764806445772.png",
    href: "/services/mcs-150-update",
    features: ["Instant Updates", "PDF Generation", "No Paperwork"]
  },
  {
    title: "IFTA Filing",
    description: "File your International Fuel Tax Agreement returns efficiently.",
    price: "Starting at $25",
    image: "/fleet_management_dashboard_1764806426862.png",
    href: "/services/ifta-irp",
    features: ["Multi-State Filing", "Mileage Tracking", "Quick Processing"]
  }
];

const stats = [
  { label: "HVUT & compliance topics", value: "230+" },
  { label: "2026 deadlines covered", value: "100%" },
  { label: "Actionable templates", value: "15" },
];

export default function Home() {
  const spotlightGuides = complianceGuides.filter((guide) =>
    spotlightSlugs.includes(guide.slug),
  );

  const categories = categoryOrder
    .map((category) => ({
      category,
      guides: complianceGuides
        .filter((guide) => guide.category === category)
        .slice(0, 3),
    }))
    .filter((entry) => entry.guides.length > 0);

  // JSON-LD structured data for Organization
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'QuickTruckTax',
    url: 'https://www.quicktrucktax.com',
    logo: 'https://www.quicktrucktax.com/quicktrucktax-logo-new.png',
    image: 'https://www.quicktrucktax.com/quicktrucktax-logo-new.png',
    description: 'QuickTruckTax helps carriers, owner-operators, and brokers stay compliant with HVUT, UCR, MCS-150, and fuel tax filings.',
    sameAs: [
      'https://twitter.com/quicktrucktax',
    ],
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'QuickTruckTax Form 2290 Guides & Resources',
    url: 'https://www.quicktrucktax.com',
    description: 'Free Form 2290 guides, checklists, due-date tools, and HVUT resources for trucking compliance.',
    brand: {
      '@type': 'Brand',
      name: 'QuickTruckTax'
    },
    applicationCategory: 'ReferenceApplication',
    offers: {
      '@type': 'Offer',
      url: 'https://www.quicktrucktax.com/resources',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1240'
    }
  };

  // FAQ Schema for Featured Snippets - Target: "How to file Form 2290"
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How to file Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuickTruckTax provides free Form 2290 guides, checklists, due-date tools, and HVUT calculators. Use our resources to understand filing steps, deadlines, and compliance requirements.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does it cost to file Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuickTruckTax is a content and resource site. We offer free guides, checklists, and tools for Form 2290 and trucking compliance.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long does it take to get Schedule 1 after filing Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuickTruckTax provides information on how to obtain your IRS-stamped Schedule 1. E-filing is generally the fastest method, often resulting in approval within minutes, while paper filings can take several weeks.'
        }
      },
      {
        '@type': 'Question',
        name: 'What is the deadline for filing Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The annual deadline for existing vehicles is August 31st. For new vehicles, file by the end of the month following the month of first use. The tax year runs from July 1 to June 30.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I need to file Form 2290 for my truck?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You must file Form 2290 if your vehicle has a taxable gross weight of 55,000 pounds or more and is used on public highways. Agricultural vehicles have a 7,500-mile threshold instead of 5,000 miles.'
        }
      },
      {
        '@type': 'Question',
        name: 'What happens if I make a mistake on Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuickTruckTax offers free VIN corrections if you make a mistake. If the IRS rejects your filing, we will re-file at no additional cost. Our expert review process catches most errors before submission.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I file Form 2290 online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, QuickTruckTax provides a full concierge service for Form 2290 filing. Our expert team handles the entire process for you - you just provide your information and we take care of filing with the IRS. Much faster than paper filing which can take weeks.'
        }
      },
      {
        '@type': 'Question',
        name: 'What information do I need to file Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You need: your EIN or SSN, vehicle VIN numbers, taxable gross weight for each vehicle, first use month, and business information. QuickTruckTax guides you through each step with clear instructions.'
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
          {/* HERO SECTION */}
          <section className="relative overflow-hidden rounded-3xl bg-[var(--color-midnight)] text-white shadow-2xl">
            <div className="absolute inset-0 z-0">
              <Image
                src="/hero-bg-truck.jpg"
                alt="Highway and trucks at golden hour - life on the road"
                fill
                priority
                fetchPriority="high"
                quality={60}
                className="object-cover opacity-50"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/85 to-[var(--color-midnight)]/40" />
              {/* Subtle road stripe accent */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-[var(--color-orange)]/60 to-transparent opacity-80" />
            </div>

            <div className="relative z-10 px-4 sm:px-6 py-14 sm:py-20 lg:px-16 grid gap-10 sm:gap-12 lg:grid-cols-2 items-center">
              <div className="space-y-6 sm:space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  File First, Pay Later
                </div>
                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-white">
                  UCR Filing &amp; <span className="block text-blue-200">Renewal for Truckers</span>
                </h1>
                <p className="text-lg leading-8 text-slate-300 max-w-xl">
                  File your UCR with $0 upfront—we complete your filing first, and you pay only when your certificate is ready to download. Plus Form 2290, MCS-150, IFTA, compliance guides, due date calculators, and reminders.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:items-center">
                  <Link
                    href="/ucr/file"
                    className="group inline-flex items-center justify-between gap-3 min-h-[54px] sm:min-h-[50px] rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#ff8b3d] to-[#f07a2d] px-5 sm:px-6 py-3.5 sm:py-3 text-[var(--color-navy)] shadow-[0_8px_22px_rgba(255,139,61,0.32)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,139,61,0.4)] active:translate-y-0 touch-manipulation w-full sm:w-auto"
                  >
                    <span className="flex items-center gap-2.5 leading-tight">
                      <span className="text-base sm:text-[15px] font-extrabold text-[#0f2647] tracking-tight">Start UCR Filing</span>
                      <span className="inline-flex items-center rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-bold text-white/95">$0 upfront</span>
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 ring-1 ring-white/30 transition-transform duration-200 group-hover:translate-x-0.5 text-[#0f2647]">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </Link>
                  <Link
                    href="/tools/ucr-calculator"
                    className="group inline-flex items-center justify-between gap-3 min-h-[54px] sm:min-h-[50px] rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 px-5 sm:px-6 py-3.5 sm:py-3 !text-white transition-all duration-200 hover:bg-white/20 hover:border-white/35 hover:-translate-y-0.5 touch-manipulation w-full sm:w-auto"
                  >
                    <span className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                        <Calculator className="w-4 h-4" />
                      </span>
                      <span className="text-base sm:text-[15px] font-bold leading-tight">UCR Fee Calculator</span>
                    </span>
                  </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300 pt-2 sm:pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Fee calculation
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Guided filing first
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Pay on certificate download
                  </div>
                </div>
              </div>

              {/* UCR Calculator above the fold + CTA */}
              <div className="hidden lg:block relative max-w-md">
                <HomepageUcrCalculator />
              </div>
              <div className="lg:hidden mt-8 max-w-sm mx-auto">
                <HomepageUcrCalculator />
              </div>
            </div>
          </section>

          {/* UCR Urgency Banner — Phase 5: Oct–Dec shows countdown / last chance; rest of year static + link to Oct 1 guide */}
          <UcrDeadlineBanner />

          {/* TRUST BANNER */}
          <div className="bg-white border-y border-slate-100 py-8">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Trusted by Industry Leaders & Independent Truckers</p>
              <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> McAfee SECURE</span>
                <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><Lock className="w-6 h-6" /> 256-Bit SSL</span>
                <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><Award className="w-6 h-6" /> Expert CPA Review</span>
              </div>
            </div>
          </div>

          {/* LIFE ON THE ROAD - Trucker imagery */}
          <section className="relative py-16 sm:py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-white pointer-events-none" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-3">Built for Life on the Road</h2>
                <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">Highways, deadlines, and compliance—we get it. Our guides and tools are made for truckers, by people who care about the industry.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3]">
                  <Image src="https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=600&q=80" alt="Heavy truck on the highway" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="font-bold text-lg">Highway Ready</p>
                    <p className="text-sm text-white/90">Stay compliant so you can stay on the road.</p>
                  </div>
                </div>
                <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3]">
                  <Image src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=80" alt="Open road at golden hour" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="font-bold text-lg">Miles Ahead</p>
                    <p className="text-sm text-white/90">Clear deadlines and checklists—no guesswork.</p>
                  </div>
                </div>
                <div className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 aspect-[4/3]">
                  <Image src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80" alt="Truck on the road" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="font-bold text-lg">Your Fleet, Your Way</p>
                    <p className="text-sm text-white/90">From one truck to hundreds—we’ve got you.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="relative py-16 sm:py-20">
            <div className="absolute inset-0 bg-[var(--color-page)]" />
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-amber-50/50 to-transparent pointer-events-none" />
            <div className="relative text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-4">Get Compliant in 3 Simple Steps</h2>
              <p className="text-lg text-[var(--color-muted)]">No complicated software. We do the heavy lifting for you.</p>
            </div>
            <div className="relative grid md:grid-cols-3 gap-12">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-slate-100 -z-10"></div>

              {[
                { title: "1. Lookup USDOT", desc: "Enter your DOT number and our AI will instantly pull your latest FMCSA business details.", icon: Search },
                { title: "2. Submit With $0 Upfront", desc: "Review your UCR bracket and submit right away. No upfront service charge is required to start.", icon: Calculator },
                { title: "3. Preview & Pay Later", desc: "Once your UCR certificate is uploaded, preview it in your dashboard and unlock full download with one secure payment.", icon: Download }
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

          {/* WHY CHOOSE US GRID */}
          <section className="bg-slate-50 rounded-3xl p-8 sm:p-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-4">Why Choose Our Smart E-Filing?</h2>
              <p className="text-lg text-[var(--color-muted)]">We offer more than just software. We offer a personal filing assistant.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Official UCR Proof", desc: "We deliver and store your official UCR registration receipt the moment it's processed.", icon: Clock },
                { title: "FMCSA Sync", desc: "Our platform syncs directly with FMCSA records to ensure your fleet count and business data are always accurate.", icon: ShieldCheck },
                { title: "Status Monitoring", desc: "We monitor your UCR status year-round and notify you of any administrative changes to your DOT status.", icon: Users },
                { title: "Secure Portal", desc: "Access your UCR certificates, receipts, and filing history anytime through your secure dashboard.", icon: Lock },
                { title: "Smart Fee Calculator", desc: "Avoid overpaying. Our calculator uses real-time brackets to determine your exact UCR and service fees.", icon: Calculator },
                { title: "Compliance Pro", desc: "Upgrade to UCR Pro for automated annual renewals, deadline reminders, and DOT status monitoring.", icon: LayoutGrid },
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100 group">
                  <feature.icon className="w-10 h-10 text-[var(--color-orange)] mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* HOW IT WORKS - Enhanced with images - Mobile Optimized */}
          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 sm:mb-4">
                  How It Works - Simple & Fast
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)]">
                  Get your Schedule 1 in 3 easy steps
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-1 bg-gradient-to-r from-[var(--color-orange)]/20 via-[var(--color-orange)]/40 to-[var(--color-orange)]/20 -z-10"></div>

                {[
                  {
                    title: "1. Provide Your Information",
                    desc: "Share your business and vehicle details with our team. Simple form takes just 2 minutes to complete.",
                    icon: FileText,
                    image: "/dashboard-mockup-v2.png"
                  },
                  {
                    title: "2. Expert Team Reviews & Files",
                    desc: "Our tax professionals review your information, catch errors, and file with the IRS on your behalf. We handle everything.",
                    icon: ShieldCheck,
                    image: "/smart_filing_features_1764806445772.png"
                  },
                  {
                    title: "3. Receive Your Schedule 1",
                    desc: "We monitor your filing and email your Schedule 1 as soon as the IRS processes it. Usually within 24 hours.",
                    icon: Download,
                    image: "/schedule1-mockup.png"
                  }
                ].map((step, idx) => (
                  <div key={idx} className="relative bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-all group">
                    <div className="absolute -top-5 sm:-top-6 left-1/2 transform -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--color-orange)] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                      {idx + 1}
                    </div>
                    <div className="mt-5 sm:mt-6 mb-4 sm:mb-6 relative h-36 sm:h-48 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-50 mx-auto mb-3 sm:mb-4">
                      <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-navy)]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-2 sm:mb-3 text-center">{step.title}</h3>
                    <p className="text-sm sm:text-base text-[var(--color-muted)] leading-relaxed text-center">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* WHY CHOOSE US - Concierge Service Focus */}
          <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-12 lg:mb-16">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 sm:mb-4">
                  Why Choose Our Concierge Service?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)] max-w-3xl mx-auto">
                  We're not just software - we're your dedicated compliance team. Our experts handle everything so you can focus on driving.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[
                  {
                    title: "Expert Concierge Service",
                    desc: "Our team of tax professionals handles your entire filing from start to finish. You just provide the info, we do the rest.",
                    icon: Users,
                    color: "text-blue-500"
                  },
                  {
                    title: "Free VIN Corrections",
                    desc: "Made a mistake? No problem. We offer FREE VIN corrections and re-files if the IRS rejects your submission.",
                    icon: Edit3,
                    color: "text-green-500"
                  },
                  {
                    title: "Instant SMS Alerts",
                    desc: "Get real-time updates via text message. Know immediately when your Schedule 1 is ready - no email checking needed.",
                    icon: MessageSquare,
                    color: "text-blue-500"
                  },
                  {
                    title: "100% Accuracy Guarantee",
                    desc: "Every filing is double-checked by our expert team. We catch errors before submission and offer free corrections if needed.",
                    icon: ShieldCheck,
                    color: "text-[var(--color-orange)]"
                  },
                  {
                    title: "Smart Tax Calculator",
                    desc: "Calculate exact HVUT amounts with our IRS-backed calculator. Know your tax before you file.",
                    icon: Calculator,
                    color: "text-purple-500"
                  },
                  {
                    title: "Bulk Filing Support",
                    desc: "File for multiple vehicles at once. Upload via CSV or use our bulk entry form. Save time and money.",
                    icon: LayoutGrid,
                    color: "text-indigo-500"
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-lg hover:border-[var(--color-orange)]/30 transition-all group">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                      <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-[var(--color-muted)]">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* GUIDES SECTION - Mobile Optimized */}
          <section className="py-12 sm:py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10 sm:mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 sm:mb-4">
                    Expert Compliance Guides
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)]">
                    Learn everything you need to know about trucking compliance
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
                      <span className="inline-flex rounded-full bg-[var(--color-orange)]/10 text-[var(--color-navy)] px-3 py-1 text-xs font-bold uppercase tracking-wide">
                        {guide.category}
                      </span>
                      <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition-colors line-clamp-2">
                        <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                      </h3>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">{guide.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs font-medium text-[var(--color-muted)] border-t border-slate-200 pt-4">
                      <span>
                        {new Date(guide.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
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

          {/* FINAL CTA SECTION - Mobile Optimized */}
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
                Ready to Simplify Your Compliance?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-slate-200 mb-8 sm:mb-10 leading-relaxed">
                Join thousands of truckers who trust QuickTruckTax. Let our expert team handle your filing - you focus on driving, we handle compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link
                  href="/dashboard/new-filing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-[var(--color-navy)] shadow-xl shadow-orange-500/30 transition hover:bg-[#e66a15] active:scale-95 transform duration-200 touch-manipulation min-h-[48px] sm:min-h-[56px]"
                >
                  Start Filing Now
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-navy)]" />
                </Link>
                <Link
                  href="/tools/hvut-calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-[var(--color-navy)] shadow-lg transition hover:bg-slate-100 active:scale-95 touch-manipulation min-h-[48px] sm:min-h-[56px]"
                >
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                  Calculate Your Tax
                </Link>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-6 sm:mt-8">
                Expert Team • Fast Processing • Free VIN Corrections • 24/7 Support
              </p>
            </div>
          </section>
        </div>
      </>
    </RedirectLoggedInToDashboard>
  );
}
