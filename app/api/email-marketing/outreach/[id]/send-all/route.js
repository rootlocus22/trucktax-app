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
 * POST /api/email-marketing/outreach/[id]/send-all
 * Processes a batch of pending contacts from an imported campaign and sends emails.
 * Call repeatedly until remaining = 0.
 *
 * Body: { batchSize?: number (default 50), bcc?: string[] }
 * Returns: { sent, failed, skipped, remaining, done }
 *
 * This is a "pump" — each call processes one batch and returns.
 * Frontend polls this until done=true.
 *
 * AWS SES default: 14 emails/sec. For safety we send up to 50 per call.
 */
export async function POST(req, { params }) {
  try {
    const auth = await verifyAccess(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(Number(body.batchSize) || 50, 100); // cap at 100 per call

    const campaignRef = adminDb.collection('email_outreach_campaigns').doc(id);
    const campaignSnap = await campaignRef.get();
    if (!campaignSnap.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const campaignData = campaignSnap.data();
    if (campaignData.status === 'completed') {
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0, remaining: 0, done: true });
    }

    const campaign = getCampaignById(campaignData.campaignId);
    if (!campaign) return NextResponse.json({ error: `Unknown campaign type: ${campaignData.campaignId}` }, { status: 400 });

    const bcc = Array.isArray(body.bcc) ? body.bcc : (campaignData.bcc || []);

    // Fetch a batch of pending contacts
    const pendingSnap = await campaignRef.collection('contacts')
      .where('status', '==', 'pending')
      .limit(batchSize)
      .get();

    if (pendingSnap.empty) {
      // No more pending — mark campaign complete
      await campaignRef.update({ status: 'completed', completedAt: new Date(), updatedAt: new Date() });
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0, remaining: 0, done: true });
    }

    let sent = 0, failed = 0, skipped = 0;
    const now = new Date();

    for (const doc of pendingSnap.docs) {
      const contact = doc.data();
      const email = contact.email;

      if (!email || !email.includes('@')) {
        await doc.ref.update({ status: 'failed', error: 'Invalid email', updatedAt: now });
        skipped++;
        continue;
      }

      if (await isUnsubscribed(email)) {
        await doc.ref.update({ status: 'unsubscribed', updatedAt: now });
        skipped++;
        continue;
      }

      try {
        const { subject, html, plainText } = campaign.getTemplate({
          email,
          companyName: contact.companyName || '',
          contactName: contact.contactName || '',
          legalName: contact.companyName || '',
          registrantName: contact.contactName || '',
          dotNumber: contact.dotNumber || '',
          fleetBracket: contact.fleetBracket || '',
          govFee: contact.govFee || '',
          totalCost: contact.totalCost || '',
          state: contact.state || '',
        });

        await sendEmail(email, subject, html, plainText || undefined, { bcc: bcc.length ? bcc : undefined });
        await doc.ref.update({ status: 'sent', sentAt: now, updatedAt: now });
        sent++;
      } catch (err) {
        await doc.ref.update({ status: 'failed', error: err.message, updatedAt: now });
        failed++;
      }
    }

    // Update campaign counters
    const campUpdate = {
      sent: (campaignData.sent || 0) + sent,
      failed: (campaignData.failed || 0) + failed,
      pending: Math.max(0, (campaignData.pending || 0) - sent - failed - skipped),
      status: 'sending',
      updatedAt: now,
    };
    await campaignRef.update(campUpdate);

    // Count remaining pending contacts
    const remainingSnap = await campaignRef.collection('contacts')
      .where('status', '==', 'pending')
      .limit(1)
      .get();
    const remaining = campUpdate.pending;
    const done = remaining <= 0 || remainingSnap.empty;

    if (done) {
      await campaignRef.update({ status: 'completed', completedAt: now, updatedAt: now });
    }

    return NextResponse.json({ sent, failed, skipped, remaining, done });
  } catch (err) {
    console.error('[outreach/:id/send-all POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
