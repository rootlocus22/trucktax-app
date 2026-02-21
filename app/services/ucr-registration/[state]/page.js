import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, Map, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

const statesList = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut', 'delaware', 'florida', 'georgia',
    'hawaii', 'idaho', 'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine', 'maryland',
    'massachusetts', 'michigan', 'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new-hampshire', 'new-jersey',
    'new-mexico', 'new-york', 'north-carolina', 'north-dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode-island', 'south-carolina',
    'south-dakota', 'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west-virginia', 'wisconsin', 'wyoming',
    'washington-dc'
];

const nonParticipatingStates = [
    "arizona", "district-of-columbia", "washington-dc", "florida", "hawaii", "maryland",
    "nevada", "new-jersey", "oregon", "vermont", "wyoming"
];

function formatStateName(slug) {
    if (!slug) return '';
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }) {
    const { state } = await params;
    const normalizedState = state.toLowerCase();

    if (!statesList.includes(normalizedState) && normalizedState !== 'district-of-columbia') {
        return {};
    }

    const stateName = formatStateName(normalizedState);
    const isNonParticipating = nonParticipatingStates.includes(normalizedState);

    let title = `${stateName} UCR Registration & Renewal 2026 | Unified Carrier Registration`;
    let description = `Register your ${stateName}-based commercial vehicles for the 2026 UCR. File first with $0 upfront and pay only when your UCR certificate is ready.`;

    if (isNonParticipating) {
        title = `UCR Registration Guide for ${stateName} Motor Carriers (2026)`;
        description = `Even though ${stateName} is a non-participating base state, interstate carriers must still file UCR. Learn the rules and file online securely with QuickTruckTax.`;
    }

    return {
        title,
        description,
        alternates: {
            canonical: `https://www.quicktrucktax.com/services/ucr-registration/${normalizedState}`,
        },
    };
}

export default async function UcrStatePage({ params }) {
    const { state } = await params;
    const normalizedState = state.toLowerCase();

    if (!statesList.includes(normalizedState) && normalizedState !== 'district-of-columbia') {
        notFound();
    }

    const stateName = formatStateName(normalizedState);
    const isNonParticipating = nonParticipatingStates.includes(normalizedState);

    const faqData = [
        {
            question: `Is UCR required for passing through ${stateName}?`,
            answer: `Yes, if you operate a commercial motor vehicle in interstate commerce and travel into or through a participating state, you must have an active UCR—even if your base state is not participating.`
        },
        {
            question: `What happens if I operate in ${stateName} without UCR?`,
            answer: "If you operate a commercial vehicle in interstate commerce without an active UCR registration, you can be subjected to significant fines, your vehicle may be detained or impounded, and you will not be allowed to proceed until UCR fees and any penalties are paid."
        },
        {
            question: "How are UCR fees calculated for 2026?",
            answer: "UCR government fees are based strictly on the number of commercial motor vehicles in your fleet operating interstate. Brackets range from 0-2 vehicles up to 1,001+ vehicles."
        },
        {
            question: "Do I have to pay upfront?",
            answer: "No. QuickTruckTax provides a 'File First, Pay Later' service. You can submit your filing without any upfront service charge. You only pay when your official UCR certificate is securely uploaded to your dashboard."
        },
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="FAQPage"
                data={faqData}
            />

            {/* Urgency Banner */}
            <div className="bg-indigo-600 text-white py-2 text-center text-sm font-semibold px-4 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-300" />
                <span>2026 UCR Registration is NOW OPEN for {stateName} carriers. Avoid compliance delays.</span>
            </div>

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-20 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-indigo-400/30">
                            <Map className="w-4 h-4" /> State-Specific Guide: {stateName}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            {stateName} UCR Registration <span className="text-indigo-400">& Renewal</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            {isNonParticipating
                                ? `Important: Although ${stateName} does not serve as a UCR base state, motor carriers based here who cross into participating states are strictly required to file. We handle your out-of-state base registration instantly.`
                                : `Mandatory 2026 Unified Carrier Registration for ${stateName} interstate carriers. Submit your fleet details with $0 upfront and pay only when your certificate is ready.`
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href={`/ucr/file?state=${isNonParticipating ? '' : encodeURIComponent(stateName)}`}
                                className="bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-600 transition shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
                            >
                                Start UCR Filing ($0 Upfront) <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-400" /> Instant Processing
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-green-400" /> DOT Compliant
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border-t-4 border-indigo-500 text-center">
                            <h3 className="font-bold text-lg mb-2 flex items-center justify-center gap-2">
                                <Map className="w-5 h-5 text-indigo-600" />
                                {stateName} Compliance
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">
                                {isNonParticipating ? "Non-Participating Base State" : "Participating Base State"}
                            </p>

                            <div className={`p-4 rounded-xl border mb-6 ${isNonParticipating ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
                                <p className="text-sm font-bold mb-1">Status Summary:</p>
                                <p className="text-sm">
                                    {isNonParticipating
                                        ? `Interstate carriers must register through the nearest participating state. We automatically assign this for you during filing.`
                                        : `Your UCR registration will be based and processed through ${stateName} authorities seamlessly.`
                                    }
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="text-sm text-slate-500">Official Registration Year</div>
                                <div className="text-2xl font-black text-indigo-600">2026</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bracket Fees Section - Kept consistent with pillar page */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">Federal 2026 UCR Government Fees</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Fees are identical across all states, determined strictly by the number of power units operating in interstate commerce.</p>
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
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6 bg-slate-100">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">State Specific UCR FAQs</h2>
                    <div className="space-y-6">
                        {faqData.map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm group">
                                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-3">{faq.question}</h3>
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
                    <h2 className="text-3xl font-bold mb-4">Secure your {stateName} UCR today</h2>
                    <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">Get it done in 3 minutes. File now, pay only when your certificate is in hand.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/ucr/file"
                            className="inline-flex bg-indigo-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-indigo-600 transition shadow-xl shadow-indigo-900/50 items-center gap-2 transform hover:-translate-y-1"
                        >
                            Get Started ($0 Upfront) <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
