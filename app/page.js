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
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-4 py-20 text-white shadow-2xl sm:px-6 lg:px-8">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero-truck-sunset.png"
              alt="Cinematic shot of a semi-truck at sunset"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/80 to-transparent" />
          </div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.5fr,1fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-orange)] border border-white/10">
                The #1 Compliance Resource
              </div>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
                Master Form 2290 Filing & Trucking Compliance.
              </h1>
              <p className="text-lg leading-8 text-white/90 sm:text-xl max-w-2xl drop-shadow-md">
                Don't let the IRS or FMCSA slow you down. E-file Form 2290 online and get expert guides for IFTA and UCR filings—all in one place.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/insights/form-2290-ultimate-guide"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#ff7a20] hover:scale-105 transform duration-200"
                >
                  Start Filing Guide
                </Link>
                <Link
                  href="/tools/hvut-calculator"
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition hover:bg-white/20 hover:border-white/50"
                >
                  HVUT Calculator
                </Link>
              </div>

              <dl className="grid gap-6 rounded-2xl bg-black/30 backdrop-blur-md p-8 text-sm sm:grid-cols-3 border border-white/10">
                {stats.map((item) => (
                  <div key={item.label} className="space-y-1 text-center sm:text-left">
                    <dt className="text-[var(--color-sand)] font-medium uppercase tracking-wider text-xs">{item.label}</dt>
                    <dd className="text-3xl font-bold text-white">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="grid gap-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)]/50 p-8 shadow-xl backdrop-blur-sm sm:p-12 md:grid-cols-3">
          {featureHighlights.map((feature) => (
            <article key={feature.title} className="group flex flex-col gap-6 p-4 rounded-2xl transition hover:bg-white/50">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-sand)]/20 group-hover:bg-[var(--color-orange)]/20 transition-colors">
                <Image src={feature.icon} alt={feature.alt} width={32} height={32} className="h-8 w-8 text-[var(--color-orange)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">{feature.title}</h2>
              <p className="text-base leading-7 text-[var(--color-muted)]">{feature.description}</p>
            </article>
          ))}
        </section>

        {/* WHY CHOOSE US (New Content Section) */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/mobile-filing-app.png"
              alt="Trucker using mobile app"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
              Built for the Modern Owner-Operator
            </h2>
            <p className="text-lg text-[var(--color-muted)] leading-relaxed">
              We understand that your office is the cab of your truck. That's why QuickTruckTax is designed to be mobile-first, fast, and jargon-free.
            </p>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">✓</div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text)]">Mobile Optimized</h3>
                  <p className="text-[var(--color-muted)]">E-file Form 2290 and check compliance from your phone, tablet, or laptop.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">✓</div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text)]">Instant Schedule 1</h3>
                  <p className="text-[var(--color-muted)]">Get your stamped Schedule 1 proof in minutes, not weeks.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">✓</div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text)]">Bank-Level Security</h3>
                  <p className="text-[var(--color-muted)]">Your data is protected with 256-bit SSL encryption and secure cloud storage.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* SPOTLIGHT GUIDES */}
        <section className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--color-border)] pb-6">
            <div>
              <h2 className="text-3xl font-bold text-[var(--color-text)]">Spotlight Guides</h2>
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
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {spotlightGuides.map((guide) => (
              <article
                key={guide.slug}
                className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg transition hover:-translate-y-2 hover:shadow-2xl hover:border-[var(--color-orange)]/30 group"
              >
                <div className="space-y-4">
                  <span className="inline-flex rounded-full bg-[var(--color-sand)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[var(--color-navy)]">
                    {guide.category}
                  </span>
                  <h3 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition-colors">
                    <Link href={`/insights/${guide.slug}`}>{guide.title}</Link>
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{guide.description}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-medium text-[var(--color-muted)] border-t border-[var(--color-border)] pt-4">
                  <span>
                    Updated {new Date(guide.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/insights/${guide.slug}`}
                    className="text-[var(--color-navy-soft)] group-hover:text-[var(--color-orange)] transition-colors"
                  >
                    Read Guide →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="space-y-16">
          {categories.map(({ category, guides }) => (
            <div key={category} className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-8 w-2 bg-[var(--color-orange)] rounded-full"></div>
                <h3 className="text-2xl font-bold text-[var(--color-text)]">{category}</h3>
              </div>
              <div className="grid gap-8 md:grid-cols-3">
                {guides.map((guide) => (
                  <article
                    key={guide.slug}
                    className="flex h-full flex-col justify-between rounded-2xl bg-[var(--color-card)] p-8 shadow-md transition hover:shadow-xl hover:bg-white border border-transparent hover:border-[var(--color-border)]"
                  >
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-[var(--color-text)]">
                        <Link href={`/insights/${guide.slug}`} className="hover:text-[var(--color-navy)] transition-colors">
                          {guide.title}
                        </Link>
                      </h4>
                      <p className="text-sm text-[var(--color-muted)] leading-relaxed">{guide.description}</p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[var(--color-muted)]">
                      <span className="bg-[var(--color-page)] px-2 py-1 rounded">{guide.estimatedReadMinutes} min read</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* CTA SECTION */}
        <section className="relative overflow-hidden rounded-3xl bg-[var(--color-navy)] px-6 py-20 text-center text-white shadow-2xl sm:px-12">
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
                href="/tools/hvut-calculator"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-[#ff7a20] hover:scale-105 transform duration-200"
              >
                Calculate Your Tax
              </Link>
              <Link
                href="/insights"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold shadow-lg transition hover:bg-gray-100"
                style={{ color: '#0f2647', backgroundColor: '#ffffff' }}
              >
                Browse Guides
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
