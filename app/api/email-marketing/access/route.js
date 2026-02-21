import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { getEmailMarketingAllowedEmails, isEmailAllowed } from '@/lib/emailMarketingAllowlist';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ allowed: false, error: 'Unauthorized' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ allowed: false, error: 'Invalid token' }, { status: 401 });
    }

    const email = decoded.email;
    if (!email) {
      return NextResponse.json({ allowed: false, error: 'No email on account' }, { status: 400 });
    }

    const allowedEmails = await getEmailMarketingAllowedEmails();
    const allowed = isEmailAllowed(allowedEmails, email);

    return NextResponse.json({ allowed, email: email.toLowerCase() });
  } catch (err) {
    console.error('[email-marketing/access]', err);
    return NextResponse.json({ allowed: false, error: err.message || 'Failed to check access' }, { status: 500 });
  }
}
