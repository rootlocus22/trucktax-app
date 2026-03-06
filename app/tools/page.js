import Link from "next/link";
import Image from "next/image";
import { Calculator, FileText, Calendar, ShieldCheck, Cpu, Zap, ArrowRight, ExternalLink, Info, CheckCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Interactive Trucking Tax Calculators & Compliance Tools",
  description:
    "Interactive HVUT calculators and deadline helpers for Form 2290 and trucking compliance tasks. Free tools for owner-operators.",
  alternates: {
    canonical: "https://www.quicktrucktax.com/tools",
  },
  openGraph: {
    title: "Interactive Trucking Tax Calculators & Compliance Tools",
    description:
      "Interactive HVUT calculators and deadline helpers for Form 2290 and trucking compliance tasks.",
    url: "https://www.quicktrucktax.com/tools",
    siteName: "QuickTruckTax",
    type: "website",
    images: [
      {
        url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
        width: 1280,
        height: 720,
        alt: "QuickTruckTax Compliance Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Interactive Trucking Tax Calculators & Compliance Tools",
    description:
      "Interactive HVUT calculators and deadline helpers for Form 2290 and trucking compliance tasks.",
    images: ["https://www.quicktrucktax.com/quicktrucktax-logo-new.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Interactive Trucking Tax Calculators & Compliance Tools",
  description:
    "Interactive HVUT calculators and deadline helpers for Form 2290 and trucking compliance tasks.",
  url: "https://www.quicktrucktax.com/tools",
  publisher: {
    "@type": "Organization",
    name: "QuickTruckTax",
    logo: {
      "@type": "ImageObject",
      url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
    },
  },
};

const tools = [
  {
    name: "Form 2290 HVUT Tax Calculator",
    description:
      "Estimate the heavy vehicle use tax owed per vehicle, monthly prorations, and filing due dates based on first use month.",
    href: "/tools/hvut-calculator",
    badge: "New",
    icon: Calculator,
  },
  {
    name: "IFTA Fuel Tax Calculator",
    description:
      "Calculate your quarterly IFTA fuel tax liability automatically. Supports mixed-state mileage and AI receipt scanning.",
    href: "/tools/ifta-calculator",
    badge: "AI Powered",
    icon: Cpu,
  },
  {
    name: "Form 2290 Status Check",
    description:
      "Check the status of your Form 2290 filing instantly. Track pending, accepted, or rejected returns with your EIN.",
    href: "/tools/check-2290-status",
    badge: "Free",
    icon: ShieldCheck,
  },
  {
    name: "Form 2290 Filing Checklist",
    description:
      "Download the step-by-step checklist to prep EIN, VIN details, and payment confirmations before filing.",
    href: "/insights/form-2290-checklist-download",
    icon: FileText,
  },
  {
    name: "2025 Compliance Calendar",
    description:
      "Track HVUT, UCR, IFTA, and estimated tax deadlines with a ready-to-import calendar for your safety team.",
    href: "/insights/trucking-compliance-calendar",
    icon: Calendar,
  },
];

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header - Full Width */}
      <header className="relative bg-[var(--color-midnight)] py-20 lg:py-28 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80"
            alt="Data and calculations background"
            fill
            className="object-cover opacity-20 mix-blend-screen"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)]/90 to-transparent" />
        </div>

        {/* Visual Elements */}
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/4 -translate-y-1/4 rounded-full bg-[var(--color-orange)]/20 blur-3xl opacity-50" />
        <div className="absolute left-0 bottom-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-orange)] border border-white/10">
              Interactive Tools
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl tracking-tight">
              Calculate, Plan, & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">Stay Compliant</span>
            </h1>
            <p className="text-lg leading-relaxed text-blue-100/90 max-w-2xl">
              Use our interactive calculators and downloadable resources to prepare Form 2290 filings, monitor HVUT payments, and organize your compliance workflow.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        {/* Info Section - Premium Card */}
        <section>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-8 sm:p-12 shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-1" />

            <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why Use QuickTruckTax Tools?</h2>
                  <div className="h-1 w-20 bg-[var(--color-orange)] rounded-full" />
                </div>
                <div className="space-y-4 text-base leading-relaxed text-slate-600">
                  <p>
                    Managing trucking compliance requires accurate calculations, organized documentation, and timely reminders. Our suite of tools helps owner-operators and fleet managers stay ahead of deadlines.
                  </p>
                  <p>
                    Whether you're calculating HVUT taxes for a new vehicle or preparing documentation for Form 2290, these tools provide the precision you need. Updated for the 2025-2026 tax year.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {[
                  { title: "IRS-Backed", desc: "Official IRS Form 2290 rates.", icon: CheckCircle },
                  { title: "Time-Saving", desc: "Reduces prep time by hours.", icon: Zap },
                  { title: "Always Ready", desc: "Updated for 2025-2026.", icon: Clock },
                  { title: "Data Secure", desc: "256-bit SSL protection.", icon: ShieldCheck }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[var(--color-orange)]">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tool Cards Grid */}
        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-10 mb-12">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Available Tools</h2>
              <p className="text-lg text-slate-600">Interactive helpers for every compliance task.</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {tools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-orange)]/30 hover:shadow-xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[var(--color-midnight)] group-hover:bg-[var(--color-orange)] group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                      <tool.icon className="h-7 w-7" />
                    </div>
                    {tool.badge && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-orange)] border border-orange-100">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[var(--color-orange)] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-base leading-relaxed text-slate-600">
                      {tool.description}
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-center text-sm font-bold text-[var(--color-orange)] tracking-wide">
                  Open Interactive Tool <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Need Help CTA - Full Width Background Section */}
      </main>

      <section className="relative bg-gradient-to-br from-slate-900 to-[var(--color-midnight)] py-16 sm:py-20 text-center overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-orange)] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl tracking-tight">
                Need More Help?
              </h2>
              <p className="text-lg text-blue-100/70 leading-relaxed max-w-2xl mx-auto">
                While our tools provide accurate calculations, complex situations may require professional guidance. Review our comprehensive guides.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/insights"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[var(--color-midnight)] px-8 py-4 text-base font-bold shadow-xl transition-all duration-300 hover:bg-[var(--color-sand)] hover:scale-105 active:scale-95"
              >
                <FileText className="w-5 h-5 text-[var(--color-orange)]" /> Browse All Guides
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-8 py-4 text-base font-bold !text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95"
              >
                Latest Articles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
