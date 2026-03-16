import Link from "next/link";
import Image from "next/image";
import { FileText, Calendar, Clock, BookOpen, CheckSquare, AlertCircle } from "lucide-react";
export const metadata = {
  title: "UCR Compliance Resources & Guides | easyucr.com",
  description:
    "Free UCR resources: 2026 filing deadlines, fee calculator, renewal guides, and compliance checklists for motor carriers and brokers.",
  alternates: {
    canonical: "https://www.easyucr.com/resources",
  },
  openGraph: {
    title: "UCR Compliance Resources & Guides | easyucr.com",
    description:
      "Essential free tools and guides for UCR registration, fees, and FMCSA compliance.",
    url: "https://www.easyucr.com/resources",
    siteName: "easyucr.com",
    type: "website",
    images: [
      {
        url: "https://www.easyucr.com/quicktrucktax-logo-new.png",
        width: 1280,
        height: 720,
        alt: "easyucr.com Resources",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "UCR Compliance Resources",
  description:
    "Collection of guides, deadlines, and tools for UCR registration and trucking compliance.",
  url: "https://www.easyucr.com/resources",
  publisher: {
    "@type": "Organization",
    name: "easyucr.com",
    logo: {
      "@type": "ImageObject",
      url: "https://www.easyucr.com/quicktrucktax-logo-new.png",
    },
  },
};

const resources = [
  {
    name: "UCR Registration Guide",
    description:
      "Everything you need to know about the Unified Carrier Registration, fees by fleet size, and renewal periods.",
    href: "/insights/ucr-renewal-guide",
    icon: FileText,
    badge: "Essential",
  },
  {
    name: "2026 UCR Filing Deadlines",
    description:
      "When to file, when enforcement starts, and what happens if you miss the December 31 deadline.",
    href: "/insights/ucr-deadlines-penalties-explained",
    icon: Clock,
  },
  {
    name: "2026 UCR Compliance Calendar",
    description:
      "Never miss a date. A full year view of UCR registration window, deadlines, and key dates.",
    href: "/insights/ucr-registration-opens-october-1",
    icon: Calendar,
  },
  {
    name: "Who Needs UCR?",
    description:
      "Unsure if you need to file? Discover exactly who needs UCR—motor carriers, brokers, freight forwarders.",
    href: "/insights/who-needs-ucr-registration",
    icon: CheckSquare,
  },
  {
    name: "Complete 2026 UCR Guide",
    description:
      "The comprehensive handbook on Unified Carrier Registration. Fees, deadlines, and how to file correctly.",
    href: "/insights/complete-guide-ucr-filing-2026",
    icon: BookOpen,
  },
  {
    name: "UCR Penalties & Late Filing",
    description:
      "What happens if you miss the deadline? Fines, roadside detentions, and how to get back in compliance.",
    href: "/insights/ucr-deadlines-penalties-explained",
    icon: AlertCircle,
  },
];

export default function ResourcesIndex() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Section - Full Width Background */}
      <header className="relative bg-[var(--color-midnight)] py-20 lg:py-28 text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80"
            alt="Trucking logistics background"
            fill
            className="object-cover opacity-30 mix-blend-overlay"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)]/90 to-transparent" />
        </div>

        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/4 -translate-y-1/4 rounded-full bg-[var(--color-orange)]/20 blur-3xl opacity-50" />
        <div className="absolute left-0 bottom-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-orange)] border border-white/10">
              Resource Library
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl tracking-tight">
              UCR Guides, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[var(--color-orange-hover)]">Deadlines</span>, & Help
            </h1>
            <p className="text-lg leading-relaxed text-blue-100/90 max-w-2xl">
              Navigating UCR compliance shouldn&apos;t be a mystery. Access our library of free guides, official deadlines, and checklists to keep your fleet compliant.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-10 mb-12">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">UCR Compliance Resources</h2>
              <p className="text-lg text-slate-600">Everything you need to stay on the road.</p>
            </div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest leading-loose">
              {resources.length} Guides & Tools
            </span>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Link
                key={resource.name}
                href={resource.href}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-orange)]/30 hover:shadow-xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[var(--color-midnight)] group-hover:bg-[var(--color-orange)] group-hover:text-white transition-all duration-300 transform group-hover:rotate-6">
                      <resource.icon className="h-6 w-6" />
                    </div>
                    {resource.badge && (
                      <span className="rounded-full bg-[var(--color-orange-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-orange)] border border-[var(--color-orange)]/20">
                        {resource.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[var(--color-orange)] transition-colors">
                      {resource.name}
                    </h3>
                    <p className="text-base leading-relaxed text-slate-600">
                      {resource.description}
                    </p>
                  </div>
                </div>
                <div className="mt-8 flex items-center text-sm font-bold text-[var(--color-orange)] tracking-wide">
                  Access Resource <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Global Secondary CTA */}
      <section className="relative bg-gradient-to-br from-slate-900 to-[var(--color-midnight)] py-12 sm:py-16 text-center overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-orange)] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 mb-2">
              <FileText className="w-6 h-6 text-[var(--color-orange)]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl tracking-tight">
                Need to File Your UCR?
              </h2>
              <p className="text-base text-blue-100/70 max-w-2xl mx-auto leading-relaxed">
                Use our UCR fee calculator to see your exact cost, then file in under 10 minutes. $79 service fee, pay only after your confirmation number is issued.
              </p>
            </div>
            <div className="flex justify-center pt-2 gap-4">
              <Link
                href="/ucr/file"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] text-white px-8 py-4 text-base font-bold shadow-xl transition-all duration-300 hover:bg-[var(--color-orange-hover)] hover:scale-105 active:scale-95"
              >
                <FileText className="w-4 h-4" /> Start UCR Filing
              </Link>
              <Link
                href="/tools/ucr-calculator"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[var(--color-midnight)] px-8 py-4 text-base font-bold shadow-xl transition-all duration-300 hover:bg-slate-100 hover:scale-105 active:scale-95"
              >
                UCR Fee Calculator
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
