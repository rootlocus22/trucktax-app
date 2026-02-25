import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getEmailMarketingAllowedEmails, isEmailAllowed } from '@/lib/emailMarketingAllowlist';
import { EMAIL_CAMPAIGNS } from '@/lib/emailCampaigns';

/** GET: list campaigns for the dropdown (id, name, description, requiredFields, optionalFields). Auth required. */
export async function GET(req) {
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

    const list = EMAIL_CAMPAIGNS.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      requiredFields: c.requiredFields,
      optionalFields: c.optionalFields || [],
    }));

    return NextResponse.json({ campaigns: list });
  } catch (err) {
    console.error('[email-marketing/campaigns]', err);
    return NextResponse.json({ error: err.message || 'Failed to list campaigns' }, { status: 500 });
  }
}
