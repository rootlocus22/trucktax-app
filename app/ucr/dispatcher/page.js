import Link from 'next/link';
import {
  ArrowRight,
  Users,
  FileCheck,
  Calculator,
  ClipboardList,
  Truck,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export const metadata = {
  title: 'File UCR for Multiple Trucks | Dispatcher & Fleet Bulk UCR Filing',
  description:
    'File UCR for multiple clients or your fleet. How dispatchers and fleet managers handle bulk UCR filing for 3–20+ trucks. $0 upfront. Annual checklist: 2290, UCR, MCS-150, IFTA.',
  alternates: {
    canonical: 'https://www.quicktrucktax.com/ucr/dispatcher',
  },
  openGraph: {
    title: 'File UCR for Multiple Trucks | Dispatcher & Bulk UCR',
    description: 'Bulk UCR filing for dispatchers and fleets. File for multiple clients or trucks. $0 upfront.',
    url: 'https://www.quicktrucktax.com/ucr/dispatcher',
  },
};

export default function UcrDispatcherPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-[var(--color-midnight)] text-white py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-blue-200 border border-white/20">
            For Dispatchers &amp; Fleets
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            File UCR for Multiple Trucks or Clients
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
            One registration per carrier—but if you manage multiple carriers or a fleet, we make it simple. File each UCR in minutes with $0 upfront. Pay only when each certificate is ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ucr/file"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e66a15] transition shadow-lg"
            >
              Start UCR Filing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/ucr/guides"
              className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/25 transition"
            >
              UCR Guides
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-16">
        {/* Who it's for */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-[var(--color-orange)]" />
            Who This Is For
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p className="text-lg">
              <strong>Dispatchers and compliance coordinators</strong> who file UCR (and often Form 2290, MCS-150, IFTA) for multiple owner-operators or small carriers. You need a fast, reliable way to get everyone current before the December 31 deadline.
            </p>
            <p>
              <strong>Fleet managers and small trucking companies</strong> with 3–20 power units. You have one UCR registration per legal entity, but you may also handle 2290 and MCS-150 updates for the same business—keeping everything in one workflow saves time and avoids missed deadlines.
            </p>
            <p>
              <strong>Accountants and bookkeepers</strong> who support trucking clients. You already track tax and registration due dates; adding UCR to the annual checklist ensures clients stay compliant and avoid state and federal penalties.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-[var(--color-orange)]" />
            How Dispatchers File UCR for Multiple Clients
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-white font-bold">1</span>
              <div>
                <h3 className="font-semibold text-slate-800">One filing per carrier</h3>
                <p className="text-slate-600 text-sm mt-1">UCR is registered to the legal entity (company or sole proprietor), not per truck. Each client or each company you manage = one UCR filing per registration year.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-white font-bold">2</span>
              <div>
                <h3 className="font-semibold text-slate-800">Use our wizard for each</h3>
                <p className="text-slate-600 text-sm mt-1">Start a new UCR filing for each carrier. Enter their legal name, USDOT, and fee bracket (based on fleet size). No upfront payment—you or the carrier pays only when the UCR certificate is ready to download.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-white border border-slate-200">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)] text-white font-bold">3</span>
              <div>
                <h3 className="font-semibold text-slate-800">Track and deliver certificates</h3>
                <p className="text-slate-600 text-sm mt-1">Once each filing is processed, the certificate is available in the dashboard. Share the link or PDF with the client so they can keep it in their cab and compliance file.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bulk pricing */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6 flex items-center gap-3">
            <Calculator className="w-8 h-8 text-[var(--color-orange)]" />
            UCR Fees &amp; Bulk Pricing for 3–20 Trucks
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              UCR fees are set by the UCR Plan and your state—they vary by <strong>number of power units</strong> (trucks) in the fleet. There is no “bulk discount” from the government; each carrier pays the fee that matches their bracket. QuickTruckTax does not charge upfront: you file, we process, and the carrier (or you on their behalf) pays only when the certificate is ready.
            </p>
            <p>
              For <strong>3–5 trucks</strong>, the typical fee bracket is in the lower tier; for <strong>6–20 trucks</strong>, a higher bracket applies. Use our <Link href="/tools/ucr-calculator" className="text-[var(--color-navy)] font-semibold hover:underline">UCR Fee Calculator</Link> to see the exact amount for each client. Filing multiple carriers is simple: run through the wizard once per carrier and keep a list of USDOT numbers and fee brackets so you can batch your workflow.
            </p>
          </div>
        </section>

        {/* Explain UCR to owner-operators */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6 flex items-center gap-3">
            <Truck className="w-8 h-8 text-[var(--color-orange)]" />
            How to Explain UCR to Owner-Operators
          </h2>
          <div className="prose prose-slate max-w-none text-slate-600">
            <p>
              Many owner-operators confuse UCR with Form 2290 or state registration. In short: <strong>UCR is the annual Unified Carrier Registration</strong> required for anyone operating in interstate commerce. It’s due by December 31 each year; the registration year runs January 1–December 31. If they have a USDOT number and run across state lines, they almost certainly need UCR.
            </p>
            <p>
              You can tell them: “UCR is separate from 2290. You need both. We’ll get your UCR filed so you’re legal—no upfront cost; you pay when your certificate is ready.” Point them to our <Link href="/ucr/guides" className="text-[var(--color-navy)] font-semibold hover:underline">UCR guides</Link> if they want to read more about who must file and deadlines.
            </p>
          </div>
        </section>

        {/* Annual checklist */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[var(--color-orange)]" />
            2290 + UCR + MCS-150 + IFTA Annual Checklist
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <p className="text-slate-600 mb-6">
              Keep your clients (or your fleet) compliant with this order of operations:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Form 2290 (HVUT)</strong> — Due after first use in the new tax year (e.g. September 2 for July use). Required for trucks 55,000+ lbs. QuickTruckTax files 2290 and delivers Schedule 1.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">UCR</strong> — Due by December 31. One registration per carrier (legal entity). File at <Link href="/ucr/file" className="text-[var(--color-navy)] font-semibold hover:underline">QuickTruckTax UCR</Link> with $0 upfront.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">MCS-150 (Biennial Update)</strong> — Due every 24 months from your USDOT registration date. Keeps your DOT record current. We offer <Link href="/services/mcs-150-update" className="text-[var(--color-navy)] font-semibold hover:underline">MCS-150 update</Link> assistance.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">IFTA / IRP</strong> — Fuel and registration credentials vary by state. See our <Link href="/services/ifta-irp" className="text-[var(--color-navy)] font-semibold hover:underline">IFTA & IRP</Link> resources for due dates and renewals.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-[var(--color-navy)] text-white p-8 sm:p-10 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-[var(--color-orange)]" />
          <h2 className="text-2xl font-bold mb-2">Ready to file UCR for your clients or fleet?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            $0 upfront. Pay only when each certificate is ready. File in minutes per carrier.
          </p>
          <Link
            href="/ucr/file"
            className="inline-flex items-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition"
          >
            Start UCR Filing <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
}
