import Link from "next/link";
import Image from "next/image";
import { Calculator, FileText, ShieldCheck, Zap, CheckCircle, Clock, ArrowRight } from "lucide-react";

export const metadata = {
  title: "UCR Fee Calculator & Tools | easyucr.com",
  description:
    "Calculate your UCR fee by fleet size. Free UCR calculator and compliance guides for truckers.",
  alternates: {
    canonical: "https://www.easyucr.com/tools",
  },
  openGraph: {
    title: "UCR Fee Calculator & Tools | easyucr.com",
    description: "Calculate your UCR fee by fleet size. Free UCR calculator for truckers.",
    url: "https://www.easyucr.com/tools",
    siteName: "easyucr.com",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "UCR Fee Calculator & Tools",
  description: "Calculate your UCR fee by fleet size. Free UCR calculator for truckers.",
  url: "https://www.easyucr.com/tools",
  publisher: {
    "@type": "Organization",
    "name": "easyucr.com",
  },
};

const tools = [
  {
    name: "UCR Fee Calculator",
    description:
      "Calculate your UCR fee by fleet size. Official 2026 brackets. See your total cost before you file.",
    href: "/tools/ucr-calculator",
    badge: "Free",
    icon: Calculator,
  },
];

export default function ToolsIndex() {
  return (
    <div className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/4 -translate-y-1/4 rounded-full bg-[var(--color-orange)]/20 blur-3xl opacity-50" />
        <div className="absolute left-0 bottom-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-orange)] border border-white/10">
              UCR Tools
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl tracking-tight">
              Calculate & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">Stay Compliant</span>
            </h1>
            <p className="text-lg leading-relaxed text-blue-100/90 max-w-2xl">
              Use our UCR fee calculator to see your total cost before you file. All-inclusive pricing—one payment, we handle everything.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
        <section>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-8 sm:p-12 shadow-sm">
            <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Why Use easyucr.com Tools?</h2>
                  <div className="h-1 w-20 bg-[var(--color-orange)] rounded-full" />
                </div>
                <div className="space-y-4 text-base leading-relaxed text-slate-600">
                  <p>
                    Managing UCR compliance starts with knowing your fee. Our calculator uses official 2026 brackets to show your exact cost.
                  </p>
                  <p>
                    All-inclusive pricing—one payment, we handle everything.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {[
                  { title: "Official Rates", desc: "2026 UCR fee brackets.", icon: CheckCircle },
                  { title: "Time-Saving", desc: "Instant calculation.", icon: Zap },
                  { title: "Always Ready", desc: "Updated for 2026.", icon: Clock },
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

        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-10 mb-12">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Available Tools</h2>
              <p className="text-lg text-slate-600">UCR compliance helpers.</p>
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
                  Open Calculator <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </section>
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
                Review our comprehensive UCR guides.
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
                href="/ucr/file"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-8 py-4 text-base font-bold !text-white transition-all duration-300 hover:bg-white/10 hover:scale-105 active:scale-95"
              >
                File UCR Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
