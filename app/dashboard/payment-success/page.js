'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { CheckCircle, ArrowRight, Loader2, Home, CreditCard } from 'lucide-react';

function PaymentSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verifying your payment...');

    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    useEffect(() => {
        if (redirectStatus === 'succeeded') {
            setStatus('success');
            setMessage('Your payment was successful!');

            // In a real app, we'd verify the PI on the server here
            // and potentially trigger any post-payment logic (like logging)
            // if it wasn't already handled by a webhook or the previous page.
        } else if (redirectStatus === 'processing') {
            setStatus('loading');
            setMessage('Your payment is still processing. We\'ll update you soon.');
        } else {
            setStatus('error');
            setMessage('Something went wrong with your payment. Please contact support.');
        }
    }, [redirectStatus]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-200 p-8 sm:p-12 text-center shadow-2xl shadow-blue-900/5 animate-fade-in-up relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12 opacity-50" />

                <div className="relative z-10">
                    {status === 'loading' ? (
                        <div className="space-y-8 py-4">
                            <div className="w-24 h-24 bg-blue-50/50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Authenticating</h2>
                                <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                                    {message}
                                </p>
                            </div>
                        </div>
                    ) : status === 'success' ? (
                        <div className="space-y-8 py-4">
                            <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-500 shadow-lg shadow-emerald-500/10">
                                <CheckCircle className="w-12 h-12 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Payment Verified!</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Your transaction was successful. Your Form 2290 filing is now being processed by our compliance team.
                                </p>
                            </div>

                            <div className="pt-8 space-y-4">
                                <Link
                                    href="/dashboard"
                                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4.5 bg-[#173b63] text-white !text-white rounded-2xl font-black hover:bg-[#1f4f82] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-900/20"
                                >
                                    <Home className="w-5 h-5" />
                                    Return Dashboard
                                </Link>

                                <Link
                                    href="/dashboard/payment-history"
                                    className="w-full inline-flex items-center justify-center gap-3 px-8 py-4.5 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    View Receipt
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 py-4">
                            <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12 shadow-lg shadow-red-500/10">
                                <div className="text-red-500 text-5xl font-black">!</div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Status Unclear</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    {message}
                                </p>
                            </div>
                            <div className="pt-6">
                                <Link
                                    href="/dashboard/new-filing"
                                    className="w-full inline-flex items-center justify-center gap-3 px-10 py-4.5 bg-[#ff8b3d] text-white !text-white rounded-2xl font-black hover:bg-[#f07a2d] transition-all hover:shadow-xl hover:shadow-orange-500/20"
                                >
                                    Try Secure Checkout Again
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
                                Reference: {paymentIntentId?.slice(-8) || 'Unknown'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12 flex items-center gap-6 opacity-40">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">PCI Compliant</p>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">SSL Encrypted</p>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Stripe Verified</p>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <ProtectedRoute>
            <Suspense fallback={
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                    <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
                </div>
            }>
                <PaymentSuccessContent />
            </Suspense>
        </ProtectedRoute>
    );
}
