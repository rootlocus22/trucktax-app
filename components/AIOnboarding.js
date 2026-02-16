'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Sparkles,
    Upload,
    ChevronRight,
    X,
    CheckCircle,
    ArrowRight,
    ShieldCheck,
    Zap,
    Building2,
    Truck
} from 'lucide-react';

export function AIOnboarding({ onDismiss }) {
    const router = useRouter();
    const [step, setStep] = useState('welcome'); // welcome, choice

    if (!step) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full overflow-hidden relative border border-slate-200 animate-scale-up">
                {/* Close Button */}
                <button
                    onClick={onDismiss}
                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all z-10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Side: Branding/Visual */}
                    <div className="md:w-2/5 bg-[#173b63] p-10 flex flex-col justify-between text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-emerald-500/20 pointer-events-none"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]"></div>

                        <div className="relative">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest mb-6">
                                <Sparkles size={12} className="text-emerald-400" />
                                AI-Powered Compliance
                            </div>
                            <h2 className="text-3xl font-black leading-tight mb-4">
                                Welcome to the future of <span className="text-emerald-400">Truck Tax.</span>
                            </h2>
                            <p className="text-blue-100/70 text-sm font-medium leading-relaxed">
                                We've combined decades of tax expertise with advanced AI to make your 2290 filing faster than ever.
                            </p>
                        </div>

                        <div className="relative space-y-4">
                            {[
                                { icon: ShieldCheck, text: 'IRS-Ready Logic' },
                                { icon: Zap, text: 'Instant Data Extraction' },
                                { icon: CheckCircle, text: 'Audit-Proof Storage' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-white/80">
                                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                                        <item.icon size={14} className="text-emerald-400" />
                                    </div>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Options */}
                    <div className="md:w-3/5 p-10 md:p-14 bg-white">
                        {step === 'welcome' ? (
                            <div className="h-full flex flex-col justify-center animate-fade-in-right">
                                <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">
                                    How would you like <br />to start?
                                </h3>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => router.push('/dashboard/upload-schedule1')}
                                        className="w-full group relative bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl text-left hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-[#173b63] text-white flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
                                                <Upload size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-xl text-slate-900">The Fast Lane</h4>
                                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-black uppercase tracking-widest">Recommended</span>
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium">Upload a previous Schedule 1. AI extracts everything in seconds.</p>
                                            </div>
                                            <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => router.push('/dashboard/new-filing')}
                                        className="w-full group relative bg-white border-2 border-slate-200 p-6 rounded-2xl text-left hover:border-[var(--color-orange)] hover:bg-orange-50/30 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-[var(--color-orange)] group-hover:text-white transition-all">
                                                <Truck size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-xl text-slate-900 mb-1">Guided Filing</h4>
                                                <p className="text-slate-500 text-sm font-medium">Starting fresh? We'll guide you through a simple step-by-step process.</p>
                                            </div>
                                            <ChevronRight className="text-slate-300 group-hover:text-[var(--color-orange)] transition-colors" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setStep('why-ai')}
                                        className="w-full text-center py-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
                                    >
                                        Why should I use AI?
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col justify-center animate-fade-in-right">
                                <button
                                    onClick={() => setStep('welcome')}
                                    className="inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mb-8 hover:text-slate-600 transition-colors"
                                >
                                    <ArrowRight className="rotate-180 w-4 h-4" /> Back
                                </button>
                                <h3 className="text-3xl font-black text-slate-900 mb-6">Effortless Compliance</h3>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="text-blue-500" size={20} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 mb-1">No Manual Data Entry</h5>
                                            <p className="text-sm text-slate-500">Stop typing long VINs and business details. Let our AI do the heavy lifting.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                            <Building2 className="text-emerald-500" size={20} />
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-slate-800 mb-1">Multi-Entity Support</h5>
                                            <p className="text-sm text-slate-500">Easily manage multiple businesses and large fleets with automated extraction.</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push('/dashboard/upload-schedule1')}
                                    className="mt-10 w-full py-4 bg-[#173b63] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#1e4b7e] transition-all shadow-xl shadow-blue-900/20"
                                >
                                    Try AI Upload Now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in-right { animation: fade-in-right 0.5s ease-out; }
      `}</style>
        </div>
    );
}
