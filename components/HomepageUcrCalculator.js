'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getUcrFee, UCR_ENTITY_TYPES, UCR_SERVICE_PLANS } from '@/lib/ucr-fees';
import DiscountedPrice from '@/components/DiscountedPrice';
import { Calculator, ArrowRight } from 'lucide-react';

const SERVICE_PRICE = 79;

export default function HomepageUcrCalculator() {
  const [entityType, setEntityType] = useState('carrier');
  const [powerUnits, setPowerUnits] = useState('');
  const [state, setState] = useState('');

  const unitsNum = Math.max(0, Math.floor(Number(powerUnits) || 0));
  const { fee: ucrFee } = getUcrFee(unitsNum, entityType);
  const total = ucrFee + SERVICE_PRICE;

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl">
      <div className="flex items-center gap-2 text-white font-semibold mb-4">
        <Calculator className="w-5 h-5 text-[var(--color-orange)]" />
        UCR Fee Calculator
      </div>
      <div className="space-y-3">
        <div>
          <label htmlFor="entityType" className="block text-xs font-medium text-white/80 mb-1">Entity type</label>
          <select
            id="entityType"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2.5 min-h-[48px] text-sm focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent touch-manipulation"
          >
            {UCR_ENTITY_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="text-slate-900">{t.label}</option>
            ))}
          </select>
        </div>
        {entityType === 'carrier' && (
          <div>
            <label htmlFor="powerUnits" className="block text-xs font-medium text-white/80 mb-1">Power units</label>
            <input
              id="powerUnits"
              type="number"
              min="0"
              value={powerUnits}
              onChange={(e) => setPowerUnits(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2.5 min-h-[48px] text-sm placeholder-white/50 focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation"
            />
          </div>
        )}
        <div>
          <label htmlFor="state" className="block text-xs font-medium text-white/80 mb-1">State (optional)</label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2.5 min-h-[48px] text-sm focus:ring-2 focus:ring-[var(--color-orange)] touch-manipulation"
          >
            <option value="" className="text-slate-900">Select state</option>
            <option value="texas" className="text-slate-900">Texas</option>
            <option value="california" className="text-slate-900">California</option>
            <option value="florida" className="text-slate-900">Florida</option>
            <option value="georgia" className="text-slate-900">Georgia</option>
            <option value="ohio" className="text-slate-900">Ohio</option>
            <option value="illinois" className="text-slate-900">Illinois</option>
            <option value="pennsylvania" className="text-slate-900">Pennsylvania</option>
            <option value="north-carolina" className="text-slate-900">North Carolina</option>
            <option value="michigan" className="text-slate-900">Michigan</option>
            <option value="new-york" className="text-slate-900">New York</option>
            <option value="other" className="text-slate-900">Other</option>
          </select>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20 space-y-1 text-sm">
        <div className="flex justify-between text-white/90">
          <span>UCR fee (2026)</span>
          <span className="font-semibold text-white">${ucrFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-white/90 items-center">
          <span>Filing service</span>
          <span className="font-semibold text-white"><DiscountedPrice price={SERVICE_PRICE} originalPrice={99} className="[&_.line-through]:text-white/60 [&_.text-slate-400]:text-white/60 [&_.text-emerald-600]:text-[var(--color-orange)] [&_.bg-emerald-50]:bg-white/20 [&_.text-emerald-600]:text-white" /></span>
        </div>
        <div className="flex justify-between text-lg font-bold text-[var(--color-orange)] pt-1">
          <span>Total</span>
          <span>${total.toLocaleString()}</span>
        </div>
      </div>
      <Link
        href={state ? `/ucr-filing/${state}` : '/ucr/file'}
        className="mt-4 flex items-center justify-center gap-2 w-full min-h-[52px] bg-[var(--color-orange)] hover:bg-[#e66a15] !text-white font-bold py-3.5 rounded-xl transition touch-manipulation"
      >
        Start UCR Filing – <span className="inline-flex items-center gap-1.5"><span className="line-through opacity-80">$99</span> <span className="font-bold">$79</span></span> <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
