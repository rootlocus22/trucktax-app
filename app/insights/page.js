import Image from "next/image";
import Link from "next/link";
import { complianceGuides } from "@/lib/guides";
import usStates from "@/data/us-states.json";

export const metadata = {
  title: "UCR Guides | easyucr.com",
  description:
    "UCR filing guides, renewal deadlines, fee brackets, and compliance tips. Everything you need for Unified Carrier Registration.",
  alternates: {
    canonical: "https://www.easyucr.com/insights",
  },
  openGraph: {
    title: "UCR Guides | easyucr.com",
    description: "UCR filing guides, renewal deadlines, fee brackets, and compliance tips.",
    url: "https://www.easyucr.com/insights",
    siteName: "easyucr.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UCR Guides | easyucr.com",
    description: "UCR filing guides, renewal deadlines, fee brackets, and compliance tips.",
  },
};

const categoryOrder = ["UCR"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "UCR Guides",
  description: "UCR filing guides, renewal deadlines, fee brackets, and compliance tips.",
  url: "https://www.easyucr.com/insights",
  publisher: {
    "@type": "Organization",
    name: "easyucr.com",
  },
};

export default function InsightsIndex() {
  const guidesByCategory = categoryOrder.map((category) => ({
    category,
    guides: complianceGuides.filter((guide) => guide.category === category),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] py-20 lg:py-28 text-white">
        <div className="absolute left-0 top-0 h-60 w-60 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-orange)]/30 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-[1.6fr,1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--color-orange)] border border-white/10">
              UCR guides
            </span>
            <h1 className="text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              UCR filing guides—<span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">renewal, fees, deadlines</span>.
            </h1>
            <p className="text-lg leading-relaxed text-blue-100/90 max-w-2xl">
              Everything you need for Unified Carrier Registration. Updated for 2026 with fee brackets, deadlines, and step-by-step filing tips.
            </p>
            <div className="pt-4">
              <Link
                href="/ucr/file"
                className="inline-flex items-center rounded-xl bg-[var(--color-orange)] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#ff7a20] hover:-translate-y-0.5"
              >
                File UCR Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col gap-20">

        {/* UCR hub CTA */}
        <section className="rounded-3xl border border-[var(--color-orange)]/20 bg-[var(--color-midnight)] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-orange)]/5 to-transparent opacity-50" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[var(--color-orange)] animate-pulse" />
                UCR Filing Due by December 31
              </h2>
              <p className="text-blue-100/80 text-base leading-relaxed">
                All guides, deadlines, and fees in one place. File with $0 upfront and stay compliant with FMCSA regulations.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/ucr/guides"
                className="inline-flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white px-7 py-4 font-bold text-sm hover:bg-white/20 transition min-w-[160px]"
              >
                Explore UCR Guides
              </Link>
              <Link
                href="/ucr/file"
                className="inline-flex items-center justify-center rounded-xl bg-[var(--color-orange)] text-white px-7 py-4 font-bold text-sm hover:bg-[#e66a15] shadow-lg transition hover:-translate-y-0.5 min-w-[160px]"
              >
                Start UCR Filing
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-12 lg:items-start">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">UCR Knowledge Base</h2>
              <div className="space-y-4 text-base leading-relaxed text-slate-600">
                <p>
                  Our guides cover UCR renewal, fee brackets, deadlines, and who needs to file. Updated for 2026.
                </p>
                <p>
                  Whether you're renewing UCR registration or filing for the first time, these guides break down each step clearly.
                </p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-1 divide-y divide-slate-100">
              <div className="pt-0 group">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange)]" />
                  Step-by-Step Instructions
                </h3>
                <p className="text-sm text-slate-500">
                  Clear workflows, fee brackets, and deadline reminders for UCR filing.
                </p>
              </div>
              <div className="pt-6 group">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange)]" />
                  2026 Updated
                </h3>
                <p className="text-sm text-slate-500">
                  Current UCR fee brackets and regulatory requirements.
                </p>
              </div>
              <div className="pt-6 group">
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange)]" />
                  Audit-Ready
                </h3>
                <p className="text-sm text-slate-500">
                  Record-keeping requirements for UCR compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {guidesByCategory.map(({ category, guides }) => (
          <section key={category} className="space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">{category}</h2>
              <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
                {guides.length} Resources
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <article
                  key={guide.slug}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[var(--color-orange)]/30 hover:-translate-y-1 group"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[var(--color-orange)] transition-colors">
                      <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{guide.description}</p>
                  </div>
                  <div className="mt-8 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400 pt-4 border-t border-slate-50">
                    <span>{guide.estimatedReadMinutes} Min Read</span>
                    <span className="text-[var(--color-orange)] group-hover:translate-x-1 transition-transform">Read Guide →</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* State Guides Directory */}
        <section className="space-y-8 pt-12 border-t border-slate-200">
          <div className="flex flex-col gap-4 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">UCR by State</h2>
            <p className="text-lg text-slate-600">
              Find UCR filing info for your base state.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {usStates.map((state) => (
              <Link
                key={state.code}
                href={`/insights/state/${state.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[var(--color-orange)] hover:shadow-md transition-all duration-200"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-black text-slate-400 group-hover:bg-[var(--color-orange)] group-hover:text-white transition-colors">
                  {state.code}
                </span>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-[var(--color-navy)]">
                  {state.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

