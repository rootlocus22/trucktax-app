'use client';

import React from 'react';

const TruckAnimation = () => {
    return (
        <div className="relative w-full h-72 flex items-center justify-center overflow-hidden rounded-3xl bg-transparent">
            {/* Background Magic Glows */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-400/5 via-purple-400/10 to-indigo-400/5 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Floating Sparkles In Background */}
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-twinkle opacity-0"
                    style={{
                        top: `${Math.random() * 80 + 10}%`,
                        left: `${Math.random() * 80 + 10}%`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                ></div>
            ))}

            {/* Road / Path - Subtle and Modern */}
            <div className="absolute bottom-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50 z-10"></div>

            {/* The Animated Truck Container */}
            <div className="absolute bottom-12 left-0 w-full z-20 animate-truck-move">
                <div className="relative flex flex-col items-center">

                    {/* Service Popups - Positioned above the truck */}
                    <div className="absolute -top-24 flex gap-8">
                        <div className="flex flex-col items-center animate-bounce-slow">
                            <div className="relative">
                                {/* Magic Ring around icons */}
                                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full animate-ping"></div>
                                <div className="relative bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-blue-100/50 flex items-center gap-2 transform hover:scale-110 transition-transform">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">2290</div>
                                    <span className="text-xs font-bold text-slate-800 tracking-tight">IRS Form 2290</span>
                                </div>
                            </div>
                            <div className="w-0.5 h-4 bg-gradient-to-b from-blue-200 to-transparent"></div>
                        </div>

                        <div className="flex flex-col items-center animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                                <div className="relative bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-purple-100/50 flex items-center gap-2 transform hover:scale-110 transition-transform">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">AM</div>
                                    <span className="text-xs font-bold text-slate-800 tracking-tight">Amendments</span>
                                </div>
                            </div>
                            <div className="w-0.5 h-4 bg-gradient-to-b from-purple-200 to-transparent"></div>
                        </div>
                    </div>

                    {/* Magical Trail / Dust Particles */}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 flex gap-1">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-particle"
                                style={{
                                    animationDelay: `${i * 0.15}s`,
                                    height: `${2 + Math.random() * 4}px`,
                                    width: `${2 + Math.random() * 4}px`
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Truck SVG with suspension bounce */}
                    <div className="animate-suspension">
                        <svg
                            width="150"
                            height="80"
                            viewBox="0 0 150 80"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="drop-shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
                        >
                            {/* Truck Body - Sleek & Modern */}
                            <rect x="5" y="25" width="100" height="35" rx="6" fill="url(#truck-grad)" />
                            <path d="M105 30H135C138.314 30 141 32.6863 141 36V55H105V30Z" fill="url(#cab-grad)" />

                            {/* Cab Window */}
                            <path d="M110 34H132C133.105 34 134 34.8954 134 36V45H110V34Z" fill="white" fillOpacity="0.4" />

                            {/* Details */}
                            <rect x="15" y="32" width="25" height="3" rx="1.5" fill="white" fillOpacity="0.2" />
                            <rect x="45" y="32" width="50" height="3" rx="1.5" fill="white" fillOpacity="0.2" />

                            {/* Headlight Glow */}
                            <circle cx="138" cy="40" r="3" fill="#FFFBEB" className="animate-pulse" />
                            <path d="M138 40L160 30V50L138 40Z" fill="url(#headlight-grad)" fillOpacity="0.3" />

                            {/* Wheels with rotation effect */}
                            <g className="animate-spin-slow origin-[25px_60px]">
                                <circle cx="25" cy="60" r="10" fill="#1E293B" />
                                <circle cx="25" cy="60" r="5" fill="#475569" stroke="white" strokeWidth="1.5" />
                                <rect x="24" y="52" width="2" height="16" fill="white" fillOpacity="0.1" />
                            </g>
                            <g className="animate-spin-slow origin-[90px_60px]">
                                <circle cx="90" cy="60" r="10" fill="#1E293B" />
                                <circle cx="90" cy="60" r="5" fill="#475569" stroke="white" strokeWidth="1.5" />
                                <rect x="89" y="52" width="2" height="16" fill="white" fillOpacity="0.1" />
                            </g>
                            <g className="animate-spin-slow origin-[125px_60px]">
                                <circle cx="125" cy="60" r="10" fill="#1E293B" />
                                <circle cx="125" cy="60" r="5" fill="#475569" stroke="white" strokeWidth="1.5" />
                                <rect x="124" y="52" width="2" height="16" fill="white" fillOpacity="0.1" />
                            </g>

                            <defs>
                                <linearGradient id="truck-grad" x1="5" y1="25" x2="105" y2="60" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#2563EB" />
                                    <stop offset="1" stopColor="#1E40AF" />
                                </linearGradient>
                                <linearGradient id="cab-grad" x1="105" y1="30" x2="141" y2="60" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#3B82F6" />
                                    <stop offset="1" stopColor="#2563EB" />
                                </linearGradient>
                                <linearGradient id="headlight-grad" x1="138" y1="40" x2="160" y2="40" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#FDE68A" />
                                    <stop offset="1" stopColor="#FDE68A" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes truck-move {
          0% { transform: translateX(-250px); }
          100% { transform: translateX(calc(100% + 250px)); }
        }
        @keyframes suspension {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-12px) scale(1.08); }
        }
        @keyframes particle {
          0% { transform: scale(1) translateX(0) translateY(0); opacity: 1; }
          100% { transform: scale(0) translateX(-40px) translateY(-20px); opacity: 0; }
        }
        @keyframes blob {
          0%, 100% { transform: scale(1) translate(0, 0); }
          33% { transform: scale(1.1) translate(10px, -10px); }
          66% { transform: scale(0.9) translate(-10px, 10px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        .animate-truck-move {
          animation: truck-move 10s linear infinite;
        }
        .animate-suspension {
          animation: suspension 0.3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 0.5s linear infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-particle {
          animation: particle 1.5s ease-out infinite;
        }
        .animate-blob {
          animation: blob 10s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default TruckAnimation;
