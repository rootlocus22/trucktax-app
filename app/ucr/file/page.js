'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUcrFee, UCR_ENTITY_TYPES, UCR_SERVICE_PLANS } from '@/lib/ucr-fees';
import DiscountedPrice from '@/components/DiscountedPrice';
import { createFiling } from '@/lib/db';
import { deleteDraftFiling } from '@/lib/draftHelpers';
import { trackEvent } from '@/lib/analytics';
import { getUcrSubmittedPayLaterEmailTemplate } from '@/lib/ucrEmailTemplates';
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Truck,
  MapPin,
  FileCheck,
  CheckCircle,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';

const UCR_VISIT_KEY = 'ucr_visit_session_id';
const UCR_VISIT_USER_ID = 'ucr_visit_user_id';
const UCR_VISIT_EMAIL = 'ucr_visit_email';
const UCR_VISIT_STEP = 'ucr_visit_step';
const UCR_VISIT_COMPLETED = 'ucr_visit_completed';

function getSessionId() {
  if (typeof window === 'undefined') return null;
  let sid = sessionStorage.getItem(UCR_VISIT_KEY);
  if (!sid) {
    sid = crypto.randomUUID?.() || `ucr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(UCR_VISIT_KEY, sid);
  }
  return sid;
}

function recordUcrVisit(body) {
  const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem(UCR_VISIT_KEY) : null;
  const userId = typeof window !== 'undefined' ? sessionStorage.getItem(UCR_VISIT_USER_ID) : null;
  if (!sessionId || !userId) return;
  fetch('/api/analytics/ucr-visit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, userId, ...body }),
    keepalive: true,
  }).catch(() => {});
}

const STEPS = [
  { id: 1, title: 'Business details', icon: Building2 },
  { id: 2, title: 'Fleet count', icon: Truck },
  { id: 3, title: 'State', icon: MapPin },
  { id: 4, title: 'Review', icon: FileCheck },
  { id: 5, title: 'Submit', icon: CheckCircle },
  { id: 6, title: 'Confirmation', icon: CheckCircle },
];

function UcrFileContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submittingFiling, setSubmittingFiling] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null); // { filingId, legalName, dotNumber, email, total }
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
  const [fmcsaLookup, setFmcsaLookup] = useState(null); // { name, dba, address: { street, city, state, zip } } after successful lookup
  const [consentGiven, setConsentGiven] = useState(false);
  const [hasTrackedStart, setHasTrackedStart] = useState(false);
  const hasRecordedVisit = useRef(false);

  // Ensure UCR visit session id exists and persist user/email/step for abandon tracking
  useEffect(() => {
    if (typeof window === 'undefined') return;
    getSessionId();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    sessionStorage.setItem(UCR_VISIT_USER_ID, user.uid);
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const email = (form && form.email) || (user && user.email) || '';
    sessionStorage.setItem(UCR_VISIT_EMAIL, email);
  }, [form?.email, user?.email]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(UCR_VISIT_STEP, String(step));
  }, [step]);

  // Record UCR visit (analytics + abandon pipeline) when user lands on the page
  useEffect(() => {
    if (authLoading || !user || hasRecordedVisit.current) return;
    const sessionId = getSessionId();
    if (!sessionId) return;
    hasRecordedVisit.current = true;
    fetch('/api/analytics/ucr-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userId: user.uid,
        email: user.email || form.email || '',
        step: 1,
      }),
    }).catch(() => {});
  }, [user, authLoading]);

  // Record step progress for analytics and abandon context
  useEffect(() => {
    if (!user || step === 1) return; // step 1 already recorded on visit
    const sessionId = sessionStorage.getItem(UCR_VISIT_KEY);
    if (!sessionId) return;
    fetch('/api/analytics/ucr-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        userId: user.uid,
        email: form.email || user.email || '',
        step,
      }),
    }).catch(() => {});
  }, [step, user, form.email]);

  // On leave/hide: record abandon so we can send email after 5 min (unless they completed)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleAbandon = () => {
      if (sessionStorage.getItem(UCR_VISIT_COMPLETED) === '1') return;
      const sessionId = sessionStorage.getItem(UCR_VISIT_KEY);
      const userId = sessionStorage.getItem(UCR_VISIT_USER_ID);
      const email = sessionStorage.getItem(UCR_VISIT_EMAIL) || '';
      const step = parseInt(sessionStorage.getItem(UCR_VISIT_STEP) || '1', 10);
      if (!sessionId || !userId) return;
      trackEvent('ucr_filing_abandoned', { step, source: 'ucr_file' });
      fetch('/api/analytics/ucr-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId, email, step, abandoned: true }),
        keepalive: true,
      }).catch(() => {});
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handleAbandon();
    };
    const onPageHide = () => handleAbandon();
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

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

  // Restore confirmation page from session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('ucr_filing_confirmation');
      if (saved) {
        const data = JSON.parse(saved);
        setConfirmationData(data);
        setStep(6);
        sessionStorage.setItem(UCR_VISIT_COMPLETED, '1');
      }
    } catch (e) {
      console.warn('Could not restore confirmation:', e);
    }
  }, []);

  useEffect(() => {
    if (hasTrackedStart) return;
    trackEvent('ucr_filing_started', {
      source: typeof window !== 'undefined' ? window.location.pathname : '/ucr/file',
      model: 'pay_later',
    });
    setHasTrackedStart(true);
  }, [hasTrackedStart]);

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
    setFmcsaLookup(null);
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
        setFmcsaLookup({
          name: data.name || '',
          dba: data.dba || '',
          address: data.address ? { street: data.address.street || '', city: data.address.city || '', state: data.address.state || '', zip: data.address.zip || '' } : null,
        });
      }
    } catch (err) {
      setLookupError("Lookup failed. Please enter your business details below.");
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

  const handleNext = () => {
    const nextStep = step + 1;
    if (step < 6) {
      setStep(nextStep);
      if (step !== 5) saveProgress(nextStep);
    }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmitFiling = async () => {
    if (!user) return;
    if (!consentGiven) return;
    setSubmittingFiling(true);
    setLookupError('');
    const payload = {
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
      total,
      paymentStatus: 'pending',
      paymentRequiredAtDownload: true,
      amountDueOnCertificateDownload: servicePrice,
    };
    try {
      const filingId = await createFiling(payload);
      const submittedEmailTemplate = getUcrSubmittedPayLaterEmailTemplate({
        legalName: payload.legalName,
        dotNumber: payload.dotNumber,
        filingId,
        amountDueLater: payload.servicePrice,
      });

      trackEvent('ucr_filing_submitted_pay_later', {
        filingId,
        plan: payload.plan,
        servicePrice: payload.servicePrice,
        powerUnits: payload.powerUnits,
        state: payload.state,
      });

      if (draftId) {
        try {
          await deleteDraftFiling(draftId);
        } catch (err) {
          console.warn('Could not delete UCR draft after submit:', err);
        }
      }

      const donePayload = {
        filingId,
        legalName: payload.legalName,
        dotNumber: payload.dotNumber,
        email: payload.email,
        amountDueLater: payload.servicePrice,
        emailSubject: submittedEmailTemplate.subject,
      };
      setConfirmationData(donePayload);
      try {
        sessionStorage.setItem('ucr_filing_confirmation', JSON.stringify(donePayload));
        sessionStorage.setItem(UCR_VISIT_COMPLETED, '1');
      } catch (e) { }
      recordUcrVisit({ email: payload.email, step: 6, completed: true });
      fetch('/api/email/filing-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filingId, status: 'submitted' }),
      }).catch(() => {});
      setStep(6);
    } catch (err) {
      console.error('UCR submit error:', err);
      setLookupError(err.message || 'Your filing could not be submitted. Please try again.');
    } finally {
      setSubmittingFiling(false);
    }
  };

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
      {/* Header with step-by-step stepper */}
      <div className="bg-[var(--color-midnight)] text-white py-6 px-4 pt-safe">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block touch-manipulation min-h-[44px] flex items-center">← QuickTruckTax</Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">UCR Filing Wizard</h1>
              <p className="text-white/80 text-sm mt-1">Step {step} of 6 — {STEPS.find(s => s.id === step)?.title}</p>
            </div>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-widest whitespace-nowrap hidden sm:inline-block">Independent Filing Assistance Service</span>
          </div>
          <p className="text-white/80 text-sm mt-4 max-w-2xl">
            Complete your Unified Carrier Registration in under 5 minutes.
          </p>
          {/* Visual stepper: one after another, only completed/current clickable */}
          <div className="mt-6 flex items-center justify-between gap-0 overflow-x-auto no-scrollbar">
            {STEPS.map((s, idx) => {
              const isCompleted = s.id < step;
              const isCurrent = s.id === step;
              const isClickable = s.id <= step;
              return (
                <div key={s.id} className="flex items-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => isClickable && setStep(s.id)}
                    disabled={!isClickable}
                    className={`flex flex-col items-center gap-1 min-w-[44px] touch-manipulation transition ${!isClickable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition
                      ${isCurrent ? 'bg-white text-[var(--color-midnight)] border-white' : ''}
                      ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                      ${!isCurrent && !isCompleted ? 'border-white/40 text-white/70' : ''}
                    `}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : s.id}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-medium max-w-[60px] sm:max-w-none text-center truncate ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                      {s.title}
                    </span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-4 sm:w-8 h-0.5 flex-shrink-0 mx-0.5 ${s.id < step ? 'bg-emerald-500' : 'bg-white/30'}`} aria-hidden />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 pb-24 sm:pb-10">
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 min-h-[48px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">DBA (if any)</label>
                <input
                  type="text"
                  value={form.dba}
                  onChange={(e) => setForm({ ...form, dba: e.target.value })}
                  placeholder="Doing business as"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 min-h-[48px]"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">USDOT number *</label>
                  <input
                    type="text"
                    value={form.dotNumber}
                    onChange={(e) => {
                      const next = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setForm({ ...form, dotNumber: next });
                      if (fmcsaLookup) setFmcsaLookup(null);
                    }}
                    placeholder="USDOT number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 min-h-[48px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUsdotLookup}
                  disabled={lookupLoading}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-100 transition flex items-center justify-center gap-2 min-h-[48px] touch-manipulation w-full sm:w-auto"
                >
                  {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Look up from FMCSA'}
                </button>
              </div>
              <p className="text-xs text-slate-500">Optional: Look up fills legal name, DBA, state, and fleet count from FMCSA. If it doesn’t work, enter your details below.</p>
              {lookupError && (
                <div className="flex items-start gap-2 text-amber-800 text-sm bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{lookupError}</span>
                </div>
              )}
              {fmcsaLookup && (fmcsaLookup.name || fmcsaLookup.address) && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                  <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">From FMCSA</h3>
                  {fmcsaLookup.name ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Legal Name</p>
                      <p className="font-bold text-[var(--color-text)]">{fmcsaLookup.name}</p>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">DBA</p>
                    <p className="font-bold text-[var(--color-text)]">{fmcsaLookup.dba || '—'}</p>
                  </div>
                  {fmcsaLookup.address && (fmcsaLookup.address.street || fmcsaLookup.address.city || fmcsaLookup.address.state) && (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Physical Address</p>
                      <p className="font-bold text-[var(--color-text)]">
                        {[fmcsaLookup.address.street, [fmcsaLookup.address.city, fmcsaLookup.address.state].filter(Boolean).join(', '), fmcsaLookup.address.zip].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
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
                  <label className="flex gap-3 p-4 min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 cursor-pointer group touch-manipulation items-start sm:items-center">
                    <input
                      type="checkbox"
                      checked={form.isAuthorized}
                      onChange={(e) => setForm({ ...form, isAuthorized: e.target.checked })}
                      className="mt-1.5 sm:mt-0 w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
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
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">Legal name</dt><dd className="font-semibold sm:text-right">{form.legalName || '—'}</dd></div>
              {form.dba && <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">DBA</dt><dd className="font-semibold sm:text-right">{form.dba}</dd></div>}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">USDOT</dt><dd className="font-semibold sm:text-right">{form.dotNumber || '—'}</dd></div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">Registrant</dt><dd className="font-semibold sm:text-right">{form.registrantName || '—'}</dd></div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">Entity</dt><dd className="font-semibold sm:text-right">{UCR_ENTITY_TYPES.find(e => e.value === form.entityType)?.label}</dd></div>
              {form.entityType === 'carrier' && (
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2">
                  <dt className="text-slate-500">Power units</dt>
                  <dd className="font-semibold sm:text-right">
                    {form.powerUnits} ({form.fleetOption === 'auto' ? 'Auto-filled' : 'Manual'})
                  </dd>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">State</dt><dd className="font-semibold sm:text-right">{form.state}</dd></div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">Plan</dt><dd className="font-semibold sm:text-right text-indigo-600">{UCR_SERVICE_PLANS[form.plan]?.name}</dd></div>
            </dl>
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600 mb-2 font-medium"><span>Official UCR fee (2026)</span><span>${ucrFee.toLocaleString()}</span></div>
              <div className="flex justify-between text-slate-600 mb-4 font-medium"><span>Service fee ({UCR_SERVICE_PLANS[form.plan]?.name})</span><span>{form.plan === 'filing' && servicePrice === 79 ? <DiscountedPrice price={79} originalPrice={99} /> : `$${servicePrice}`}</span></div>
              <div className="flex justify-between font-bold text-xl pt-4 border-t border-slate-200 text-[var(--color-navy)]"><span>Total payable</span><span>${total.toLocaleString()}</span></div>
            </div>
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-800">
                <strong>Pay-later protection:</strong> You can submit now with <strong>$0 upfront</strong>. We charge the service fee only after your UCR certificate is uploaded and ready for full download.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Submit filing (pay later) */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Submit now, pay when certificate is ready</h2>
            {!user ? (
              <div className="text-center py-6">
                <p className="text-slate-600 mb-4">Sign in or create an account to complete your UCR filing.</p>
                <Link href={`/login?redirect=${encodeURIComponent('/ucr/file')}`} className="inline-block bg-[var(--color-orange)] text-white px-6 py-3 rounded-xl font-semibold">Sign in to continue</Link>
              </div>
            ) : (
              <>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                  <div className="flex justify-between text-slate-600 mb-2"><span>UCR official fee (2026)</span><span>${ucrFee.toLocaleString()}</span></div>
                  <div className="flex justify-between text-slate-600 mb-2"><span>Service fee ({UCR_SERVICE_PLANS[form.plan]?.name})</span><span>{form.plan === 'filing' && servicePrice === 79 ? <DiscountedPrice price={79} originalPrice={99} /> : `$${servicePrice}`}</span></div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 text-[var(--color-navy)]"><span>Due today</span><span>$0.00</span></div>
                  <div className="flex justify-between text-sm text-slate-600 mt-2"><span>Pay on certificate download</span><span>{form.plan === 'filing' && servicePrice === 79 ? <DiscountedPrice price={79} originalPrice={99} /> : `$${servicePrice.toLocaleString()}`}</span></div>
                </div>
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-800">
                    <strong>File first, pay later:</strong> We process your UCR filing first. Once your certificate is ready, you can preview it in your dashboard and unlock the full download for {form.plan === 'filing' && servicePrice === 79 ? <><span className="text-slate-400 line-through">$99</span> <span className="font-bold text-[var(--color-orange)]">$79</span></> : `$${servicePrice}`}.
                  </p>
                </div>
                {lookupError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 mb-4">
                    <AlertCircle className="w-4 h-4" /> {lookupError}
                  </div>
                )}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-[var(--color-navy)] focus:ring-[var(--color-navy)]"
                    />
                    <span className="text-sm text-slate-700 leading-snug">
                      <strong>Authorization & Consent:</strong> I authorize QuickTruckTax to prepare and submit my UCR registration using the information provided. I understand that QuickTruckTax is an independent third-party filing service and is not affiliated with the government.
                    </span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitFiling}
                  disabled={submittingFiling || !consentGiven}
                  className="mt-2 w-full bg-[var(--color-navy)] text-white py-4 min-h-[52px] rounded-xl font-bold touch-manipulation flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {submittingFiling ? (
                    <>Submitting your filing… <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Submit filing now (pay later)</>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 6: Thank you / Confirmation */}
        {step === 6 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm text-center">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle className="w-14 h-14 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Your UCR filing is submitted</h1>
            <p className="text-lg text-slate-600 mb-6">No upfront charge. You’ll pay only when your certificate is ready to download.</p>
            <div className="max-w-md mx-auto p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left mb-8">
              <p className="text-sm text-slate-600 mb-2">
                <strong className="text-[var(--color-text)]">Registration:</strong>{' '}
                {confirmationData?.legalName || form.legalName || '—'} (USDOT: {confirmationData?.dotNumber || form.dotNumber || '—'})
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <strong className="text-[var(--color-text)]">Confirmation email:</strong> {confirmationData?.email || form.email || user?.email}
              </p>
              {confirmationData?.amountDueLater != null && (
                <p className="text-sm text-slate-600">
                  <strong className="text-[var(--color-text)]">Pay later amount:</strong>{' '}
                  {Number(confirmationData.amountDueLater) === 79 ? (
                    <DiscountedPrice price={79} originalPrice={99} />
                  ) : (
                    `$${Number(confirmationData.amountDueLater).toLocaleString()}`
                  )}
                </p>
              )}
              {confirmationData?.emailSubject && (
                <p className="text-sm text-slate-600 mt-2">
                  <strong className="text-[var(--color-text)]">Email subject preview:</strong> {confirmationData.emailSubject}
                </p>
              )}
            </div>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
              Our team will process your filing with the UCR board. Once your certificate is uploaded, you can preview it in your dashboard and unlock full download in one click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard" className="inline-flex items-center justify-center min-h-[48px] bg-[var(--color-navy)] !text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-navy-200/50 transition touch-manipulation w-full sm:w-auto">Go to Dashboard</Link>
              <Link href="/dashboard/filings" className="inline-flex items-center justify-center min-h-[48px] bg-[var(--color-orange)] !text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition touch-manipulation w-full sm:w-auto">View my filings</Link>
              <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center min-h-[48px] bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition touch-manipulation w-full sm:w-auto">Print receipt</button>
            </div>
          </div>
        )}

        {/* Nav buttons - full-width primary on mobile for conversion */}
        {step < 6 && step !== 5 && (
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8">
            <button type="button" onClick={handleBack} className="min-h-[48px] px-6 py-3 rounded-xl border border-slate-200 font-medium text-[var(--color-text)] touch-manipulation w-full sm:w-auto">Back</button>
            <button type="button" onClick={handleNext} disabled={!canProceed()} className="flex-1 min-h-[52px] px-8 py-3 rounded-xl bg-[var(--color-orange)] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation w-full sm:w-auto">
              {step === 4 ? 'Proceed to submit' : 'Next'} <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
        {step === 5 && user && (
          <div className="mt-8">
            <button type="button" onClick={handleBack} className="min-h-[48px] px-6 py-3 rounded-xl border border-slate-200 font-medium text-[var(--color-text)] touch-manipulation w-full sm:w-auto">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UcrFilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[var(--color-navy)] animate-spin" />
      </div>
    }>
      <UcrFileContent />
    </Suspense>
  );
}
