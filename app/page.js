import Image from "next/image";
import Link from "next/link";
import { complianceGuides } from "@/lib/guides";

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
    title: "Interactive calculators",
    description:
      "Model Form 2290 HVUT taxes, prorations, and filing deadlines in seconds with IRS-backed datasets.",
    icon: "/window.svg",
  },
  {
    title: "Step-by-step guidance",
    description:
      "Follow proven playbooks for IRS and FMCSA filings, written for owner-operators and fleet managers.",
    icon: "/file.svg",
  },
  {
    title: "Actionable reminders",
    description:
      "Use calendars, checklists, and timelines to stay ahead of every Form 2290, UCR, and IFTA deadline.",
    icon: "/globe.svg",
  },
];

const stats = [
  { label: "HVUT & compliance topics", value: "23+" },
  { label: "2025 deadlines covered", value: "100%" },
  { label: "Actionable templates", value: "10" },
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

  return (
    <div className="flex flex-col gap-16 sm:gap-20">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-6 py-14 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-12">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 top-12 h-48 w-48 rounded-full bg-[var(--color-orange)]/20 blur-3xl" />
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.6fr,1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-sand)]">
              Trusted HVUT knowledge
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
              QuickTruckTax keeps your trucks compliant—without the paperwork chaos.
            </h1>
            <p className="text-base leading-7 text-white/80 sm:text-lg">
              Explore expert-written guides covering Heavy Vehicle Use Tax (Form 2290), Unified Carrier Registration, MCS-150 updates, and IFTA filings. Stay informed, prepared, and ready for every audit.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/insights/form-2290-ultimate-guide"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ff7a20]"
              >
                Start with Form 2290 Guide
              </Link>
              <Link
                href="/tools/hvut-calculator"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Open HVUT calculator
              </Link>
              <Link
                href="/insights"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Browse all insights
              </Link>
            </div>
            <dl className="grid gap-4 rounded-2xl bg-white/10 p-6 text-sm sm:grid-cols-3 sm:text-left">
              {stats.map((item) => (
                <div key={item.label} className="space-y-1 text-center sm:text-left">
                  <dt className="text-[var(--color-sand)]">{item.label}</dt>
                  <dd className="text-2xl font-semibold text-white">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative h-56 w-full sm:h-72 lg:h-80">
            <div className="absolute inset-0 rounded-3xl bg-[var(--color-sky)]/20 blur-3xl" />
            <Image
              src="/hero-truck.svg"
              alt="Illustration of a compliant trucking fleet dashboard"
              fill
              priority
              className="relative rounded-3xl object-cover"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]/95 p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] backdrop-blur sm:p-10 md:grid-cols-3">
        {featureHighlights.map((feature) => (
          <article key={feature.title} className="flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-sand)]/80">
              <Image src={feature.icon} alt="" width={28} height={28} className="h-7 w-7 text-[var(--color-orange)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{feature.title}</h2>
            <p className="text-sm leading-6 text-[var(--color-muted)]">{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Spotlight guides</h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              High-impact reads to keep compliance on schedule this quarter.
            </p>
          </div>
          <Link
            href="/insights"
            className="inline-flex items-center text-sm font-medium text-[var(--color-navy-soft)] hover:text-[var(--color-orange)]"
          >
            View all insights →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {spotlightGuides.map((guide) => (
            <article
              key={guide.slug}
              className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] transition hover:-translate-y-1 hover:border-[var(--color-amber)]/60 hover:shadow-xl"
            >
              <div className="space-y-3">
                <span className="inline-flex rounded-full bg-[var(--color-sand)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-orange)]">
                  {guide.category}
                </span>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                </h3>
                <p className="text-sm text-[var(--color-muted)]">{guide.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-[var(--color-muted)]">
                <span>
                  Updated {new Date(guide.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Link
                  href={`/insights/${guide.slug}`}
                  className="font-semibold text-[var(--color-navy-soft)] hover:text-[var(--color-orange)]"
                >
                  Read guide
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-10">
        {categories.map(({ category, guides }) => (
          <div key={category} className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl">{category}</h3>
              <span className="text-sm text-[var(--color-muted)]">
                {guides.length} guide{guides.length === 1 ? "" : "s"} curated for you
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {guides.map((guide) => (
                <article
                  key={guide.slug}
                  className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] transition hover:-translate-y-1 hover:border-[var(--color-sky)]/60 hover:shadow-xl"
                >
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-[var(--color-text)]">
                      <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                    </h4>
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
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-[var(--color-navy)] via-[var(--color-midnight)] to-[#0e2341] px-8 py-12 text-white shadow-xl shadow-[rgba(10,23,43,0.25)] sm:px-16">
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Stay ahead of every compliance deadline.
            </h2>
            <p className="text-sm leading-6 text-white/80">
              Sign up for the QuickTruckTax digest (coming soon) to receive Form 2290 reminders, safety audit tips, and new template drops. In the meantime, bookmark your favorite guides and share them with dispatch and safety teams.
            </p>
          </div>
          <div className="relative">
            <div className="rounded-2xl bg-white/15 p-6 text-sm text-white/85">
              <p className="font-semibold text-white">Next steps</p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-amber)]" />
                  Download the Form 2290 checklist before the July rush.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-amber)]" />
                  Add the 2025 compliance calendar to your shared planner.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-amber)]" />
                  Share guides with drivers who manage their own HVUT filings.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
