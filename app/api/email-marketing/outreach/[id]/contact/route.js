import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getEmailMarketingAllowedEmails, isEmailAllowed } from '@/lib/emailMarketingAllowlist';

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
 * PATCH /api/email-marketing/outreach/[id]/contact
 * Update a contact's CRM status (mark replied, converted, etc.)
 * Body: { contactId, status, notes }
 * Status: 'replied' | 'converted' | 'sent' | 'failed' | 'unsubscribed'
 */
export async function PATCH(req, { params }) {
  try {
    const auth = await verifyAccess(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { contactId, status, notes } = body;

    if (!contactId || !status) {
      return NextResponse.json({ error: 'contactId and status are required' }, { status: 400 });
    }

    const VALID_STATUSES = ['sent', 'failed', 'replied', 'converted', 'unsubscribed'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Use one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    const campaignRef = adminDb.collection('email_outreach_campaigns').doc(id);
    const contactRef = campaignRef.collection('contacts').doc(contactId);
    const contactSnap = await contactRef.get();
    if (!contactSnap.exists) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

    const now = new Date();
    const updates = { status, updatedAt: now };
    if (notes !== undefined) updates.notes = String(notes);
    if (status === 'replied') updates.repliedAt = now;
    await contactRef.update(updates);

    // Update campaign reply/convert counters
    const campaignSnap = await campaignRef.get();
    if (campaignSnap.exists) {
      const prevStatus = contactSnap.data().status;
      const campData = campaignSnap.data();
      const campUpdates = { updatedAt: now };
      if (status === 'replied' && prevStatus !== 'replied') {
        campUpdates.replied = (campData.replied || 0) + 1;
      }
      if (status === 'converted' && prevStatus !== 'converted') {
        campUpdates.converted = (campData.converted || 0) + 1;
      }
      if (Object.keys(campUpdates).length > 1) await campaignRef.update(campUpdates);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[outreach/:id/contact PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
