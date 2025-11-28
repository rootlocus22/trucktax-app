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
  LayoutDashboard
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
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-[var(--color-midnight)] text-white">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-truck-premium.png"
              alt="Cinematic semi-truck on highway"
              fill
              priority
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)] via-transparent to-[var(--color-midnight)]/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/80 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 items-center pt-8 pb-8">
            <div className="space-y-6 animate-fade-in-up">
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
                The fastest, most secure way to get your Schedule 1. Built for modern owner-operators and fleets who value their time.
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

              <div className="flex items-center gap-4 text-sm text-white/60 pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-600 border-2 border-[var(--color-midnight)] flex items-center justify-center text-xs font-bold text-white">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p>Trusted by 10,000+ Truckers</p>
              </div>
            </div>

            {/* Dashboard Mockup - Floating Glass Effect */}
            <div className="relative hidden lg:block perspective-1000">
              <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-orange)] to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[var(--color-midnight)]/80 backdrop-blur-xl">
                  <Image
                    src="/dashboard-mockup-premium.png"
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
