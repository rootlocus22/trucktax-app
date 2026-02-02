'use client';

import { useState, useEffect, useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import getStripe from '@/lib/stripe';
import StripePaymentForm from './StripePaymentForm';
import { Loader2 } from 'lucide-react';


export default function StripeWrapper({ amount, metadata, onSuccess, onCancel }) {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Use a stable key for the effect to prevent infinite loops from object literals
    const memoizedAmount = Math.round(amount * 100);
    const metadataKey = metadata?.filingId || metadata?.submissionId || '';

    useEffect(() => {
        if (!amount || amount <= 0) {
            setLoading(false);
            return;
        }

        // Create PaymentIntent as soon as the page loads
        setLoading(true);
        setError('');

        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, metadata }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Network response was not ok');
                return data;
            })
            .then((data) => {
                if (data.clientSecret) {
                    setClientSecret(data.clientSecret);
                } else {
                    setError('No client secret received from server');
                }
            })

            .catch((err) => {
                setError('Failed to connect to payment server. Please try again.');
            })
            .finally(() => setLoading(false));
    }, [memoizedAmount, metadataKey]);




    const options = useMemo(() => ({
        clientSecret,
        appearance: {
            theme: 'stripe',
            variables: {
                colorPrimary: '#0F766E',
            },
        },
    }), [clientSecret]);

    const stripePromise = useMemo(() => getStripe(), []);


    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        return (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                <strong>Stripe Configuration Missing:</strong> NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in your environment.
            </div>
        );
    }

    if (!amount || amount <= 0) {
        return (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                Waiting for final amount calculation...
            </div>
        );
    }


    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-navy)]" />
                <p className="text-slate-500 font-medium">Initializing secure checkout...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 space-y-3">
                <p className="font-bold flex items-center gap-2 uppercase text-xs tracking-wider">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    Payment Error
                </p>
                <p className="text-sm opacity-90">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-xs font-bold underline hover:no-underline"
                >
                    Try Refreshing the Page
                </button>
            </div>
        );
    }


    return (
        <div className="w-full">
            {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                    <StripePaymentForm
                        amount={amount}

                        onSuccess={onSuccess}
                        onCancel={onCancel}
                    />
                </Elements>
            )}
        </div>
    );
}
