import Link from 'next/link';
import { Files, CheckCircle, Map, ShieldCheck, ArrowRight, DollarSign, AlertTriangle } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'UCR Registration & Renewal Guide | Unified Carrier Registration',
    description: 'Learn how to file your annual UCR registration online with $0 upfront. We file first, then you pay when your UCR certificate is ready.',
    keywords: 'ucr registration guide, ucr renewal, unified carrier registration, file ucr online instructions, interstate carrier registration info',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/ucr-registration',
    },
};

export default function UCRServicePage() {
    const faqData = [
        {
            question: "Who needs to register for UCR?",
            answer: "Any motor carrier (private, for-hire, or exempt) that operates a commercial motor vehicle in interstate commerce (across state lines) needs to register for UCR. This also applies to brokers, freight forwarders, and leasing companies."
        },
        {
            question: "When is the UCR registration due?",
            answer: "The UCR registration year runs from January 1 to December 31. Registration for the upcoming year typically opens in October. You must register before operating in the new calendar year to stay compliant to avoid DOT fines and vehicle impoundment."
        },
        {
            question: "How are UCR fees calculated for 2025/2026?",
            answer: "UCR fees are based on the size of your fleet (number of commercial motor vehicles). There are 6 brackets: 0-2 vehicles, 3-5, 6-20, 21-100, 101-1000, and 1001+. The fee is not per-vehicle but a flat rate for the entire bracket."
        },
        {
            question: "Do I need UCR if my base state does not participate?",
            answer: "Yes. Even if your physical address is in a non-participating state (like Florida, New Jersey, or Arizona), you must still register and pay UCR fees if your vehicles cross state lines into any of the 41 participating states."
        },
        {
            question: "Do I have to pay before my filing is submitted?",
            answer: "No. With our file-first model, you can submit your UCR filing with no upfront service charge. You pay later when your certificate is uploaded and ready for full download in your dashboard."
        },
        {
            question: "Do I need UCR if I only drive in one state?",
            answer: "No. If you operate exclusively intrastate (within one state), you do not need UCR. However, you likely need an Intrastate USDOT number and state-specific permits like a CA Number (California) or TXDMV Number (Texas)."
        }
    ];

    const nonParticipatingStates = [
        "Arizona", "District of Columbia", "Florida", "Hawaii", "Maryland",
        "Nevada", "New Jersey", "Oregon", "Vermont", "Wyoming"
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "UCR Registration Service",
                    description: "Online filing service for Annual Unified Carrier Registration (UCR).",
                    catalogName: "Trucking Compliance Services",
                    offers: [
                        { name: "UCR 0-2 Vehicles", price: "Varies" },
                        { name: "UCR 3-5 Vehicles", price: "Varies" }
                    ]
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Urgency Banner */}
            <div className="bg-indigo-600 text-white py-2 text-center text-sm font-semibold px-4 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-300" />
                <span>2026 UCR Registration is NOW OPEN. Avoid fines and operation delays by filing your Unified Carrier Registration today.</span>
            </div>

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-20 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-indigo-400/30 shadow-lg shadow-indigo-900/20">
                            <ShieldCheck className="w-4 h-4" /> Official IRS & DOT Compliance Partner
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Unified Carrier Registration (UCR) <span className="text-indigo-400">Renewal</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            Mandatory annual registration for all carriers crossing state lines. Submit first with $0 upfront and pay only when your UCR certificate is ready. Nationwide support for all 50 states.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/ucr/file"
                                className="bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 transition shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                            >
                                Start UCR Filing ($0 Upfront) <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" /> Instant Proof
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-400" /> 50 State Valid
                            </div>
                            <div className="flex items-center gap-2">
                                <Map className="w-4 h-4 text-green-400" /> US-Based Support
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        {/* Visual representation of UCR Map */}
                        <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border-t-4 border-indigo-500">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Map className="w-5 h-5 text-indigo-600" />
                                Interstate Authority Validated
                            </h3>

                            {/* Abstract Map Nodes */}
                            <div className="relative h-48 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden mb-6 flex items-center justify-center">
                                <div className="absolute w-full h-px bg-slate-200 top-1/2"></div>
                                <div className="absolute h-full w-px bg-slate-200 left-1/2"></div>

                                {/* Node 1 */}
                                <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50"></div>
                                {/* Node 2 */}
                                <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/50"></div>
                                {/* Connector */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <line x1="33%" y1="33%" x2="66%" y2="66%" stroke="var(--color-navy)" strokeWidth="2" strokeDasharray="4 4" />
                                </svg>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="text-sm text-slate-500">Registration Year</div>
                                <div className="text-base font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md">2026</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bracket Fees Section */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">UCR Government Fee Brackets (2025/2026)</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Fees are strictly determined by the number of power units (trucks/tractors) operating in interstate commerce as per official UCR Plan regulations.</p>
                    </div>

                    <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { range: "0 - 2", fee: "$46.00", desc: "Small Fleets" },
                            { range: "3 - 5", fee: "$144.00", desc: "Growing" },
                            { range: "6 - 20", fee: "$359.00", desc: "Mid-Size" },
                            { range: "21 - 100", fee: "$1,224.00", desc: "Large" },
                            { range: "101 - 1k", fee: "$5,835.00", desc: "Hub" },
                            { range: "1,001+", fee: "$56,977.00", desc: "Enterprise" }
                        ].map((tier, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 text-center hover:border-indigo-400 transition shadow-sm hover:shadow-md">
                                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">{tier.desc}</div>
                                <div className="text-xl font-bold text-[var(--color-navy)] mb-1">{tier.range}</div>
                                <div className="text-lg font-bold text-indigo-600 mb-1">{tier.fee}</div>
                                <div className="text-slate-400 text-[10px] text-center">Power Units</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-slate-400 text-xs mt-8">* Official UCR Plan government fees. QuickTruckTax service filing fees apply separately.</p>
                    <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100 max-w-3xl mx-auto text-center">
                        <h3 className="font-bold text-[var(--color-navy)] mb-2">Why wait to pay?</h3>
                        <p className="text-slate-600 text-sm">We process your Unified Carrier Registration without any upfront service charge. You only pay for our service when your official UCR certificate is securely processed and ready for download.</p>
                    </div>
                </div>
            </div>

            {/* Participating States Section */}
            <div className="py-20 px-6 bg-slate-100">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-6">UCR State Requirements</h2>
                        <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                            Currently, there are 41 U.S. states participating in the Unified Carrier Registration plan. If your company is based in a non-participating state but your trucks cross over state lines into any participating state, <strong className="text-slate-800">UCR registration is still legally mandatory.</strong>
                        </p>
                        <p className="text-slate-600 mb-6">
                            When registering from a non-participating state, you will simply select the nearest participating base state for your filings.
                        </p>
                        <Link href="/ucr/file" className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1">
                            Begin your state UCR filing <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <Map className="w-5 h-5 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-navy)]">Non-Participating States</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">If based here but driving interstate, you must still file.</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {nonParticipatingStates.map((state) => (
                                <div key={state} className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    {state}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {faqData.map((faq, i) => (
                            <div key={i} className="border-b border-slate-100 pb-6 group">
                                <h3 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed text-sm">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-20 px-6 bg-[var(--color-navy)] text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-4">Ready to file your 2026 UCR?</h2>
                    <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">Join thousands of interstate carriers choosing a stress-free registration process. Nationwide compliance takes just minutes.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/ucr/file"
                            className="inline-flex bg-indigo-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-indigo-600 transition shadow-xl shadow-indigo-900/50 items-center gap-2 transform hover:-translate-y-1"
                        >
                            Start Filing Now ($0 Upfront) <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
