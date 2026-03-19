import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getEmailMarketingAllowedEmails, isEmailAllowed } from '@/lib/emailMarketingAllowlist';
import { sendEmail } from '@/lib/ses';
import { getCampaignById } from '@/lib/emailCampaigns';
import { isUnsubscribed } from '@/lib/unsubscribedEmails';

async function verifyAccess(req) {
  const authHeader = req.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return { error: 'Unauthorized', status: 401 };
  let decoded;
  try { decoded = await adminAuth.verifyIdToken(idToken); } catch { return { error: 'Invalid token', status: 401 }; }
  const callerEmail = decoded.email;
  if (!callerEmail) return { error: 'No email on account', status: 400 };
  const allowedEmails = await getEmailMarketingAllowedEmails();
  if (!isEmailAllowed(allowedEmails, callerEmail)) return { error: 'Access denied', status: 403 };
  return { callerEmail };
}

/**
 * POST /api/email-marketing/outreach/[id]/send
 * Send a batch of contacts for the given outreach campaign.
 * Body: { contacts: [{email, companyName, contactName}...], bcc: ['support@...'] }
 * Returns: { sent, failed, skipped, errors }
 */
export async function POST(req, { params }) {
  try {
    const auth = await verifyAccess(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const campaignRef = adminDb.collection('email_outreach_campaigns').doc(id);
    const campaignSnap = await campaignRef.get();
    if (!campaignSnap.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const campaignData = campaignSnap.data();
    const campaign = getCampaignById(campaignData.campaignId);
    if (!campaign) return NextResponse.json({ error: `Unknown campaign type: ${campaignData.campaignId}` }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const contacts = Array.isArray(body.contacts) ? body.contacts : [];
    const bcc = Array.isArray(body.bcc) ? body.bcc : (campaignData.bcc || []);

    if (contacts.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0, errors: [] });
    }

    let sent = 0, failed = 0, skipped = 0;
    const errors = [];
    const now = new Date();
    const contactsCollection = campaignRef.collection('contacts');

    for (const contact of contacts) {
      const email = contact.email && String(contact.email).trim().toLowerCase();
      if (!email || !email.includes('@')) {
        skipped++;
        continue;
      }

      // Check unsubscribe
      if (await isUnsubscribed(email)) {
        skipped++;
        await contactsCollection.add({
          email,
          companyName: contact.companyName || '',
          contactName: contact.contactName || '',
          status: 'unsubscribed',
          sentAt: now,
        });
        continue;
      }

      try {
        const { subject, html, plainText } = campaign.getTemplate({
          email,
          companyName: contact.companyName || '',
          contactName: contact.contactName || '',
          legalName: contact.companyName || '',
          registrantName: contact.contactName || '',
        });

        await sendEmail(email, subject, html, plainText || undefined, { bcc: bcc.length ? bcc : undefined });

        await contactsCollection.add({
          email,
          companyName: contact.companyName || '',
          contactName: contact.contactName || '',
          status: 'sent',
          sentAt: now,
        });
        sent++;
      } catch (err) {
        failed++;
        errors.push({ email, error: err.message });
        await contactsCollection.add({
          email,
          companyName: contact.companyName || '',
          contactName: contact.contactName || '',
          status: 'failed',
          sentAt: now,
          error: err.message,
        });
      }
    }

    // Atomically increment campaign stats
    await campaignRef.update({
      sent: (campaignData.sent || 0) + sent,
      failed: (campaignData.failed || 0) + failed,
      updatedAt: now,
    });

    return NextResponse.json({ sent, failed, skipped, errors });
  } catch (err) {
    console.error('[outreach/:id/send POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
