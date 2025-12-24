import Link from "next/link";
//trigger build

export const metadata = {
  title: "Compliance Tools | QuickTruckTax",
  description:
    "Interactive HVUT calculators and deadline helpers for Form 2290 and trucking compliance tasks. Free tools for owner-operators.",
  alternates: {
    canonical: "https://www.quicktrucktax.com/tools",
  },
  openGraph: {
    title: "Compliance Tools | QuickTruckTax",
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
    title: "Compliance Tools | QuickTruckTax",
    description:
      "Interactive HVUT calculators and deadline helpers for Form 2290 and trucking compliance tasks.",
    images: ["https://www.quicktrucktax.com/quicktrucktax-logo-new.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Compliance Tools",
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
  },
  {
    name: "Form 2290 Filing Checklist",
    description:
      "Download the step-by-step checklist to prep EIN, VIN details, and payment confirmations before filing.",
    href: "/insights/form-2290-checklist-download",
  },
  {
    name: "2025 Compliance Calendar",
    description:
      "Track HVUT, UCR, IFTA, and estimated tax deadlines with a ready-to-import calendar for your safety team.",
    href: "/insights/trucking-compliance-calendar",
  },
];

export default function ToolsIndex() {
  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-4 py-14 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-6 lg:px-8">
        <div className="absolute right-0 top-0 h-56 w-56 translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-orange)]/30 blur-3xl" />
        <div className="relative z-10 space-y-5">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-sand)]">
            QuickTruckTax tools
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
            Calculate, plan, and stay compliant year-round.
          </h1>
          <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-white/80">
            Use our interactive calculators and downloadable resources to prepare Form 2290 filings, monitor HVUT payments, and organize your compliance workflow.
          </p>
        </div>
      </header>

      <section className="space-y-8">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] sm:p-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-4">Why Use QuickTruckTax Tools?</h2>
              <p className="text-base leading-7 text-[var(--color-muted)] mb-4">
                Managing trucking compliance requires accurate calculations, organized documentation, and timely reminders. Our suite of free tools helps owner-operators, fleet managers, and compliance teams stay ahead of deadlines and avoid costly penalties.
              </p>
              <p className="text-base leading-7 text-[var(--color-muted)]">
                Whether you're calculating HVUT taxes for a new vehicle, preparing documentation for Form 2290 filing, or tracking multiple compliance deadlines across your fleet, these tools provide the precision and organization you need. All calculations are based on current IRS regulations and FMCSA requirements, updated for the 2025-2026 tax year.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-[var(--color-border)]">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">IRS-Backed Calculations</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  All tax calculations use official IRS Form 2290 rates and proration formulas, ensuring accuracy for your filings.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">Time-Saving Resources</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Downloadable checklists and calendars integrate with your existing workflow, reducing preparation time by hours.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--color-text)]">Always Up-to-Date</h3>
                <p className="text-sm text-[var(--color-muted)]">
                  Tools are updated annually to reflect the latest IRS regulations, deadline changes, and compliance requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-6">Available Tools</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {tools.map((tool) => (
              <article
                key={tool.name}
                className="flex h-full flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] transition hover:-translate-y-1 hover:border-[var(--color-amber)]/60 hover:shadow-xl"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-[var(--color-text)]">{tool.name}</h3>
                    {tool.badge ? (
                      <span className="rounded-full bg-[var(--color-sand)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-orange)]">
                        {tool.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm leading-6 text-[var(--color-muted)]">{tool.description}</p>
                </div>
                <Link
                  href={tool.href}
                  className="mt-6 inline-flex w-fit items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--color-navy)] shadow-sm transition hover:bg-[var(--color-orange)] hover:text-white"
                >
                  Open tool →
                </Link>
              </article>
            ))}
          </div>
        </div>

        <section className="rounded-3xl bg-gradient-to-br from-[var(--color-navy)] via-[var(--color-midnight)] to-[#0e2341] px-6 py-10 text-white shadow-xl shadow-[rgba(10,23,43,0.25)] sm:px-10">
          <h2 className="text-2xl font-semibold mb-4">Need More Help?</h2>
          <p className="text-base leading-7 text-white/80 mb-6">
            While our tools provide accurate calculations and helpful resources, complex situations may require professional guidance. Review our comprehensive guides for detailed explanations of Form 2290 filing, UCR requirements, MCS-150 updates, and IFTA compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/insights"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ff7a20]"
              style={{ color: '#ffffff' }}
            >
              Browse All Guides
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              style={{ color: '#ffffff' }}
            >
              Read Latest Articles
            </Link>
          </div>
        </section>
      </section>
    </div>
  );
}
