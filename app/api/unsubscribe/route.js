import { NextResponse } from 'next/server';
import { verifyUnsubscribeToken } from '@/lib/unsubscribeToken';
import { addUnsubscribed } from '@/lib/unsubscribedEmails';

/**
 * GET /api/unsubscribe?token=...
 * Verifies the token, adds the email to unsubscribed_emails in Firestore, returns JSON.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Missing token. Use the unsubscribe link from our email.' },
        { status: 400 }
      );
    }

    const email = verifyUnsubscribeToken(token);
    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired link. Request a new unsubscribe link from a recent email.' },
        { status: 400 }
      );
    }

    await addUnsubscribed(email);
    return NextResponse.json({ ok: true, email });
  } catch (err) {
    console.error('[api/unsubscribe]', err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
