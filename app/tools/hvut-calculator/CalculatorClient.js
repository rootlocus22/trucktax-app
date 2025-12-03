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

export default function CalculatorClient() {
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
        <div className="flex flex-col gap-12 sm:gap-16">
            <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-4 py-14 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-6 lg:px-8">
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-sky)]/25 blur-3xl" />
                <div className="relative z-10 space-y-6">
                    <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-sand)]">
                        Form 2290 tool
                    </span>
                    <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                        Form 2290 HVUT Tax Calculator
                    </h1>
                    <p className="text-base leading-7 text-white/80 sm:text-lg">
                        Estimate the heavy vehicle use tax due per vehicle, prorated amounts when you first use a truck mid-season, and the IRS filing deadline. Rates reflect the IRS 2025–2026 HVUT schedule.
                    </p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                        Source: IRS Form 2290 Instructions (Rev. July 2024)
                    </p>
                </div>
            </header>

            <section className="grid gap-10 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] lg:grid-cols-[1.2fr,1fr] lg:p-10">
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-[var(--color-text)]">Vehicle details</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                            Taxable gross weight (lbs)
                            <input
                                type="number"
                                min={55000}
                                max={80000}
                                value={weight || ''}
                                onChange={(event) => setWeight(Number(event.target.value))}
                                className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                            Number of vehicles
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={vehicleCount || ''}
                                onChange={(event) => setVehicleCount(Number(event.target.value) || 0)}
                                className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-[var(--color-text)]">
                            First use month (2025–2026 season)
                            <select
                                value={firstUseMonth}
                                onChange={(event) => setFirstUseMonth(event.target.value)}
                                className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30"
                            >
                                {hvutMonths.map((month) => (
                                    <option key={month.label} value={month.label}>
                                        {month.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-3 text-sm font-medium text-[var(--color-text)] shadow-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-sky)] focus:ring-[var(--color-sky)]"
                                checked={suspended}
                                onChange={(event) => setSuspended(event.target.checked)}
                            />
                            Vehicle qualifies for suspended/low-mileage status (5,000 mi. or less)
                        </label>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-[var(--color-muted)]">
                        {vehicleWeightPresets.map((preset) => (
                            <button
                                key={preset.value}
                                type="button"
                                onClick={() => setWeight(preset.value)}
                                className="rounded-full border border-[var(--color-border)] px-4 py-2 font-semibold text-[var(--color-muted)] transition hover:border-[var(--color-orange)]/70 hover:text-[var(--color-orange)]"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-5 rounded-2xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-6 py-6 text-white shadow-xl shadow-[rgba(10,23,43,0.25)]">
                    <h3 className="text-lg font-semibold">Estimated tax for this vehicle class</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between border-b border-white/15 pb-3">
                            <span>Annual Form 2290 tax</span>
                            <span className="text-lg font-semibold">{formatCurrency(annualTax)}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-white/15 pb-3">
                            <span>Prorated tax (starting {firstUseMonth})</span>
                            <span className="text-lg font-semibold">{formatCurrency(proratedTax)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Total vehicles ({vehicleCount})</span>
                            <span className="text-lg font-semibold">{formatCurrency(totalProratedTax)}</span>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white/12 px-4 py-3 text-sm text-white/80">
                        <p className="font-semibold text-white">Next IRS due date</p>
                        <p className="mt-1">
                            File Form 2290 and pay HVUT by <span className="font-semibold text-[var(--color-amber)]">{dueDate || '—'}</span>.
                        </p>
                        <p className="mt-2 text-xs text-white/70">
                            IRS requires payment in full with filing. Suspended vehicles do not owe tax but must still be listed on the return.
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] lg:grid-cols-2 lg:p-10">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-[var(--color-text)]">IRS HVUT tax table (2025–2026 season)</h2>
                    <p className="text-sm leading-6 text-[var(--color-muted)]">
                        The heavy vehicle use tax is based on the taxable gross weight listed on Schedule 1. Vehicles over 75,000 pounds always pay the maximum of $550 per year.
                    </p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
                    <table className="min-w-full divide-y divide-[var(--color-border)] text-sm">
                        <thead className="bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy-soft)] text-white">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left font-semibold">
                                    Weight category
                                </th>
                                <th scope="col" className="px-4 py-3 text-left font-semibold">
                                    Annual tax
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-[var(--color-card)] text-[var(--color-text)]">
                            {hvutRates.map((rate) => (
                                <tr key={rate.description} className="border-b border-[var(--color-border)] last:border-0">
                                    <td className="px-4 py-3 text-sm font-medium">
                                        {rate.description}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[var(--color-muted)]">
                                        {rate.flatTax
                                            ? formatCurrency(rate.flatTax)
                                            : `${formatCurrency(rate.baseTax)} + ${formatCurrency(rate.perThousandOver)} for each additional 1,000 lbs`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-6 text-sm text-[var(--color-muted)] shadow-lg shadow-[rgba(15,38,71,0.08)] sm:p-8">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">What to do next</h2>
                <ul className="mt-4 space-y-3">
                    <li className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-orange)]" />
                        <span>
                            Gather your EIN, VIN list, and payment preference before e-filing. Use the{' '}
                            <Link href="/insights/form-2290-checklist-download" className="font-semibold text-[var(--color-navy-soft)] hover:text-[var(--color-orange)]">
                                Form 2290 checklist
                            </Link>{' '}
                            to stay organized.
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-orange)]" />
                        <span>
                            Need a reminder? Add the{' '}
                            <Link href="/insights/trucking-compliance-calendar" className="font-semibold text-[var(--color-navy-soft)] hover:text-[var(--color-orange)]">
                                2025 compliance calendar
                            </Link>{' '}
                            to your dispatch team’s planner.
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-orange)]" />
                        <span>
                            Unsure about suspended vehicles? Review our guide on{' '}
                            <Link href="/insights/form-2290-suspended-vehicles" className="font-semibold text-[var(--color-navy-soft)] hover:text-[var(--color-orange)]">
                                low mileage credits and filings
                            </Link>
                            .
                        </span>
                    </li>
                </ul>
                <p className="mt-6 text-xs text-[var(--color-muted)]/70">
                    Disclaimer: This calculator is for educational planning only. Always verify results against the current IRS Form 2290 Instructions and consult a tax professional for specific guidance.
                </p>
            </section>
        </div>
    );
}
