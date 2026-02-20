import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
}

const db = getFirestore();

/**
 * POST /api/stripe/verify-session
 * Body: { session_id }
 * Retrieves Stripe session, verifies payment, and finalizes either:
 * - pending UCR filing creation, or
 * - UCR certificate unlock payment for an existing filing.
 * Returns { filingId, legalName, dotNumber, total } for confirmation page.
 */
export async function POST(request) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const body = await request.json();
    const sessionId = body.session_id;

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const unlockType = session.metadata?.type;
    const pendingPaymentId = session.metadata?.pendingPaymentId;
    if (unlockType === 'ucr_certificate_unlock' && pendingPaymentId) {
      const pendingPaymentRef = db.collection('pending_ucr_payments').doc(pendingPaymentId);
      const pendingPaymentSnap = await pendingPaymentRef.get();
      if (!pendingPaymentSnap.exists) {
        return NextResponse.json({ error: 'Pending unlock payment not found or already completed' }, { status: 404 });
      }

      const paymentData = pendingPaymentSnap.data();
      const filingId = paymentData.filingId;
      const amount = (Number(paymentData.amountCents) || 0) / 100;
      const now = new Date();

      const filingRef = db.collection('filings').doc(filingId);
      const filingSnap = await filingRef.get();
      if (!filingSnap.exists) {
        return NextResponse.json({ error: 'Filing not found for unlock payment' }, { status: 404 });
      }
      const filing = filingSnap.data();

      await filingRef.update({
        paymentStatus: 'paid',
        amountPaid: amount,
        paidAt: now,
        stripeSessionId: sessionId,
        updatedAt: now,
      });

      await db.collection('payments').add({
        userId: paymentData.userId,
        filingId,
        type: 'ucr_certificate_unlock',
        description: `UCR Certificate Unlock – ${filing.legalName || 'Carrier'} (USDOT: ${filing.dotNumber || '—'})`,
        amount,
        total: amount,
        currency: 'USD',
        stripeSessionId: sessionId,
        status: 'paid',
        createdAt: now,
      });

      await pendingPaymentRef.delete();
      return NextResponse.json({
        mode: 'ucr_certificate_unlock',
        filingId,
        amount,
      });
    }

    const pendingId = session.metadata?.pendingId;
    if (!pendingId) {
      return NextResponse.json({ error: 'Invalid session metadata' }, { status: 400 });
    }

    const pendingRef = db.collection('pending_ucr_filings').doc(pendingId);
    const pendingSnap = await pendingRef.get();
    if (!pendingSnap.exists) {
      return NextResponse.json({ error: 'Pending filing not found or already completed' }, { status: 404 });
    }

    const { filingPayload } = pendingSnap.data();
    const payload = { ...filingPayload };
    const userId = payload.userId;
    const servicePrice = payload.servicePrice ?? 0;
    const total = payload.total ?? 0;

    const now = new Date();
    const filingIdRef = db.collection('filings').doc();
    const filingId = filingIdRef.id;

    await filingIdRef.set({
      ...payload,
      stripeSessionId: sessionId,
      paymentStatus: 'paid',
      amountPaid: servicePrice,
      paidAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await db.collection('payments').add({
      userId,
      filingId,
      type: 'ucr_filing',
      description: `UCR Filing – ${payload.legalName || 'Carrier'} (USDOT: ${payload.dotNumber})`,
      amount: servicePrice,
      total,
      currency: 'USD',
      stripeSessionId: sessionId,
      status: 'paid',
      createdAt: now,
    });

    await pendingRef.delete();

    return NextResponse.json({
      filingId,
      legalName: payload.legalName,
      dotNumber: payload.dotNumber,
      total: payload.total,
      email: payload.email,
    });
  } catch (err) {
    console.error('Verify session error:', err);
    return NextResponse.json(
      { error: err.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
