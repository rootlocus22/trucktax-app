import Link from "next/link";

export const metadata = {
  title: "Compliance Tools",
  description:
    "Interactive HVUT calculators and deadline helpers for Form 2290 and trucking compliance tasks.",
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
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-6 py-14 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-12">
        <div className="absolute right-0 top-0 h-56 w-56 translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-orange)]/30 blur-3xl" />
        <div className="relative z-10 space-y-5">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-sand)]">
            QuickTruckTax tools
          </span>
          <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Calculate, plan, and stay compliant year-round.
          </h1>
          <p className="text-base leading-7 text-white/80 sm:text-lg">
            Use our interactive calculators and downloadable resources to prepare Form 2290 filings, monitor HVUT payments, and organize your compliance workflow.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <article
            key={tool.name}
            className="flex h-full flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] transition hover:-translate-y-1 hover:border-[var(--color-amber)]/60 hover:shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">{tool.name}</h2>
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
              className="mt-6 inline-flex w-fit items-center rounded-full bg-[var(--color-navy-soft)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-orange)]"
            >
              Open tool →
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
