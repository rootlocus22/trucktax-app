import Image from "next/image";
import Link from "next/link";
import { complianceGuides } from "@/lib/guides";

export const metadata = {
  title: "Trucking Compliance Guides",
  description:
    "Browse detailed guides for Form 2290, UCR, MCS-150, IFTA, and trucking administration tasks.",
};

const categoryOrder = [
  "Form 2290 / HVUT",
  "UCR",
  "FMCSA / MCS-150",
  "IFTA & Fuel Taxes",
  "Business & Administration",
  "Resources",
];

export default function InsightsIndex() {
  const guidesByCategory = categoryOrder.map((category) => ({
    category,
    guides: complianceGuides.filter((guide) => guide.category === category),
  }));

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-6 py-14 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-12">
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
    </div>
  );
}
