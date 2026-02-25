'use client';

/**
 * Phase 2 E-E-A-T: Clear "we are not the government" disclaimer.
 * Use on UCR filing page, UCR hub, and key compliance pages.
 */
export default function GovernmentDisclaimer({ className = '', compact = false }) {
  if (compact) {
    return (
      <p className={`text-xs text-slate-500 ${className}`}>
        QuickTruckTax is not affiliated with FMCSA or DOT. Independent filing service.
      </p>
    );
  }
  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 ${className}`}>
      <p className="font-medium text-slate-700">Independent filing service</p>
      <p className="mt-0.5">
        QuickTruckTax is not affiliated with the FMCSA, DOT, IRS, or any government agency. We are a private third-party provider that helps you complete your UCR and compliance filings.
      </p>
    </div>
  );
}
