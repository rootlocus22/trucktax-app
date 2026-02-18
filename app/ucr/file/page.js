'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUcrFee, UCR_ENTITY_TYPES, UCR_SERVICE_PLANS } from '@/lib/ucr-fees';
import { createFiling } from '@/lib/db';
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Truck,
  MapPin,
  FileCheck,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Business details', icon: Building2 },
  { id: 2, title: 'Fleet count', icon: Truck },
  { id: 3, title: 'State', icon: MapPin },
  { id: 4, title: 'Review', icon: FileCheck },
  { id: 5, title: 'Payment', icon: CreditCard },
  { id: 6, title: 'Confirmation', icon: CheckCircle },
];

export default function UcrFilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    legalName: '',
    dba: '',
    dotNumber: '',
    entityType: 'carrier',
    powerUnits: '',
    state: '',
    email: '',
    phone: '',
    plan: 'filing',
    fleetOption: 'manual', // 'auto' | 'manual'
    isAuthorized: false,
    registrantName: '',
    filingYear: 2026,
  });
  const [draftId, setDraftId] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Load draft from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('draft');
    if (id) {
      setDraftId(id);
      const { getDraftFiling } = require('@/lib/draftHelpers');
      getDraftFiling(id).then(draft => {
        if (draft) {
          setForm(prev => ({
            ...prev,
            ...draft,
            // Ensure step is set from draft if saved
            powerUnits: draft.powerUnits?.toString() || prev.powerUnits
          }));
          if (draft.currentStep) setStep(draft.currentStep);
        }
      });
    }
  }, []);

  // Conversion funnel: no transactions without login — redirect to login and return here after
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const returnPath = typeof window !== 'undefined' && window.location.search ? '/ucr/file' + window.location.search : '/ucr/file';
      router.push('/login?redirect=' + encodeURIComponent(returnPath));
    }
  }, [user, authLoading, router]);

  const { fee: ucrFee } = getUcrFee(Number(form.powerUnits) || 0, form.entityType);
  const servicePrice = UCR_SERVICE_PLANS[form.plan]?.price ?? 79;
  const total = ucrFee + servicePrice;

  const canProceed = () => {
    if (step === 1) return form.legalName.trim() && form.dotNumber.trim() && form.registrantName.trim() && form.isAuthorized;
    if (step === 2) return form.entityType && (['broker', 'freight_forwarder', 'leasing'].includes(form.entityType) || (form.powerUnits && Number(form.powerUnits) >= 0));
    if (step === 3) return form.state?.length === 2;
    return true;
  };

  const handleUsdotLookup = async () => {
    if (!form.dotNumber || form.dotNumber.length < 5) {
      setLookupError('Please enter a valid USDOT number');
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await fetch(`/api/fmcsa/lookup?usdot=${form.dotNumber}`);
      const data = await res.json();
      if (data.error) {
        setLookupError(data.error);
      } else {
        setForm({
          ...form,
          legalName: data.name || '',
          dba: data.dba || '',
          state: data.address?.state || '',
          powerUnits: data.totalUnits || '',
          fleetOption: 'auto'
        });
      }
    } catch (err) {
      setLookupError('Failed to lookup USDOT info');
    } finally {
      setLookupLoading(false);
    }
  };

  const saveProgress = async (nextStep) => {
    if (!user) return;
    const { saveDraftFiling } = require('@/lib/draftHelpers');
    try {
      const id = await saveDraftFiling(user.uid, {
        ...form,
        filingType: 'ucr',
        currentStep: nextStep || step,
        draftId: draftId
      });
      if (!draftId) setDraftId(id);
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  const submitUcrFiling = async () => {
    if (!user) return;
    try {
      const { fee: ucrFee } = getUcrFee(Number(form.powerUnits) || 0, form.entityType);
      const servicePrice = UCR_SERVICE_PLANS[form.plan]?.price ?? 79;
      await createFiling({
        userId: user.uid,
        filingType: 'ucr',
        filingYear: form.filingYear || 2026,
        status: 'submitted',
        priority: 'high',
        dotNumber: form.dotNumber,
        legalName: form.legalName,
        dba: form.dba,
        entityType: form.entityType,
        powerUnits: Number(form.powerUnits) || 0,
        state: form.state,
        plan: form.plan,
        registrantName: form.registrantName,
        email: form.email || user.email,
        phone: form.phone,
        ucrFee,
        servicePrice,
        total: ucrFee + servicePrice,
      });
      // Clean up the draft now that it's submitted
      if (draftId) {
        const { deleteDraftFiling } = require('@/lib/draftHelpers');
        await deleteDraftFiling(draftId);
      }
    } catch (err) {
      console.error('Failed to submit UCR filing:', err);
    }
  };

  const handleNext = () => {
    const nextStep = step + 1;
    if (step < 6) {
      setStep(nextStep);
      // On payment confirmation, submit to filings collection
      if (step === 5) {
        submitUcrFiling();
      } else {
        saveProgress(nextStep);
      }
    }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[var(--color-navy)]/20 border-t-[var(--color-navy)] rounded-full animate-spin" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[var(--color-midnight)] text-white py-6 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">← QuickTruckTax</Link>
          <h1 className="text-2xl font-bold">UCR Filing Wizard</h1>
          <p className="text-white/80 text-sm mt-1">Simple. Fast. Smart UCR filing.</p>
          {/* Stepper */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {STEPS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${step >= s.id ? 'bg-white/20 text-white' : 'text-white/60'
                  }`}
              >
                <s.icon className="w-3.5 h-3.5" /> {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Step 1: Business details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Business details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Legal name *</label>
                <input
                  type="text"
                  value={form.legalName}
                  onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                  placeholder="Company or sole proprietor name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">DBA (if any)</label>
                <input
                  type="text"
                  value={form.dba}
                  onChange={(e) => setForm({ ...form, dba: e.target.value })}
                  placeholder="Doing business as"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">USDOT number *</label>
                  <input
                    type="text"
                    value={form.dotNumber}
                    onChange={(e) => setForm({ ...form, dotNumber: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                    placeholder="USDOT number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUsdotLookup}
                  disabled={lookupLoading}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition flex items-center gap-2 h-[48px]"
                >
                  {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lookup'}
                </button>
              </div>
              {lookupError && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4" /> {lookupError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Legal name *</label>
                <input
                  type="text"
                  value={form.legalName}
                  onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                  placeholder="Company or sole proprietor name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">DBA (if any)</label>
                <input
                  type="text"
                  value={form.dba}
                  onChange={(e) => setForm({ ...form, dba: e.target.value })}
                  placeholder="Doing business as"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(555) 000-0000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">Registrant Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Full Name of Person Filing *</label>
                    <input
                      type="text"
                      value={form.registrantName}
                      onChange={(e) => setForm({ ...form, registrantName: e.target.value })}
                      placeholder="Your regular name"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    />
                  </div>
                  <label className="flex gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.isAuthorized}
                      onChange={(e) => setForm({ ...form, isAuthorized: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-600 leading-relaxed">
                      I certify that I am authorized to file this registration on behalf of the USDOT number listed above. I understand that providing false information is subject to penalties.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Fleet count */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Fleet size & entity type</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Entity type</label>
                <select
                  value={form.entityType}
                  onChange={(e) => setForm({ ...form, entityType: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3"
                >
                  {UCR_ENTITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              {form.entityType === 'carrier' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[var(--color-text)]">Fleet count source</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fleetOption: 'auto' })}
                      className={`p-4 rounded-xl border text-left transition ${form.fleetOption === 'auto'
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className="font-bold text-sm mb-1">Option A: Automatic</div>
                      <div className="text-xs text-slate-500">Use fleet size from latest FMCSA records</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, fleetOption: 'manual' })}
                      className={`p-4 rounded-xl border text-left transition ${form.fleetOption === 'manual'
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      <div className="font-bold text-sm mb-1">Option B: Manual</div>
                      <div className="text-xs text-slate-500">Manually input vehicle count</div>
                    </button>
                  </div>

                  {form.fleetOption === 'manual' ? (
                    <div>
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Number of power units *</label>
                      <input
                        type="number"
                        min="0"
                        value={form.powerUnits}
                        onChange={(e) => setForm({ ...form, powerUnits: e.target.value })}
                        placeholder="e.g. 5"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3"
                      />
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Exclude vehicles operating solely in intrastate commerce.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-sm font-medium text-slate-600">Calculated power units</div>
                      <div className="text-2xl font-bold text-indigo-600">{form.powerUnits || '0'}</div>
                      <p className="text-xs text-slate-500 mt-1 italic">Retrieved from FMCSA database</p>
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Service plan</label>
                <div className="space-y-2">
                  {Object.entries(UCR_SERVICE_PLANS).map(([key, p]) => (
                    <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input type="radio" name="plan" value={key} checked={form.plan === key} onChange={() => setForm({ ...form, plan: key })} className="text-[var(--color-orange)]" />
                      <span className="font-medium">{p.name} – ${p.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: State */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Base state</h2>
            <p className="text-slate-600 mb-4">Select the state where your business is registered or where you have your principal place of business.</p>
            <select
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg"
            >
              <option value="">Select state</option>
              {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Review your UCR filing</h2>
            <dl className="space-y-4 text-sm divide-y divide-slate-100">
              <div className="flex justify-between py-2"><dt className="text-slate-500">Legal name</dt><dd className="font-semibold text-right">{form.legalName || '—'}</dd></div>
              {form.dba && <div className="flex justify-between py-2"><dt className="text-slate-500">DBA</dt><dd className="font-semibold text-right">{form.dba}</dd></div>}
              <div className="flex justify-between py-2"><dt className="text-slate-500">USDOT</dt><dd className="font-semibold text-right">{form.dotNumber || '—'}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-slate-500">Registrant</dt><dd className="font-semibold text-right">{form.registrantName || '—'}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-slate-500">Entity</dt><dd className="font-semibold text-right">{UCR_ENTITY_TYPES.find(e => e.value === form.entityType)?.label}</dd></div>
              {form.entityType === 'carrier' && (
                <div className="flex justify-between py-2">
                  <dt className="text-slate-500">Power units</dt>
                  <dd className="font-semibold text-right">
                    {form.powerUnits} ({form.fleetOption === 'auto' ? 'Auto-filled' : 'Manual'})
                  </dd>
                </div>
              )}
              <div className="flex justify-between py-2"><dt className="text-slate-500">State</dt><dd className="font-semibold text-right">{form.state}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-slate-500">Plan</dt><dd className="font-semibold text-right text-indigo-600">{UCR_SERVICE_PLANS[form.plan]?.name}</dd></div>
            </dl>
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600 mb-2 font-medium"><span>Official UCR fee (2026)</span><span>${ucrFee.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-600 mb-4 font-medium"><span>Service fee ({UCR_SERVICE_PLANS[form.plan]?.name})</span><span>${servicePrice}</span></div>
              <div className="flex justify-between font-bold text-xl pt-4 border-t border-slate-200 text-[var(--color-navy)]"><span>Total payable</span><span>${total.toLocaleString()}</span></div>
            </div>
          </div>
        )}

        {/* Step 5: Payment */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Payment</h2>
            {!user ? (
              <div className="text-center py-6">
                <p className="text-slate-600 mb-4">Sign in or create an account to complete your UCR filing and payment.</p>
                <Link href={`/login?redirect=${encodeURIComponent('/ucr/file')}`} className="inline-block bg-[var(--color-orange)] text-white px-6 py-3 rounded-xl font-semibold">Sign in to continue</Link>
              </div>
            ) : (
              <>
                <p className="text-slate-600 mb-4">Total due: <strong className="text-[var(--color-text)]">${total.toLocaleString()}</strong></p>
                <p className="text-sm text-slate-500">Payment integration (Stripe) can be wired here. For now, this step confirms your selection.</p>
                <button type="button" onClick={handleNext} className="mt-6 w-full bg-[var(--color-orange)] text-white py-4 rounded-xl font-bold">Confirm &amp; proceed to confirmation</button>
              </>
            )}
          </div>
        )}

        {/* Step 6: Confirmation */}
        {step === 6 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">UCR Filing Successfully Submitted</h2>
            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              Your registration for <strong>{form.legalName}</strong> (USDOT: {form.dotNumber}) has been received.
              Our compliance team will process it with the UCR board and notify you at <strong>{form.email}</strong> once your official certificate is ready.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center capitalize">
              <Link href="/dashboard" className="inline-block bg-[var(--color-navy)] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-navy-200/50 transition">Go to dashboard</Link>
              <button onClick={() => window.print()} className="inline-block bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition">Print receipt</button>
            </div>
          </div>
        )}

        {/* Nav buttons */}
        {step < 6 && step !== 5 && (
          <div className="flex gap-4 mt-8">
            <button type="button" onClick={handleBack} className="px-6 py-3 rounded-xl border border-slate-200 font-medium text-[var(--color-text)]">Back</button>
            <button type="button" onClick={handleNext} disabled={!canProceed()} className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-[var(--color-orange)] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              {step === 4 ? 'Proceed to payment' : 'Next'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        {step === 5 && user && (
          <div className="mt-8">
            <button type="button" onClick={handleBack} className="px-6 py-3 rounded-xl border border-slate-200 font-medium text-[var(--color-text)]">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}
