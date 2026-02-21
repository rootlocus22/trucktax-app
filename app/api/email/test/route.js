import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/ses';
import {
  getWelcomeEmailTemplate,
  getAbandonEmailTemplate,
  getInvoiceEmailTemplate,
  getFilingSubmittedEmailTemplate,
  getFilingProcessingStartedEmailTemplate,
  getFilingCompletedPayDownloadEmailTemplate,
} from '@/lib/emailTemplates';

const EMAIL_TYPES = [
  'welcome',
  'abandon',
  'invoice',
  'filing_submitted',
  'filing_processing_started',
  'filing_completed',
];

export const dynamic = 'force-dynamic';

function isAllowed(req) {
  const secret = process.env.EMAIL_TEST_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    return auth === `Bearer ${secret}`;
  }
  return process.env.NODE_ENV === 'development';
}

export async function POST(req) {
  if (!isAllowed(req)) {
    return NextResponse.json({ error: 'Unauthorized. Set EMAIL_TEST_SECRET or run in development.' }, { status: 401 });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON body required' }, { status: 400 });
  }

  const to = (body.to || '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'Valid "to" email is required' }, { status: 400 });
  }

  const type = (body.type || '').toLowerCase().trim();
  const typesToSend = type
    ? (EMAIL_TYPES.includes(type) ? [type] : [])
    : EMAIL_TYPES;

  if (typesToSend.length === 0) {
    return NextResponse.json({
      error: `Invalid type. Use one of: ${EMAIL_TYPES.join(', ')}`,
    }, { status: 400 });
  }

  const results = [];

  for (const t of typesToSend) {
    try {
      let subject, html;
      switch (t) {
        case 'welcome':
          ({ subject, html } = getWelcomeEmailTemplate({ displayName: 'Test User' }));
          break;
        case 'abandon': {
          const abandon = getAbandonEmailTemplate({ firstName: 'Test' });
          subject = abandon.subject;
          html = abandon.html;
          break;
        }
        case 'invoice':
          ({ subject, html } = getInvoiceEmailTemplate({
            amount: 79,
            filingId: 'test-filing-123',
            legalName: 'Test Trucking LLC',
          }));
          break;
        case 'filing_submitted':
          ({ subject, html } = getFilingSubmittedEmailTemplate({
            legalName: 'Test Trucking LLC',
            filingId: 'test-filing-123',
          }));
          break;
        case 'filing_processing_started':
          ({ subject, html } = getFilingProcessingStartedEmailTemplate({
            legalName: 'Test Trucking LLC',
            filingId: 'test-filing-123',
          }));
          break;
        case 'filing_completed':
          ({ subject, html } = getFilingCompletedPayDownloadEmailTemplate({
            legalName: 'Test Trucking LLC',
            filingId: 'test-filing-123',
            amount: 79,
          }));
          break;
        default:
          results.push({ type: t, ok: false, error: 'Unknown type' });
          continue;
      }
      const result = await sendEmail(to, subject, html);
      results.push({ type: t, ok: true, messageId: result.messageId, subject });
    } catch (err) {
      results.push({ type: t, ok: false, error: err.message || String(err) });
    }
  }

  const allOk = results.every((r) => r.ok);
  return NextResponse.json({
    ok: allOk,
    to,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  }, { status: allOk ? 200 : 207 });
}

export async function GET(req) {
  if (!isAllowed(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    usage: 'POST with body: { "to": "your@email.com", "type": "welcome" }',
    types: EMAIL_TYPES,
    note: 'Omit "type" to send all emails. Use Authorization: Bearer <EMAIL_TEST_SECRET> in production.',
  });
}
