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
    question: "Is QuickTruckTax IRS authorized?",
    answer: "Yes, we are an IRS-authorized e-file provider. Your data is transmitted directly to the IRS using secure, encrypted channels."
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
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-4 text-left focus:outline-none group"
      >
        <span className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition-colors">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[var(--color-muted)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--color-muted)]" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-[var(--color-muted)] leading-relaxed">
          {answer}
        </div>
      )}
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

      <div className="flex flex-col gap-8 sm:gap-12">
        {/* HERO SECTION */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[var(--color-midnight)] text-white">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-truck-premium-v2.png"
              alt="Cinematic semi-truck on highway"
              fill
              priority
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)] via-transparent to-[var(--color-midnight)]/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/90 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center pt-8 pb-8">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-orange)] border border-white/10 shadow-lg">
                <ShieldCheck className="w-4 h-4" />
                IRS Authorized E-file Provider
              </div>
              <h1 className="text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl drop-shadow-2xl tracking-tight">
                File Form 2290 <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">
                  In Minutes.
                </span>
              </h1>
              <p className="text-xl leading-8 text-white/80 max-w-xl drop-shadow-md font-light">
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

        {/* TRUST BAR */}
        <section className="bg-[var(--color-card)] border-y border-[var(--color-border)] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Replace with actual logos if available, using text/icons for now */}
              <div className="flex items-center gap-2 font-bold text-xl text-[var(--color-text)]"><ShieldCheck className="w-8 h-8 text-[var(--color-navy)]" /> IRS Authorized</div>
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
                We've reimagined the filing experience to be faster, smarter, and more secure.
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
                    <span>IRS-Authorized E-file Provider</span>
                  </li>
                  <li className="flex items-center gap-3 text-[var(--color-text)]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Valid for Tags & Registration</span>
                  </li>
                </ul>
                <Link href="/signup" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 text-lg group">
                  Start Filing <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            {/* Feature 2: Bulk Upload */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-[var(--color-text)]">Bulk Fleet Management</h3>
                <p className="text-lg text-[var(--color-muted)] leading-relaxed">
                  Managing 25+ trucks? Don't waste hours entering data manually. Upload your entire fleet via CSV and let our system handle the rest. We validate every VIN automatically.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-[var(--color-text)]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>One-Click CSV Import</span>
                  </li>
                  <li className="flex items-center gap-3 text-[var(--color-text)]">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Automatic VIN Validation</span>
                  </li>
                </ul>
                <Link href="/signup" className="inline-flex items-center text-purple-600 font-bold hover:text-purple-700 text-lg group">
                  Upload Your Fleet <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                </Link>
              </div>
              <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/20 to-orange-600/20 mix-blend-overlay z-10"></div>
                <Image
                  src="/bulk-upload-visual.png"
                  alt="Bulk Fleet Upload Visualization"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
            </div>

            {/* Feature 3: Support & Amendments */}
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
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
                  <Phone className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold text-[var(--color-text)]">US-Based Support & Corrections</h3>
                <p className="text-lg text-[var(--color-muted)] leading-relaxed">
                  Made a mistake? Need help with a rejection? Our 100% US-based support team is here to guide you. Plus, file VIN corrections (Amendments) and 8849 Refund claims directly from your dashboard.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <AlertTriangle className="w-6 h-6 text-amber-600 mb-2" />
                    <p className="font-bold text-sm">Free VIN Corrections</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
                    <RefreshCw className="w-6 h-6 text-green-600 mb-2" />
                    <p className="font-bold text-sm">8849 Refund Claims</p>
                  </div>
                </div>
                <Link href="/signup" className="inline-flex items-center text-amber-600 font-bold hover:text-amber-700 text-lg group">
                  Contact Support <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* BENTO GRID FEATURES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-[var(--color-text)] mb-2 tracking-tight">
              Everything You Need. <span className="text-[var(--color-orange)]">Nothing You Don't.</span>
            </h2>
            <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto">
              We've stripped away the complexity to give you a filing experience that just works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
            {/* Large Feature - Instant Schedule 1 */}
            <div className="md:col-span-2 bg-[var(--color-card)] rounded-3xl p-8 border border-[var(--color-border)] shadow-lg hover:shadow-xl transition flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-30 transition"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 text-yellow-600">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">Instant Schedule 1</h3>
                <p className="text-[var(--color-muted)] text-lg max-w-md">
                  Get your IRS-stamped proof of payment in minutes. Download it directly to your phone or email it to your carrier.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 w-[95%]"></div>
                </div>
                <span className="text-sm font-bold text-[var(--color-text)]">98% Faster</span>
              </div>
            </div>

            {/* Tall Feature - Mobile First */}
            <div className="md:row-span-2 bg-[var(--color-midnight)] text-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition flex flex-col relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/hero-truck.svg')] opacity-5 bg-center bg-cover mix-blend-overlay"></div>
              <div className="relative z-10 flex-1">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-[var(--color-orange)]">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Mobile First</h3>
                <p className="text-white/70 mb-8">
                  Designed for the cab, not the office. File from your iPhone, Android, or tablet with zero friction.
                </p>
                <div className="relative h-64 w-full bg-white/5 rounded-t-2xl border-t border-l border-r border-white/10 p-4 backdrop-blur-sm">
                  <div className="w-full h-4 bg-white/10 rounded-full mb-3"></div>
                  <div className="w-2/3 h-4 bg-white/10 rounded-full mb-8"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-[var(--color-orange)] rounded-xl opacity-80"></div>
                    <div className="h-20 bg-white/10 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature - Bulk Upload */}
            <div className="bg-[var(--color-card)] rounded-3xl p-8 border border-[var(--color-border)] shadow-lg hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Bulk Vehicle Upload</h3>
              <p className="text-[var(--color-muted)]">
                Upload your entire fleet via CSV. We handle the parsing and validation instantly.
              </p>
            </div>

            {/* Feature - Amendments */}
            <div className="bg-[var(--color-card)] rounded-3xl p-8 border border-[var(--color-border)] shadow-lg hover:shadow-xl transition group">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">Free Amendments</h3>
              <p className="text-[var(--color-muted)]">
                Made a mistake? Fix VINs or increase weights for free. No hidden correction fees.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS - Timeline Style */}
        <section className="bg-[var(--color-page-alt)] py-12 skew-y-3 -mt-6 mb-0 relative z-0">
          <div className="skew-y-[-3deg] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">From Cab to Compliant in 3 Steps</h2>
            </div>

            <div className="relative">
              {/* Line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-[var(--color-border)] -translate-y-1/2 z-0"></div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: <Truck className="w-6 h-6" />, title: "Enter Info", desc: "Add vehicle & business details." },
                  { icon: <CreditCard className="w-6 h-6" />, title: "Pay Securely", desc: "Pay service fee & IRS tax." },
                  { icon: <CheckCircle className="w-6 h-6" />, title: "Get Schedule 1", desc: "Download stamped proof instantly." }
                ].map((step, i) => (
                  <div key={i} className="relative z-10 bg-[var(--color-card)] p-6 rounded-2xl shadow-lg border border-[var(--color-border)] text-center transform hover:-translate-y-2 transition duration-300">
                    <div className="w-14 h-14 bg-[var(--color-navy)] text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md border-4 border-white">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-1">{step.title}</h3>
                    <p className="text-sm text-[var(--color-muted)]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS - Masonry Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">Join the Fleet</h2>
            <p className="text-lg text-[var(--color-muted)]">
              Thousands of truckers trust us to keep them rolling.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[var(--color-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-border)] hover:shadow-md transition">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[var(--color-orange)] fill-current" />
                  ))}
                </div>
                <p className="text-[var(--color-text)] mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-[var(--color-muted)]">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[var(--color-text)] text-sm">{testimonial.name}</div>
                    <div className="text-xs text-[var(--color-muted)]">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING & FAQ SPLIT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-start">
          {/* Pricing Card */}
          <div className="bg-[var(--color-navy)] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-orange)] rounded-full blur-[100px] opacity-20 -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
              <p className="text-white/70 mb-8">No hidden fees. Pay only when you file.</p>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-6xl font-bold">$24.99</span>
                <span className="text-xl text-white/60">/ filing</span>
              </div>

              <ul className="space-y-4 mb-10">
                {["Federal Filing Included", "Instant Schedule 1", "Free VIN Corrections", "5-Year Record Storage"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[var(--color-orange)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full py-4 bg-white text-[var(--color-navy)] text-center font-bold rounded-xl hover:bg-gray-100 transition shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">Common Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-1">
                  <FAQItem question={faq.question} answer={faq.answer} />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/faq" className="text-[var(--color-navy)] font-bold hover:text-[var(--color-orange)] flex items-center gap-2">
                View all FAQs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SPOTLIGHT GUIDES */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--color-border)] pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">Spotlight Guides</h2>
              <p className="mt-2 text-lg text-[var(--color-muted)]">
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
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {spotlightGuides.map((guide) => (
              <article
                key={guide.slug}
                className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 group"
              >
                <div className="space-y-4">
                  <span className="inline-flex rounded-full bg-[var(--color-sand)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--color-navy)]">
                    {guide.category}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition-colors line-clamp-2">
                    <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed line-clamp-3">{guide.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-[var(--color-muted)] border-t border-[var(--color-border)] pt-4">
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

        {/* FINAL CTA */}
        <section className="relative overflow-hidden bg-[var(--color-midnight)] py-12">
          <div className="absolute inset-0 bg-[url('/hero-truck.svg')] opacity-5 bg-center bg-cover mix-blend-overlay"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">Ready to Roll?</h2>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Join the thousands of smart truckers who save time and money with QuickTruckTax.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-10 py-5 text-xl font-bold text-white shadow-2xl transition hover:bg-[#ff7a20] hover:scale-105 transform duration-200"
              >
                File Your 2290 Now
              </Link>
            </div>
            <p className="mt-8 text-sm text-white/40">
              Secure • IRS Authorized • Instant Schedule 1
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
