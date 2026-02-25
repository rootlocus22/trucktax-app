import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/ses';
import { logAnalytics } from '@/lib/analytics';
import { getAbandonEmailTemplate } from '@/lib/emailTemplates';
import { isUnsubscribed } from '@/lib/unsubscribedEmails';

const COLLECTION = 'ucr_visits';
const ABANDON_DELAY_MS = 5 * 60 * 1000; // 5 minutes

export const dynamic = 'force-dynamic';

export async function GET(req) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>. Optionally verify.
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = Date.now();
    const cutoff = new Timestamp(Math.floor((now - ABANDON_DELAY_MS) / 1000), 0);
    const ref = adminDb.collection(COLLECTION);
    const snapshot = await ref.where('abandonedAt', '<', cutoff).get();

    let sent = 0;
    let skipped = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.completedAt) {
        skipped++;
        continue;
      }
      if (data.abandonEmailSent === true) {
        skipped++;
        continue;
      }
      const to = data.email?.trim();
      if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        skipped++;
        continue;
      }

      if (await isUnsubscribed(to)) {
        skipped++;
        await docSnap.ref.update({
          abandonEmailSent: true,
          abandonEmailSkippedReason: 'unsubscribed',
          updatedAt: Timestamp.now(),
        });
        continue;
      }

      try {
        const { subject, html } = getAbandonEmailTemplate({
          firstName: data.registrantName ? data.registrantName.trim().split(/\s+/)[0] : '',
          email: to,
        });
        await sendEmail(to, subject, html);
        await docSnap.ref.update({
          abandonEmailSent: true,
          abandonEmailSentAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        logAnalytics('ucr_abandon_email_sent', { to, sessionId: docSnap.id, step: data.step });
        sent++;
      } catch (err) {
        console.error(`[ucr-abandon-emails] Failed to send to ${to}:`, err);
      }
    }

    return NextResponse.json({
      ok: true,
      sent,
      skipped,
      message: `Sent ${sent} abandon email(s).`,
    });
  } catch (err) {
    console.error('[ucr-abandon-emails]', err);
    return NextResponse.json(
      { error: err.message || 'Cron failed' },
      { status: 500 }
    );
  }
}
