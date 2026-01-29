import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
        if (!webhookSecret) {
            console.warn('STRIPE_WEBHOOK_SECRET is not set. Skipping signature verification (DEVELOPMENT ONLY).');
            event = JSON.parse(body);
        } else {
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handlePaymentSuccess(paymentIntent);
            break;
        case 'checkout.session.completed':
            const session = event.data.object;
            // If using Checkout Sessions instead of PaymentIntents directly
            // handlePaymentSuccess(session);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(paymentIntent) {
    const { metadata, amount, id: paymentIntentId } = paymentIntent;
    const { userId, filingId, filingType, submissionId } = metadata;

    console.log(`Processing successful payment for user ${userId}, filing ${filingId}, type ${filingType}`);

    try {
        const batch = adminDb.batch();

        // 1. Record the payment
        const paymentRef = adminDb.collection('payments').doc(paymentIntentId);
        batch.set(paymentRef, {
            userId,
            filingId: filingId || null,
            submissionId: submissionId || null,
            filingType,
            amount: amount / 100,
            currency: paymentIntent.currency,
            status: 'paid',
            provider: 'stripe',
            paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
            metadata: metadata,
            createdAt: Timestamp.now(),
        });

        // 2. Update the Filing status if filingId is provided
        if (filingId) {
            const filingRef = adminDb.collection('filings').doc(filingId);
            batch.update(filingRef, {
                paymentStatus: 'paid',
                status: 'paid', // Or 'submitted' depending on logic
                updatedAt: Timestamp.now(),
                paymentIntentId: paymentIntentId
            });
        }

        // 3. Update MCS-150 Submission status if applicable
        if (submissionId && filingType === 'mcs150') {
            const submissionRef = adminDb.collection('mcs150Submissions').doc(submissionId);
            batch.update(submissionRef, {
                paymentStatus: 'paid',
                status: 'paid',
                updatedAt: Timestamp.now()
            });
        }

        await batch.commit();
        console.log(`Successfully updated records for payment ${paymentIntentId}`);
    } catch (error) {
        console.error('Error updating records after payment success:', error);
        throw error;
    }
}
