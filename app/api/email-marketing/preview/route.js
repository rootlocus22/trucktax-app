import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getEmailMarketingAllowedEmails, isEmailAllowed } from '@/lib/emailMarketingAllowlist';
import { getCampaignById, getDefaultCampaignId } from '@/lib/emailCampaigns';

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

/** POST: return { subject, html } for the given campaign + customerData (no send). Auth required. */
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

    const allowedEmails = await getEmailMarketingAllowedEmails();
    if (!isEmailAllowed(allowedEmails, decoded.email)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const customer = parseCustomerData(body.customerData ?? body);
    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid customer data. Provide an object with at least "email".' },
        { status: 400 }
      );
    }

    const campaignId = body.campaignId && String(body.campaignId).trim() || getDefaultCampaignId();
    const campaign = getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: `Unknown campaign: ${campaignId}` }, { status: 400 });
    }

    const { subject, html } = campaign.getTemplate(customer);
    return NextResponse.json({ subject, html });
  } catch (err) {
    console.error('[email-marketing/preview]', err);
    return NextResponse.json({ error: err.message || 'Failed to generate preview' }, { status: 500 });
  }
}
