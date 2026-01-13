'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Bell, CheckCircle, AlertTriangle, Mail, Phone } from 'lucide-react';

/**
 * ComplianceAlertSignup - Email/SMS signup for compliance deadline reminders.
 * Captures leads into Firestore `compliance_alerts` collection.
 * 
 * Based on Clarity insights showing extended dwell time on compliance calendar page.
 */
export default function ComplianceAlertSignup() {
    const [formData, setFormData] = useState({
        email: '',
        phone: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email) {
            setStatus('error');
            setErrorMsg('Please enter your email address');
            return;
        }

        setStatus('submitting');
        setErrorMsg('');

        try {
            await addDoc(collection(db, 'compliance_alerts'), {
                email: formData.email,
                phone: formData.phone || null,
                submittedAt: serverTimestamp(),
                source: 'compliance_calendar_signup',
                alertTypes: ['hvut', 'ifta', 'ucr', 'mcs150']
            });
            setStatus('success');
        } catch (error) {
            console.error('Error submitting signup:', error);
            setStatus('error');
            setErrorMsg('Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <aside className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-green-800 mb-2">You're all set!</h2>
                <p className="text-green-700 text-sm">
                    We'll send you deadline reminders for Form 2290, IFTA, UCR, and MCS-150 updates.
                </p>
            </aside>
        );
    }

    return (
        <aside className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-lg shadow-[rgba(15,38,71,0.08)] sm:p-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-orange)]/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[var(--color-orange)]" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Never Miss a Deadline</h2>
            </div>

            <p className="text-sm text-[var(--color-muted)] mb-6">
                Get free email and SMS reminders before your HVUT, IFTA, UCR, and MCS-150 deadlines. No spam, just timely alerts.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                            className="w-full pl-11 pr-4 py-3 bg-[var(--color-page)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-sky)] focus:border-[var(--color-sky)] outline-none transition text-sm"
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted)]" />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(555) 123-4567 (optional)"
                            className="w-full pl-11 pr-4 py-3 bg-[var(--color-page)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-sky)] focus:border-[var(--color-sky)] outline-none transition text-sm"
                        />
                    </div>
                </div>

                {status === 'error' && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {errorMsg}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-[var(--color-orange)] hover:bg-[#ff7a20] text-white font-bold py-3 px-6 rounded-xl transition shadow-md shadow-orange-500/20 disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px] text-sm"
                >
                    {status === 'submitting' ? 'Signing up...' : 'Get Free Deadline Alerts'}
                </button>

                <p className="text-xs text-center text-[var(--color-muted)]">
                    No spam. Unsubscribe anytime.
                </p>
            </form>
        </aside>
    );
}
