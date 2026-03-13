import Link from 'next/link';
import { Search, CheckCircle, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'Check 2290 Status & Form 2290 Filing Status (IRS Schedule 1)',
    description: 'Check Form 2290 status and track your Schedule 1 in minutes. See if the IRS accepted your return and get your stamped copy.',
    keywords: 'form 2290 status, check 2290 status, track schedule 1, 2290 status check, irs 2290 status',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/tools/check-2290-status',
    },
};

const CHECK_2290_FAQ = [
    { question: "How do I check my Form 2290 status?", answer: "If you filed with QuickTruckTax, enter your email or application ID on our status check page to see real-time updates. The IRS typically processes e-filed returns within 5–15 minutes." },
    { question: "Where is my Schedule 1?", answer: "Once the IRS accepts your Form 2290, your stamped Schedule 1 is available in your QuickTruckTax dashboard. Download and save it for state registration and roadside inspections." },
    { question: "What does 'Form 2290 status' mean?", answer: "Your Form 2290 status can be Pending (sent to IRS, awaiting response), Accepted (IRS approved—Schedule 1 ready), or Rejected (error found—correct and re-transmit)." },
];

export default function StatusCheckPage() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup type="FAQPage" data={CHECK_2290_FAQ} />
            <SchemaMarkup
                type="Service"
                data={{
                    name: "Form 2290 Status Check",
                    description: "Tool to track the status of your heavy vehicle use tax return and download Schedule 1.",
                    catalogName: "Tax Tools",
                    offers: [{ name: "Status Check", price: "0.00" }]
                }}
            />

            {/* Hero */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Check Your <span className="text-[var(--color-orange)]">Form 2290 Status</span>
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Waiting for your Schedule 1? Track your filing instantly. If you filed with us, you'll see real-time updates from the IRS.
                    </p>

                    {/* Simulation Box / Login CTA */}
                    <div className="bg-white rounded-2xl p-8 max-w-xl mx-auto shadow-2xl">
                        <div className="text-slate-900 text-left">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Track by Email or Application ID</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter your email address..."
                                    className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Link
                                    href="/login"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center"
                                >
                                    Check <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                *Only for filings submitted via QuickTruckTax. Filed elsewhere? <Link href="#irs-direct" className="text-blue-600 underline">See instructions</Link>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Meanings */}
            <div className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-[var(--color-navy)] mb-12">Understanding Your Status</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Pending */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mb-4">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">Pending / Transmitted</h3>
                            <p className="text-slate-600 text-sm">
                                Your return has been sent to the IRS but they haven't responded yet. This usually takes 5-15 minutes but can take longer during peak times.
                            </p>
                        </div>

                        {/* Accepted */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-b-4 border-b-green-500">
                            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">Accepted</h3>
                            <p className="text-slate-600 text-sm">
                                Use Success! The IRS has processed your return. Your watermarked Schedule 1 is ready for download in your dashboard.
                            </p>
                        </div>

                        {/* Rejected */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">Rejected</h3>
                            <p className="text-slate-600 text-sm">
                                The IRS found an error (usually a name/EIN mismatch). You need to correct the info and re-transmit. Re-filing is free with us.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filed Elsewhere Section */}
            <div id="irs-direct" className="bg-slate-100 py-16 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-4">Filed with another provider?</h2>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            If you didn't file with QuickTruckTax, we cannot track your specific return. You must contact the service provider you used, or check your bank statement to see if the IRS payment cleared.
                        </p>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            <strong>Tip:</strong> If you lost your Schedule 1 from last year, you can't get a "duplicate" easily from the IRS site. You usually have to call the IRS Excies Tax Hotline.
                        </p>
                    </div>
                    <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-4 text-[var(--color-navy)] font-bold">
                            <ShieldCheck className="w-6 h-6 text-green-500" /> Switch to Concierge
                        </div>
                        <p className="text-slate-600 mb-6 text-sm">
                            We focus on UCR filing—file with us and we keep your certificate in your secure portal. For Form 2290, see our guide or use an IRS-approved provider.
                        </p>
                        <Link
                            href="/ucr/file"
                            className="block w-full text-center bg-[var(--color-navy)] !text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition"
                        >
                            File UCR with us
                        </Link>
                        <Link href="/services/form-2290-filing" className="block w-full text-center border border-slate-300 text-slate-700 py-3 rounded-lg font-semibold mt-2 hover:bg-slate-50 transition">
                            Form 2290 guide
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
