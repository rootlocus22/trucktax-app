"use client";

import { useState } from 'react';
import ReceiptUploader from '@/components/ReceiptUploader';
import { calculateIFTA } from '@/lib/ifta-calculator';

export default function IftaCalculatorPage() {
    // State for Trip Entries (Miles per state)
    const [tripEntries, setTripEntries] = useState([
        { id: 1, state: 'CA', miles: '' }
    ]);

    // State for Fuel Purchases
    const [fuelPurchases, setFuelPurchases] = useState([
        { id: 1, state: 'CA', gallons: '', amount: '', date: '' }
    ]);

    const [calculationResult, setCalculationResult] = useState(null);

    // Helper to add empty rows
    const addTripEntry = () => {
        setTripEntries([...tripEntries, { id: Date.now(), state: '', miles: '' }]);
    };

    const addFuelPurchase = () => {
        setFuelPurchases([...fuelPurchases, { id: Date.now(), state: '', gallons: '', amount: '', date: '' }]);
    };

    // Helper to update rows
    const updateTrip = (id, field, value) => {
        setTripEntries(tripEntries.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const updateFuel = (id, field, value) => {
        setFuelPurchases(fuelPurchases.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const [hasScanned, setHasScanned] = useState(false);

    // Handler for AI OCR Data
    const handleOcrData = (data) => {
        if (!data) return;

        setHasScanned(true); // Mark as scanned to reveal full UI in AI flow

        // 1. Prepare New Fuel Entry
        const newFuelEntry = {
            id: Date.now(),
            state: data.state ? data.state.toUpperCase() : '',
            gallons: data.gallons || '',
            amount: data.totalAmount || '',
            date: data.date || ''
        };

        // 2. Compute Next Fuel State
        let nextFuelPurchases = [...fuelPurchases];

        // Prevent duplicate entries
        const isDuplicate = nextFuelPurchases.some(entry =>
            entry.state === newFuelEntry.state &&
            entry.gallons === newFuelEntry.gallons &&
            entry.amount === newFuelEntry.amount &&
            entry.date === newFuelEntry.date
        );

        if (isDuplicate) {
            // Even if duplicate, we might want to ensure the specific view logic triggers, 
            // but for now we just return to avoid double-add.
            // If the user scanned substantially the same thing, we just assume they want to see the current state.
            // We'll still trigger calculation on current state just in case.
        } else {
            // Replace default empty row if it exists
            if (nextFuelPurchases.length === 1 && !nextFuelPurchases[0].gallons && !nextFuelPurchases[0].amount) {
                nextFuelPurchases = [newFuelEntry];
            } else {
                nextFuelPurchases.push(newFuelEntry);
            }
        }

        setFuelPurchases(nextFuelPurchases);

        // 3. Compute Next Trip State (Auto-add state row if missing)
        let nextTripEntries = [...tripEntries];
        if (newFuelEntry.state) {
            const stateExists = nextTripEntries.some(t => t.state === newFuelEntry.state);

            if (!stateExists) {
                // Replace default empty trip row if it exists
                if (nextTripEntries.length === 1 && !nextTripEntries[0].state && !nextTripEntries[0].miles) {
                    nextTripEntries = [{ id: Date.now() + 1, state: newFuelEntry.state, miles: '' }];
                } else {
                    nextTripEntries.push({ id: Date.now() + 1, state: newFuelEntry.state, miles: '' });
                }
            }
        }
        setTripEntries(nextTripEntries);

        // 4. Auto-Calculate Immediately
        // Even if miles are missing, we calculate to show the "Refund" (Tax Paid) status immediately.
        const result = calculateIFTA(nextTripEntries, nextFuelPurchases);
        setCalculationResult(result);
    };

    const handleCalculate = () => {
        // Basic validation
        const validTrips = tripEntries.filter(e => e.state && e.miles);
        const validFuel = fuelPurchases.filter(e => e.state && e.gallons);

        const result = calculateIFTA(validTrips, validFuel);
        setCalculationResult(result);
    };

    const [hasStarted, setHasStarted] = useState(false);
    const [entryMethod, setEntryMethod] = useState(null); // 'ai' or 'manual'
    const [showSidebarScanner, setShowSidebarScanner] = useState(true);

    const handleStart = (method) => {
        setEntryMethod(method);
        setHasStarted(true);
        // Always hide the sidebar scanner initially to keep the UI clean.
        // Users can click "+ Scan Another Receipt" if they need it.
        setShowSidebarScanner(false);
    };

    const handleBack = () => {
        setHasStarted(false);
        setEntryMethod(null);
        setHasScanned(false);
        // We aren't clearing data here to preserve it in case of accidental clicks, 
        // but the view resets to the choice screen.
    };

    return (
        <div className="flex flex-col gap-12 sm:gap-16">
            {/* Header Section - Exact copy of HVUT style */}
            <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-4 py-14 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-6 lg:px-8">
                <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-sky)]/25 blur-3xl" />
                <div className="relative z-10 space-y-6">
                    <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-sand)]">
                        IFTA Fuel Tax Tool
                    </span>
                    <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                        IFTA Fuel Tax Calculator
                    </h1>
                    <p className="text-base leading-7 text-white/80 sm:text-lg">
                        Estimate your quarterly fuel tax liability automatically. Upload fuel receipts to calculate net tax due or refund amounts for each jurisdiction.
                    </p>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                        Rates: Q1 2024 IFTA Tax Rates
                    </p>
                </div>
            </header>

            {!hasStarted ? (
                /* Choice Screen */
                <section className="animate-fade-in grid gap-8 md:grid-cols-2 max-w-4xl mx-auto w-full">
                    {/* AI Option */}
                    <button
                        onClick={() => handleStart('ai')}
                        className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-8 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-navy)]/30"
                    >
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-sky)]/10 blur-2xl transition-all group-hover:bg-[var(--color-sky)]/20" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-navy)]/5 text-3xl text-[var(--color-navy)] shadow-sm group-hover:bg-[var(--color-navy)] group-hover:text-white transition-colors duration-300">
                                📸
                            </div>
                            <h3 className="mb-3 text-2xl font-bold text-[var(--color-text)]">Auto-Scan Receipts</h3>
                            <p className="text-[var(--color-muted)] leading-relaxed mb-6 flex-grow">
                                Upload photos of your fuel receipts. Our AI instantly extracts date, location, gallons, and cost to calculate your tax.
                            </p>
                            <div className="flex items-center text-sm font-bold text-[var(--color-navy)] group-hover:text-[var(--color-orange)] transition-colors">
                                Start AI Scan <span className="ml-2">→</span>
                            </div>
                        </div>
                    </button>

                    {/* Manual Option */}
                    <button
                        onClick={() => handleStart('manual')}
                        className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white p-8 text-left shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-orange)]/30"
                    >
                        <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-orange)]/10 blur-2xl transition-all group-hover:bg-[var(--color-orange)]/20" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-orange)]/10 text-3xl text-[var(--color-orange)] shadow-sm group-hover:bg-[var(--color-orange)] group-hover:text-white transition-colors duration-300">
                                ✍️
                            </div>
                            <h3 className="mb-3 text-2xl font-bold text-[var(--color-text)]">Manual Entry</h3>
                            <p className="text-[var(--color-muted)] leading-relaxed mb-6 flex-grow">
                                Have your trip sheets ready? Manually enter total miles per state and fuel purchase details to get your report.
                            </p>
                            <div className="flex items-center text-sm font-bold text-[var(--color-navy)] group-hover:text-[var(--color-orange)] transition-colors">
                                Enter Manually <span className="ml-2">→</span>
                            </div>
                        </div>
                    </button>
                </section>
            ) : (entryMethod === 'ai' && !hasScanned) ? (
                /* AI Intermediate Step: Focused Uploader */
                <section className="animate-fade-in max-w-3xl mx-auto w-full">
                    <button
                        onClick={handleBack}
                        className="mb-8 group flex items-center text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-navy)] transition-colors pl-1"
                    >
                        <span className="mr-2 inline-block transition-transform group-hover:-translate-x-1">←</span> Back to Options
                    </button>

                    <div className="rounded-3xl border border-[var(--color-border)] bg-white p-10 shadow-2xl shadow-[rgba(15,38,71,0.1)] text-center relative overflow-hidden">
                        {/* Decorative background blob */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 bg-gradient-to-b from-[var(--color-page)] to-transparent opacity-50 -z-10" />

                        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-navy)]/5 text-[var(--color-navy)] shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                            </svg>
                        </div>

                        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-3">Upload Fuel Receipt</h2>
                        <p className="text-[var(--color-muted)] mb-10 max-w-md mx-auto text-lg leading-relaxed">
                            Take a clear photo of your receipt. We'll automatically extract the date, location, gallons, and cost.
                        </p>

                        <div className="max-w-xl mx-auto mb-8">
                            <ReceiptUploader onScanComplete={handleOcrData} />
                        </div>

                        <button
                            onClick={() => setEntryMethod('manual')}
                            className="text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-orange)] transition-colors py-2 px-4 rounded-lg hover:bg-[var(--color-page)]"
                        >
                            Skip & Enter Manually
                        </button>
                    </div>
                </section>
            ) : (
                /* Main Calculator Content - Shown after choice (Manual) or after Scan (AI) */
                <div className="animate-fade-in">
                    <button
                        onClick={handleBack}
                        className="mb-6 group flex items-center text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-navy)] transition-colors"
                    >
                        <span className="mr-2 inline-block transition-transform group-hover:-translate-x-1">←</span> Back to Options
                    </button>

                    <section className="grid gap-10 rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] lg:grid-cols-[1.5fr,1fr] lg:p-10">

                        {/* Left Column: Inputs */}
                        <div className="space-y-8">

                            {/* Trip Logs */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-[var(--color-text)]">Trip Logs (Miles)</h2>
                                    <button
                                        onClick={addTripEntry}
                                        className="text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-orange)] transition-colors"
                                    >
                                        + Add State
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {tripEntries.map((entry) => (
                                        <div key={entry.id} className="grid grid-cols-12 gap-3 items-center">
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    placeholder="State"
                                                    value={entry.state}
                                                    onChange={(e) => updateTrip(entry.id, 'state', e.target.value.toUpperCase())}
                                                    maxLength={2}
                                                    className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30 uppercase"
                                                />
                                            </div>
                                            <div className="col-span-8">
                                                <input
                                                    type="number"
                                                    placeholder="Miles Driven"
                                                    value={entry.miles}
                                                    onChange={(e) => updateTrip(entry.id, 'miles', e.target.value)}
                                                    className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div >

                            <div className="h-px bg-[var(--color-border)]" />

                            {/* Fuel Purchases */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-[var(--color-text)]">Fuel Purchases</h2>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={addFuelPurchase}
                                            className="text-sm font-semibold text-[var(--color-navy)] hover:text-[var(--color-orange)] transition-colors"
                                        >
                                            + Add Fuel
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Labels mimicking HVUT clean minimal look */}
                                    <div className="grid grid-cols-[2fr_3fr_2fr_2fr_auto] gap-2 text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] px-1">
                                        <div>State</div>
                                        <div>Date</div>
                                        <div>Gal</div>
                                        <div>Cost</div>
                                        <div></div>
                                    </div>

                                    {fuelPurchases.map((entry) => (
                                        <div key={entry.id} className="grid grid-cols-[2fr_3fr_2fr_2fr_auto] gap-2 items-center animate-fade-in">
                                            <input
                                                type="text"
                                                placeholder="ST"
                                                value={entry.state}
                                                onChange={(e) => updateFuel(entry.id, 'state', e.target.value.toUpperCase())}
                                                maxLength={2}
                                                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30 uppercase"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Date"
                                                value={entry.date}
                                                onChange={(e) => updateFuel(entry.id, 'date', e.target.value)}
                                                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30"
                                            />
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={entry.gallons}
                                                onChange={(e) => updateFuel(entry.id, 'gallons', e.target.value)}
                                                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30"
                                            />
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={entry.amount}
                                                onChange={(e) => updateFuel(entry.id, 'amount', e.target.value)}
                                                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-base font-normal text-[var(--color-text)] shadow-sm focus:border-[var(--color-sky)] focus:outline-none focus:ring-2 focus:ring-[var(--color-sky)]/30"
                                            />
                                            <div className="flex justify-center w-8">
                                                <button
                                                    onClick={() => setFuelPurchases(current => current.filter(p => p.id !== entry.id))}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                    title="Remove Entry"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-4">
                                    <button
                                        onClick={handleCalculate}
                                        className="w-full rounded-xl bg-[var(--color-orange)] py-3 px-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#ff7a20] hover:shadow-orange-500/30 transform active:scale-[0.98]"
                                    >
                                        Calculate Tax Liability
                                    </button>
                                </div>
                            </div>
                        </div >

                        {/* Right Column: AI & Results */}
                        < div className="space-y-6 h-fit sticky top-24" >

                            {/* AI Scanner Block - Conditional Display */}
                            {
                                showSidebarScanner && (
                                    <div className={`rounded-2xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-[var(--color-border)] p-6 shadow-sm transition-all duration-500 ${entryMethod === 'ai' ? 'ring-2 ring-[var(--color-navy)] ring-offset-2' : ''}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-semibold text-[var(--color-navy)]">AI Receipt Scanner</span>
                                            <span className="rounded bg-[var(--color-navy)] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">New</span>
                                        </div>
                                        <ReceiptUploader onScanComplete={handleOcrData} />
                                    </div>
                                )
                            }
                            {
                                !showSidebarScanner && (
                                    <button
                                        onClick={() => setShowSidebarScanner(true)}
                                        className="w-full rounded-2xl border border-dashed border-[var(--color-border)] p-4 text-center text-sm font-medium text-[var(--color-navy)] hover:bg-[var(--color-page)] transition-colors"
                                    >
                                        + Scan Another Receipt
                                    </button>
                                )
                            }

                            {/* Results Block */}
                            {
                                calculationResult ? (
                                    <div className="space-y-5 rounded-2xl bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] px-6 py-6 text-white shadow-xl shadow-[rgba(10,23,43,0.25)]">
                                        <h3 className="text-lg font-semibold">Tax Calculation Results</h3>
                                        <div className="space-y-4 text-sm">
                                            <div className="flex items-center justify-between border-b border-white/15 pb-3">
                                                <span>Fleet Average MPG</span>
                                                <span className="text-xl font-semibold">{calculationResult.mpg.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Net Tax Due</span>
                                                <div className="text-right">
                                                    <span className={`text-2xl font-bold ${calculationResult.totalTaxDue < 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {calculationResult.totalTaxDue < 0
                                                            ? `($${Math.abs(calculationResult.totalTaxDue).toFixed(2)})`
                                                            : `$${calculationResult.totalTaxDue.toFixed(2)}`
                                                        }
                                                    </span>
                                                    <div className="text-[10px] text-white/60 uppercase tracking-wide">
                                                        {calculationResult.totalTaxDue < 0 ? 'Refund' : 'Balance Owed'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90 max-h-64 overflow-y-auto custom-scrollbar">
                                            <p className="font-semibold text-white mb-2 text-xs uppercase tracking-wide opacity-80">Jurisdiction Detail</p>
                                            {calculationResult.jurisdictionResults.map(res => (
                                                <div key={res.state} className="flex justify-between items-center py-1.5 border-b border-white/10 last:border-0 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold w-6">{res.state}</span>
                                                        <span className="opacity-70">{res.taxRate}</span>
                                                    </div>
                                                    <span className={res.netTax < 0 ? 'text-green-400' : 'text-white'}>
                                                        {res.netTax < 0 ? `($${Math.abs(res.netTax).toFixed(2)})` : `$${res.netTax.toFixed(2)}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center">
                                        <div className="mx-auto w-10 h-10 rounded-full bg-[var(--color-page)] flex items-center justify-center mb-3 text-xl">🚛</div>
                                        <p className="text-sm text-[var(--color-muted)]">
                                            Results will appear here after you enter miles and fuel.
                                        </p>
                                    </div>
                                )
                            }
                        </div >
                    </section >
                </div >
            )
            }
        </div >
    );
}
