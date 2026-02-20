import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, ShieldCheck } from "lucide-react";

export const metadata = {
    title: "QuickTruckTax vs ExpressTruckTax | Best 2290 E-Filing Alternative 2025",
    description: "Comparing QuickTruckTax and ExpressTruckTax features, pricing, and support. See why truckers save 30% by switching for the 2025-2026 tax year.",
};

export default function VsExpressTruckTax() {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <span className="text-[var(--color-orange)] font-bold uppercase tracking-wider text-sm mb-2 block">Competitor Comparison</span>
                <h1 className="text-4xl font-extrabold text-[#0f172a] mb-6">
                    QuickTruckTax vs. ExpressTruckTax
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Honest comparison of pricing, features, and support for the 2025-2026 Tax Year.
                </p>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mb-16">
                <div className="grid grid-cols-3 bg-slate-50 p-6 border-b border-slate-200">
                    <div className="font-bold text-slate-500">Feature</div>
                    <div className="font-bold text-[var(--color-orange)] text-center">QuickTruckTax</div>
                    <div className="font-bold text-slate-600 text-center">ExpressTruckTax</div>
                </div>

                {/* Row 1: Price */}
                <div className="grid grid-cols-3 p-6 border-b border-slate-100 items-center">
                    <div className="font-semibold text-slate-900">Price (Single Vehicle)</div>
                    <div className="text-center">
                        <span className="text-2xl font-bold text-green-600">$34.99</span>
                        <span className="block text-xs text-slate-500">Flat Rate</span>
                    </div>
                    <div className="text-center text-slate-500">
                        <span className="text-xl font-bold">$19.90*</span>
                        <span className="block text-xs text-slate-400 opacity-60">*Starts at, goes up to $60+</span>
                    </div>
                </div>

                {/* Row 2: VIN Correction */}
                <div className="grid grid-cols-3 p-6 border-b border-slate-100 items-center bg-slate-50/50">
                    <div className="font-semibold text-slate-900">VIN Corrections</div>
                    <div className="text-center flex flex-col items-center">
                        <CheckCircle className="text-green-500 w-6 h-6 mb-1" />
                        <span className="text-xs font-bold text-green-700">FREE Forever</span>
                    </div>
                    <div className="text-center flex flex-col items-center text-slate-500">
                        <CheckCircle className="text-slate-400 w-6 h-6 mb-1" />
                        <span className="text-xs">Included</span>
                    </div>
                </div>

                {/* Row 3: Support */}
                <div className="grid grid-cols-3 p-6 border-b border-slate-100 items-center">
                    <div className="font-semibold text-slate-900">Customer Support</div>
                    <div className="text-center flex flex-col items-center">
                        <span className="font-bold text-slate-900">Priority Phone & Chat</span>
                        <span className="text-xs text-slate-500">No extra charge</span>
                    </div>
                    <div className="text-center text-slate-500">
                        <span className="font-medium">Standard</span>
                    </div>
                </div>

                {/* Row 4: Speed */}
                <div className="grid grid-cols-3 p-6 items-center bg-slate-50/50">
                    <div className="font-semibold text-slate-900">Schedule 1 Delivery</div>
                    <div className="text-center font-bold text-blue-600">
                        Instant
                    </div>
                    <div className="text-center text-slate-500">
                        Instant
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                    <h2 className="text-3xl font-bold text-[#0f172a] mb-6">Why switch to QuickTruckTax?</h2>
                    <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                        While competitors lure you in with low "starting at" prices, the final bill often surprises you. We believe in transparency.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex gap-3 items-start">
                            <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0 mt-1" />
                            <span className="text-slate-700"><strong>Flat Pricing:</strong> The price you see is the price you pay. No tiered "packages".</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0 mt-1" />
                            <span className="text-slate-700"><strong>Mobile-First Design:</strong> File from your truck cab on any device without squinting.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <CheckCircle className="text-green-500 w-6 h-6 flex-shrink-0 mt-1" />
                            <span className="text-slate-700"><strong>Guaranteed Accuracy:</strong> Our system double-checks tax calculations against the latest IRS tables.</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4">Ready to save?</h3>
                        <p className="text-blue-200 mb-8">
                            Create your free account today and see the difference.
                        </p>
                        <Link href="/services/form-2290-filing" className="block w-full text-center bg-[var(--color-orange)] hover:bg-[#ea580c] py-4 rounded-xl font-bold text-lg transition-colors">
                            Start Filing Now
                        </Link>
                        <p className="text-center text-xs text-blue-400 mt-4">Safe, Secure & Federal Compliant</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
