'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getHvutAnnualTax,
  getHvutProratedTax,
  getHvutDueDate,
  hvutMonths,
  hvutRates,
} from '@/lib/hvutRates';

const vehicleWeightPresets = [
  { label: 'Single truck – 55,000 lbs', value: 55000 },
  { label: 'Day cab – 60,000 lbs', value: 60000 },
  { label: 'Sleeper + trailer – 75,000 lbs', value: 75000 },
  { label: 'Heavy haul – 80,000 lbs', value: 80000 },
];

function formatCurrency(amount) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function HvutCalculatorPage() {
  const [weight, setWeight] = useState(60000);
  const [vehicleCount, setVehicleCount] = useState(1);
  const [firstUseMonth, setFirstUseMonth] = useState(hvutMonths[0].label);
  const [suspended, setSuspended] = useState(false);

  const annualTax = useMemo(() => {
    if (suspended) {
      return 0;
    }
    return getHvutAnnualTax(weight);
  }, [weight, suspended]);

  const proratedTax = useMemo(() => {
    if (suspended) {
      return 0;
    }
    return getHvutProratedTax(weight, firstUseMonth);
  }, [weight, firstUseMonth, suspended]);

  const dueDate = useMemo(
    () => getHvutDueDate(firstUseMonth),
    [firstUseMonth],
  );

  const totalAnnualTax = annualTax * vehicleCount;
  const totalProratedTax = proratedTax * vehicleCount;

  return (
    <div className="flex flex-col gap-12 sm:gap-16 max-w-5xl mx-auto">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-6 py-16 text-white shadow-2xl shadow-[rgba(10,23,43,0.3)] sm:px-10 lg:px-12 text-center sm:text-left">
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-sky)]/20 blur-[100px]" />
        <div className="absolute left-0 bottom-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-[var(--color-orange)]/10 blur-[80px]" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          <span className="inline-flex rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-orange)] border border-white/10 shadow-lg">
            Form 2290 Tool
          </span>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl tracking-tight">
            HVUT Tax Calculator
          </h1>
          <p className="text-lg leading-relaxed text-white/80 sm:text-xl font-light max-w-2xl">
            Instantly estimate your heavy vehicle use tax. Accurate rates for the 2025–2026 tax season, including prorated calculations.
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.5fr,1fr] gap-8 items-start">
        {/* Input Section */}
        <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 shadow-xl shadow-[rgba(15,38,71,0.05)]">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-8 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-navy)] text-white text-sm">1</span>
            Vehicle Details
          </h2>

          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">
                  Taxable Gross Weight
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={55000}
                    max={80000}
                    value={weight || ''}
                    onChange={(event) => setWeight(Number(event.target.value))}
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] pl-4 pr-12 py-4 text-lg font-medium text-[var(--color-text)] shadow-sm transition focus:border-[var(--color-orange)] focus:outline-none focus:ring-4 focus:ring-[var(--color-orange)]/10"
                    placeholder="60000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--color-muted)]">
                    lbs
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">
                  Number of Vehicles
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={vehicleCount || ''}
                  onChange={(event) => setVehicleCount(Number(event.target.value) || 0)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-4 text-lg font-medium text-[var(--color-text)] shadow-sm transition focus:border-[var(--color-orange)] focus:outline-none focus:ring-4 focus:ring-[var(--color-orange)]/10"
                />
              </div>

              <div className="space-y-3 sm:col-span-2">
                <label className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wide">
                  First Used Month
                </label>
                <div className="relative">
                  <select
                    value={firstUseMonth}
                    onChange={(event) => setFirstUseMonth(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-page)] px-4 py-4 text-lg font-medium text-[var(--color-text)] shadow-sm transition focus:border-[var(--color-orange)] focus:outline-none focus:ring-4 focus:ring-[var(--color-orange)]/10 cursor-pointer"
                  >
                    {hvutMonths.map((month) => (
                      <option key={month.label} value={month.label}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-muted)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </div>
                </div>
                <p className="text-xs text-[var(--color-muted)] mt-2">
                  Select the month the vehicle was first driven on public highways during the tax period (July - June).
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--color-border)]">
              <label className="flex items-start gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-page)]/50 hover:bg-[var(--color-page)] transition cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer h-6 w-6 rounded border-[var(--color-border)] text-[var(--color-orange)] focus:ring-[var(--color-orange)]/30 cursor-pointer"
                    checked={suspended}
                    onChange={(event) => setSuspended(event.target.checked)}
                  />
                </div>
                <div className="flex-1">
                  <span className="block font-bold text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition-colors">
                    Suspended Vehicle (Category W)
                  </span>
                  <span className="block text-sm text-[var(--color-muted)] mt-1">
                    Select if vehicle is expected to travel 5,000 miles or less (7,500 for agriculture). No tax due.
                  </span>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider">Quick Select Weight</span>
              <div className="flex flex-wrap gap-2">
                {vehicleWeightPresets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setWeight(preset.value)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${weight === preset.value
                        ? 'bg-[var(--color-navy)] text-white shadow-md transform scale-105'
                        : 'bg-[var(--color-page)] text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results Section - Sticky on Desktop */}
        <div className="lg:sticky lg:top-8 space-y-6">
          <section className="rounded-3xl bg-[var(--color-navy)] text-white shadow-2xl overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-orange)] rounded-full blur-[100px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

            <div className="p-8 relative z-10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm">2</span>
                Estimated Tax
              </h3>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">Annual Tax Rate</span>
                    <span className="font-medium">{formatCurrency(annualTax)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                    <span className="text-white/70 text-sm">Prorated ({firstUseMonth})</span>
                    <span className="font-medium">{formatCurrency(proratedTax)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Total Due</span>
                    <span className="text-4xl font-bold text-[var(--color-orange)] tracking-tight">
                      {formatCurrency(totalProratedTax)}
                    </span>
                  </div>
                  <div className="text-right text-xs text-white/50 mt-1">
                    for {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="bg-[var(--color-midnight)]/50 rounded-xl p-4 border border-white/5">
                  <div className="flex gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-orange)]/20 flex items-center justify-center text-[var(--color-orange)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--color-orange)] uppercase tracking-wide mb-1">Filing Deadline</p>
                      <p className="font-bold text-lg">{dueDate || '—'}</p>
                      <p className="text-xs text-white/60 mt-1">
                        File by this date to avoid penalties.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/signup"
                  className="flex items-center justify-center w-full py-4 bg-[var(--color-orange)] text-white font-bold rounded-xl hover:bg-[#ff7a20] transition shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02] transform duration-200"
                >
                  File Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </Link>
                <p className="text-center text-xs text-white/40 mt-3">
                  Secure e-filing • IRS Authorized
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="grid gap-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-10 shadow-lg shadow-[rgba(15,38,71,0.05)]">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">IRS Tax Rate Table (2025–2026)</h2>
          <p className="text-[var(--color-muted)] leading-relaxed">
            The heavy vehicle use tax is determined by the taxable gross weight of your vehicle.
            Vehicles over 75,000 pounds are capped at the maximum rate.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--color-border)]">
              <thead className="bg-[var(--color-page-alt)]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                    Weight Category
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-[var(--color-text)] uppercase tracking-wider">
                    Annual Tax
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-card)] divide-y divide-[var(--color-border)]">
                {hvutRates.map((rate, index) => (
                  <tr key={rate.description} className={`transition hover:bg-[var(--color-page)]/50 ${index % 2 === 0 ? 'bg-white' : 'bg-[var(--color-page)]/20'}`}>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                      {rate.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-muted)]">
                      {rate.flatTax
                        ? <span className="font-bold text-[var(--color-navy)]">{formatCurrency(rate.flatTax)}</span>
                        : <span>{formatCurrency(rate.baseTax)} <span className="text-[var(--color-muted)] font-normal">+ {formatCurrency(rate.perThousandOver)} / 1,000 lbs over 55k</span></span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-[var(--color-page-alt)] p-8 border border-[var(--color-border)]">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Next Steps</h2>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-orange)] flex items-center justify-center text-white text-xs font-bold">1</div>
                <span className="text-[var(--color-muted)]">
                  Gather your <strong className="text-[var(--color-text)]">EIN</strong> and <strong className="text-[var(--color-text)]">VINs</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-orange)] flex items-center justify-center text-white text-xs font-bold">2</div>
                <span className="text-[var(--color-muted)]">
                  Create a free account on QuickTruckTax.
                </span>
              </li>
              <li className="flex gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-orange)] flex items-center justify-center text-white text-xs font-bold">3</div>
                <span className="text-[var(--color-muted)]">
                  E-file in minutes and receive your Schedule 1 instantly.
                </span>
              </li>
            </ul>
          </div>
          <div className="flex-1 bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm">
            <h3 className="font-bold text-[var(--color-text)] mb-2">Need Help?</h3>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Our US-based support team is ready to assist you with any questions about weight categories or filing.
            </p>
            <Link href="/contact" className="text-[var(--color-navy)] font-bold text-sm hover:text-[var(--color-orange)] transition flex items-center gap-1">
              Contact Support <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-[var(--color-muted)]/60 border-t border-[var(--color-border)] pt-4">
          Disclaimer: This calculator is for educational planning only. Always verify results against the current IRS Form 2290 Instructions.
        </p>
      </section>
    </div>
  );
}
