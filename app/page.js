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
    features: ["Instant Schedule 1", "Free VIN Corrections", "IRS-Authorized"]
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
    description: 'QuickTruckTax helps carriers file Form 2290, UCR, MCS-150, and IFTA quickly and accurately. Get your IRS Schedule 1 in minutes.',
    sameAs: ['https://twitter.com/quicktrucktax']
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'IRS Form 2290 E-Filing Service (2025-2026)',
    image: 'https://www.quicktrucktax.com/quicktrucktax-logo-new.png',
    description: 'Secure, IRS-authorized E-file provider for Form 2290 (HVUT). Get your Schedule 1 in minutes.',
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
          text: 'File Form 2290 online in 3 steps: 1) Enter your business and vehicle information, 2) We review and submit to the IRS, 3) Receive your IRS-stamped Schedule 1 via email in minutes. E-filing costs $34.99 and takes about 2 minutes to complete.'
        }
      },
      {
        '@type': 'Question',
        name: 'How much does it cost to file Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'QuickTruckTax charges a flat fee of $34.99 to e-file Form 2290. This includes IRS submission, error checking, and instant delivery of your Schedule 1. Free VIN corrections are included if you make a mistake.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long does it take to get Schedule 1 after filing Form 2290?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'With QuickTruckTax e-filing, you receive your IRS-stamped Schedule 1 within minutes of IRS acceptance. Most filings are accepted instantly, and we email your Schedule 1 immediately. Paper filings can take 2-4 weeks.'
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
          text: 'Yes, you can file Form 2290 online through QuickTruckTax. E-filing is faster, more secure, and recommended by the IRS. You get your Schedule 1 instantly instead of waiting weeks for paper processing.'
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
        {/* HERO SECTION - Enhanced with better imagery */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white min-h-[90vh] flex items-center">
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

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 sm:px-12 lg:px-16 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-2 text-sm font-bold uppercase tracking-wider text-blue-300 backdrop-blur-sm">
                  <ShieldCheck className="w-4 h-4" /> IRS-Authorized E-Filing Provider
                </div>
                <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl text-white">
                  File Form 2290 in <span className="text-[var(--color-orange)]">2 Minutes</span>
                  <span className="block mt-2 text-blue-200">Get Schedule 1 Instantly</span>
                </h1>
                <p className="text-xl leading-relaxed text-slate-200 max-w-2xl">
                  The fastest way for truckers to file HVUT, UCR, MCS-150, and IFTA. Trusted by 10,000+ carriers. 
                  <span className="font-semibold text-white"> Save 40% vs competitors.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/dashboard/new-filing"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-8 py-5 text-lg font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-[#e66a15] hover:scale-105 transform duration-200"
                  >
                    Start Filing Now
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/tools/hvut-calculator"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/20 px-8 py-5 text-lg font-semibold text-white transition hover:bg-white/20 hover:border-white/30"
                  >
                    <Calculator className="w-5 h-5" />
                    Calculate Tax
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> 
                    <span>Free VIN Corrections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> 
                    <span>Instant SMS Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> 
                    <span>Schedule 1 in Minutes</span>
                  </div>
                </div>
              </div>

              {/* Hero Image/Visual */}
              <div className="hidden lg:block relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                  <Image
                    src="/schedule1-mockup.png"
                    alt="Schedule 1 document preview"
                    width={600}
                    height={400}
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)]/50 to-transparent" />
                </div>
                {/* Floating Stats Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-2xl border-2 border-[var(--color-orange)]/20">
                  <div className="flex items-center gap-4">
                    <div className="bg-[var(--color-orange)]/10 rounded-lg p-3">
                      <DollarSign className="w-6 h-6 text-[var(--color-orange)]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--color-text)]">$34.99</p>
                      <p className="text-xs text-[var(--color-muted)]">Flat Fee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BANNER */}
        <div className="bg-white border-y border-slate-200 py-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <span className="font-semibold">IRS-Authorized</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">256-Bit SSL</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Award className="w-5 h-5 text-[var(--color-orange)]" />
                <span className="font-semibold">Expert Review</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS SECTION */}
        <section className="bg-gradient-to-r from-slate-50 to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "10,000+", label: "Truckers Served", icon: Truck },
                { value: "2 min", label: "Avg Filing Time", icon: Zap },
                { value: "100%", label: "IRS Acceptance", icon: FileCheck },
                { value: "$34.99", label: "Flat Fee", icon: DollarSign }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
                    <stat.icon className="w-8 h-8 text-[var(--color-orange)]" />
                  </div>
                  <p className="text-3xl font-bold text-[var(--color-text)] mb-2">{stat.value}</p>
                  <p className="text-sm text-[var(--color-muted)] font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES SHOWCASE */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">
                Complete Trucking Compliance Solutions
              </h2>
              <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
                Everything you need to stay compliant, all in one place
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, idx) => (
                <Link
                  key={idx}
                  href={service.href}
                  className="group bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--color-orange)] transition-all duration-300"
                >
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-[var(--color-orange)] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {service.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-orange)] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[var(--color-muted)] text-sm mb-4 line-clamp-2">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {service.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-2 text-[var(--color-orange)] font-semibold text-sm">
                      Learn More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - Enhanced with images */}
        <section className="py-20 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">
                How It Works - Simple & Fast
              </h2>
              <p className="text-xl text-[var(--color-muted)]">
                Get your Schedule 1 in 3 easy steps
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-24 left-[16%] right-[16%] h-1 bg-gradient-to-r from-[var(--color-orange)]/20 via-[var(--color-orange)]/40 to-[var(--color-orange)]/20 -z-10"></div>

              {[
                { 
                  title: "1. Enter Your Information", 
                  desc: "Fill out our simple form with your business and vehicle details. Takes just 2 minutes.", 
                  icon: FileText,
                  image: "/dashboard-mockup-v2.png"
                },
                { 
                  title: "2. We Review & File", 
                  desc: "Our experts check everything for errors and submit directly to the IRS on your behalf.", 
                  icon: ShieldCheck,
                  image: "/smart_filing_features_1764806445772.png"
                },
                { 
                  title: "3. Get Schedule 1 Instantly", 
                  desc: "Receive your IRS-stamped Schedule 1 via email within minutes of IRS acceptance.", 
                  icon: Download,
                  image: "/schedule1-mockup.png"
                }
              ].map((step, idx) => (
                <div key={idx} className="relative bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-[var(--color-orange)] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {idx + 1}
                  </div>
                  <div className="mt-6 mb-6 relative h-48 rounded-xl overflow-hidden bg-slate-100">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mx-auto mb-4">
                    <step.icon className="w-8 h-8 text-[var(--color-navy)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 text-center">{step.title}</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed text-center">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* KEY FEATURES */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">
                Why Truckers Choose QuickTruckTax
              </h2>
              <p className="text-xl text-[var(--color-muted)]">
                More than just software - we're your compliance partner
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  title: "Instant Schedule 1 Delivery", 
                  desc: "We monitor your filing 24/7 and email your Schedule 1 the moment the IRS accepts it. No waiting, no checking.", 
                  icon: Zap,
                  color: "text-yellow-500"
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
                  title: "Expert Review Included", 
                  desc: "Every filing is reviewed by our team before submission. We catch errors before the IRS sees them.", 
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
                <div key={idx} className="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-lg hover:border-[var(--color-orange)]/30 transition-all group">
                  <div className={`w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIAL / SOCIAL PROOF */}
        <section className="py-20 bg-gradient-to-br from-[var(--color-midnight)] to-[var(--color-navy)] text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-xl font-bold">4.9/5</span>
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  Trusted by Thousands of Truckers
                </h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  "QuickTruckTax saved me hours of paperwork. Got my Schedule 1 in minutes, not weeks. 
                  The SMS alerts were a game-changer - I knew exactly when it was ready."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Mike Thompson</p>
                    <p className="text-slate-400">Owner-Operator, 15+ Years</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold mb-2">10,000+</p>
                      <p className="text-slate-300 text-sm">Happy Customers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold mb-2">99.8%</p>
                      <p className="text-slate-300 text-sm">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold mb-2">2 min</p>
                      <p className="text-slate-300 text-sm">Avg Filing Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold mb-2">24/7</p>
                      <p className="text-slate-300 text-sm">Support Available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GUIDES SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12">
              <div>
                <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">
                  Expert Compliance Guides
                </h2>
                <p className="text-xl text-[var(--color-muted)]">
                  Learn everything you need to know about trucking compliance
                </p>
              </div>
              <Link
                href="/insights"
                className="inline-flex items-center gap-2 text-lg font-bold text-[var(--color-orange)] hover:text-[var(--color-navy)] transition-colors group"
              >
                View All Guides <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {spotlightGuides.map((guide) => (
                <article
                  key={guide.slug}
                  className="flex h-full flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl hover:border-[var(--color-orange)]/50 group"
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

        {/* FINAL CTA SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-midnight)] py-24">
          <div className="absolute inset-0">
            <Image
              src="/hero-truck-sunset.png"
              alt="Truck on highway"
              fill
              className="object-cover opacity-10"
            />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Simplify Your Compliance?
            </h2>
            <p className="text-xl text-slate-200 mb-10 leading-relaxed">
              Join thousands of truckers who trust QuickTruckTax. Get your Schedule 1 in minutes, not weeks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/new-filing"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-10 py-5 text-lg font-bold text-white shadow-xl shadow-orange-500/30 transition hover:bg-[#e66a15] hover:scale-105 transform duration-200"
              >
                Start Filing Now
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/tools/hvut-calculator"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-5 text-lg font-bold text-[var(--color-navy)] shadow-lg transition hover:bg-slate-100"
              >
                <Calculator className="w-5 h-5" />
                Calculate Your Tax
              </Link>
            </div>
            <p className="text-sm text-slate-400 mt-8">
              No credit card required • Instant Schedule 1 • Free VIN Corrections
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
