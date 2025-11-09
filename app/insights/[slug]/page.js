import Image from "next/image";
import { notFound } from "next/navigation";
import { complianceGuides } from "@/lib/guides";

function getGuide(slug) {
  return complianceGuides.find((guide) => guide.slug === slug);
}

export function generateStaticParams() {
  return complianceGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    return {};
  }

  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: {
      canonical: `https://quicktrucktax.com/insights/${guide.slug}`,
    },
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: "article",
      url: `https://quicktrucktax.com/insights/${guide.slug}`,
      section: guide.category,
      tags: guide.keywords,
    },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    dateModified: guide.updatedAt,
    datePublished: guide.updatedAt,
    author: {
      "@type": "Organization",
      name: "QuickTruckTax",
    },
    publisher: {
      "@type": "Organization",
      name: "QuickTruckTax",
      logo: {
        "@type": "ImageObject",
        url: "https://quicktrucktax.com/favicon.ico",
      },
    },
    mainEntityOfPage: `https://quicktrucktax.com/insights/${guide.slug}`,
    about: guide.keywords,
  };

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-12">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2),
        }}
      />
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-6 py-12 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-12">
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-sky)]/25 blur-3xl" />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.7fr,1fr] lg:items-center">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-sand)]">
              {guide.category}
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {guide.title}
            </h1>
            <p className="text-base leading-7 text-white/80">{guide.hero}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
              <span>
                Updated {new Date(guide.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{guide.estimatedReadMinutes}-minute read</span>
            </div>
          </div>
          <div className="relative h-52 w-full sm:h-64">
            <div className="absolute inset-0 rounded-3xl bg-[var(--color-orange)]/25 blur-3xl" />
            <Image
              src="/hero-truck.svg"
              alt="QuickTruckTax compliance illustration"
              fill
              className="relative rounded-3xl object-cover"
            />
          </div>
        </div>
      </header>

      <section className="space-y-12">
        <div className="space-y-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] sm:p-10">
          {guide.body.map((section, sectionIndex) => (
            <div key={`${guide.slug}-${sectionIndex}`} className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl">{section.heading}</h2>
              {section.copy.map((paragraph, paragraphIndex) => (
                <p
                  key={`${guide.slug}-${sectionIndex}-${paragraphIndex}`}
                  className="text-base leading-7 text-[var(--color-muted)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          ))}
        </div>

        {guide.faq?.length ? (
          <section className="rounded-3xl bg-gradient-to-br from-[var(--color-navy)] via-[var(--color-midnight)] to-[#0e2341] px-6 py-10 text-white shadow-xl shadow-[rgba(10,23,43,0.25)] sm:px-12">
            <h2 className="text-xl font-semibold sm:text-2xl">Frequently Asked Questions</h2>
            <div className="mt-6 space-y-6">
              {guide.faq.map((item, index) => (
                <div key={`${guide.slug}-faq-${index}`} className="space-y-1">
                  <h3 className="text-base font-semibold text-white">{item.q}</h3>
                  <p className="text-sm leading-6 text-white/80">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>

      <aside className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-6 text-sm text-[var(--color-muted)] shadow-lg shadow-[rgba(15,38,71,0.08)] sm:p-8">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Stay in the loop</h2>
        <p className="mt-2">
          Join our monthly compliance digest to receive Form 2290 reminders, fuel tax updates, and audit checklists.
        </p>
        <p className="mt-4 text-xs text-[var(--color-muted)]/80">
          (Email signup coming soon. For now, bookmark this page or share it with your safety manager.)
        </p>
      </aside>
    </article>
  );
}
