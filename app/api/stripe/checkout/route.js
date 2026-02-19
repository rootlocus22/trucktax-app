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
 * POST /api/stripe/checkout
 * Body: { userId, amountCents, planName, filingPayload }
 * filingPayload: all fields needed for createFiling (ucrFee, servicePrice, total, legalName, dotNumber, etc.)
 * Creates a pending_ucr_filings doc, then a Stripe Checkout Session. Returns { url, pendingId }.
 */
export async function POST(request) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { userId, amountCents, planName, filingPayload } = body;

    if (!userId || amountCents == null || !filingPayload) {
      return NextResponse.json(
        { error: 'userId, amountCents, and filingPayload are required' },
        { status: 400 }
      );
    }

    const amount = Math.round(Number(amountCents));
    if (amount < 50) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const pendingRef = db.collection('pending_ucr_filings').doc();
    const pendingId = pendingRef.id;
    await pendingRef.set({
      userId,
      filingPayload: {
        ...filingPayload,
        filingType: 'ucr',
        status: 'submitted',
        priority: 'high',
      },
      amountCents: amount,
      createdAt: new Date(),
    });

    const origin = request.headers.get('origin') || request.headers.get('x-forwarded-host') || 'http://localhost:3000';
    const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;

    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName || 'UCR Filing Service',
              description: 'QuickTruckTax UCR registration filing service and compliance record.',
              images: [],
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/ucr/file?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/ucr/file?step=5&canceled=1`,
      client_reference_id: userId,
      metadata: {
        pendingId,
        type: 'ucr_filing',
      },
    });

    return NextResponse.json({ url: session.url, pendingId });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Checkout failed' },
      { status: 500 }
    );
  }
}
