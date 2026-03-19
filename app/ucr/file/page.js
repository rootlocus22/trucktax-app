'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUcrFee, getServiceFee, UCR_ENTITY_TYPES, CARRIER_ENTITY_TYPES, FLAT_FEE_ENTITY_TYPES } from '@/lib/ucr-fees';
import { US_STATES, getStateName } from '@/lib/us-states';
import { deleteDraftFiling } from '@/lib/draftHelpers';
import { trackEvent } from '@/lib/analytics';
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
  ShieldCheck,
  Lock,
  Award,
  CreditCard,
} from 'lucide-react';

const UCR_VISIT_KEY = 'ucr_visit_session_id';
const UCR_VISIT_USER_ID = 'ucr_visit_user_id';
const UCR_VISIT_EMAIL = 'ucr_visit_email';
const UCR_VISIT_STEP = 'ucr_visit_step';
const UCR_VISIT_COMPLETED = 'ucr_visit_completed';

const AVAILABLE_YEARS = [2026, 2025];

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
  }).catch(() => { });
}

const STEPS = [
  { id: 1, title: 'Business details', icon: Building2 },
  { id: 2, title: 'Fleet & type', icon: Truck },
  { id: 3, title: 'State', icon: MapPin },
  { id: 4, title: 'Review', icon: FileCheck },
  { id: 5, title: 'Payment', icon: CreditCard },
  { id: 6, title: 'Confirmation', icon: CheckCircle },
];

function UcrFileContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submittingFiling, setSubmittingFiling] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [form, setForm] = useState({
    legalName: '',
    dba: '',
    dotNumber: '',
    entityTypes: [], // multi-select: array of entity type values
    powerUnits: '',
    state: '',
    email: '',
    phone: '',
    plan: 'filing',
    fleetOption: 'manual', // 'auto' | 'manual'
    isAuthorized: false,
    registrantFirstName: '',
    registrantLastName: '',
    filingYear: 2026,
  });
  const [draftId, setDraftId] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [fmcsaLookup, setFmcsaLookup] = useState(null);
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
    }).catch(() => { });
  }, [user, authLoading]);

  // Record step progress for analytics and abandon context
  useEffect(() => {
    if (!user || step === 1) return;
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
    }).catch(() => { });
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
      }).catch(() => { });
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
            // Migrate old single entityType to multi-select
            entityTypes: draft.entityTypes || (draft.entityType ? [draft.entityType === 'carrier' ? 'motor_carrier' : draft.entityType] : prev.entityTypes),
            // Migrate old registrantName to split fields
            registrantFirstName: draft.registrantFirstName || draft.registrantName?.split(' ')[0] || prev.registrantFirstName,
            registrantLastName: draft.registrantLastName || draft.registrantName?.split(' ').slice(1).join(' ') || prev.registrantLastName,
            powerUnits: draft.powerUnits?.toString() || prev.powerUnits,
          }));
          if (draft.currentStep) setStep(draft.currentStep);
        }
      });
    }
  }, []);

  // Conversion funnel: no transactions without login
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const returnPath = typeof window !== 'undefined' && window.location.search ? '/ucr/file' + window.location.search : '/ucr/file';
      router.push('/login?redirect=' + encodeURIComponent(returnPath));
    }
  }, [user, authLoading, router]);

  // Handle Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const sessionId = params.get('session_id');
    if (success === '1' && sessionId) {
      setSubmittingFiling(true);
      fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setLookupError(data.error);
            setSubmittingFiling(false);
          } else {
            setConfirmationData({
              filingId: data.filingId,
              legalName: data.legalName,
              dotNumber: data.dotNumber,
              email: data.email,
              total: data.total,
            });
            setStep(6);
            sessionStorage.setItem(UCR_VISIT_COMPLETED, '1');
            sessionStorage.setItem('ucr_filing_confirmation', JSON.stringify({
              filingId: data.filingId,
              legalName: data.legalName,
              dotNumber: data.dotNumber,
              email: data.email,
              total: data.total,
            }));
            // Clean URL
            window.history.replaceState({}, '', '/ucr/file');
          }
        })
        .catch(err => {
          setLookupError('Payment verification failed. Please contact support.');
          setSubmittingFiling(false);
        });
    }
    // Handle canceled
    if (params.get('canceled') === '1') {
      const stepParam = params.get('step');
      if (stepParam) setStep(parseInt(stepParam, 10));
      setLookupError('Payment was canceled. You can try again when ready.');
      window.history.replaceState({}, '', '/ucr/file');
    }
  }, []);

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
      model: 'stripe_checkout',
    });
    setHasTrackedStart(true);
  }, [hasTrackedStart]);

  // Determine if any carrier type is selected (for showing fleet count)
  const hasCarrierType = form.entityTypes.some(t => CARRIER_ENTITY_TYPES.includes(t));

  const powerUnitsNum = Number(form.powerUnits) || 0;
  const { fee: ucrFee } = getUcrFee(powerUnitsNum, form.entityTypes);
  const { fee: servicePrice, tier: serviceTier } = getServiceFee(hasCarrierType ? powerUnitsNum : 0);
  const total = servicePrice != null ? ucrFee + servicePrice : null;
  const isContactUsTier = servicePrice == null;

  const registrantFullName = [form.registrantFirstName, form.registrantLastName].filter(Boolean).join(' ');

  const canProceed = () => {
    if (step === 1) {
      return (
        form.legalName.trim() &&
        form.dotNumber.trim() &&
        form.registrantFirstName.trim() &&
        form.registrantLastName.trim() &&
        form.phone.trim() &&
        form.isAuthorized
      );
    }
    if (step === 2) {
      return (
        form.entityTypes.length > 0 &&
        form.filingYear &&
        (!hasCarrierType || (form.powerUnits && Number(form.powerUnits) >= 0)) &&
        !isContactUsTier
      );
    }
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
        setForm(prev => ({
          ...prev,
          legalName: data.name || prev.legalName,
          dba: data.dba || prev.dba,
          state: data.address?.state || prev.state,
          powerUnits: data.totalUnits || prev.powerUnits,
          phone: data.phone || prev.phone,
          fleetOption: 'auto',
        }));
        setFmcsaLookup({
          name: data.name || '',
          dba: data.dba || '',
          phone: data.phone || '',
          ein: data.ein || '',
          mcNumber: data.mcNumber || '',
          status: data.status || '',
          type: data.type || '',
          totalUnits: data.totalUnits || 0,
          address: data.address ? {
            street: data.address.street || '',
            city: data.address.city || '',
            state: data.address.state || '',
            zip: data.address.zip || '',
          } : null,
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

  const handleFileAnother = () => {
    sessionStorage.removeItem('ucr_filing_confirmation');
    sessionStorage.removeItem(UCR_VISIT_KEY);
    sessionStorage.removeItem(UCR_VISIT_STEP);
    sessionStorage.removeItem(UCR_VISIT_COMPLETED);

    setConfirmationData(null);
    setDraftId(null);
    setSubmittingFiling(false);
    setLookupError('');
    setFmcsaLookup(null);
    setForm({
      legalName: '',
      dba: '',
      dotNumber: '',
      entityTypes: [],
      powerUnits: '',
      state: '',
      email: '',
      phone: '',
      plan: 'filing',
      fleetOption: 'manual',
      isAuthorized: false,
      registrantFirstName: '',
      registrantLastName: '',
      filingYear: 2026,
    });
    setStep(1);
    hasRecordedVisit.current = false;
    setHasTrackedStart(false);
    window.history.replaceState({}, '', '/ucr/file');
  };

  const handleNext = () => {
    const nextStep = step + 1;
    if (step < 6) {
      setStep(nextStep);
      if (step !== 5) saveProgress(nextStep);
    }
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const toggleEntityType = (value) => {
    setForm(prev => ({
      ...prev,
      entityTypes: prev.entityTypes.includes(value)
        ? prev.entityTypes.filter(t => t !== value)
        : [...prev.entityTypes, value],
    }));
  };

  // Stripe Checkout: redirect customer to Stripe for full payment
  const handleStripeCheckout = async () => {
    if (!user || total == null) return;
    setSubmittingFiling(true);
    setLookupError('');

    const filingPayload = {
      userId: user.uid,
      filingType: 'ucr',
      filingYear: form.filingYear || 2026,
      status: 'pending_payment',
      priority: 'high',
      dotNumber: form.dotNumber,
      legalName: form.legalName,
      dba: form.dba,
      entityTypes: form.entityTypes,
      powerUnits: Number(form.powerUnits) || 0,
      state: form.state,
      plan: form.plan,
      registrantFirstName: form.registrantFirstName,
      registrantLastName: form.registrantLastName,
      registrantName: registrantFullName,
      email: form.email || user.email,
      phone: form.phone,
      ucrFee,
      servicePrice,
      total,
    };

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          amountCents: Math.round(total * 100),
          planName: `UCR ${form.filingYear} Registration — ${form.legalName} (USDOT: ${form.dotNumber})`,
          filingPayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err) {
      console.error('Stripe checkout error:', err);
      setLookupError(err.message || 'Payment failed. Please try again.');
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
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block touch-manipulation min-h-[44px] flex items-center">← easyucr.com</Link>
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
          <p className="text-white/60 text-xs mt-2 max-w-2xl">
            Not affiliated with FMCSA or DOT — independent filing service.
          </p>
          {/* Visual stepper */}
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
        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-500 text-sm mb-6">
          <span className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> McAfee SECURE</span>
          <span className="flex items-center gap-2"><Lock className="w-5 h-5" /> 256-Bit SSL</span>
          <span className="flex items-center gap-2"><Award className="w-5 h-5" /> Expert review</span>
        </div>
        <>
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
                  <p className="text-xs text-slate-500">Optional: Look up fills legal name, DBA, state, and fleet count from FMCSA. If it doesn't work, enter your details below.</p>
                  {lookupError && (
                    <div className="flex items-start gap-2 text-amber-800 text-sm bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{lookupError}</span>
                    </div>
                  )}
                  {/* FMCSA Lookup Result with MCS-150 data */}
                  {fmcsaLookup && (fmcsaLookup.name || fmcsaLookup.address) && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">From FMCSA (MCS-150)</h3>
                      {fmcsaLookup.name && (
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Legal Name</p>
                          <p className="font-bold text-[var(--color-text)]">{fmcsaLookup.name}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">DBA</p>
                          <p className="font-semibold text-[var(--color-text)]">{fmcsaLookup.dba || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Status</p>
                          <p className={`font-semibold ${fmcsaLookup.status === 'Active' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {fmcsaLookup.status || '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Operation Type</p>
                          <p className="font-semibold text-[var(--color-text)]">{fmcsaLookup.type || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-0.5">Total Vehicles</p>
                          <p className="font-semibold text-[var(--color-text)]">{fmcsaLookup.totalUnits || '—'}</p>
                        </div>
                        {fmcsaLookup.mcNumber && (
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">MC Number</p>
                            <p className="font-semibold text-[var(--color-text)]">{fmcsaLookup.mcNumber}</p>
                          </div>
                        )}
                        {fmcsaLookup.ein && (
                          <div>
                            <p className="text-xs text-slate-500 mb-0.5">EIN</p>
                            <p className="font-semibold text-[var(--color-text)]">{fmcsaLookup.ein}</p>
                          </div>
                        )}
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
                      <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Phone *</label>
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
                    <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">Company Official / Registrant</h3>
                    <p className="text-xs text-slate-500 mb-3">Enter the first and last name of the person authorized to complete UCR registration for USDOT-{form.dotNumber || '___'}.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">First Name *</label>
                        <input
                          type="text"
                          value={form.registrantFirstName}
                          onChange={(e) => setForm({ ...form, registrantFirstName: e.target.value })}
                          placeholder="First name"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={form.registrantLastName}
                          onChange={(e) => setForm({ ...form, registrantLastName: e.target.value })}
                          placeholder="Last name"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3"
                        />
                      </div>
                    </div>
                    <label className="flex gap-3 p-4 min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 cursor-pointer group touch-manipulation items-start sm:items-center mt-4">
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
            )}

            {/* Step 2: Fleet count & Entity Type (multi-select) + Registration Year */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Fleet size, classifications & registration year</h2>
                <div className="space-y-6">
                  {/* Registration Year */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Registration Year *</label>
                    <select
                      value={form.filingYear}
                      onChange={(e) => setForm({ ...form, filingYear: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3"
                    >
                      {AVAILABLE_YEARS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      You are filing your UCR for {form.filingYear}. Completing this filing is the best way to stay FMCSA compliant.
                    </p>
                  </div>

                  {/* Entity Type - Multi-select checkboxes */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Carrier Classifications (check all that apply) *</label>
                    <div className="space-y-2">
                      {UCR_ENTITY_TYPES.map((t) => (
                        <label
                          key={t.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition touch-manipulation ${
                            form.entityTypes.includes(t.value)
                              ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.entityTypes.includes(t.value)}
                            onChange={() => toggleEntityType(t.value)}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-sm text-[var(--color-text)]">{t.label}</span>
                            <p className="text-xs text-slate-500">{t.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {form.entityTypes.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Select at least one classification
                      </p>
                    )}
                  </div>

                  {/* Fleet count - only shown if carrier type selected */}
                  {hasCarrierType && (
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

                  {/* Service fee (tier-based) */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-sm font-medium text-slate-600 mb-1">Service fee (based on fleet size)</div>
                    {isContactUsTier ? (
                      <div className="text-amber-700 font-semibold">
                        Fleets of 100+ power units — <a href="mailto:support@vendaxsystemlabs.com" className="text-[var(--color-orange)] underline">Contact us</a> for a custom quote.
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-indigo-600">${servicePrice?.toFixed(2)}</div>
                    )}
                    {serviceTier && !isContactUsTier && (
                      <p className="text-xs text-slate-500 mt-1">{serviceTier.label} power units tier</p>
                    )}
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
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>{s.code} — {s.name}</option>
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
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">Registration Year</dt><dd className="font-semibold sm:text-right">{form.filingYear}</dd></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2">
                    <dt className="text-slate-500">Company Official</dt>
                    <dd className="font-semibold sm:text-right">{registrantFullName || '—'}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2">
                    <dt className="text-slate-500">Classifications</dt>
                    <dd className="font-semibold sm:text-right">
                      {form.entityTypes.length > 0
                        ? form.entityTypes.map(t => UCR_ENTITY_TYPES.find(e => e.value === t)?.label || t).join(', ')
                        : '—'}
                    </dd>
                  </div>
                  {hasCarrierType && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2">
                      <dt className="text-slate-500">Total number of vehicles</dt>
                      <dd className="font-semibold sm:text-right">
                        {form.powerUnits} ({form.fleetOption === 'auto' ? 'Auto-filled from FMCSA' : 'Manual'})
                      </dd>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">UCR Base State</dt><dd className="font-semibold sm:text-right">{form.state ? `${form.state} — ${getStateName(form.state)}` : '—'}</dd></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">Email</dt><dd className="font-semibold sm:text-right">{form.email || user?.email || '—'}</dd></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">Phone</dt><dd className="font-semibold sm:text-right">{form.phone || '—'}</dd></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-3 sm:py-2"><dt className="text-slate-500">Service fee tier</dt><dd className="font-semibold sm:text-right text-indigo-600">{serviceTier?.label} power units — ${servicePrice?.toFixed(2) ?? 'Contact us'}</dd></div>
                </dl>
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex justify-between text-slate-600 mb-2 font-medium"><span>{form.filingYear} UCR Registration Fee</span><span>${ucrFee.toLocaleString()}</span></div>
                  <div className="flex justify-between text-slate-600 mb-4 font-medium"><span>Service fee ({serviceTier?.label} tier)</span><span>${servicePrice?.toFixed(2) ?? 'Contact us'}</span></div>
                  <div className="flex justify-between font-bold text-xl pt-4 border-t border-slate-200 text-[var(--color-navy)]"><span>Total</span><span>{total != null ? `$${total.toLocaleString()}` : 'Contact us for quote'}</span></div>
                </div>
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-800">
                    <strong>Secure Payment:</strong> You will be redirected to Stripe's secure checkout to pay the total amount. We file your UCR registration and pay the government fee on your behalf using our corporate account. Your card details are never stored on our servers.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Payment — Stripe Checkout */}
            {step === 5 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[var(--color-text)] mb-6">Secure Payment</h2>
                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-slate-600 mb-4">Sign in or create an account to complete your UCR filing.</p>
                    <Link href={`/login?redirect=${encodeURIComponent('/ucr/file')}`} className="inline-block bg-[var(--color-orange)] text-white px-6 py-3 rounded-xl font-semibold">Sign in to continue</Link>
                  </div>
                ) : (
                  <>
                    {/* Payment summary */}
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                      <h3 className="text-sm font-bold text-[var(--color-text)] mb-3">Payment Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                          <span>{form.filingYear} UCR Registration Fee</span>
                          <span>${ucrFee.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Service fee ({serviceTier?.label} tier)</span>
                          <span>${servicePrice?.toFixed(2) ?? 'Contact us'}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-200 text-[var(--color-navy)]">
                          <span>Total</span>
                          <span>{total != null ? `$${total.toLocaleString()}` : 'Contact us'}</span>
                        </div>
                      </div>
                    </div>

                    {/* How it works */}
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                      <h3 className="text-sm font-bold text-blue-900 mb-3">How it works</h3>
                      <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                        <li>You pay the total amount securely via Stripe (credit/debit card)</li>
                        <li>We file your UCR registration on ucr.gov using our corporate account</li>
                        <li>Your UCR certificate is uploaded to your dashboard when ready</li>
                      </ol>
                    </div>

                    {/* Security badges */}
                    <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Lock className="w-4 h-4" /> PCI DSS Compliant</span>
                      <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Powered by Stripe</span>
                      <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> Visa, Mastercard, Amex</span>
                    </div>

                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm text-amber-800">
                        <strong>Your card info is safe.</strong> You'll be redirected to Stripe's secure payment page. Your credit/debit card details are handled entirely by Stripe and never touch our servers. We are PCI SAQ A compliant.
                      </p>
                    </div>

                    {lookupError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 mb-4">
                        <AlertCircle className="w-4 h-4" /> {lookupError}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleStripeCheckout}
                      disabled={submittingFiling || total == null}
                      className="mt-2 w-full bg-[var(--color-navy)] text-white py-4 min-h-[52px] rounded-xl font-bold touch-manipulation flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:opacity-90"
                    >
                      {submittingFiling ? (
                        <>Processing… <Loader2 className="w-5 h-5 animate-spin" /></>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Pay ${total.toLocaleString()} — Secure Checkout
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-3">
                      By proceeding, you authorize easyucr.com to charge ${total.toLocaleString()} and file your UCR registration on your behalf.
                    </p>
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
                <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Payment received — UCR filing submitted!</h1>
                <p className="text-lg text-slate-600 mb-6">Your payment has been processed. We'll file your UCR registration and upload your certificate to your dashboard.</p>
                <div className="max-w-md mx-auto p-6 bg-slate-50 rounded-2xl border border-slate-200 text-left mb-8">
                  <p className="text-sm text-slate-600 mb-2">
                    <strong className="text-[var(--color-text)]">Registration:</strong>{' '}
                    {confirmationData?.legalName || form.legalName || '—'} (USDOT: {confirmationData?.dotNumber || form.dotNumber || '—'})
                  </p>
                  <p className="text-sm text-slate-600 mb-2">
                    <strong className="text-[var(--color-text)]">Confirmation email:</strong> {confirmationData?.email || form.email || user?.email}
                  </p>
                  {confirmationData?.total != null && (
                    <p className="text-sm text-slate-600">
                      <strong className="text-[var(--color-text)]">Amount paid:</strong> ${Number(confirmationData.total).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="max-w-md mx-auto mb-8">
                  <h3 className="text-sm font-bold text-[var(--color-text)] mb-3 text-left">What happens next?</h3>
                  <ol className="text-sm text-slate-600 text-left space-y-2 list-decimal list-inside">
                    <li>Our team files your UCR registration on ucr.gov</li>
                    <li>Your official UCR certificate is uploaded to your dashboard</li>
                    <li>You'll receive an email notification when it's ready</li>
                  </ol>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  <button type="button" onClick={handleFileAnother} className="inline-flex items-center justify-center min-h-[48px] bg-[var(--color-navy)] !text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-navy-200/50 transition touch-manipulation w-full sm:w-auto">File Another UCR</button>
                  <Link href="/dashboard/filings" className="inline-flex items-center justify-center min-h-[48px] bg-[var(--color-orange)] !text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition touch-manipulation w-full sm:w-auto">View my filings</Link>
                  <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center min-h-[48px] bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition touch-manipulation w-full sm:w-auto">Print receipt</button>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            {step < 6 && step !== 5 && (
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mt-8">
                <button type="button" onClick={handleBack} className="min-h-[48px] px-6 py-3 rounded-xl border border-slate-200 font-medium text-[var(--color-text)] touch-manipulation w-full sm:w-auto">Back</button>
                <button type="button" onClick={handleNext} disabled={!canProceed()} className="flex-1 min-h-[52px] px-8 py-3 rounded-xl bg-[var(--color-orange)] text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation w-full sm:w-auto">
                  {step === 4 ? 'Proceed to payment' : 'Next'} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {step === 5 && user && (
              <div className="mt-8">
                <button type="button" onClick={handleBack} className="min-h-[48px] px-6 py-3 rounded-xl border border-slate-200 font-medium text-[var(--color-text)] touch-manipulation w-full sm:w-auto">Back</button>
              </div>
            )}
          </>
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
