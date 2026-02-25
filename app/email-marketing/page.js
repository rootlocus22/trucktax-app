'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import {
  Send,
  Mail,
  User,
  Building2,
  AlertCircle,
  Loader2,
  CheckCircle,
  FileText,
  Copy,
  RefreshCw,
  ChevronRight,
  Inbox,
  Code,
  Eye,
  Check,
} from 'lucide-react';

const ROUTE_NAME = 'email-marketing';
const TYPE_LINE = /^\s*\([^)]*\)\s*$/;

function cleanValue(s) {
  if (s == null || typeof s !== 'string') return '';
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

function parsePaste(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // try Firebase-style
  }
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim());
  const result = {};
  const knownKeys = new Set(['email', 'legalname', 'registrantname', 'displayname', 'daysleft']);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const key = line.toLowerCase();
    if (!knownKeys.has(key)) continue;
    let valueLine = lines[i + 1];
    if (valueLine != null && TYPE_LINE.test(valueLine)) valueLine = null;
    if (valueLine != null && valueLine !== '') {
      const camel = key === 'legalname' ? 'legalName' : key === 'registrantname' ? 'registrantName' : key === 'displayname' ? 'displayName' : key === 'daysleft' ? 'daysLeft' : key;
      result[camel] = key === 'daysleft' ? (parseInt(valueLine, 10) || valueLine) : cleanValue(valueLine);
    }
  }
  if (result.email && result.email.includes('@')) return result;
  return null;
}

/** Sample JSON for a campaign (required + optional with example values). */
function getSampleJson(campaign) {
  const all = [...(campaign.requiredFields || []), ...(campaign.optionalFields || [])];
  const examples = {
    email: 'customer@example.com',
    legalName: 'ACME Trucking LLC',
    registrantName: 'Jane Smith',
    displayName: 'Jane',
    daysLeft: 14,
  };
  const obj = {};
  all.forEach((f) => { obj[f] = examples[f] ?? (f === 'daysLeft' ? 14 : ''); });
  return JSON.stringify(obj, null, 2);
}

function EmailMarketingContent() {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState({ allowed: null, email: null, error: null });
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState('customer_follow_up');
  const [paste, setPaste] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState({ subject: '', html: '', loading: false, error: null });
  const [copied, setCopied] = useState(false);
  const previewDebounceRef = useRef(null);

  const checkAccess = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/access', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAccess({ allowed: false, email: user.email, error: data.error || 'Failed to check access' });
        return;
      }
      setAccess({ allowed: data.allowed === true, email: data.email || user.email, error: null });
    } catch (err) {
      setAccess({ allowed: false, email: user?.email, error: err.message || 'Network error' });
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    checkAccess();
  }, [user, checkAccess]);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch {
      setCampaigns([]);
    }
  }, [user]);

  useEffect(() => {
    if (access.allowed) fetchCampaigns();
  }, [access.allowed, fetchCampaigns]);

  const parsed = parsePaste(paste);
  const toEmail = parsed?.email && String(parsed.email).trim();
  const validRecipient = toEmail && toEmail.includes('@');
  const legalName = parsed?.legalName != null ? String(parsed.legalName).trim() : '';
  const registrantName = parsed?.registrantName != null ? String(parsed.registrantName).trim() : '';
  const selectedCampaign = campaigns.find((c) => c.id === campaignId);

  const customerDataForApi = useCallback(() => ({
    email: toEmail,
    legalName: legalName || undefined,
    registrantName: registrantName || undefined,
    displayName: parsed?.displayName || undefined,
    daysLeft: parsed?.daysLeft != null ? parsed.daysLeft : undefined,
  }), [toEmail, legalName, registrantName, parsed?.displayName, parsed?.daysLeft]);

  const fetchPreview = useCallback(async () => {
    if (!user || !validRecipient) {
      setPreview((p) => ({ ...p, subject: '', html: '', error: 'Add valid email to preview' }));
      return;
    }
    setPreview((p) => ({ ...p, loading: true, error: null }));
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ campaignId, customerData: customerDataForApi() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPreview({ subject: '', html: '', loading: false, error: data.error || 'Preview failed' });
        return;
      }
      setPreview({ subject: data.subject || '', html: data.html || '', loading: false, error: null });
    } catch (err) {
      setPreview({ subject: '', html: '', loading: false, error: err.message || 'Preview failed' });
    }
  }, [user, campaignId, validRecipient, customerDataForApi]);

  useEffect(() => {
    if (!validRecipient || !selectedCampaign) {
      setPreview((p) => ({ ...p, html: '', subject: '' }));
      return;
    }
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(fetchPreview, 400);
    return () => {
      if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    };
  }, [campaignId, paste, validRecipient, selectedCampaign, fetchPreview]);


  const handleCopySample = useCallback(() => {
    if (!selectedCampaign) return;
    const sample = getSampleJson(selectedCampaign);
    navigator.clipboard.writeText(sample).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [selectedCampaign]);

  const handleSend = async () => {
    if (!validRecipient || !user) return;
    setSending(true);
    setResult(null);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          campaignId,
          customerData: customerDataForApi(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, error: data.error || res.statusText });
        return;
      }
      setResult({ ok: true, sentTo: data.sentTo, subject: data.subject, campaignId: data.campaignId });
    } catch (err) {
      setResult({ ok: false, error: err.message || 'Request failed' });
    } finally {
      setSending(false);
    }
  };

  if (authLoading || access.allowed === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-navy)]" />
          <p className="text-sm text-slate-500">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Access denied</h1>
          <p className="text-slate-600 mb-4">
            Only allowed users can access <strong>{ROUTE_NAME}</strong>. Your email ({access.email}) is not on the list.
          </p>
          <p className="text-sm text-slate-500">
            Firestore: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">config / emailMarketing</code> → <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">allowedEmails</code> (array).
          </p>
          <Link href="/dashboard" className="inline-block mt-6 text-[var(--color-orange)] font-semibold hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Tool header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] flex items-center justify-center">
                  <Inbox className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Email Marketing</h1>
                  <p className="text-xs text-slate-500">Campaigns, preview & send</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Logged in as <span className="font-medium text-slate-700">{access.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left: Campaign + Data */}
          <div className="space-y-6">
            {/* Campaign card */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--color-navy)]" />
                <h2 className="font-bold text-slate-800">Campaign</h2>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Select template</label>
                <select
                  value={campaignId}
                  onChange={(e) => { setCampaignId(e.target.value); setResult(null); }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent"
                >
                  {campaigns.length === 0 && <option value="customer_follow_up">Customer follow-up</option>}
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {selectedCampaign?.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">{selectedCampaign.description}</p>
                )}
                {selectedCampaign && (
                  <>
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">JSON schema</span>
                      <button
                        type="button"
                        onClick={handleCopySample}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-orange)] hover:text-[#e66a15] transition"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy sample'}
                      </button>
                    </div>
                    <pre className="text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto font-mono">
                      {getSampleJson(selectedCampaign)}
                    </pre>
                    <p className="text-xs text-slate-500">
                      Required: <code className="bg-slate-100 px-1 rounded">{selectedCampaign.requiredFields?.join(', ')}</code>
                      {selectedCampaign.optionalFields?.length ? (
                        <> · Optional: <code className="bg-slate-100 px-1 rounded">{selectedCampaign.optionalFields.join(', ')}</code></>
                      ) : null}
                    </p>
                  </>
                )}
              </div>
            </section>

            {/* Data input card */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Code className="w-5 h-5 text-[var(--color-navy)]" />
                <h2 className="font-bold text-slate-800">Recipient data</h2>
              </div>
              <div className="p-6 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Paste JSON or Firebase console copy</label>
                <textarea
                  value={paste}
                  onChange={(e) => { setPaste(e.target.value); setResult(null); }}
                  placeholder={`{"email":"customer@example.com","legalName":"ACME LLC","registrantName":"Jane"}`}
                  className="w-full h-36 rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent resize-y bg-slate-50/50"
                  spellCheck={false}
                />
                {paste.trim() && !parsed && (
                  <p className="text-amber-600 text-sm flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> Invalid or missing <code>email</code>. Use valid JSON or Firebase-style copy.
                  </p>
                )}
                {parsed && (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Parsed recipient</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <strong>{toEmail}</strong>
                      </span>
                      {legalName && (
                        <span className="flex items-center gap-2 text-slate-600">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {legalName}
                        </span>
                      )}
                      {registrantName && (
                        <span className="flex items-center gap-2 text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          {registrantName}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={fetchPreview}
                    disabled={!validRecipient}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${preview.loading ? 'animate-spin' : ''}`} />
                    Refresh preview
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!validRecipient || sending}
                    className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-[var(--color-orange)] text-white font-bold rounded-xl hover:bg-[#e66a15] transition disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {sending ? 'Sending…' : 'Send email'}
                  </button>
                </div>
                {result?.ok && (
                  <p className="text-emerald-600 text-sm flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Sent to {result.sentTo}. Subject: {result.subject}
                    {result.campaignId && <span className="text-slate-500">({result.campaignId})</span>}
                  </p>
                )}
                {result && !result.ok && (
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    {result.error}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right: Email preview */}
          <div className="lg:sticky lg:top-24 self-start">
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[var(--color-navy)]" />
                  <h2 className="font-bold text-slate-800">Email preview</h2>
                </div>
                {preview.loading && (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                )}
              </div>
              <div className="p-4 space-y-3">
                {preview.error && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    {preview.error}
                  </div>
                )}
                {preview.subject && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subject</p>
                    <p className="text-sm font-medium text-slate-800 break-all">{preview.subject}</p>
                  </div>
                )}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden min-h-[320px] max-h-[70vh] flex flex-col">
                  {preview.html ? (
                    <iframe
                      title="Email preview"
                      srcDoc={preview.html}
                      className="w-full flex-1 min-h-[400px] border-0 bg-white"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="flex-1 min-h-[400px] flex items-center justify-center text-slate-400 text-sm">
                      {validRecipient ? (preview.loading ? 'Loading preview…' : 'Preview will appear here') : 'Enter recipient data to see preview'}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EmailMarketingPage() {
  return (
    <ProtectedRoute>
      <EmailMarketingContent />
    </ProtectedRoute>
  );
}
