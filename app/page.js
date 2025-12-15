import Image from "next/image";
import Link from "next/link";
import { complianceGuides } from "@/lib/guides";
import { ShieldCheck, ChevronRight, Calculator, CheckCircle, Lock, Award, FileText, Download, Clock, Edit3, Users, LayoutGrid, ArrowRight } from "lucide-react";

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

const featureHighlights = [
  {
    title: "Interactive Calculators",
    description:
      "Model Form 2290 HVUT taxes, prorations, and filing deadlines in seconds with IRS-backed datasets. No more guessing.",
    icon: "/window.svg",
    alt: "Calculator icon",
  },
  {
    title: "Step-by-Step Guidance",
    description:
      "Follow proven playbooks for IRS and FMCSA filings, written specifically for owner-operators and fleet managers.",
    icon: "/file.svg",
    alt: "Document icon",
  },
  {
    title: "Actionable Reminders",
    description:
      "Use calendars, checklists, and timelines to stay ahead of every Form 2290, UCR, and IFTA deadline.",
    icon: "/globe.svg",
    alt: "Globe icon",
  },
];

const stats = [
  { label: "HVUT & compliance topics", value: "230+" },
  { label: "2025 deadlines covered", value: "100%" },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="flex flex-col gap-20 sm:gap-24">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-[var(--color-midnight)] text-white shadow-2xl">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-truck-sunset.png"
              alt="Heavy-duty truck on highway at sunset representing fast Form 2290 filing"
              fill
              priority
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/90 to-transparent" />
          </div>

          <div className="relative z-10 px-6 py-20 sm:px-12 lg:px-16 grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
                <ShieldCheck className="w-4 h-4" /> Premium Filing Concierge Service
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-white">
                We File Form 2290 & Get Your <span className="text-[var(--color-orange)]">Schedule 1</span>.
              </h1>
              <p className="text-lg leading-8 text-slate-300 max-w-xl">
                The easiest way to handle your Heavy Vehicle Use Tax. Our experts review and transmit your return for you to ensure glitch-free compliance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/services/form-2290-filing"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-orange)] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#e66a15] hover:scale-105 transform duration-200"
                >
                  Start Concierge Filing
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/tools/hvut-calculator"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/20"
                >
                  <Calculator className="w-5 h-5" />
                  Tax Calculator
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm font-medium text-slate-400 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" /> Expert Manual Review
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" /> Fast Schedule 1 Delivery
                </div>
              </div>
            </div>

            {/* Hero Stats/Trust Card */}
            <div className="hidden lg:block relative">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-4xl font-bold text-white mb-1">4.9/5</p>
                    <p className="text-sm text-slate-400">Customer Rating</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-[var(--color-orange)]">24h</p>
                    <p className="text-sm text-slate-400">Turnaround Time</p>
                  </div>
                  <div className="col-span-2 border-t border-white/10 pt-6">
                    <p className="text-sm text-slate-300 italic">"They handled everything for me. I just sent my info and got my Schedule 1 back same day."</p>
                    <p className="text-xs text-slate-500 mt-2 font-bold uppercase">– Mike T., Owner-Operator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST BANNER */}
        <div className="bg-white border-y border-slate-100 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Trusted by Industry Leaders & Independent Truckers</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos - replace with SVGs or text for now */}
              <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> McAfee SECURE</span>
              <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><Lock className="w-6 h-6" /> 256-Bit SSL</span>
              <span className="text-2xl font-black text-slate-800 flex items-center gap-2"><Award className="w-6 h-6" /> Expert CPA Review</span>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="py-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-4">Get Compliant in 3 Simple Steps</h2>
            <p className="text-lg text-[var(--color-muted)]">No complicated software. We do the heavy lifting for you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-slate-100 -z-10"></div>

            {[
              { title: "1. Submit Info", desc: "Send us your business and vehicle details via our secure form. It takes 2 minutes.", icon: FileText },
              { title: "2. We File For You", desc: "Our experts review your data for errors and transmit it to the IRS on your behalf.", icon: Users },
              { title: "3. Get Schedule 1", desc: "We email you the official IRS-stamped Schedule 1 as soon as it's accepted.", icon: Download }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="w-24 h-24 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center mb-6 text-[var(--color-navy)]">
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">{step.title}</h3>
                <p className="text-[var(--color-muted)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE US GRID */}
        <section className="bg-slate-50 rounded-3xl p-8 sm:p-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-4">Why Choose Our Concierge Service?</h2>
            <p className="text-lg text-[var(--color-muted)]">We offer more than just software. We offer a personal filing assistant.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Fast Schedule 1", desc: "We monitor your filing status constantly and forward your Schedule 1 the moment it arrives.", icon: Clock },
              { title: "Error-Free Guarantee", desc: "Our experts manually review your VINs and weights before filing to prevent IRS rejections.", icon: ShieldCheck },
              { title: "US-Based Support", desc: "Talk to a real person. Our tax experts are right here in the USA ready to answer questions.", icon: Users },
              { title: "Secure Transmission", desc: "We use authorized channels to transmit your data securely to government agencies.", icon: Lock },
              { title: "Smart Tax Calculator", desc: "Don't guess your tax. We calculate the exact HVUT amount for you based on IRS rules.", icon: Calculator },
              { title: "All-in-One Compliance", desc: "We can handle your 2290s, UCR registrations, and MCS-150 updates for you completely.", icon: LayoutGrid },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100 group">
                <feature.icon className="w-10 h-10 text-[var(--color-orange)] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">{feature.title}</h3>
                <p className="text-[var(--color-muted)] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COMPREHENSIVE SEO CONTENT SECTION - BEAUTIFIED */}
        <section className="py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 space-y-12">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">The Ultimate Guide to Form 2290</h2>
                <p className="text-xl text-[var(--color-muted)] leading-relaxed">
                  Running a trucking business is hard work. Filing your taxes shouldn't be. QuickTruckTax simplifies the Heavy Vehicle Use Tax (HVUT) process so you can focus on the road.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">What is Form 2290?</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed">
                    A federal excise tax return filed by owners of heavy highway vehicles with a <strong>taxable gross weight of 55,000 lbs or more</strong>. The funds support highway maintenance.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-[var(--color-orange)] mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Who Needs to File?</h3>
                  <ul className="space-y-2 text-[var(--color-muted)]">
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" /> Owners of vehicles 55,000+ lbs.</li>
                    <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" /> Vehicles driving 5,000+ miles/year (7,500 for ag).</li>
                  </ul>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className="h-10 w-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Key Deadlines</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed">
                    <strong>July 1 - June 30</strong> tax year. File by <strong>August 31st</strong> for existing vehicles. For new trucks, file by the end of the month following the month of first use.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">What is Schedule 1?</h3>
                  <p className="text-[var(--color-muted)] leading-relaxed">
                    Your mandatory proof of payment for DMV registration. We deliver your <strong>IRS-stamped Schedule 1</strong> digitally just minutes after the IRS accepts your return.
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-8 rounded-2xl flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-white rounded-full text-blue-600 shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-900 mb-2">Pro Tip: E-File for Speed</h4>
                  <p className="text-blue-800 leading-relaxed">
                    The IRS strongly recommends e-filing. Paper returns can take weeks, but a concierge service like ours gets you your result instantly. Don't risk DMV delays—file online.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar / CTA Box */}
            <div className="lg:w-1/3 bg-[var(--color-midnight)] text-white p-8 rounded-2xl sticky top-24 shadow-xl ring-1 ring-white/10">
              <h3 className="text-2xl font-bold mb-4">Ready to File?</h3>
              <p className="text-slate-300 mb-8">
                Get your Schedule 1 in minutes for as low as <strong>$34.99</strong>.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Instant IRS Audit Check</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Secure Data Encryption</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> Free Re-files for Rejections</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400" /> US-Based Support</li>
              </ul>
              <Link
                href="/services/form-2290-filing"
                className="flex w-full items-center justify-center rounded-xl bg-[var(--color-orange)] py-4 font-bold text-white transition hover:bg-[#e66a15] hover:shadow-lg hover:scale-[1.02]"
              >
                Start Concierge Filing
              </Link>
              <p className="text-xs text-center mt-4 text-slate-500">
                Terms & Conditions apply.
              </p>
            </div>
          </div>
        </section>

        {/* SPOTLIGHT GUIDES (Keep existing structure but enhance visibility) */}
        <section className="space-y-8 py-12 border-t border-[var(--color-border)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text)]">Trucking Insights & Guides</h2>
              <p className="mt-2 text-lg text-[var(--color-muted)]">
                Expert knowledge to keep your fleet compliant and your costs down.
              </p>
            </div>
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-orange)] hover:text-[var(--color-navy)] transition-colors group"
            >
              View all 200+ Guides <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {spotlightGuides.map((guide) => (
              <article
                key={guide.slug}
                className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-orange)]/30 group"
              >
                <div className="space-y-4">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--color-navy)]">
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

        {/* CTA SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-[var(--color-navy)] px-6 py-20 text-center text-white shadow-2xl sm:px-12 my-12">
          <div className="absolute inset-0 bg-[url('/hero-truck.svg')] opacity-10 bg-center bg-no-repeat bg-cover mix-blend-overlay"></div>
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Simplify Your Compliance?
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              Join thousands of truckers who trust QuickTruckTax for their HVUT, IFTA, and UCR needs. Get started today and drive with peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services/form-2290-filing"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#ff7a20] hover:scale-105 transform duration-200"
              >
                Start Free Filing Account
              </Link>
              <Link
                href="/tools/hvut-calculator"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold !text-blue-900 shadow-lg transition hover:bg-slate-100"
                style={{ color: '#1e3a8a' }}
              >
                Try Tax Calculator
              </Link>
            </div>
            <p className="text-xs text-white/40 mt-6">*No credit card required to sign up.</p>
          </div>
        </section>
      </div>
    </>
  );
}
