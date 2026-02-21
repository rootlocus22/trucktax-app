'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getUcrFee, UCR_FEE_BRACKETS_2026, UCR_ENTITY_TYPES, UCR_SERVICE_PLANS } from '@/lib/ucr-fees';
import DiscountedPrice from '@/components/DiscountedPrice';
import { Calculator, ArrowRight, Truck, Building2 } from 'lucide-react';

export default function UcrCalculatorClient() {
  const [entityType, setEntityType] = useState('carrier');
  const [powerUnits, setPowerUnits] = useState('');
  const [plan, setPlan] = useState('filing');

  const unitsNum = Math.max(0, Math.floor(Number(powerUnits) || 0));
  const { fee: ucrFee } = getUcrFee(unitsNum, entityType);
  const servicePrice = UCR_SERVICE_PLANS[plan]?.price ?? 79;
  const total = ucrFee + servicePrice;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">UCR Fee Calculator</h1>
        <p className="text-[var(--color-muted)]">Official 2026 brackets. See your UCR fee and total with our service.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Your details</h2>

          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Entity type</label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-[var(--color-text)] bg-white mb-6 focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent"
          >
            {UCR_ENTITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label} – {t.description}</option>
            ))}
          </select>

          {(entityType === 'carrier') && (
            <>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Number of power units (commercial motor vehicles)</label>
              <input
                type="number"
                min="0"
                value={powerUnits}
                onChange={(e) => setPowerUnits(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-[var(--color-text)] mb-6 focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent"
              />
            </>
          )}

          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Service plan</label>
          <div className="space-y-3">
            {Object.entries(UCR_SERVICE_PLANS).map(([key, p]) => (
              <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] cursor-pointer hover:bg-slate-50">
                <input type="radio" name="plan" value={key} checked={plan === key} onChange={() => setPlan(key)} className="text-[var(--color-orange)]" />
                <span className="font-medium text-[var(--color-text)]">{p.name} – {p.originalPrice != null ? <DiscountedPrice price={p.price} originalPrice={p.originalPrice} /> : `$${p.price}`}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="bg-[var(--color-midnight)] text-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5" /> Your estimate
          </h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-white/90">
              <span>UCR registration fee (2026)</span>
              <span className="font-semibold text-white">${ucrFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-white/90 items-center">
              <span>{UCR_SERVICE_PLANS[plan]?.name}</span>
              <span className="font-semibold text-white">{UCR_SERVICE_PLANS[plan]?.originalPrice != null ? <DiscountedPrice price={servicePrice} originalPrice={UCR_SERVICE_PLANS[plan].originalPrice} className="[&_.line-through]:text-white/60 [&_.text-slate-400]:text-white/60 [&_.text-emerald-600]:text-[var(--color-orange)] [&_.bg-emerald-50]:bg-white/20" /> : `$${servicePrice}`}</span>
            </div>
            <div className="border-t border-white/20 pt-4 flex justify-between text-lg">
              <span>Total</span>
              <span className="font-bold text-[var(--color-orange)]">${total.toLocaleString()}</span>
            </div>
          </div>
          <Link
            href="/ucr/file"
            className="block w-full text-center bg-[var(--color-orange)] hover:bg-[#e66a15] text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            Start UCR Filing <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-white/60 mt-4 text-center">Fee calculation is based on official UCR brackets. Service fee is separate.</p>
        </div>
      </div>

      {/* Fee table */}
      <div className="mt-12 bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <h3 className="text-lg font-semibold text-[var(--color-text)] p-4 border-b border-[var(--color-border)]">2026 UCR fee schedule (carriers)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="p-3 font-medium text-[var(--color-text)]">Fleet size (power units)</th>
                <th className="p-3 font-medium text-[var(--color-text)]">Fee</th>
              </tr>
            </thead>
            <tbody>
              {UCR_FEE_BRACKETS_2026.map((b) => (
                <tr key={b.min} className="border-t border-slate-100">
                  <td className="p-3 text-[var(--color-muted)]">{b.label}</td>
                  <td className="p-3 font-semibold text-[var(--color-text)]">${b.fee.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
