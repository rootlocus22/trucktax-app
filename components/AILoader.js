'use client';

import { Sparkles, Brain, Cpu, Database, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AILoader({ message = 'AI is analyzing your document...' }) {
    const [activeIcon, setActiveIcon] = useState(0);
    const icons = [Search, Brain, Cpu, Database];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIcon((prev) => (prev + 1) % icons.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const Icon = icons[activeIcon];

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-slate-900 rounded-3xl overflow-hidden relative border border-blue-500/20 shadow-2xl">
            {/* Dynamic Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-600/10 blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-600/10 blur-[100px] animate-pulse delay-700"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Animated AI Brain/Icon */}
                <div className="mb-10 relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-ping"></div>
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] animate-float border border-white/20">
                        <Icon size={40} className="stroke-[1.5px] animate-pulse" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg animate-bounce">
                        <Sparkles size={16} className="text-amber-500 fill-current" />
                    </div>
                </div>

                {/* Loading Message */}
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                    {message}
                </h3>

                {/* Progress Tracker */}
                <div className="max-w-xs w-full">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500 bg-[length:200%_100%] animate-shimmer"></div>
                    </div>

                    <div className="space-y-2">
                        {[
                            { label: 'Optical Character Recognition', delay: '0s' },
                            { label: 'Structured Data Extraction', delay: '0.5s' },
                            { label: 'Business Entity Validation', delay: '1s' },
                            { label: 'Vehicle Fleet Processing', delay: '1.5s' }
                        ].map((step, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-fade-in"
                                style={{ animationDelay: step.delay }}
                            >
                                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                {step.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
