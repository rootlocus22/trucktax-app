import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getEmailMarketingAllowedEmails, isEmailAllowed } from '@/lib/emailMarketingAllowlist';
import { sendEmail } from '@/lib/ses';
import { getCampaignById, getDefaultCampaignId } from '@/lib/emailCampaigns';
import { isUnsubscribed } from '@/lib/unsubscribedEmails';

function parseCustomerData(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const email = raw.email && String(raw.email).trim();
  if (!email || !email.includes('@')) return null;
  return {
    email,
    legalName: raw.legalName ? String(raw.legalName).trim() : '',
    registrantName: raw.registrantName ? String(raw.registrantName).trim() : '',
    displayName: raw.displayName ? String(raw.displayName).trim() : '',
    daysLeft: raw.daysLeft != null ? Number(raw.daysLeft) : undefined,
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

    const campaignId = body.campaignId && String(body.campaignId).trim() || getDefaultCampaignId();
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: `Unknown campaign: ${campaignId}. Use one of: customer_follow_up, welcome, abandon_ucr, ucr_seasonal_reminder, ucr_deadline_reminder, post_download_thank_you` },
        { status: 400 }
      );
    }

    if (await isUnsubscribed(customer.email)) {
      return NextResponse.json({
        ok: true,
        sent: false,
        reason: 'unsubscribed',
        sentTo: customer.email,
        message: 'Skipped; this email is unsubscribed from marketing.',
      });
    }

    const { subject, html, plainText } = campaign.getTemplate(customer);

    await sendEmail(customer.email, subject, html, plainText || undefined);

    return NextResponse.json({ ok: true, sent: true, sentTo: customer.email, subject, campaignId: campaign.id });
  } catch (err) {
    console.error('[email-marketing/send]', err);
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
  }
}
