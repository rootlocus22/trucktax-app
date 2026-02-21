import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/ses';
import { getWelcomeEmailTemplate } from '@/lib/emailTemplates';
import { Timestamp } from 'firebase-admin/firestore';

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

    const uid = decoded.uid;
    const email = decoded.email;
    if (!email) {
      return NextResponse.json({ error: 'No email' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : null;

    if (userData?.welcomeEmailSentAt) {
      return NextResponse.json({ ok: true, sent: false, reason: 'already_sent' });
    }

    const { subject, html } = getWelcomeEmailTemplate({
      displayName: userData?.displayName || email?.split('@')[0] || '',
    });
    await sendEmail(email, subject, html);
    await userRef.set(
      { welcomeEmailSentAt: Timestamp.now(), updatedAt: Timestamp.now() },
      { merge: true }
    );

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    console.error('[email/welcome]', err);
    return NextResponse.json({ error: err.message || 'Failed to send welcome email' }, { status: 500 });
  }
}
