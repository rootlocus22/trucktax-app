'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Send, Mail, User, Building2, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const ROUTE_NAME = 'email-marketing';

const FIELDS_WE_NEED = ['email', 'legalName', 'registrantName'];
const TYPE_LINE = /^\s*\([^)]*\)\s*$/; // e.g. "(string)", "(number)", "(timestamp)"

/** Strip surrounding quotes and trim */
function cleanValue(s) {
  if (s == null || typeof s !== 'string') return '';
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/**
 * Parse Firebase console copy: key on one line, value on next, then optional (type).
 * Also accepts raw JSON.
 */
function parsePaste(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // 1) Try exact JSON first
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // not JSON, try Firebase-style
  }

  // 2) Parse Firebase console copy: "fieldName\nvalue\n(type)" — key on one line, value on next
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim());
  const result = {};
  const knownKeys = new Set(['email', 'legalname', 'registrantname']);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const key = line.toLowerCase();
    if (!knownKeys.has(key)) continue;

    // Value is usually the very next line; if it's a type hint like "(string)", look back
    let valueLine = lines[i + 1];
    if (valueLine != null && TYPE_LINE.test(valueLine)) valueLine = null;
    if (valueLine != null && valueLine !== '') {
      const camel = key === 'legalname' ? 'legalName' : key === 'registrantname' ? 'registrantName' : key;
      result[camel] = cleanValue(valueLine);
    }
  }

  if (result.email && result.email.includes('@')) return result;
  return null;
}

function EmailMarketingContent() {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState({ allowed: null, email: null, error: null });
  const [paste, setPaste] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

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

  const parsed = parsePaste(paste);
  const toEmail = parsed?.email && String(parsed.email).trim();
  const validRecipient = toEmail && toEmail.includes('@');
  const legalName = parsed?.legalName != null ? String(parsed.legalName).trim() : '';
  const registrantName = parsed?.registrantName != null ? String(parsed.registrantName).trim() : '';

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
          customerData: {
            email: toEmail,
            legalName: legalName || undefined,
            registrantName: registrantName || undefined,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ ok: false, error: data.error || res.statusText });
        return;
      }
      setResult({ ok: true, sentTo: data.sentTo, subject: data.subject });
    } catch (err) {
      setResult({ ok: false, error: err.message || 'Request failed' });
    } finally {
      setSending(false);
    }
  };

  if (authLoading || access.allowed === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-navy)]" />
          <p className="text-sm text-[var(--color-muted)]">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!access.allowed) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">Access denied</h1>
          <p className="text-slate-600 mb-4">
            Only allowed users can access <strong>{ROUTE_NAME}</strong>. Your email ({access.email}) is not on the list.
          </p>
          <p className="text-sm text-slate-500">
            To grant access, add a document in Firestore: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">config / emailMarketing</code> with field <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">allowedEmails</code> (array of email strings). Add your email there to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Email marketing</h1>
        <p className="text-[var(--color-muted)] mt-1">Paste <strong>JSON</strong> or <strong>Firebase console copy</strong> (field names + values). We’ll extract email, legalName, and registrantName. Route: <code className="bg-slate-100 px-1 rounded text-sm">{ROUTE_NAME}</code></p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">Paste customer data (JSON or Firebase console copy)</label>
          <textarea
            value={paste}
            onChange={(e) => { setPaste(e.target.value); setResult(null); }}
            placeholder={'Paste JSON: {"email":"a@b.com","legalName":"ACME LLC","registrantName":"Jane"}\n\nOr Firebase copy:\nemail\n"mawbea04@yahoo.com"\n(string)\nlegalName\n"G5 TRUCKING LLC"\n(string)'}
            className="w-full h-40 rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono text-[var(--color-text)] placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent resize-y"
            spellCheck={false}
          />
          {paste.trim() && !parsed && (
            <p className="text-amber-600 text-sm mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> Could not find a valid <code>email</code>. Paste JSON or Firebase-style copy (field name, then value, e.g. email then "user@example.com").
            </p>
          )}
        </div>

        {parsed && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Preview — email will be sent to:</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <strong>{validRecipient ? toEmail : '(invalid or missing email)'}</strong>
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

        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {result?.ok && (
              <p className="text-emerald-600 text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Sent to {result.sentTo}. Subject: {result.subject}
              </p>
            )}
            {result && !result.ok && (
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {result.error}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={!validRecipient || sending}
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-[var(--color-orange)] text-white font-bold rounded-xl hover:bg-[#e66a15] transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {sending ? 'Sending…' : 'Send email to this customer'}
          </button>
        </div>
      </div>
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
