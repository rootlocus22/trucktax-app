'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import {
  Send, Mail, User, Building2, AlertCircle, Loader2, CheckCircle, FileText,
  Copy, RefreshCw, ChevronRight, Inbox, Code, Eye, Check, Upload, Users,
  BarChart2, MessageSquare, TrendingUp, XCircle, ArrowLeft, Megaphone, Database,
} from 'lucide-react';

const ROUTE_NAME = 'email-marketing';
const BCC_DEFAULT = 'support@vendaxsystemlabs.com';
const TYPE_LINE = /^\s*\([^)]*\)\s*$/;
const BATCH_SIZE = 10; // for small-list mode
const PUMP_INTERVAL_MS = 2500; // polling interval for send-all pump

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanValue(s) {
  if (s == null || typeof s !== 'string') return '';
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) return t.slice(1, -1).trim();
  return t;
}

function parsePaste(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch { /* try Firebase-style */ }
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
      const camel = key === 'legalname' ? 'legalName' : key === 'registrantname' ? 'registrantName'
        : key === 'displayname' ? 'displayName' : key === 'daysleft' ? 'daysLeft' : key;
      result[camel] = key === 'daysleft' ? (parseInt(valueLine, 10) || valueLine) : cleanValue(valueLine);
    }
  }
  if (result.email && result.email.includes('@')) return result;
  return null;
}

function getSampleJson(campaign) {
  const all = [...(campaign.requiredFields || []), ...(campaign.optionalFields || [])];
  const examples = {
    email: 'customer@example.com', legalName: 'ACME Trucking LLC', registrantName: 'Jane Smith',
    displayName: 'Jane', daysLeft: 14, companyName: 'ACME Trucking LLC', contactName: 'Jane',
    dotNumber: '123456', fleetBracket: '3–5 trucks', govFee: '$96', totalCost: '$175', state: 'TX',
  };
  const obj = {};
  all.forEach((f) => { obj[f] = examples[f] ?? (f === 'daysLeft' ? 14 : ''); });
  return JSON.stringify(obj, null, 2);
}

// Detect columns from Excel header row (for small-list mode)
function detectColumns(headers) {
  const h = headers.map((h) => String(h || '').toLowerCase().trim());
  const emailIdx = h.findIndex((x) => /^(email|e-mail|mail)$/.test(x) || x.includes('email'));
  const companyIdx = h.findIndex((x) => /company|business|firm|carrier|legal/.test(x) && !x.includes('email'));
  const contactIdx = h.findIndex((x) => /contact|person|owner|manager|first/.test(x) && !/company|business/.test(x));
  return { emailIdx, companyIdx: companyIdx === emailIdx ? -1 : companyIdx, contactIdx };
}

async function parseExcelFile(file) {
  const XLSX = (await import('xlsx')).default;
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rows.length < 2) return { contacts: [], headers: [] };
  const headers = rows[0].map(String);
  const { emailIdx, companyIdx, contactIdx } = detectColumns(headers);
  if (emailIdx === -1) return { contacts: [], headers, error: 'No email column found.' };
  const contacts = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const email = String(row[emailIdx] || '').trim().toLowerCase();
    if (!email || !email.includes('@')) continue;
    contacts.push({
      email,
      companyName: companyIdx >= 0 ? String(row[companyIdx] || '').trim() : '',
      contactName: contactIdx >= 0 ? String(row[contactIdx] || '').trim() : '',
    });
  }
  return { contacts, headers };
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  sent: 'bg-blue-100 text-blue-700', failed: 'bg-red-100 text-red-700',
  replied: 'bg-emerald-100 text-emerald-700', converted: 'bg-purple-100 text-purple-700',
  unsubscribed: 'bg-slate-100 text-slate-500', pending: 'bg-amber-100 text-amber-700',
  sending: 'bg-amber-100 text-amber-700', completed: 'bg-emerald-100 text-emerald-700',
  imported: 'bg-sky-100 text-sky-700',
};
function StatusBadge({ status }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function EmailMarketingContent() {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState({ allowed: null, email: null, error: null });
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState('fmcsa');

  // ── Single send ──────────────────────────────────────────────────────────
  const [campaignId, setCampaignId] = useState('customer_follow_up');
  const [paste, setPaste] = useState('');
  const [sending, setSending] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [preview, setPreview] = useState({ subject: '', html: '', loading: false, error: null });
  const [copied, setCopied] = useState(false);
  const previewDebounceRef = useRef(null);

  // ── Small list outreach ──────────────────────────────────────────────────
  const [outreachCampaignId, setOutreachCampaignId] = useState('ucr_outreach');
  const [outreachName, setOutreachName] = useState('');
  const [contacts, setContacts] = useState([]);
  const [fileError, setFileError] = useState('');
  const [fileName, setFileName] = useState('');
  const [bccEnabled, setBccEnabled] = useState(true);
  const [outreachProgress, setOutreachProgress] = useState(null);
  const [outreachSending, setOutreachSending] = useState(false);

  // ── FMCSA import ─────────────────────────────────────────────────────────
  const [fmcsaFile, setFmcsaFile] = useState(null); // File object
  const [fmcsaName, setFmcsaName] = useState('');
  const [fmcsaCampaignId, setFmcsaCampaignId] = useState('ucr_outreach');
  const [fmcsaBcc, setFmcsaBcc] = useState(true);
  const [fmcsaImporting, setFmcsaImporting] = useState(false);
  const [fmcsaImported, setFmcsaImported] = useState(null); // { id, total, name }
  const [fmcsaSending, setFmcsaSending] = useState(false);
  const [fmcsaProgress, setFmcsaProgress] = useState(null); // { sent, failed, remaining, done }
  const [fmcsaError, setFmcsaError] = useState('');
  const pumpRef = useRef(null);

  // ── CRM ──────────────────────────────────────────────────────────────────
  const [outreachCampaigns, setOutreachCampaigns] = useState([]);
  const [crmLoading, setCrmLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingContact, setUpdatingContact] = useState(null);

  // ── Access check ─────────────────────────────────────────────────────────
  const checkAccess = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/access', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setAccess({ allowed: false, email: user.email, error: data.error || 'Failed to check access' }); return; }
      setAccess({ allowed: data.allowed === true, email: data.email || user.email, error: null });
    } catch (err) { setAccess({ allowed: false, email: user?.email, error: err.message || 'Network error' }); }
  }, [user]);

  useEffect(() => { if (!user) return; checkAccess(); }, [user, checkAccess]);

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/campaigns', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setCampaigns(data.campaigns || []); }
    } catch { setCampaigns([]); }
  }, [user]);

  useEffect(() => { if (access.allowed) fetchCampaigns(); }, [access.allowed, fetchCampaigns]);

  // ── Single send ──────────────────────────────────────────────────────────
  const parsed = parsePaste(paste);
  const toEmail = parsed?.email && String(parsed.email).trim();
  const validRecipient = toEmail && toEmail.includes('@');
  const legalName = parsed?.legalName != null ? String(parsed.legalName).trim() : '';
  const registrantName = parsed?.registrantName != null ? String(parsed.registrantName).trim() : '';
  const campaignForSingle = campaigns.find((c) => c.id === campaignId);

  const customerDataForApi = useCallback(() => ({
    email: toEmail, legalName: legalName || undefined, registrantName: registrantName || undefined,
    displayName: parsed?.displayName || undefined, daysLeft: parsed?.daysLeft != null ? parsed.daysLeft : undefined,
  }), [toEmail, legalName, registrantName, parsed?.displayName, parsed?.daysLeft]);

  const fetchPreview = useCallback(async () => {
    if (!user || !validRecipient) { setPreview((p) => ({ ...p, subject: '', html: '', error: 'Add valid email to preview' })); return; }
    setPreview((p) => ({ ...p, loading: true, error: null }));
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/preview', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ campaignId, customerData: customerDataForApi() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setPreview({ subject: '', html: '', loading: false, error: data.error || 'Preview failed' }); return; }
      setPreview({ subject: data.subject || '', html: data.html || '', loading: false, error: null });
    } catch (err) { setPreview({ subject: '', html: '', loading: false, error: err.message || 'Preview failed' }); }
  }, [user, campaignId, validRecipient, customerDataForApi]);

  useEffect(() => {
    if (!validRecipient || !campaignForSingle) { setPreview((p) => ({ ...p, html: '', subject: '' })); return; }
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(fetchPreview, 400);
    return () => { if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current); };
  }, [campaignId, paste, validRecipient, campaignForSingle, fetchPreview]);

  const handleCopySample = useCallback(() => {
    if (!campaignForSingle) return;
    navigator.clipboard.writeText(getSampleJson(campaignForSingle)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }, [campaignForSingle]);

  const handleSingleSend = async () => {
    if (!validRecipient || !user) return;
    setSending(true); setSingleResult(null);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ campaignId, customerData: customerDataForApi() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setSingleResult({ ok: false, error: data.error || res.statusText }); return; }
      setSingleResult({ ok: true, sentTo: data.sentTo, subject: data.subject, campaignId: data.campaignId });
    } catch (err) { setSingleResult({ ok: false, error: err.message || 'Request failed' }); }
    finally { setSending(false); }
  };

  // ── Small list outreach ──────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(''); setContacts([]); setFileName(file.name);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'csv') {
        // Use PapaParse for CSV
        const Papa = (await import('papaparse')).default;
        Papa.parse(file, {
          header: true, skipEmptyLines: true,
          complete: (results) => {
            const parsed = [];
            for (const row of results.data) {
              const email = (row['Email'] || row['email'] || row['EMAIL'] || '').trim().toLowerCase();
              if (!email || !email.includes('@')) continue;
              parsed.push({
                email,
                companyName: (row['Company_Name'] || row['company'] || row['Business_Name'] || '').trim(),
                contactName: (row['Contact_Name'] || row['contact'] || '').trim(),
              });
            }
            if (parsed.length === 0) { setFileError('No valid emails found. For large FMCSA files, use the FMCSA Import tab.'); return; }
            setContacts(parsed);
          },
          error: (err) => setFileError(`CSV parse error: ${err.message}`),
        });
      } else {
        const { contacts: parsed, error } = await parseExcelFile(file);
        if (error) { setFileError(error); return; }
        if (parsed.length === 0) { setFileError('No valid email addresses found in the file.'); return; }
        setContacts(parsed);
      }
    } catch (err) { setFileError(`Failed to parse file: ${err.message}`); }
    e.target.value = '';
  };

  const handleStartOutreach = async () => {
    if (!user || contacts.length === 0 || outreachSending) return;
    setOutreachSending(true);
    const progress = { sent: 0, failed: 0, skipped: 0, total: contacts.length, done: false, campaignFirestoreId: null };
    setOutreachProgress({ ...progress });
    try {
      const token = await user.getIdToken(true);
      const bcc = bccEnabled ? [BCC_DEFAULT] : [];
      const name = outreachName.trim() || `UCR Outreach — ${new Date().toLocaleDateString()}`;
      const createRes = await fetch('/api/email-marketing/outreach', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, campaignId: outreachCampaignId, totalContacts: contacts.length, bcc }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) { setOutreachProgress((p) => ({ ...p, error: createData.error || 'Failed to create campaign', done: true })); setOutreachSending(false); return; }
      progress.campaignFirestoreId = createData.id;
      setOutreachProgress({ ...progress });

      for (let offset = 0; offset < contacts.length; offset += BATCH_SIZE) {
        const batch = contacts.slice(offset, offset + BATCH_SIZE);
        try {
          const t = await user.getIdToken();
          const batchRes = await fetch(`/api/email-marketing/outreach/${createData.id}/send`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
            body: JSON.stringify({ contacts: batch, bcc }),
          });
          const batchData = await batchRes.json().catch(() => ({}));
          if (batchRes.ok) { progress.sent += batchData.sent || 0; progress.failed += batchData.failed || 0; progress.skipped += batchData.skipped || 0; }
          else { progress.failed += batch.length; }
        } catch { progress.failed += batch.length; }
        setOutreachProgress({ ...progress });
      }
      try {
        const ft = await user.getIdToken();
        await fetch(`/api/email-marketing/outreach/${createData.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ft}` }, body: JSON.stringify({ status: 'completed' }) });
      } catch { /* non-critical */ }
      progress.done = true;
      setOutreachProgress({ ...progress });
    } catch (err) { setOutreachProgress((p) => ({ ...p, error: err.message, done: true })); }
    finally { setOutreachSending(false); }
  };

  // ── FMCSA Import + Pump ──────────────────────────────────────────────────
  const handleFmcsaFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFmcsaFile(file);
    setFmcsaImported(null);
    setFmcsaProgress(null);
    setFmcsaError('');
    const baseName = file.name.replace(/\.(csv|xlsx?)$/i, '').replace(/_/g, ' ');
    if (!fmcsaName) setFmcsaName(baseName);
    e.target.value = '';
  };

  const handleFmcsaImport = async () => {
    if (!fmcsaFile || !user || fmcsaImporting) return;
    setFmcsaImporting(true); setFmcsaError('');
    try {
      const token = await user.getIdToken(true);
      const formData = new FormData();
      formData.append('file', fmcsaFile);
      formData.append('name', fmcsaName.trim() || fmcsaFile.name);
      formData.append('campaignId', fmcsaCampaignId);
      if (fmcsaBcc) formData.append('bcc', BCC_DEFAULT);

      const res = await fetch('/api/email-marketing/outreach/import', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — let browser set it with boundary
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setFmcsaError(data.error || 'Import failed'); return; }
      setFmcsaImported({ id: data.id, total: data.total, withEmail: data.withEmail, name: data.name, skipped: data.skipped || 0 });
    } catch (err) { setFmcsaError(err.message || 'Import failed'); }
    finally { setFmcsaImporting(false); }
  };

  // Pump: call send-all repeatedly until done
  const handleFmcsaStartSending = async () => {
    if (!fmcsaImported || !user || fmcsaSending) return;
    setFmcsaSending(true);
    setFmcsaProgress({ sent: 0, failed: 0, skipped: 0, remaining: fmcsaImported.total, done: false });

    const pump = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/email-marketing/outreach/${fmcsaImported.id}/send-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ batchSize: 50 }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setFmcsaError(data.error || 'Send error'); setFmcsaSending(false); return;
        }
        setFmcsaProgress((p) => ({
          sent: (p?.sent || 0) + (data.sent || 0),
          failed: (p?.failed || 0) + (data.failed || 0),
          skipped: (p?.skipped || 0) + (data.skipped || 0),
          remaining: data.remaining || 0,
          done: data.done || false,
        }));
        if (data.done) {
          setFmcsaSending(false);
          loadOutreachCampaigns();
        } else {
          pumpRef.current = setTimeout(pump, PUMP_INTERVAL_MS);
        }
      } catch (err) {
        setFmcsaError(err.message); setFmcsaSending(false);
      }
    };

    pumpRef.current = setTimeout(pump, 500);
  };

  const handleFmcsaStopSending = () => {
    if (pumpRef.current) { clearTimeout(pumpRef.current); pumpRef.current = null; }
    setFmcsaSending(false);
  };

  useEffect(() => () => { if (pumpRef.current) clearTimeout(pumpRef.current); }, []);

  // ── CRM ──────────────────────────────────────────────────────────────────
  const loadOutreachCampaigns = useCallback(async () => {
    if (!user) return;
    setCrmLoading(true);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch('/api/email-marketing/outreach', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setOutreachCampaigns(data.campaigns || []); }
    } catch { /* ignore */ }
    finally { setCrmLoading(false); }
  }, [user]);

  useEffect(() => { if (activeTab === 'crm' && access.allowed) loadOutreachCampaigns(); }, [activeTab, access.allowed, loadOutreachCampaigns]);

  const loadCampaignDetail = async (campId) => {
    if (!user) return;
    setSelectedCampaign(campId); setDetailLoading(true); setCampaignDetail(null);
    try {
      const token = await user.getIdToken(true);
      const res = await fetch(`/api/email-marketing/outreach/${campId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setCampaignDetail(data); }
    } catch { /* ignore */ }
    finally { setDetailLoading(false); }
  };

  const handleContactStatusUpdate = async (contactId, status) => {
    if (!user || !selectedCampaign) return;
    setUpdatingContact(contactId);
    try {
      const token = await user.getIdToken(true);
      await fetch(`/api/email-marketing/outreach/${selectedCampaign}/contact`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contactId, status }),
      });
      await loadCampaignDetail(selectedCampaign);
    } catch { /* ignore */ }
    finally { setUpdatingContact(null); }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
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
          <p className="text-slate-600 mb-4">Only allowed users can access <strong>{ROUTE_NAME}</strong>. Your email ({access.email}) is not on the list.</p>
          <p className="text-sm text-slate-500">Firestore: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">config / emailMarketing</code> → <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">allowedEmails</code></p>
          <Link href="/dashboard" className="inline-block mt-6 text-[var(--color-orange)] font-semibold hover:underline">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'fmcsa', label: 'FMCSA Import', icon: Database },
    { id: 'outreach', label: 'Small List', icon: Megaphone },
    { id: 'crm', label: 'CRM Dashboard', icon: BarChart2 },
    { id: 'single', label: 'Single Send', icon: Send },
  ];

  const fmcsaSent = fmcsaProgress?.sent || 0;
  const fmcsaTotal = fmcsaImported?.total || 0;
  const fmcsaPct = fmcsaTotal > 0 ? Math.round((fmcsaSent / fmcsaTotal) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition"><ChevronRight className="w-5 h-5 rotate-180" /></Link>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)] flex items-center justify-center"><Inbox className="w-5 h-5 text-white" /></div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Email Marketing</h1>
                  <p className="text-xs text-slate-500">FMCSA outreach, campaigns & CRM</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-0.5">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap ${activeTab === id ? 'bg-white text-[var(--color-navy)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>
              <span className="text-sm text-slate-500 hidden sm:block">{access.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* ── FMCSA IMPORT TAB ──────────────────────────────────────────────── */}
        {activeTab === 'fmcsa' && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left config panel */}
            <div className="lg:col-span-2 space-y-5">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[var(--color-navy)]" />
                  <h2 className="font-bold text-slate-800">FMCSA Bulk Import</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800">
                    <strong>Handles large files.</strong> Imports contacts server-side into Firestore, then sends in background batches. Works for 100k+ contact FMCSA files.
                  </div>

                  {/* File picker */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select FMCSA CSV file</label>
                    {!fmcsaFile ? (
                      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[var(--color-orange)] hover:bg-orange-50/20 transition">
                        <Upload className="w-7 h-7 text-slate-400 mb-2" />
                        <span className="text-sm font-semibold text-slate-600">Click to select CSV file</span>
                        <span className="text-xs text-slate-400 mt-0.5">fmcsa_TX_all_carriers.csv, etc.</span>
                        <input type="file" accept=".csv" onChange={handleFmcsaFileSelect} className="hidden" />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-emerald-800">{fmcsaFile.name}</p>
                          <p className="text-xs text-emerald-600">{formatFileSize(fmcsaFile.size)}</p>
                        </div>
                        <button onClick={() => { setFmcsaFile(null); setFmcsaImported(null); setFmcsaProgress(null); setFmcsaError(''); }}
                          className="text-slate-400 hover:text-red-500 transition"><XCircle className="w-5 h-5" /></button>
                      </div>
                    )}
                  </div>

                  {/* Campaign name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Campaign name</label>
                    <input type="text" value={fmcsaName} onChange={(e) => setFmcsaName(e.target.value)}
                      placeholder="FMCSA TX Carriers — Mar 2026"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent" />
                  </div>

                  {/* Template */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email template</label>
                    <select value={fmcsaCampaignId} onChange={(e) => setFmcsaCampaignId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium bg-white focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent">
                      {campaigns.length === 0 && <option value="ucr_outreach">UCR Outreach (Cold) — Personalized with fleet data</option>}
                      {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* BCC toggle */}
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setFmcsaBcc(!fmcsaBcc)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${fmcsaBcc ? 'bg-[var(--color-orange)]' : 'bg-slate-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${fmcsaBcc ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">BCC {BCC_DEFAULT}</p>
                      <p className="text-xs text-slate-500">Blind copy on every outgoing email</p>
                    </div>
                  </div>

                  {fmcsaError && (
                    <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{fmcsaError}
                    </div>
                  )}

                  {/* Import button */}
                  {!fmcsaImported && (
                    <button onClick={handleFmcsaImport} disabled={!fmcsaFile || fmcsaImporting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--color-navy)] text-white font-bold rounded-xl hover:bg-[var(--color-midnight)] transition disabled:opacity-50 disabled:pointer-events-none">
                      {fmcsaImporting ? <><Loader2 className="w-5 h-5 animate-spin" /> Importing…</> : <><Upload className="w-5 h-5" /> Import to Campaign</>}
                    </button>
                  )}
                </div>
              </section>

              {/* Send controls (appears after import) */}
              {fmcsaImported && (
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-bold text-emerald-800">Imported — ready to send</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-[var(--color-navy)]">{fmcsaImported.total.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Contacts queued</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-2xl font-bold text-slate-600">{fmcsaImported.skipped.toLocaleString()}</p>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">Rows skipped (no email)</p>
                      </div>
                    </div>

                    {!fmcsaProgress ? (
                      <button onClick={handleFmcsaStartSending}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--color-orange)] text-white font-bold rounded-xl hover:bg-[#e66a15] transition">
                        <Send className="w-5 h-5" /> Start Sending {fmcsaImported.total.toLocaleString()} emails
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                          <span>{fmcsaProgress.done ? 'Send complete!' : `Sending… ${fmcsaSent.toLocaleString()} of ${fmcsaTotal.toLocaleString()}`}</span>
                          {!fmcsaProgress.done && <Loader2 className="w-4 h-4 animate-spin text-[var(--color-orange)]" />}
                          {fmcsaProgress.done && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div className="bg-[var(--color-orange)] h-3 rounded-full transition-all duration-500"
                            style={{ width: `${fmcsaPct}%` }} />
                        </div>
                        <p className="text-xs text-center text-slate-500">{fmcsaPct}% — {fmcsaProgress.remaining?.toLocaleString()} remaining</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-blue-50 rounded-lg p-2"><p className="text-xl font-bold text-blue-700">{fmcsaSent.toLocaleString()}</p><p className="text-blue-600 font-medium">Sent</p></div>
                          <div className="bg-red-50 rounded-lg p-2"><p className="text-xl font-bold text-red-700">{(fmcsaProgress.failed || 0).toLocaleString()}</p><p className="text-red-600 font-medium">Failed</p></div>
                          <div className="bg-slate-50 rounded-lg p-2"><p className="text-xl font-bold text-slate-600">{(fmcsaProgress.skipped || 0).toLocaleString()}</p><p className="text-slate-500 font-medium">Skipped</p></div>
                        </div>
                        {fmcsaSending && (
                          <button onClick={handleFmcsaStopSending}
                            className="w-full py-2.5 border-2 border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition">
                            Pause sending
                          </button>
                        )}
                        {fmcsaProgress.done && (
                          <div className="flex gap-3">
                            <button onClick={() => { setFmcsaFile(null); setFmcsaImported(null); setFmcsaProgress(null); setFmcsaName(''); setFmcsaError(''); }}
                              className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">New import</button>
                            <button onClick={() => { setActiveTab('crm'); loadOutreachCampaigns(); }}
                              className="flex-1 py-2.5 bg-[var(--color-navy)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-midnight)] transition">View in CRM</button>
                          </div>
                        )}
                        {fmcsaSending && (
                          <p className="text-xs text-slate-400 text-center">Sending 50 emails every 2.5s — keep this tab open</p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Right: File guide */}
            <div className="lg:col-span-3 space-y-5">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[var(--color-navy)]" />
                  <h2 className="font-bold text-slate-800">Available FMCSA Files</h2>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-600 mb-5">These are your FMCSA carrier files with pre-calculated UCR fees. Each email will be personalized with the carrier&rsquo;s DOT number, fleet size, and exact UCR cost.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">File</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Emails</th>
                          <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Total rows</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { file: 'fmcsa_interstate_small_fleet_with_email.csv', emails: 99223, rows: 100000 },
                          { file: 'fmcsa_TX_all_carriers.csv', emails: 159885, rows: 185744 },
                          { file: 'fmcsa_IL_all_carriers.csv', emails: 43566, rows: 50000 },
                          { file: 'fmcsa_PA_all_carriers.csv', emails: 37807, rows: 49704 },
                          { file: 'fmcsa_OH_all_carriers.csv', emails: 34002, rows: 40000 },
                          { file: 'fmcsa_NC_all_carriers.csv', emails: 33734, rows: 40000 },
                          { file: 'fmcsa_NY_all_carriers.csv', emails: 27361, rows: 50000 },
                          { file: 'fmcsa_CA_all_carriers.csv', emails: 27656, rows: 80000 },
                          { file: 'fmcsa_GA_all_carriers.csv', emails: 20240, rows: 39837 },
                          { file: 'fmcsa_TN_all_carriers.csv', emails: 20994, rows: 24990 },
                          { file: 'fmcsa_FL_all_carriers.csv', emails: 21724, rows: 50000 },
                        ].map(({ file, emails, rows }) => (
                          <tr key={file} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{file}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">{emails.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{rows.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold">
                          <td className="px-4 py-2.5 text-slate-700">Total (all files)</td>
                          <td className="px-4 py-2.5 text-right text-emerald-700">526,192</td>
                          <td className="px-4 py-2.5 text-right text-slate-500">750,275</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <strong>How emails are personalized:</strong> The UCR Outreach template uses each carrier&rsquo;s <code className="bg-amber-100 px-1 rounded">UCR_Fleet_Bracket</code>, <code className="bg-amber-100 px-1 rounded">UCR_Gov_Fee_2026</code>, and <code className="bg-amber-100 px-1 rounded">EasyUCR_Total_2026</code> columns to show their exact cost — e.g. &ldquo;Your fleet of 3–5 trucks means your 2026 UCR fee is $96. Total with EasyUCR: $175.&rdquo;
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── SMALL LIST OUTREACH TAB ───────────────────────────────────────── */}
        {activeTab === 'outreach' && (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[var(--color-navy)]" />
                  <h2 className="font-bold text-slate-800">Small List Outreach</h2>
                  <span className="text-xs text-slate-500 ml-1">(upload .xlsx or .csv, up to ~5k contacts)</span>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Campaign name</label>
                    <input type="text" value={outreachName} onChange={(e) => setOutreachName(e.target.value)}
                      placeholder={`UCR Outreach — ${new Date().toLocaleDateString()}`}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email template</label>
                    <select value={outreachCampaignId} onChange={(e) => setOutreachCampaignId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium bg-white focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent">
                      {campaigns.length === 0 && <option value="ucr_outreach">UCR Outreach (Cold)</option>}
                      {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setBccEnabled(!bccEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${bccEnabled ? 'bg-[var(--color-orange)]' : 'bg-slate-200'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${bccEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <p className="text-sm font-semibold text-slate-700">BCC {BCC_DEFAULT}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[var(--color-navy)]" />
                  <h2 className="font-bold text-slate-800">Upload Contacts</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-slate-600">Upload .xlsx or .csv with an <code className="bg-slate-100 px-1 rounded">email</code> column. For FMCSA files use the FMCSA Import tab.</p>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-[var(--color-orange)] hover:bg-orange-50/20 transition">
                    <Upload className="w-7 h-7 text-slate-400 mb-2" />
                    <span className="text-sm font-semibold text-slate-600">{fileName || 'Click to upload'}</span>
                    <span className="text-xs text-slate-400 mt-0.5">.xlsx or .csv</span>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {fileError && <div className="flex items-start gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{fileError}</div>}
                  {contacts.length > 0 && (
                    <div className="flex items-center justify-between gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-600" /><span className="text-sm font-semibold text-emerald-800">{contacts.length} contacts loaded</span></div>
                      <button onClick={() => { setContacts([]); setFileName(''); }} className="text-slate-400 hover:text-red-500 transition"><XCircle className="w-5 h-5" /></button>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                {!outreachProgress ? (
                  <button onClick={handleStartOutreach} disabled={contacts.length === 0 || outreachSending}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--color-orange)] text-white font-bold rounded-xl hover:bg-[#e66a15] transition disabled:opacity-50 disabled:pointer-events-none">
                    <Send className="w-5 h-5" />Send to {contacts.length || 0} contacts
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                      <span>{outreachProgress.done ? 'Complete!' : `Sending… ${outreachProgress.sent + outreachProgress.failed + outreachProgress.skipped} / ${outreachProgress.total}`}</span>
                      {!outreachProgress.done && <Loader2 className="w-4 h-4 animate-spin text-[var(--color-orange)]" />}
                      {outreachProgress.done && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                      <div className="bg-[var(--color-orange)] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(((outreachProgress.sent + outreachProgress.failed + outreachProgress.skipped) / Math.max(outreachProgress.total, 1)) * 100)}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-blue-50 rounded-lg p-2"><p className="text-2xl font-bold text-blue-700">{outreachProgress.sent}</p><p className="text-blue-600 font-medium">Sent</p></div>
                      <div className="bg-red-50 rounded-lg p-2"><p className="text-2xl font-bold text-red-700">{outreachProgress.failed}</p><p className="text-red-600 font-medium">Failed</p></div>
                      <div className="bg-slate-50 rounded-lg p-2"><p className="text-2xl font-bold text-slate-600">{outreachProgress.skipped}</p><p className="text-slate-500 font-medium">Skipped</p></div>
                    </div>
                    {outreachProgress.done && (
                      <div className="flex gap-3">
                        <button onClick={() => { setOutreachProgress(null); setContacts([]); setFileName(''); setOutreachName(''); }}
                          className="flex-1 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">New outreach</button>
                        <button onClick={() => { setActiveTab('crm'); loadOutreachCampaigns(); }}
                          className="flex-1 py-2.5 bg-[var(--color-navy)] text-white rounded-xl text-sm font-semibold hover:bg-[var(--color-midnight)] transition">View in CRM</button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>

            <div className="lg:sticky lg:top-24 self-start">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><Users className="w-5 h-5 text-[var(--color-navy)]" /><h2 className="font-bold text-slate-800">Contact Preview</h2></div>
                  {contacts.length > 0 && <span className="text-xs font-semibold text-slate-500">{contacts.length}</span>}
                </div>
                <div className="overflow-auto max-h-[600px]">
                  {contacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Upload className="w-10 h-10 mb-3 opacity-40" /><p className="text-sm font-medium">Upload a file to preview contacts</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">#</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Company</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {contacts.slice(0, 100).map((c, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                            <td className="px-4 py-2.5 text-slate-700 font-medium">{c.email}</td>
                            <td className="px-4 py-2.5 text-slate-500 max-w-[160px] truncate">{c.companyName || '—'}</td>
                          </tr>
                        ))}
                        {contacts.length > 100 && <tr><td colSpan={3} className="px-4 py-3 text-xs text-slate-400 text-center">+ {contacts.length - 100} more</td></tr>}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── CRM TAB ──────────────────────────────────────────────────────── */}
        {activeTab === 'crm' && (
          <div>
            {selectedCampaign ? (
              <div>
                <button onClick={() => { setSelectedCampaign(null); setCampaignDetail(null); }}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition">
                  <ArrowLeft className="w-4 h-4" />Back to campaigns
                </button>
                {detailLoading ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-navy)]" /></div>
                ) : campaignDetail ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800">{campaignDetail.campaign.name}</h2>
                          <p className="text-sm text-slate-500 mt-1">Template: {campaignDetail.campaign.campaignId} · by {campaignDetail.campaign.sentBy}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{campaignDetail.campaign.createdAt ? new Date(campaignDetail.campaign.createdAt).toLocaleString() : ''}</p>
                        </div>
                        <StatusBadge status={campaignDetail.campaign.status} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
                        {[
                          { label: 'Total', value: campaignDetail.campaign.total, color: 'text-slate-700' },
                          { label: 'Sent', value: campaignDetail.campaign.sent, color: 'text-blue-700' },
                          { label: 'Failed', value: campaignDetail.campaign.failed, color: 'text-red-600' },
                          { label: 'Replied', value: campaignDetail.campaign.replied, color: 'text-emerald-600' },
                          { label: 'Converted', value: campaignDetail.campaign.converted, color: 'text-purple-600' },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="bg-slate-50 rounded-xl p-4 text-center">
                            <p className={`text-3xl font-bold ${color}`}>{(value || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
                          </div>
                        ))}
                      </div>
                      {campaignDetail.campaign.sent > 0 && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Reply rate</span>
                            <span>{Math.round(((campaignDetail.campaign.replied || 0) / Math.max(campaignDetail.campaign.sent, 1)) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.round(((campaignDetail.campaign.replied || 0) / Math.max(campaignDetail.campaign.sent, 1)) * 100)}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Contacts ({campaignDetail.contacts.length})</h3>
                        <p className="text-xs text-slate-500">Mark replies and conversions below</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Company</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Fleet</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {campaignDetail.contacts.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-slate-700 font-medium"><a href={`mailto:${c.email}`} className="hover:text-[var(--color-orange)]">{c.email}</a></td>
                                <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">{c.companyName || '—'}</td>
                                <td className="px-4 py-3 text-slate-400 text-xs">{c.fleetBracket || '—'}</td>
                                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                                <td className="px-4 py-3">
                                  {(c.status === 'sent' || c.status === 'replied') && c.status !== 'converted' && (
                                    <div className="flex gap-2">
                                      {c.status === 'sent' && (
                                        <button onClick={() => handleContactStatusUpdate(c.id, 'replied')} disabled={updatingContact === c.id}
                                          className="text-xs px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition font-semibold disabled:opacity-50">
                                          {updatingContact === c.id ? '…' : 'Replied'}
                                        </button>
                                      )}
                                      <button onClick={() => handleContactStatusUpdate(c.id, 'converted')} disabled={updatingContact === c.id}
                                        className="text-xs px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition font-semibold disabled:opacity-50">
                                        {updatingContact === c.id ? '…' : 'Converted'}
                                      </button>
                                    </div>
                                  )}
                                  {c.status === 'failed' && c.error && <span className="text-xs text-red-500">{c.error.slice(0, 40)}</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Outreach Campaigns</h2>
                  <button onClick={loadOutreachCampaigns} disabled={crmLoading} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition">
                    <RefreshCw className={`w-4 h-4 ${crmLoading ? 'animate-spin' : ''}`} />Refresh
                  </button>
                </div>
                {crmLoading ? (
                  <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-navy)]" /></div>
                ) : outreachCampaigns.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
                    <Database className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-600 mb-2">No outreach campaigns yet</h3>
                    <p className="text-slate-500 mb-6">Import an FMCSA file to start your first outreach.</p>
                    <button onClick={() => setActiveTab('fmcsa')} className="px-6 py-3 bg-[var(--color-orange)] text-white font-bold rounded-xl hover:bg-[#e66a15] transition">Go to FMCSA Import</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Campaigns', value: outreachCampaigns.length, icon: Megaphone, color: 'text-[var(--color-navy)]' },
                        { label: 'Emails sent', value: outreachCampaigns.reduce((s, c) => s + (c.sent || 0), 0), icon: Send, color: 'text-blue-700' },
                        { label: 'Replied', value: outreachCampaigns.reduce((s, c) => s + (c.replied || 0), 0), icon: MessageSquare, color: 'text-emerald-700' },
                        { label: 'Converted', value: outreachCampaigns.reduce((s, c) => s + (c.converted || 0), 0), icon: TrendingUp, color: 'text-purple-700' },
                      ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
                          <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
                          <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
                          <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Campaign</th>
                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Sent</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Replied</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Converted</th>
                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                            <th className="px-4 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {outreachCampaigns.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => loadCampaignDetail(c.id)}>
                              <td className="px-6 py-4"><p className="font-semibold text-slate-800">{c.name}</p><p className="text-xs text-slate-400 mt-0.5">{c.campaignId}</p></td>
                              <td className="px-4 py-4"><StatusBadge status={c.status} /></td>
                              <td className="px-4 py-4 text-right text-slate-600">{(c.total || 0).toLocaleString()}</td>
                              <td className="px-4 py-4 text-right font-semibold text-blue-700">{(c.sent || 0).toLocaleString()}</td>
                              <td className="px-4 py-4 text-right font-semibold text-emerald-600">{c.replied || 0}</td>
                              <td className="px-4 py-4 text-right font-semibold text-purple-600">{c.converted || 0}</td>
                              <td className="px-4 py-4 text-right text-xs text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                              <td className="px-4 py-4 text-right"><ChevronRight className="w-4 h-4 text-slate-400 inline" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SINGLE SEND TAB ───────────────────────────────────────────────── */}
        {activeTab === 'single' && (
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><FileText className="w-5 h-5 text-[var(--color-navy)]" /><h2 className="font-bold text-slate-800">Campaign</h2></div>
                <div className="p-6 space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">Select template</label>
                  <select value={campaignId} onChange={(e) => { setCampaignId(e.target.value); setSingleResult(null); }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 bg-white focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent">
                    {campaigns.length === 0 && <option value="customer_follow_up">Customer follow-up</option>}
                    {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {campaignForSingle?.description && <p className="text-sm text-slate-600">{campaignForSingle.description}</p>}
                  {campaignForSingle && (
                    <>
                      <div className="flex items-center justify-between gap-2 pt-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">JSON schema</span>
                        <button type="button" onClick={handleCopySample}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-orange)] hover:text-[#e66a15] transition">
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Copied' : 'Copy sample'}
                        </button>
                      </div>
                      <pre className="text-xs bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto font-mono">{getSampleJson(campaignForSingle)}</pre>
                    </>
                  )}
                </div>
              </section>

              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2"><Code className="w-5 h-5 text-[var(--color-navy)]" /><h2 className="font-bold text-slate-800">Recipient data</h2></div>
                <div className="p-6 space-y-4">
                  <textarea value={paste} onChange={(e) => { setPaste(e.target.value); setSingleResult(null); }}
                    placeholder={`{"email":"customer@example.com","legalName":"ACME LLC"}`}
                    className="w-full h-36 rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent resize-y bg-slate-50/50"
                    spellCheck={false} />
                  {paste.trim() && !parsed && (
                    <p className="text-amber-600 text-sm flex items-center gap-1.5"><AlertCircle className="w-4 h-4 flex-shrink-0" />Invalid or missing <code>email</code>.</p>
                  )}
                  {parsed && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Parsed recipient</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-2 text-slate-700"><Mail className="w-4 h-4 text-slate-400" /><strong>{toEmail}</strong></span>
                        {legalName && <span className="flex items-center gap-2 text-slate-600"><Building2 className="w-4 h-4 text-slate-400" />{legalName}</span>}
                        {registrantName && <span className="flex items-center gap-2 text-slate-600"><User className="w-4 h-4 text-slate-400" />{registrantName}</span>}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button type="button" onClick={fetchPreview} disabled={!validRecipient}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
                      <RefreshCw className={`w-4 h-4 ${preview.loading ? 'animate-spin' : ''}`} />Preview
                    </button>
                    <button type="button" onClick={handleSingleSend} disabled={!validRecipient || sending}
                      className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 bg-[var(--color-orange)] text-white font-bold rounded-xl hover:bg-[#e66a15] transition disabled:opacity-50 disabled:pointer-events-none">
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}{sending ? 'Sending…' : 'Send email'}
                    </button>
                  </div>
                  {singleResult?.ok && <p className="text-emerald-600 text-sm flex items-center gap-2"><CheckCircle className="w-5 h-5" />Sent to {singleResult.sentTo}. Subject: {singleResult.subject}</p>}
                  {singleResult && !singleResult.ok && <p className="text-red-600 text-sm flex items-center gap-2"><AlertCircle className="w-5 h-5" />{singleResult.error}</p>}
                </div>
              </section>
            </div>

            <div className="lg:sticky lg:top-24 self-start">
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><Eye className="w-5 h-5 text-[var(--color-navy)]" /><h2 className="font-bold text-slate-800">Email preview</h2></div>
                  {preview.loading && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}
                </div>
                <div className="p-4 space-y-3">
                  {preview.error && <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">{preview.error}</div>}
                  {preview.subject && <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subject</p><p className="text-sm font-medium text-slate-800 break-all">{preview.subject}</p></div>}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden min-h-[320px] max-h-[70vh] flex flex-col">
                    {preview.html ? (
                      <iframe title="Email preview" srcDoc={preview.html} className="w-full flex-1 min-h-[400px] border-0 bg-white" sandbox="allow-same-origin" />
                    ) : (
                      <div className="flex-1 min-h-[400px] flex items-center justify-center text-slate-400 text-sm">
                        {validRecipient ? (preview.loading ? 'Loading…' : 'Preview will appear here') : 'Enter recipient data to see preview'}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
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
