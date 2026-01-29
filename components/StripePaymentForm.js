'use client';

import { useState, useEffect } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

export default function StripePaymentForm({ amount, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }


        setIsLoading(true);

        const paymentElement = elements.getElement(PaymentElement);
        if (!paymentElement) {
            console.error('Payment Element not found');
            setMessage('Payment component is not ready. Please wait a moment and try again.');
            setIsLoading(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/payment-success`,
            },
            redirect: 'if_required',
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent);
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="min-h-[150px] relative">
                {!isReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 rounded-lg space-y-2 z-10 border border-slate-100">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Initialising Secure Channel...</span>
                    </div>
                )}
                <PaymentElement
                    id="payment-element"
                    onReady={() => setIsReady(true)}
                    options={{ layout: 'tabs' }}
                />
            </div>


            <div className="flex gap-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 px-6 border border-slate-300 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                        Go Back
                    </button>
                )}
                <button
                    disabled={isLoading || !stripe || !elements || !isReady}
                    id="submit"
                    className="flex-1 bg-[var(--color-navy)] text-white py-3 px-8 rounded-lg font-bold hover:bg-[var(--color-navy-soft)] disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                        `Pay $${amount.toFixed(2)}`
                    )}
                </button>
            </div>




            {message && <div id="payment-message" className="text-red-500 text-sm font-medium mt-2">{message}</div>}
        </form>
    );
}
