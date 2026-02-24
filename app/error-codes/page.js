import Link from "next/link";
import { errorCodes } from "@/lib/error-codes";
import { AlertCircle, ArrowRight, Search } from "lucide-react";

export const metadata = {
    title: "IRS Form 2290 Error Code Encyclopedia | Fix Rejections Fast",
    description: "Library of common IRS Form 2290 rejection codes. Find out what R0000-058, R0000-900, and other error codes mean and how to fix them.",
};

export default function ErrorCodesIndex() {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <div className="text-center mb-16">
                <span className="text-red-500 font-bold uppercase tracking-wider text-sm mb-2 block">Troubleshooting Guide</span>
                <h1 className="text-4xl font-extrabold text-[#0f172a] mb-6">
                    IRS Error Code Encyclopedia
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                    Got rejected? Don't panic. Find your error code below to see exactly how to fix it and resubmit.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {errorCodes.map((error) => (
                    <Link href={`/error-codes/${error.code}`} key={error.code} className="group">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-red-200 transition-all h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-mono text-sm font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {error.code}
                                </span>
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0f172a] mb-2 group-hover:text-blue-600 transition-colors">
                                {error.title.replace("IRS Error Code ", "")}
                            </h3>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-grow">
                                {error.shortDesc}
                            </p>
                            <div className="flex items-center text-sm font-bold text-[var(--color-orange)] group-hover:translate-x-1 transition-transform">
                                Read Solution <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center border dashed border-blue-200">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Can't find your code?</h3>
                <p className="text-blue-800 mb-6">
                    Our support team fixes IRS rejections all day long. Chat with us for free help.
                </p>
                <Link href="/services/form-2290-filing" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                    Form 2290 guide
                </Link>
                <Link href="/ucr/file" className="inline-flex items-center gap-2 bg-[var(--color-orange)] text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition ml-3">
                    File UCR
                </Link>
            </div>
        </div>
    );
}
