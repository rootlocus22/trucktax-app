"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { complianceGuides } from "@/lib/guides";
import { 
  ShieldCheck, 
  ChevronRight, 
  Calculator, 
  CheckCircle, 
  Lock, 
  Award, 
  FileText, 
  Download, 
  Clock, 
  Edit3, 
  Users, 
  LayoutGrid, 
  ArrowRight,
  Zap,
  DollarSign,
  Truck,
  FileCheck,
  MessageSquare,
  Star
} from "lucide-react";

const spotlightSlugs = [
  "form-2290-ultimate-guide",
  "ucr-renewal-guide",
  "mcs150-update-guide",
  "ifta-filing-basics",
];

const services = [
  {
    title: "Form 2290 E-Filing",
    description: "File your HVUT tax return in minutes. Get IRS-stamped Schedule 1 instantly.",
    price: "$34.99",
    image: "/schedule1-mockup.png",
    href: "/services/form-2290-filing",
    features: ["Expert Review", "Fast Processing", "Free VIN Corrections"]
  },
  {
    title: "UCR Registration",
    description: "Renew your Unified Carrier Registration quickly and securely.",
    price: "Starting at $10",
    image: "/dashboard-mockup-v2.png",
    href: "/services/ucr-renewal",
    features: ["Fast Processing", "Multi-State Support", "Bulk Renewals"]
  },
  {
    title: "MCS-150 Updates",
    description: "Keep your FMCSA registration current with easy online updates.",
    price: "Free",
    image: "/smart_filing_features_1764806445772.png",
    href: "/services/mcs150-update",
    features: ["Instant Updates", "PDF Generation", "No Paperwork"]
  },
  {
    title: "IFTA Filing",
    description: "File your International Fuel Tax Agreement returns efficiently.",
    price: "Starting at $25",
    image: "/fleet_management_dashboard_1764806426862.png",
    href: "/services/ifta-filing",
    features: ["Multi-State Filing", "Mileage Tracking", "Quick Processing"]
  }
];

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect based on role
    if (!loading && user) {
      if (userData?.role === 'agent') {
        router.push('/agent/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, userData, loading, router]);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'QuickTruckTax',
    url: 'https://www.quicktrucktax.com',
    logo: 'https://www.quicktrucktax.com/quicktrucktax-logo-new.png',
    description: 'QuickTruckTax provides expert concierge services for Form 2290, UCR, MCS-150, and IFTA filing. Our team handles everything for you.',
    sameAs: ['https://twitter.com/quicktrucktax']
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'IRS Form 2290 E-Filing Service (2025-2026)',
    image: 'https://www.quicktrucktax.com/quicktrucktax-logo-new.png',
    description: 'Expert concierge service for Form 2290 (HVUT) filing. Our team handles everything for you.',
    brand: {
      '@type': 'Brand',
      name: 'QuickTruckTax'
    },
    offers: {
      '@type': 'Offer',
      url: 'https://www.quicktrucktax.com/services/form-2290-filing',
      priceCurrency: 'USD',
      price: '34.99',
      priceValidUntil: '2026-12-31',
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
          text: 'File Form 2290 with QuickTruckTax in 3 simple steps: 1) Provide your business and vehicle information, 2) Our expert team reviews and files with the IRS on your behalf, 3) Receive your Schedule 1 via email once processed. Our concierge service costs $34.99 flat fee.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does it cost to file Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuickTruckTax charges a flat fee of $34.99 for our concierge Form 2290 filing service. This includes expert review, IRS filing, error checking, and delivery of your Schedule 1. Free VIN corrections are included if you make a mistake.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long does it take to get Schedule 1 after filing Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'With QuickTruckTax concierge service, our team files your Form 2290 and monitors it 24/7. You typically receive your Schedule 1 within 24 hours of filing. We email it to you as soon as the IRS processes it. Paper filings can take 2-4 weeks.'
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

  // Filter guides based on spotlight slugs
  const spotlightGuides = complianceGuides.filter(guide => 
    spotlightSlugs.includes(guide.slug)
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, productJsonLd, faqJsonLd]) }}
      />

      <div className="flex flex-col">
        {/* HERO SECTION - Enhanced with better imagery - Mobile Optimized */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white min-h-[85vh] sm:min-h-[90vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-truck-sunset.png"
              alt="Heavy-duty truck on highway representing Form 2290 filing"
              fill
              priority
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-12 sm:py-16 lg:py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-orange)]/20 border border-[var(--color-orange)]/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-orange)] backdrop-blur-sm">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="whitespace-nowrap">Expert Concierge Service</span>
              </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] sm:leading-tight tracking-tight text-white">
                  Expert Form 2290 Filing <span className="text-[var(--color-orange)]">Done For You</span>
                  <span className="block mt-2 sm:mt-3 text-blue-200 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">Get Your Schedule 1 Fast</span>
              </h1>
                <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-slate-200 max-w-2xl mx-auto lg:mx-0">
                  Our expert team handles your Form 2290 filing from start to finish. We review, file, and deliver your Schedule 1. 
                  <span className="font-semibold text-white"> Trusted by 10,000+ truckers nationwide.</span>
              </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                    href="/dashboard/new-filing"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-[#e66a15] active:scale-95 transform duration-200 touch-manipulation min-h-[48px] sm:min-h-[56px]"
                >
                    Start Filing Now
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link
                  href="/tools/hvut-calculator"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/20 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-lg font-semibold text-white transition hover:bg-white/20 hover:border-white/30 active:scale-95 touch-manipulation min-h-[48px] sm:min-h-[56px]"
                >
                    <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                    Calculate Tax
                </Link>
              </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-medium text-slate-300 pt-2 sm:pt-4">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" /> 
                    <span>Expert Team Review</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" /> 
                    <span>Free VIN Corrections</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" /> 
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Hero Image/Visual - Responsive */}
              <div className="hidden md:block relative mt-8 lg:mt-0">
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 sm:border-4 border-white/20">
                  <Image
                    src="/schedule1-mockup.png"
                    alt="Schedule 1 document preview"
                    width={600}
                    height={400}
                    className="object-cover w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)]/50 to-transparent" />
            </div>
                {/* Floating Stats Card - Responsive */}
                <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-2xl border-2 border-[var(--color-orange)]/20">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-[var(--color-orange)]/10 rounded-lg p-2 sm:p-3">
                      <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-orange)]" />
                  </div>
                  <div>
                      <p className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">$34.99</p>
                      <p className="text-xs text-[var(--color-muted)]">Flat Fee</p>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BANNER - Mobile Optimized */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-y border-slate-200 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700">Expert Team</span>
                <span className="text-[10px] sm:text-xs text-slate-500">Tax Professionals</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700">Secure & Private</span>
                <span className="text-[10px] sm:text-xs text-slate-500">256-Bit SSL</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-orange)]/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-[var(--color-orange)]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700">100% Accuracy</span>
                <span className="text-[10px] sm:text-xs text-slate-500">Error-Free Filing</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-700">4.9/5 Rating</span>
                <span className="text-[10px] sm:text-xs text-slate-500">10,000+ Reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION - Mobile Optimized */}
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {[
                { value: "10,000+", label: "Truckers Served", icon: Truck },
                { value: "2 min", label: "Avg Filing Time", icon: Zap },
                { value: "99.8%", label: "Success Rate", icon: FileCheck },
                { value: "$34.99", label: "Flat Fee", icon: DollarSign }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow-lg mb-3 sm:mb-4">
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--color-orange)]" />
          </div>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-1 sm:mb-2">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-[var(--color-muted)] font-medium">{stat.label}</p>
                </div>
              ))}
              </div>
          </div>
        </section>

        {/* SERVICES SHOWCASE - Mobile Optimized */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3 sm:mb-4">
                Complete Trucking Compliance Solutions
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-[var(--color-muted)] max-w-2xl mx-auto px-4">
                Everything you need to stay compliant, all in one place
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {services.map((service, idx) => (
                <Link
                  key={idx}
                  href={service.href}
                  className="group bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--color-orange)] transition-all duration-300 active:scale-[0.98] touch-manipulation"
                >
                  <div className="relative h-40 sm:h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[var(--color-orange)] text-white px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      {service.price}
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-orange)] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[var(--color-muted)] text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 text-[var(--color-orange)] font-semibold text-xs sm:text-sm">
                      Learn More <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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

        {/* TESTIMONIAL / SOCIAL PROOF - Mobile Optimized */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[var(--color-midnight)] to-[var(--color-navy)] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-lg sm:text-xl font-bold">4.9/5</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                  Trusted by Thousands of Truckers
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 leading-relaxed">
                  "QuickTruckTax made filing so easy. Their team handled everything - I just provided my info and they took care of the rest. 
                  Got my Schedule 1 the next day. Best service I've used!"
                </p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-base sm:text-lg">Mike Thompson</p>
                    <p className="text-sm sm:text-base text-slate-400">Owner-Operator, 15+ Years</p>
                  </div>
                </div>
              </div>
              <div className="relative mt-8 sm:mt-0">
                <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">10,000+</p>
                      <p className="text-slate-300 text-xs sm:text-sm">Happy Customers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">99.8%</p>
                      <p className="text-slate-300 text-xs sm:text-sm">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">2 min</p>
                      <p className="text-slate-300 text-xs sm:text-sm">Avg Filing Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">24/7</p>
                      <p className="text-slate-300 text-xs sm:text-sm">Support Available</p>
                    </div>
                </div>
                </div>
              </div>
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
                    <span className="inline-flex rounded-full bg-[var(--color-orange)]/10 text-[var(--color-orange)] px-3 py-1 text-xs font-bold uppercase tracking-wide">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-[#e66a15] active:scale-95 transform duration-200 touch-manipulation min-h-[48px] sm:min-h-[56px]"
              >
                Start Filing Now
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
  );
}
