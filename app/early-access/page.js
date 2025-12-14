'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, ArrowRight, Truck, Mail, Phone, User, Building, DollarSign, Shield, Bell } from 'lucide-react';

export default function EarlyAccessPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        interestedServices: []
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [errorMsg, setErrorMsg] = useState('');

    const services = [
        "Form 2290 Filing",
        "MCS-150 Update",
        "UCR Registration",
        "IFTA Filing"
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (service) => {
        setFormData(prev => {
            const current = prev.interestedServices;
            if (current.includes(service)) {
                return { ...prev, interestedServices: current.filter(s => s !== service) };
            } else {
                return { ...prev, interestedServices: [...current, service] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMsg('');

        try {
            await addDoc(collection(db, 'early_access_leads'), {
                ...formData,
                submittedAt: serverTimestamp(),
                source: 'web_early_access_page'
            });
            setStatus('success');
            setFormData({ fullName: '', email: '', phone: '', companyName: '', interestedServices: [] });
        } catch (error) {
            console.error("Error submitting lead:", error);
            setStatus('error');
            setErrorMsg(`Failed to submit: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-[var(--color-midnight)] skew-y-3 origin-top-left transform -translate-y-24 z-0"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl z-0"></div>

            <div className="relative z-10 container mx-auto px-4 py-12 md:py-20 flex flex-col items-center">

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-300 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500/20 mb-6 backdrop-blur-sm">
                        <Truck className="w-4 h-4" />
                        <span className="text-white">Launching January 2026</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                        The Future of Trucking Compliance <br className="hidden md:block" /> is Almost Here.
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                        Secure your spot for the most advanced e-filing platform. Join the waitlist today and get exclusive early-bird benefits.
                    </p>
                </div>

                <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-8 items-start">

                    {/* Benefits Sidebar (Left) */}
                    <div className="lg:col-span-2 space-y-6 lg:pt-8 order-2 lg:order-1">
                        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-900">
                                <Shield className="w-5 h-5 text-teal-600" />
                                Early Access Perks
                            </h3>
                            <ul className="space-y-6">
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                        <DollarSign className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">20% Lifetime Discount</h4>
                                        <p className="text-sm text-slate-600 mt-1">Lock in a special rate for all your future filings.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                        <Bell className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Priority Alerts</h4>
                                        <p className="text-sm text-slate-600 mt-1">Get automated reminders before competitors.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">VIP Support Line</h4>
                                        <p className="text-sm text-slate-600 mt-1">Direct access to senior compliance agents.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="flex items-center gap-4 px-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {/* Placeholder avatars */}
                                        <User className="w-5 h-5 opacity-50" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-slate-600">
                                <strong className="text-slate-900">2,000+</strong> truckers joined
                            </p>
                        </div>
                    </div>

                    {/* Main Form Card (Right) */}
                    <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 order-1 lg:order-2">
                        <div className="p-1 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500"></div>
                        <div className="p-8 md:p-10">
                            {status === 'success' ? (
                                <div className="text-center py-16">
                                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                                        <CheckCircle className="w-12 h-12 text-green-500" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-4">You're on the list!</h2>
                                    <p className="text-slate-600 mb-8 max-w-md mx-auto text-lg">
                                        Congratulations! You've secured your spot. We'll send your exclusive 20% discount code to <span className="font-bold text-slate-800">{formData.email}</span> when we launch.
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 hover:underline transition"
                                    >
                                        Register another company <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-bold text-slate-900">Secure Your Spot</h2>
                                        <span className="text-sm text-slate-500">* Limited availability</span>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                            <input
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition font-medium"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Company Name</label>
                                            <input
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition font-medium"
                                                placeholder="Trucking Co LLC"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition font-medium"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-500 outline-none transition font-medium"
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        <label className="text-sm font-semibold text-slate-700 block">Services you need help with:</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {services.map(service => (
                                                <div
                                                    key={service}
                                                    onClick={() => handleServiceToggle(service)}
                                                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${formData.interestedServices.includes(service)
                                                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                                                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${formData.interestedServices.includes(service)
                                                        ? 'bg-blue-500 border-blue-500 text-white'
                                                        : 'border-slate-300 bg-white'
                                                        }`}>
                                                        {formData.interestedServices.includes(service) && <CheckCircle className="w-3 h-3" />}
                                                    </div>
                                                    <span className="text-sm font-medium">{service}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {status === 'error' && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-1">
                                            <AlertTriangle className="w-5 h-5 shrink-0" />
                                            {errorMsg}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full bg-[var(--color-orange)] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg shadow-orange-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                    >
                                        {status === 'submitting' ? (
                                            'Processing...'
                                        ) : (
                                            <>
                                                Get Early Access <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-xs text-center text-slate-400 mt-4">
                                        We respect your privacy. Unsubscribe at any time.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
