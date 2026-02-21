import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getEmailMarketingAllowedEmails, isEmailAllowed } from '@/lib/emailMarketingAllowlist';
import { sendEmail } from '@/lib/ses';
import { getCustomerFollowUpEmailTemplate } from '@/lib/emailTemplates';

function parseCustomerData(body) {
  const raw = typeof body === 'string' ? (() => { try { return JSON.parse(body); } catch { return null; } })() : body;
  if (!raw || typeof raw !== 'object') return null;
  const email = raw.email && String(raw.email).trim();
  if (!email || !email.includes('@')) return null;
  return {
    email,
    legalName: raw.legalName ? String(raw.legalName).trim() : '',
    registrantName: raw.registrantName ? String(raw.registrantName).trim() : '',
  };
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const callerEmail = decoded.email;
    if (!callerEmail) {
      return NextResponse.json({ error: 'No email on account' }, { status: 400 });
    }

    const allowedEmails = await getEmailMarketingAllowedEmails();
    if (!isEmailAllowed(allowedEmails, callerEmail)) {
      return NextResponse.json({ error: 'Access denied. Your email is not on the allowlist.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const customer = parseCustomerData(body.customerData ?? body);
    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid customer data. Provide an object with at least "email" (e.g. { email, legalName, registrantName }).' },
        { status: 400 }
      );
    }

    const { subject, html, plainText } = getCustomerFollowUpEmailTemplate({
      legalName: customer.legalName,
      registrantName: customer.registrantName,
    });

    await sendEmail(customer.email, subject, html, plainText || undefined);

    return NextResponse.json({ ok: true, sentTo: customer.email, subject });
  } catch (err) {
    console.error('[email-marketing/send]', err);
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
  }
}
