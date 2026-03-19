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

/** GET /api/email-marketing/outreach/[id] — campaign details + contacts */
export async function GET(req, { params }) {
  try {
    const auth = await verifyAccess(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const campaignRef = adminDb.collection('email_outreach_campaigns').doc(id);
    const campaignSnap = await campaignRef.get();
    if (!campaignSnap.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const d = campaignSnap.data();
    const campaign = {
      id: campaignSnap.id,
      name: d.name,
      campaignId: d.campaignId,
      status: d.status,
      total: d.total || 0,
      sent: d.sent || 0,
      failed: d.failed || 0,
      replied: d.replied || 0,
      converted: d.converted || 0,
      sentBy: d.sentBy,
      bcc: d.bcc || [],
      createdAt: d.createdAt?.toDate?.()?.toISOString() || null,
      completedAt: d.completedAt?.toDate?.()?.toISOString() || null,
    };

    const contactsSnap = await campaignRef.collection('contacts').orderBy('sentAt', 'desc').limit(500).get();
    const contacts = contactsSnap.docs.map((doc) => {
      const c = doc.data();
      return {
        id: doc.id,
        email: c.email,
        companyName: c.companyName || '',
        contactName: c.contactName || '',
        status: c.status,
        sentAt: c.sentAt?.toDate?.()?.toISOString() || null,
        repliedAt: c.repliedAt?.toDate?.()?.toISOString() || null,
        notes: c.notes || '',
        error: c.error || '',
      };
    });

    return NextResponse.json({ campaign, contacts });
  } catch (err) {
    console.error('[outreach/:id GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** PATCH /api/email-marketing/outreach/[id] — update campaign (e.g. mark completed) */
export async function PATCH(req, { params }) {
  try {
    const auth = await verifyAccess(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const updates = { updatedAt: new Date() };
    if (body.status) updates.status = body.status;
    if (body.status === 'completed') updates.completedAt = new Date();

    await adminDb.collection('email_outreach_campaigns').doc(id).update(updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[outreach/:id PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
