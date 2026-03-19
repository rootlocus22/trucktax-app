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

/** GET /api/email-marketing/outreach — list all outreach campaigns */
export async function GET(req) {
  try {
    const auth = await verifyAccess(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const snap = await adminDb.collection('email_outreach_campaigns')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const campaigns = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name,
        campaignId: d.campaignId,
        status: d.status,
        total: d.total || 0,
        sent: d.sent || 0,
        failed: d.failed || 0,
        replied: d.replied || 0,
        converted: d.converted || 0,
        sentBy: d.sentBy,
        createdAt: d.createdAt?.toDate?.()?.toISOString() || null,
        completedAt: d.completedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error('[outreach GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** POST /api/email-marketing/outreach — create a new outreach campaign record */
export async function POST(req) {
  try {
    const auth = await verifyAccess(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json().catch(() => ({}));
    const { name, campaignId, totalContacts, bcc } = body;

    if (!name || !campaignId) {
      return NextResponse.json({ error: 'name and campaignId are required' }, { status: 400 });
    }

    const now = new Date();
    const docRef = adminDb.collection('email_outreach_campaigns').doc();
    await docRef.set({
      name: String(name).trim(),
      campaignId: String(campaignId).trim(),
      status: 'sending',
      total: Number(totalContacts) || 0,
      sent: 0,
      failed: 0,
      replied: 0,
      converted: 0,
      sentBy: auth.callerEmail,
      bcc: Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err) {
    console.error('[outreach POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
