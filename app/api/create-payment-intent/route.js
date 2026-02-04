import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization to avoid build-time errors
function getStripe() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY not configured');
    }
    return new Stripe(secretKey);
}

export async function POST(req) {
    try {
        const { amount, metadata } = await req.json();

        const stripe = getStripe();

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amounts in cents
            currency: 'usd',
            metadata: metadata || {},
            payment_method_types: ['card', 'cashapp'],
        });


        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error('Stripe Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
