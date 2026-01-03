import Link from "next/link";
import { notFound } from "next/navigation";
import { getErrorCode, errorCodes } from "@/lib/error-codes";
import { AlertTriangle, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

export async function generateMetadata({ params }) {
    const { code } = await params;
    const error = getErrorCode(code);

    if (!error) return {};

    return {
        title: `How to Fix IRS Error Code ${code} | QuickTruckTax`,
        description: `IRS Rejection ${code}: ${error.shortDesc}. Learn the 2-minute fix and resubmit your Form 2290 instantly.`,
    };
}

// Generate static params for known codes to help SSG/SEO
export async function generateStaticParams() {
    return errorCodes.map((error) => ({
        code: error.code,
    }));
}

export default async function ErrorCodePage({ params }) {
    const { code } = await params;
    const error = getErrorCode(code);

    if (!error) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <Link href="/error-codes" className="text-slate-500 hover:text-slate-800 mb-8 inline-flex items-center text-sm font-medium">
                ← Back to Error Codes
            </Link>

            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 sm:p-12 mb-12">
                <div className="flex items-start gap-4 mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500 flex-shrink-0" />
                    <div>
                        <span className="font-mono text-red-800 font-bold bg-white/50 px-3 py-1 rounded-md border border-red-200 text-sm">
                            {error.code}
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] mt-4 mb-4">
                            {error.shortDesc}
                        </h1>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-8 bg-white rounded-2xl p-6 shadow-sm border border-red-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">The Cause</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {error.cause}
                        </p>
                    </div>
                    <div className="md:border-l border-slate-100 md:pl-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-2">The Fix</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {error.fix}
                        </p>
                    </div>
                </div>
            </div>

            {/* The Hook: Switch Campaign */}
            <div className="bg-[#0f172a] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center">
                <div className="relative z-10 max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4">Struggling with repeated rejections?</h2>
                    <p className="text-lg text-slate-300 mb-8">
                        Competitor services often leave you in the dark with cryptic errors. Switch to QuickTruckTax for a guaranteed error-free transmission. Our system catches these mistakes <strong>before</strong> you file.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/services/form-2290-filing" className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-full font-bold hover:bg-[#ff7a20] transition hover:scale-105">
                            Fix & File Now <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400" /> Pre-File Validation</span>
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400" /> Free Re-submissions</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
