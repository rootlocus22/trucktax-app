import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, ShieldCheck, Zap } from "lucide-react";

export const metadata = {
    title: "Compare QuickTruckTax vs Competitors | Best 2290 E-File Providers",
    description: "See how QuickTruckTax stacks up against ExpressTruckTax, eForm2290, and others. Lower fees, instantly available support, and no hidden costs.",
};

export default function ComparisonsHub() {
    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-6">
                    Why Truckers Switch to <span className="text-[var(--color-orange)]">QuickTruckTax</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Don't overpay for your Form 2290. Compare features, pricing, and support to see why we are the smart choice for 2025-2026.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Comparison Card: ExpressTruckTax */}
                <Link href="/comparisons/vs-express-truck-tax" className="group">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-[var(--color-orange)]/30 transition-all h-full flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <ShieldCheck className="w-8 h-8 text-blue-600" />
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Top Choice</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-[var(--color-orange)] transition-colors">
                            vs. ExpressTruckTax
                        </h3>
                        <p className="text-slate-600 mb-6 flex-grow">
                            See why our $34.99 flat rate beats their tiered pricing. No hidden fees for "Premium" support.
                        </p>
                        <div className="flex items-center text-[var(--color-navy)] font-bold">
                            Compare Now <Zap className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Link>

                {/* Placeholder for eForm2290 */}
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 opacity-60">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-slate-200 p-3 rounded-lg">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-400 mb-2">
                        vs. eForm2290
                    </h3>
                    <p className="text-slate-400 mb-6">
                        Coming Soon. Full breakdown of features and pricing.
                    </p>
                </div>

                {/* Placeholder for SimpleTruckTax */}
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 opacity-60">
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-slate-200 p-3 rounded-lg">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-400 mb-2">
                        vs. SimpleTruckTax
                    </h3>
                    <p className="text-slate-400 mb-6">
                        Coming Soon. Full breakdown of features and pricing.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FileText({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
    )
}
