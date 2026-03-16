import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/ses';
import { Timestamp } from 'firebase-admin/firestore';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.easyucr.com';
const FILING_URL = process.env.NEXT_PUBLIC_FILING_APP_URL || `${SITE_URL}/ucr/file`;

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    await adminDb.collection('email_subscribers').doc(normalized).set(
      {
        email: normalized,
        source: 'seo_site',
        subscribed_at: Timestamp.now(),
        reminder_sent_at: null,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    const html = `
      <p>Got it! We will email you when 2027 UCR filing opens on October 1, 2026.</p>
      <p>In the meantime, if you still need to file your 2026 UCR, 
         <a href="${FILING_URL}">file now for $79</a> — 
         you pay only after it is confirmed.</p>
      <p>— The EasyUCR team</p>
    `;

    await sendEmail(
      normalized,
      'You are on the list — UCR 2027 reminder confirmed',
      html
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/subscribe]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
