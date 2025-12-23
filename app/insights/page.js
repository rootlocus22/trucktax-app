import Image from "next/image";
import Link from "next/link";
import { complianceGuides } from "@/lib/guides";
import usStates from "@/data/us-states.json";

export const metadata = {
  title: "Trucking Compliance Guides | QuickTruckTax",
  description:
    "Browse detailed guides for Form 2290, UCR, MCS-150, IFTA, and trucking administration tasks. Expert advice for owner-operators and fleet managers.",
  alternates: {
    canonical: "https://www.quicktrucktax.com/insights",
  },
  openGraph: {
    title: "Trucking Compliance Guides | QuickTruckTax",
    description:
      "Browse detailed guides for Form 2290, UCR, MCS-150, IFTA, and trucking administration tasks.",
    url: "https://www.quicktrucktax.com/insights",
    siteName: "QuickTruckTax",
    type: "website",
    images: [
      {
        url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
        width: 1280,
        height: 720,
        alt: "QuickTruckTax Compliance Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trucking Compliance Guides | QuickTruckTax",
    description:
      "Browse detailed guides for Form 2290, UCR, MCS-150, IFTA, and trucking administration tasks.",
    images: ["https://www.quicktrucktax.com/quicktrucktax-logo-new.png"],
  },
};

const categoryOrder = [
  "Form 2290 / HVUT",
  "UCR",
  "FMCSA / MCS-150",
  "IFTA & Fuel Taxes",
  "Business & Administration",
  "Resources",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Trucking Compliance Guides",
  description:
    "Browse detailed guides for Form 2290, UCR, MCS-150, IFTA, and trucking administration tasks.",
  url: "https://www.quicktrucktax.com/insights",
  publisher: {
    "@type": "Organization",
    name: "QuickTruckTax",
    logo: {
      "@type": "ImageObject",
      url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
    },
  },
};

export default function InsightsIndex() {
  const guidesByCategory = categoryOrder.map((category) => ({
    category,
    guides: complianceGuides.filter((guide) => guide.category === category),
  }));

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-4 py-14 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-6 lg:px-8">
        <div className="absolute left-0 top-0 h-60 w-60 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-orange)]/30 blur-3xl" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.6fr,1fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-sand)]">
              Compliance playbooks
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Every filing explained—Form 2290, UCR, MCS-150, IFTA, and more.
            </h1>
            <p className="text-base leading-7 text-white/80 sm:text-lg">
              Explore the QuickTruckTax knowledge base to keep your fleet compliant. Each guide is updated for the 2025 season with practical checklists, timelines, and audit preparation tips.
            </p>
            <Link
              href="/insights/trucking-compliance-calendar"
              className="inline-flex w-fit items-center rounded-full bg-[var(--color-orange)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ff7a20]"
            >
              Download the compliance calendar
            </Link>
          </div>
          <div className="relative h-52 w-full sm:h-64">
            <div className="absolute inset-0 rounded-3xl bg-[var(--color-sky)]/25 blur-3xl" />
            <Image
              src="/hero-truck.svg"
              alt="QuickTruckTax compliance illustration"
              fill
              className="relative rounded-3xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] sm:p-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">Comprehensive Compliance Knowledge Base</h2>
            <p className="text-base leading-7 text-[var(--color-muted)] mb-4">
              Our guides are written by compliance experts and updated annually to reflect the latest IRS regulations, FMCSA requirements, and state-specific rules. Each guide provides actionable steps, real-world examples, and practical checklists to help you navigate complex trucking compliance requirements.
            </p>
            <p className="text-base leading-7 text-[var(--color-muted)]">
              Whether you're filing Form 2290 for the first time, renewing UCR registration, updating your MCS-150, or managing IFTA quarterly returns, these guides break down each process into clear, manageable steps. Many guides include downloadable resources, FAQ sections, and links to official government forms and portals.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-[var(--color-border)]">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Step-by-Step Instructions</h3>
              <p className="text-sm text-[var(--color-muted)]">
                Every guide includes detailed workflows with screenshots, form examples, and deadline reminders to ensure accurate filings.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">2025-2026 Updated</h3>
              <p className="text-sm text-[var(--color-muted)]">
                All guides reflect current tax rates, filing deadlines, and regulatory changes for the current compliance year.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Audit-Ready Documentation</h3>
              <p className="text-sm text-[var(--color-muted)]">
                Learn what records to keep, how long to retain them, and how to organize documentation for IRS or DOT audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {guidesByCategory.map(({ category, guides }) => (
        <section key={category} className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">{category}</h2>
            <span className="text-sm text-[var(--color-muted)]">
              {guides.length} guide{guides.length === 1 ? "" : "s"} available
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {guides.map((guide) => (
              <article
                key={guide.slug}
                className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] transition hover:-translate-y-1 hover:border-[var(--color-sky)]/60 hover:shadow-xl"
              >
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">
                    <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">{guide.description}</p>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[var(--color-muted)]">
                  <span>{guide.estimatedReadMinutes}-minute read</span>
                  <span>•</span>
                  <span>
                    Updated {new Date(guide.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* State Guides Directory */}
      <section className="space-y-6 pt-8 border-t border-[var(--color-border)]">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">State-Specific Filing Guides</h2>
          <p className="text-base text-[var(--color-muted)]">
            Find specific HVUT, IFTA, and registration rules for your base jurisdiction.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {usStates.map((state) => (
            <Link
              key={state.code}
              href={`/insights/state/${state.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-white hover:border-[var(--color-navy)] hover:shadow-md transition"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-[var(--color-navy)] group-hover:bg-[var(--color-navy)] group-hover:text-white transition-colors">
                {state.code}
              </span>
              <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-navy)]">
                {state.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
