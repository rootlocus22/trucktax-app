'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { getUcrFee, UCR_ENTITY_TYPES, UCR_SERVICE_PLANS } from '@/lib/ucr-fees';
import DiscountedPrice from '@/components/DiscountedPrice';
import { Calculator, ArrowRight } from 'lucide-react';

const SERVICE_PRICE = 79;

export default function HomepageUcrCalculator() {
  const formId = useId();
  const [entityType, setEntityType] = useState('carrier');
  const [powerUnits, setPowerUnits] = useState('');
  const [state, setState] = useState('');

  const unitsNum = Math.max(0, Math.floor(Number(powerUnits) || 0));
  const { fee: ucrFee } = getUcrFee(unitsNum, entityType);
  const total = ucrFee + SERVICE_PRICE;

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Absolute Badge */}
      <div className="absolute top-0 right-0 bg-[var(--color-orange)] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-lg">
        $0 Upfront
      </div>

      <div className="flex items-center gap-2 text-white font-semibold mb-4">
        <Calculator className="w-5 h-5 text-[var(--color-orange)]" />
        Official 2026 UCR Estimator
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor={`${formId}-entityType`} className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">Entity type</label>
          <select
            id={`${formId}-entityType`}
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2.5 min-h-[48px] text-sm focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent outline-none transition-all cursor-pointer"
          >
            {UCR_ENTITY_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="text-slate-900">{t.label}</option>
            ))}
          </select>
        </div>

        {entityType === 'carrier' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label htmlFor={`${formId}-powerUnits`} className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">Number of Power Units</label>
            <input
              id={`${formId}-powerUnits`}
              type="number"
              min="0"
              value={powerUnits}
              onChange={(e) => setPowerUnits(e.target.value)}
              placeholder="e.g. 5"
              className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2.5 min-h-[48px] text-sm placeholder-white/30 focus:ring-2 focus:ring-[var(--color-orange)] outline-none transition-all"
            />
          </div>
        )}

        <div>
          <label htmlFor={`${formId}-state`} className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider">Base State (Optional)</label>
          <select
            id={`${formId}-state`}
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 text-white px-3 py-2.5 min-h-[48px] text-sm focus:ring-2 focus:ring-[var(--color-orange)] outline-none transition-all cursor-pointer"
          >
            <option value="" className="text-slate-900">Select State</option>
            {['Texas', 'California', 'Florida', 'Georgia', 'Ohio', 'Illinois', 'Pennsylvania', 'North Carolina', 'Michigan', 'New York'].map(s => (
              <option key={s} value={s.toLowerCase().replace(' ', '-')} className="text-slate-900">{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">State/Federal Fee:</span>
          <span className="text-white font-mono">${ucrFee.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/60">Filing Service:</span>
          <div className="flex items-center gap-2">
            <span className="text-white/30 line-through text-xs font-mono">$99</span>
            <span className="text-[var(--color-orange)] font-mono">$79</span>
          </div>
        </div>
        <div className="h-px bg-white/10 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-white font-bold uppercase tracking-widest text-xs">Total to File:</span>
          <span className="text-white text-xl font-black font-mono">${total.toLocaleString()}</span>
        </div>
      </div>

      <Link
        href={state ? `/ucr-filing/${state}` : '/ucr-filing/new'}
        className="mt-4 flex items-center justify-center gap-2 w-full min-h-[56px] bg-[var(--color-orange)] hover:bg-[#ff7a20] text-[#0f2647] font-black rounded-xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 group uppercase tracking-tight"
      >
        File 2026 UCR Now
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>

      <p className="mt-3 text-[10px] text-white/40 text-center">
        Guaranteed compliant with 2026 UCR Board brackets.
      </p>
    </div>
  );
}
