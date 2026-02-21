import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { logAnalytics } from '@/lib/analytics';

const COLLECTION = 'ucr_visits';

export async function POST(req) {
  try {
    const body = await req.json();
    const { sessionId, userId, email, step, completed, abandoned } = body || {};

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'sessionId and userId are required' },
        { status: 400 }
      );
    }

    const ref = adminDb.collection(COLLECTION).doc(String(sessionId));
    const now = Timestamp.now();

    if (completed === true) {
      await ref.set(
        {
          userId,
          email: email || null,
          step: step ?? 6,
          completedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
      logAnalytics('ucr_visit_completed', { sessionId, userId, step: step ?? 6 });
      return NextResponse.json({ ok: true, action: 'completed' });
    }

    if (abandoned === true) {
      await ref.set(
        {
          userId,
          email: email || null,
          step: step ?? 1,
          abandonedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
      logAnalytics('ucr_visit_abandoned', { sessionId, userId, step: step ?? 1 });
      return NextResponse.json({ ok: true, action: 'abandoned' });
    }

    // Visit or step update
    const doc = await ref.get();
    const payload = {
      userId,
      email: email || null,
      step: typeof step === 'number' ? step : 1,
      updatedAt: now,
    };
    if (!doc.exists) {
      payload.createdAt = now;
    }
    await ref.set(payload, { merge: true });
    return NextResponse.json({ ok: true, action: doc.exists ? 'step' : 'visit' });
  } catch (err) {
    console.error('[ucr-visit]', err);
    return NextResponse.json(
      { error: err.message || 'Failed to record visit' },
      { status: 500 }
    );
  }
}
