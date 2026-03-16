import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calculator, ShieldCheck, Zap, CheckCircle } from 'lucide-react';

export const metadata = {
    title: 'UCR Registration Services | File UCR Online',
    description: 'Federal-compliant UCR registration. File UCR online with $0 upfront.',
    keywords: 'ucr registration, ucr filing, ucr renewal, trucking compliance',
    alternates: {
        canonical: 'https://www.easyucr.com/services',
    },
    openGraph: {
        title: "UCR Registration Services | easyucr.com",
        description: "Federal-compliant UCR registration. File UCR online with $0 upfront.",
        url: "https://www.easyucr.com/services",
        siteName: "easyucr.com",
        type: "website",
    },
};

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* HER0 - UCR Focused */}
            <div className="relative text-white py-24 px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=80"
                        alt="Trucks on the road - compliance made simple"
                        fill
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)]/95 via-[var(--color-navy)]/80 to-[var(--color-navy)]/95" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-orange)] border border-white/10 shadow-lg mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            Federal Compliant UCR Platform
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg leading-tight">
                            Instant <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20]">UCR Registration</span> for 2026
                        </h1>
                        <p className="text-xl text-blue-100 max-w-xl mb-8 leading-relaxed">
                            Stop guessing compliance brackets. Instantly sync with federal databases, verify your fleet size, and receive your official UCR receipt in under 5 minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/ucr/file" className="inline-flex items-center justify-center bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-medium hover:bg-[#e66a15] transition shadow-[0_0_20px_rgba(255,139,61,0.4)] group text-lg">
                                Start UCR Filing
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/tools/ucr-calculator" className="inline-flex justify-center items-center bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-4 rounded-xl font-medium transition text-lg">
                                <Calculator className="w-5 h-5 mr-2" /> Calculate UCR Fee
                            </Link>
                        </div>
                    </div>

                    {/* Feature Highlight Graphic */}
                    <div className="hidden lg:block relative perspective-1000">
                        <div className="relative transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700 ease-out">
                            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-orange)] to-blue-600 rounded-2xl blur opacity-30"></div>
                            <div className="relative bg-[var(--color-midnight)]/90 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl">
                                <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-xl">UCR Registration</p>
                                        <p className="text-white/60 text-sm">2026 Filing Year</p>
                                    </div>
                                </div>

                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3 text-blue-100">
                                        <CheckCircle className="w-5 h-5 text-[var(--color-orange)] shrink-0 mt-0.5" />
                                        <span>Instant DOT Number & Fleet Size Verification</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-blue-100">
                                        <CheckCircle className="w-5 h-5 text-[var(--color-orange)] shrink-0 mt-0.5" />
                                        <span>Exact Tier Brackets Auto-Calculated</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-blue-100">
                                        <CheckCircle className="w-5 h-5 text-[var(--color-orange)] shrink-0 mt-0.5" />
                                        <span>Secure PDF Receipt Delivered Instantly</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Final CTA */}
            <div className="py-20 px-6 bg-[var(--color-navy)] relative overflow-hidden text-center">
                <div className="absolute inset-0 opacity-10 bg-[url('/ucr-filing.webp')] bg-repeat space-x-4"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-6">Need UCR Answers Now?</h2>
                    <p className="text-lg text-blue-100 mb-8">
                        Explore our deep-dive pillar posts specifically crafted to answer everything you need to know about the Unified Carrier Registration.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            href="/insights/complete-guide-ucr-filing-2026"
                            className="bg-white/10 hover:bg-white/20 !text-white hover:!text-white border border-white/30 px-6 py-3 rounded-lg font-bold transition"
                        >
                            Complete 2026 Guide
                        </Link>
                        <Link
                            href="/insights/who-needs-ucr-registration"
                            className="bg-white/10 hover:bg-white/20 !text-white hover:!text-white border border-white/30 px-6 py-3 rounded-lg font-bold transition"
                        >
                            Who Needs to File?
                        </Link>
                    <Link
                            href="/insights/ucr-renewal-guide"
                            className="bg-white/10 hover:bg-white/20 !text-white hover:!text-white border border-white/30 px-6 py-3 rounded-lg font-bold transition"
                    >
                            UCR Renewal Process
                    </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
