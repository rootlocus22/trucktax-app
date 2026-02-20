'use client';

import Link from 'next/link';
import Image from 'next/image';
import { blogPosts as complianceGuides } from '@/app/blog/blogData';
import {
  FileText,
  AlertTriangle,
  RefreshCw,
  Upload,
  CheckCircle,
  ShieldCheck,
  Zap,
  Star,
  Clock,
  CreditCard,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Truck,
  LayoutDashboard,
  Phone,
  Lock,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

const spotlightSlugs = [
  "form-2290-ultimate-guide",
  "ucr-renewal-guide",
  "mcs150-update-guide",
  "ifta-filing-basics",
];

const categoryOrder = [
  "Getting Started",
  "Compliance",
  "Guides",
  "Owner-Operators",
  "Fleet Management",
];

const stats = [
  { label: "HVUT & compliance topics", value: "230+" },
  { label: "2025 deadlines covered", value: "100%" },
  { label: "Actionable templates", value: "15" },
];

const testimonials = [
  {
    name: "John D.",
    role: "Owner-Operator",
    content: "I used to dread filing my 2290. QuickTruckTax made it so simple. I was done in 5 minutes on my phone while waiting for a load.",
    rating: 5
  },
  {
    name: "Sarah M.",
    role: "Fleet Manager",
    content: "The bulk upload feature is a lifesaver for our fleet of 50+ trucks. Saved me hours of typing VINs. Highly recommend!",
    rating: 5
  },
  {
    name: "Mike R.",
    role: "Independent Trucker",
    content: "Fast, cheap, and I got my Schedule 1 instantly. Exactly what I needed to get back on the road.",
    rating: 5
  }
];

const faqs = [
  {
    question: "How long does it take to get my Schedule 1?",
    answer: "In most cases, you will receive your IRS-stamped Schedule 1 within minutes of submitting your return. The IRS processes e-filed returns very quickly."
  },
  {
    question: "Is QuickTruckTax a legitimate service?",
    answer: "Yes. We are a private concierge and technology service. Your data is transmitted securely using encrypted channels. We are not the IRS or any government agency."
  },
  {
    question: "Can I file for multiple vehicles?",
    answer: "Absolutely. You can file for as many vehicles as you need in a single return. For larger fleets, use our Bulk Upload feature to import vehicle details via CSV."
  },
  {
    question: "What if I make a mistake on my filing?",
    answer: "No problem. You can easily file an Amendment (VIN Correction) through our platform to fix any errors on a previously accepted return."
  }
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border border-[var(--color-border)] rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-[var(--color-page-alt)]/30 shadow-sm' : 'bg-white hover:border-[var(--color-orange)]/30'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-6 py-5 text-left focus:outline-none group"
      >
        <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-[var(--color-orange)]' : 'text-[var(--color-text)] group-hover:text-[var(--color-orange)]'}`}>
          {question}
        </span>
        <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[var(--color-orange)] text-white rotate-180' : 'bg-[var(--color-page-alt)] text-[var(--color-muted)] group-hover:bg-[var(--color-orange)]/10 group-hover:text-[var(--color-orange)]'}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-0 text-[var(--color-muted)] leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const spotlightGuides = complianceGuides
    .filter((guide) => spotlightSlugs.includes(guide.id))
    .sort((a, b) => spotlightSlugs.indexOf(a.id) - spotlightSlugs.indexOf(b.id));

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
    url: 'https://quicktrucktax.com',
    logo: 'https://quicktrucktax.com/quicktrucktax-logo-new.png',
    image: 'https://quicktrucktax.com/quicktrucktax-logo-new.png',
    description: 'QuickTruckTax helps carriers, owner-operators, and brokers stay compliant with HVUT, UCR, MCS-150, and fuel tax filings.',
    sameAs: [
      'https://twitter.com/quicktrucktax',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="flex flex-col">
        {/* HERO SECTION - Full Width */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[var(--color-midnight)] text-white w-full">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-truck-premium-v2.png"
              alt="Cinematic semi-truck on highway"
              fill
              priority
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)]/80 via-transparent to-[var(--color-midnight)]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)]/70 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-16 grid lg:grid-cols-2 gap-12 items-center py-16">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-orange)] border border-white/10 shadow-lg">
                <ShieldCheck className="w-4 h-4" />
                Leading Third-Party E-file Provider
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[4.25rem] font-bold leading-[1.1] drop-shadow-2xl tracking-tight">
                File Form 2290 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">
                  In Minutes.
                </span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-[1.375rem] leading-relaxed text-white/80 max-w-xl drop-shadow-md font-normal">
                The fastest, most secure way to get your Schedule 1. No hidden fees, just simple filing for modern owner-operators.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-8 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(255,139,61,0.5)] transition hover:bg-[#ff7a20] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,139,61,0.7)] transform duration-200"
                >
                  Start Filing Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 backdrop-blur-md px-8 py-4 text-lg font-bold text-white transition hover:bg-white/10 hover:border-white/50"
                >
                  Explore Features
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/60 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Instant Schedule 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>US-Based Support</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup - Floating Glass Effect */}
            <div className="relative hidden lg:block perspective-1000">
              <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-orange)] to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[var(--color-midnight)]/80 backdrop-blur-xl">
                  <Image
                    src="/dashboard-mockup-v2.png"
                    alt="QuickTruckTax Dashboard"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 uppercase font-bold">Status</p>
                    <p className="text-white font-bold">Schedule 1 Accepted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rest of sections with gap */}
        <div className="flex flex-col gap-8 sm:gap-12">

          {/* TRUST BAR */}
          <section className="bg-[var(--color-card)] border-y border-[var(--color-border)] py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Replace with actual logos if available, using text/icons for now */}
                <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-text)]"><ShieldCheck className="w-8 h-8 text-[var(--color-navy)]" /> Federal Compliant</div>
                <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-text)]"><Lock className="w-8 h-8 text-[var(--color-navy)]" /> 256-bit SSL</div>
                <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-text)]"><Star className="w-8 h-8 text-[var(--color-navy)]" /> 5-Star Rated</div>
                <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-text)]"><Phone className="w-8 h-8 text-[var(--color-navy)]" /> US Support</div>
              </div>
            </div>
          </section>

          {/* COMPARISON SECTION - "Why Us" */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">Why Drivers Switch to Us</h2>
              <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
                Don't get stuck with hidden fees or slow support. See the difference.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* The Other Guys */}
              <div className="bg-red-50 rounded-3xl p-8 border border-red-100 opacity-80">
                <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
                  <XCircle className="w-6 h-6" /> The Other Guys
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-red-700">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-60" />
                    <span>Hidden fees for "processing" or "transmission"</span>
                  </li>
                  <li className="flex items-start gap-3 text-red-700">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-60" />
                    <span>Outsourced support that doesn't know trucking</span>
                  </li>
                  <li className="flex items-start gap-3 text-red-700">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 opacity-60" />
                    <span>Clunky, outdated interfaces</span>
                  </li>
                </ul>
              </div>

              {/* Us */}
              <div className="bg-[var(--color-navy)] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-orange)] rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                  <CheckCircle className="w-6 h-6 text-[var(--color-orange)]" /> QuickTruckTax
                </h3>
                <ul className="space-y-4 relative z-10">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-orange)] shrink-0 mt-0.5" />
                    <span>Transparent pricing. No hidden fees. Ever.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-orange)] shrink-0 mt-0.5" />
                    <span>100% US-Based Support Team</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-orange)] shrink-0 mt-0.5" />
                    <span>Modern, mobile-first design</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* SERVICES SPOTLIGHT SECTION */}
          <section className="bg-[var(--color-page-alt)] py-20 clip-path-slant">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">Complete Compliance Solutions</h2>
                <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
                  From standard filings to complex amendments, we've got every scenario covered with intelligent features that save you time and money.
                </p>
              </div>

              {/* Feature 1: 2290 Filing */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay z-10"></div>
                  <Image
                    src="/schedule1-mockup.png"
                    alt="Official IRS Schedule 1"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                  {/* Floating Badge */}
                  <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg z-20 flex items-center gap-3 animate-bounce-slow">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">IRS Status</p>
                      <p className="text-gray-900 font-bold">Accepted Instantly</p>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-[var(--color-text)]">Instant Schedule 1</h3>
                  <p className="text-lg text-[var(--color-muted)] leading-relaxed">
                    Stop waiting for the mail. E-file your Form 2290 and get your official IRS-stamped Schedule 1 in minutes. We send it directly to your email, ready to download and print.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-[var(--color-text)]">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Trusted Third-Party E-file Provider</span>
                    </li>
                    <li className="flex items-center gap-3 text-[var(--color-text)]">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Valid for Tags & Registration</span>
                    </li>
                    <li className="flex items-center gap-3 text-[var(--color-text)]">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Support for All Weight Categories (A-W)</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 text-lg group">
                    Start Filing <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>

              {/* Feature 2: Amendment Types - NEW ENHANCED SECTION */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-[var(--color-text)]">Complete Amendment Support</h3>
                  <p className="text-lg text-[var(--color-muted)] leading-relaxed">
                    Life happens. Vehicles change. We handle every type of Form 2290 amendment with precision and clarity, so you stay compliant no matter what.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-2xl">📝</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[var(--color-text)] mb-1">VIN Correction</h4>
                          <p className="text-sm text-[var(--color-muted)] mb-2">Fix incorrect VINs on filed returns</p>
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">FREE - No Tax Due</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-2 border-orange-200 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-2xl">⚖️</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[var(--color-text)] mb-1">Weight Increase</h4>
                          <p className="text-sm text-[var(--color-muted)] mb-2">Report when vehicle moves to higher weight category</p>
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Additional Tax Calculated</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-2xl">🛣️</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[var(--color-text)] mb-1">Mileage Exceeded</h4>
                          <p className="text-sm text-[var(--color-muted)] mb-2">Report suspended vehicles exceeding mileage limits</p>
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Full Tax Applied</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/signup" className="inline-flex items-center text-amber-600 font-bold hover:text-amber-700 text-lg group">
                    File Amendment <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
                <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-purple-600/10 mix-blend-overlay z-10"></div>
                  <Image
                    src="/amendment_types_feature_1764806411271.png"
                    alt="Amendment Types Dashboard"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                </div>
              </div>

              {/* Feature 3: Fleet & Business Management - NEW SECTION */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 relative h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-green-600/10 mix-blend-overlay z-10"></div>
                  <Image
                    src="/fleet_management_dashboard_1764806426862.png"
                    alt="Fleet Management Dashboard"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                    <Truck className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-[var(--color-text)]">Business & Fleet Management</h3>
                  <p className="text-lg text-[var(--color-muted)] leading-relaxed">
                    Manage multiple businesses and unlimited vehicles from one dashboard. Add EINs, track weight categories, monitor suspended vehicles, and keep all your compliance data organized.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-[var(--color-text)]">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Unlimited Business Profiles with EIN Management</span>
                    </li>
                    <li className="flex items-center gap-3 text-[var(--color-text)]">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Vehicle Database with VIN Validation</span>
                    </li>
                    <li className="flex items-center gap-3 text-[var(--color-text)]">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Track Suspended Vehicle Status & Mileage</span>
                    </li>
                    <li className="flex items-center gap-3 text-[var(--color-text)]">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Bulk CSV Upload for Large Fleets</span>
                    </li>
                  </ul>
                  <Link href="/signup" className="inline-flex items-center text-green-600 font-bold hover:text-green-700 text-lg group">
                    Manage Your Fleet <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>

              {/* Feature 4: Smart Filing Features - NEW SECTION */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-[var(--color-text)]">Smart Filing Intelligence</h3>
                  <p className="text-lg text-[var(--color-muted)] leading-relaxed">
                    Our platform works behind the scenes to protect you from errors, save your progress automatically, and give you real-time pricing transparency.
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <h4 className="font-bold text-[var(--color-text)]">Auto-Save Drafts</h4>
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">Never lose your work. We save your progress every 500ms automatically.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <h4 className="font-bold text-[var(--color-text)]">Duplicate Detection</h4>
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">Smart alerts prevent you from filing the same return twice.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-[var(--color-border)] shadow-sm hover:shadow-md transition">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-bold text-[var(--color-text)]">Real-Time Pricing</h4>
                      </div>
                      <p className="text-sm text-[var(--color-muted)]">See exact costs calculated live as you fill out your filing.</p>
                    </div>
                  </div>
                  <Link href="/signup" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 text-lg group">
                    Experience Smart Filing <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
                <div className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                  <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600/10 to-blue-600/10 mix-blend-overlay z-10"></div>
                  <Image
                    src="/smart_filing_features_1764806445772.png"
                    alt="Smart Filing Features"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                </div>
              </div>

              {/* Feature 5: Refund Claims & Support */}
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                  <Image
                    src="/support-team-visual.png"
                    alt="US Based Support Team"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)]/80 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 text-white z-20">
                    <p className="font-bold text-lg">Here to Help</p>
                    <p className="text-white/80">Real people, real answers.</p>
                  </div>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                    <RefreshCw className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-[var(--color-text)]">Refunds & Expert Support</h3>
                  <p className="text-lg text-[var(--color-muted)] leading-relaxed">
                    Sold a vehicle? Destroyed in an accident? Low mileage use? File Form 8849 to claim your HVUT refund. Plus, get help from our 100% US-based support team whenever you need it.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <RefreshCw className="w-6 h-6 text-green-600 mb-2" />
                      <p className="font-bold text-sm">Form 8849 Refund Claims</p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">Get money back for eligible vehicles</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <Phone className="w-6 h-6 text-blue-600 mb-2" />
                      <p className="font-bold text-sm">US-Based Support</p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">Real experts who know trucking</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <Upload className="w-6 h-6 text-purple-600 mb-2" />
                      <p className="font-bold text-sm">Document Upload</p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">Attach supporting PDFs easily</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                      <Lock className="w-6 h-6 text-indigo-600 mb-2" />
                      <p className="font-bold text-sm">Secure Storage</p>
                      <p className="text-xs text-[var(--color-muted)] mt-1">5-year record retention</p>
                    </div>
                  </div>
                  <Link href="/signup" className="inline-flex items-center text-green-600 font-bold hover:text-green-700 text-lg group">
                    File for Refund <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* BENTO GRID FEATURES - Dark Glassmorphism */}
          <section className="bg-[var(--color-midnight)] py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                  Everything You Need. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">Nothing You Don't.</span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  We've stripped away the complexity to give you a filing experience that just works.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                {/* Large Feature - Instant Schedule 1 */}
                <div className="md:col-span-2 bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 transition duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-orange)] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-orange)] to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Instant Schedule 1</h3>
                    <p className="text-white/70 text-lg max-w-md">
                      Get your IRS-stamped proof of payment in minutes. Download it directly to your phone or email it to your carrier.
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[var(--color-orange)] to-red-500 w-[98%] shadow-[0_0_10px_rgba(255,139,61,0.5)]"></div>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-orange)]">98% Faster</span>
                  </div>
                </div>

                {/* Tall Feature - Mobile First */}
                <div className="md:row-span-2 bg-gradient-to-b from-[#1a2c4e] to-[var(--color-midnight)] rounded-3xl p-8 shadow-2xl border border-white/10 hover:border-white/20 transition group relative overflow-hidden">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 border border-blue-500/30">
                      <LayoutDashboard className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Mobile First</h3>
                    <p className="text-white/70 mb-8">
                      Designed for the cab, not the office. File from your iPhone, Android, or tablet with zero friction.
                    </p>

                    {/* Mobile UI Mockup */}
                    <div className="mt-auto relative mx-auto w-full max-w-[240px] transform hover:scale-105 transition duration-500">
                      <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-[#334155] bg-[#0f172a]">
                        <Image
                          src="/mobile_dashboard_mockup.png"
                          alt="Mobile App Interface"
                          width={240}
                          height={480}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature - Business Management */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl hover:bg-white/10 transition duration-300 group">
                  <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 text-green-400 border border-green-500/30 group-hover:scale-110 transition-transform">
                    <Truck className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Business Management</h3>
                  <p className="text-white/60">
                    Manage multiple businesses with EIN tracking and unlimited vehicle profiles.
                  </p>
                </div>

                {/* Feature - Amendment Types */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl hover:bg-white/10 transition duration-300 group">
                  <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">All Amendment Types</h3>
                  <p className="text-white/60">
                    VIN corrections, weight increases, and mileage exceeded - all supported.
                  </p>
                </div>

                {/* Feature - Bulk Upload */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl hover:bg-white/10 transition duration-300 group">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 border border-purple-500/30 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Bulk Vehicle Upload</h3>
                  <p className="text-white/60">
                    Upload your entire fleet via CSV. We handle the parsing and validation instantly.
                  </p>
                </div>

                {/* Feature - Smart Features */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl hover:bg-white/10 transition duration-300 group">
                  <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Smart Intelligence</h3>
                  <p className="text-white/60">
                    Auto-save drafts, duplicate detection, and real-time pricing calculations.
                  </p>
                </div>

                {/* Feature - Document Upload */}
                <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-xl hover:bg-white/10 transition duration-300 group">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Document Upload</h3>
                  <p className="text-white/60">
                    Attach supporting PDFs and keep all your records organized in one place.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS - Visual Timeline */}
          <section className="bg-white py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-[var(--color-text)] mb-4">From Cab to Compliant in 3 Steps</h2>
                <p className="text-xl text-[var(--color-muted)]">Simple, fast, and secure.</p>
              </div>

              <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent z-0"></div>

                <div className="grid md:grid-cols-3 gap-12">
                  {[
                    {
                      icon: <Truck className="w-8 h-8" />,
                      title: "1. Enter Info",
                      desc: "Add your vehicle and business details. We'll guide you through every field.",
                      color: "bg-blue-600",
                      shadow: "shadow-blue-200"
                    },
                    {
                      icon: <CreditCard className="w-8 h-8" />,
                      title: "2. Pay Securely",
                      desc: "Pay the IRS tax and our small service fee securely with any credit card.",
                      color: "bg-[var(--color-orange)]",
                      shadow: "shadow-orange-200"
                    },
                    {
                      icon: <CheckCircle className="w-8 h-8" />,
                      title: "3. Get Schedule 1",
                      desc: "Receive your official IRS-stamped Schedule 1 via email instantly.",
                      color: "bg-green-600",
                      shadow: "shadow-green-200"
                    }
                  ].map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                      <div className={`w-24 h-24 ${step.color} text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl ${step.shadow} transform group-hover:scale-110 transition duration-300 rotate-3 group-hover:rotate-6`}>
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">{step.title}</h3>
                      <p className="text-[var(--color-muted)] leading-relaxed max-w-xs">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-16 text-center">
                <Link href="/signup" className="inline-flex items-center justify-center px-8 py-4 bg-[var(--color-navy)] !text-white font-bold rounded-full hover:bg-[var(--color-midnight)] transition shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Start Your Filing <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS - Dark Premium Grid */}
          <section className="bg-[var(--color-navy)] py-24 relative overflow-hidden clip-path-slant-reverse">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 bg-[url('/hero-truck.svg')] bg-repeat space-x-4"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Join the Fleet</h2>
                <p className="text-xl text-white/70">
                  Thousands of truckers trust us to keep them rolling.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition duration-300 hover:-translate-y-2 shadow-xl">
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-[var(--color-orange)] fill-current drop-shadow-md" />
                      ))}
                    </div>
                    <p className="text-white/90 mb-8 leading-relaxed text-lg italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-orange)] to-red-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-xl">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{testimonial.name}</div>
                        <div className="text-sm text-white/60">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PRICING & FAQ SPLIT */}
          <section className="bg-[var(--color-page)] py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-start">
              {/* Pricing Card - Premium Glow */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-orange)] to-purple-600 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative bg-white rounded-[2rem] p-10 shadow-2xl border border-[var(--color-border)] overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[var(--color-orange)] text-white text-xs font-bold px-4 py-2 rounded-bl-2xl uppercase tracking-widest">
                    Best Value
                  </div>

                  <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2">Simple Pricing</h2>
                  <p className="text-[var(--color-muted)] mb-8">No hidden fees. Pay only when you file.</p>

                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-7xl font-bold text-[var(--color-navy)] tracking-tight">$24.99</span>
                    <span className="text-xl text-[var(--color-muted)]">/ filing</span>
                  </div>

                  <ul className="space-y-5 mb-12">
                    {["Federal Filing Included", "Instant Schedule 1", "Free VIN Corrections", "5-Year Record Storage", "100% US-Based Support"].map((item, i) => (
                      <li key={i} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-lg text-[var(--color-text)]">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className="block w-full py-5 bg-[var(--color-navy)] !text-white text-center font-bold text-xl rounded-xl hover:bg-[var(--color-midnight)] transition shadow-lg hover:shadow-xl hover:scale-[1.02] transform duration-200"
                  >
                    Get Started Now
                  </Link>
                  <p className="text-center text-sm text-[var(--color-muted)] mt-4">
                    Secure credit card payment. No account needed to start.
                  </p>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="pt-8">
                <h2 className="text-3xl font-bold text-[var(--color-text)] mb-8">Common Questions</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-[var(--color-border)] p-1 shadow-sm hover:shadow-md transition duration-300">
                      <FAQItem question={faq.question} answer={faq.answer} />
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/faq" className="inline-flex items-center gap-2 text-[var(--color-navy)] font-bold hover:text-[var(--color-orange)] transition-colors text-lg group">
                    View all FAQs <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SPOTLIGHT GUIDES */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--color-border)] pb-6 mb-10">
              <div>
                <h2 className="text-3xl font-bold text-[var(--color-text)]">Spotlight Guides</h2>
                <p className="mt-2 text-xl text-[var(--color-muted)]">
                  Essential reading for the current tax season.
                </p>
              </div>
              <Link
                href="/insights"
                className="inline-flex items-center text-sm font-bold text-[var(--color-navy-soft)] hover:text-[var(--color-orange)] transition-colors"
              >
                View all insights →
              </Link>
            </div>
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
              {spotlightGuides.map((guide) => (
                <article
                  key={guide.slug}
                  className="flex h-full flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300 group"
                >
                  <div className="space-y-4">
                    <span className="inline-flex rounded-full bg-[var(--color-sand)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-navy)]">
                      {guide.category}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition-colors line-clamp-2">
                      <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                    </h3>
                    <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">{guide.description}</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between text-xs font-medium text-[var(--color-muted)] border-t border-[var(--color-border)] pt-6">
                    <span>
                      {new Date(guide.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/insights/${guide.slug}`}
                      className="text-[var(--color-navy-soft)] group-hover:text-[var(--color-orange)] transition-colors font-bold"
                    >
                      Read Guide →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* FINAL CTA - Premium Impact */}
          <section className="relative overflow-hidden bg-[var(--color-midnight)] py-24">
            <div className="absolute inset-0 bg-[url('/hero-truck.svg')] opacity-5 bg-center bg-cover mix-blend-overlay"></div>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)] via-transparent to-transparent"></div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-8 animate-fade-in-up">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gray-400 border border-[var(--color-midnight)]"></div>
                  ))}
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-[var(--color-orange)] fill-current" />)}
                </div>
                <span className="text-xs font-bold ml-1">Trusted by 10,000+ Truckers</span>
              </div>

              <h2 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight drop-shadow-2xl leading-tight">
                Stop Overpaying. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">Start Filing Smarter.</span>
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                Create your free account in seconds. No credit card required to start.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  href="/signup"
                  className="relative inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-12 py-6 text-xl font-bold text-white shadow-[0_0_40px_rgba(255,139,61,0.6)] transition hover:bg-[#ff7a20] hover:scale-105 transform duration-200 group overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                  <span className="relative flex items-center gap-3">
                    Get Started for Free <ArrowRight className="w-6 h-6" />
                  </span>
                </Link>
                <Link href="/features" className="text-white/70 font-bold hover:text-white transition border-b border-transparent hover:border-white/50 pb-0.5">
                  Explore Features
                </Link>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-center border-t border-white/10 pt-8">
                <div>
                  <h4 className="text-3xl font-bold text-white mb-1">4.9/5</h4>
                  <p className="text-sm text-white/50 uppercase tracking-widest">Average Rating</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-white mb-1">2 Min</h4>
                  <p className="text-sm text-white/50 uppercase tracking-widest">Filing Time</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-white mb-1">24/7</h4>
                  <p className="text-sm text-white/50 uppercase tracking-widest">Support Access</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
