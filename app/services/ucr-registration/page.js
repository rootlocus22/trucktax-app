import Link from 'next/link';
import { Files, CheckCircle, Map, ShieldCheck, ArrowRight, DollarSign } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'UCR Registration & Renewal Guide | Unified Carrier Registration',
    description: 'Learn how to file your annual UCR registration online. Comprehensive guide for interstate carriers on bracket-based fee structures and compliance.',
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
            answer: "The UCR registration year runs from January 1 to December 31. Registration for the upcoming year typically opens in October. You must register before operating in the new calendar year to stay compliant."
        },
        {
            question: "How are UCR fees calculated?",
            answer: "UCR fees are based on the size of your fleet (number of commercial motor vehicles). There are brackets: 0-2 vehicles, 3-5, 6-20, 21-100, and 101-1000+. The fee is not per-vehicle but a flat rate for the bracket."
        },
        {
            question: "Do I need UCR if I only drive in one state?",
            answer: "No. If you operate exclusively intrastate (within one state), you do not need UCR. However, you likely need an Intrastate USDOT number and state-specific permits like a CA Number (California) or TXDMV Number (Texas)."
        }
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

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-indigo-400/30">
                            <Map className="w-4 h-4" /> Interstate Compliance
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Unified Carrier Registration (UCR) <span className="text-indigo-400">Renewal</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            Mandatory annual registration for all carriers crossing state lines. Simple fee calculation based on your fleet size.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/resources"
                                className="bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 transition shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                            >
                                Explore Resources <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Instant Proof
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> 50 State Valid
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        {/* Visual representation of UCR Map */}
                        <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border-t-4 border-indigo-500">
                            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                <Map className="w-5 h-5 text-indigo-600" />
                                Interstate Authority
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
                                <div className="text-base font-bold text-indigo-600">2026</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bracket Fees Section */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">UCR Fee Brackets</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Fees are determined by the number of power units (trucks) in your fleet.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            { range: "0 - 2", fee: "$46.00", desc: "Small Fleets" },
                            { range: "3 - 5", fee: "$144.00", desc: "Growing Fleets" },
                            { range: "6 - 20", fee: "$359.00", desc: "Mid-Size" },
                            { range: "21 - 100", fee: "$1,224.00", desc: "Large Fleets" }
                        ].map((tier, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 text-center hover:border-indigo-400 transition">
                                <div className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">{tier.desc}</div>
                                <div className="text-3xl font-bold text-[var(--color-navy)] mb-2">{tier.range}</div>
                                <div className="text-xl font-bold text-indigo-600 mb-2">{tier.fee}</div>
                                <div className="text-slate-500 text-xs text-center">Power Units</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">UCR FAQs</h2>
                    <div className="space-y-6">
                        {faqData.map((faq, i) => (
                            <div key={i} className="border-b border-slate-200 pb-6">
                                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="py-16 px-6 bg-slate-50 text-center">
                <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">Ready to file your 2026 UCR?</h2>
                <div className="inline-block bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <p className="text-indigo-800 font-medium mb-4">Registration opens Jan 2026</p>
                    <Link
                        href="/resources"
                        className="inline-flex bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 transition shadow-lg shadow-indigo-900/20 items-center gap-2"
                    >
                        UCR Waitlist <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

        </div>
    );
}
