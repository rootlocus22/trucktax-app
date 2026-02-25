import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendEmail } from '@/lib/ses';
import { getInvoiceEmailTemplate, getPostDownloadThankYouEmailTemplate } from '@/lib/emailTemplates';

// Lazy initialization to avoid build-time errors
function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY not configured');
    }
    return new Stripe(secretKey);
}

function getWebhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET;
}

export async function POST(req) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
        const webhookSecret = getWebhookSecret();
        if (!webhookSecret) {
            console.warn('STRIPE_WEBHOOK_SECRET is not set. Skipping signature verification (DEVELOPMENT ONLY).');
            event = JSON.parse(body);
        } else {
            const stripe = getStripe();
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
            await handleCheckoutSessionCompleted(session);
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

        if (amount === 7900 && userId) {
            await sendInvoiceEmail(userId, filingId || null, 79);
        }
    } catch (error) {
        console.error('Error updating records after payment success:', error);
        throw error;
    }
}

async function handleCheckoutSessionCompleted(session) {
    const amountTotal = session.amount_total || 0;
    const userId = session.client_reference_id || session.metadata?.userId;
    const filingId = session.metadata?.filingId || null;
    const sessionId = session.id;

    try {
        const batch = adminDb.batch();
        const paymentRef = adminDb.collection('payments').doc(sessionId);
        batch.set(paymentRef, {
            userId: userId || null,
            filingId: filingId || null,
            filingType: session.metadata?.type || 'ucr_certificate_unlock',
            amount: amountTotal / 100,
            currency: session.currency || 'usd',
            status: 'paid',
            provider: 'stripe',
            paymentMethod: 'checkout_session',
            metadata: session.metadata || {},
            createdAt: Timestamp.now(),
        });

        if (filingId) {
            const filingRef = adminDb.collection('filings').doc(filingId);
            batch.update(filingRef, {
                paymentStatus: 'paid',
                updatedAt: Timestamp.now(),
            });
        }

        await batch.commit();
        console.log(`Checkout session ${sessionId} recorded.`);

        if (amountTotal === 7900 && userId) {
            await sendInvoiceEmail(userId, filingId, 79);
        }
    } catch (error) {
        console.error('Error handling checkout.session.completed:', error);
        throw error;
    }
}

async function sendInvoiceEmail(userId, filingId, amount) {
    try {
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();
        const user = userSnap.exists ? userSnap.data() : null;
        const to = user?.email;
        if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return;

        let legalName = null;
        let registrantName = null;
        if (filingId) {
            const filingSnap = await adminDb.collection('filings').doc(filingId).get();
            if (filingSnap.exists) {
                const fd = filingSnap.data();
                legalName = fd.legalName || null;
                registrantName = fd.registrantName || null;
            }
        }
        const { subject, html } = getInvoiceEmailTemplate({ amount, filingId, legalName, email: to });
        await sendEmail(to, subject, html);

        // Post-payment thank-you (brand touchpoint)
        const thankYou = getPostDownloadThankYouEmailTemplate({
            legalName: legalName || '',
            registrantName: registrantName || user?.displayName || '',
            email: to,
        });
        await sendEmail(to, thankYou.subject, thankYou.html, thankYou.plainText || undefined);
    } catch (err) {
        console.error('Failed to send invoice/thank-you email:', err);
    }
}
