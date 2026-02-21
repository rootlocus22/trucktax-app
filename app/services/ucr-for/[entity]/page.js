import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, Truck, ShieldCheck, ArrowRight, AlertTriangle, Building2 } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

const entityTypes = {
    'motor-carriers': { name: 'Motor Carriers', desc: 'Entities providing commercial motor vehicle transportation in interstate commerce.', icon: Truck },
    'freight-forwarders': { name: 'Freight Forwarders', desc: 'Entities arranging transportation of freight in interstate commerce.', icon: Building2 },
    'brokers': { name: 'Brokers', desc: 'Entities arranging for the transportation of property by motor carrier.', icon: Building2 },
    'leasing-companies': { name: 'Leasing Companies', desc: 'Companies that lease commercial motor vehicles to interstate motor carriers.', icon: Truck },
};

function formatEntityName(slug) {
    if (!slug) return '';
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }) {
    const { entity } = await params;
    const normalizedEntity = entity.toLowerCase();

    if (!entityTypes[normalizedEntity]) {
        return {};
    }

    const entityData = entityTypes[normalizedEntity];

    return {
        title: `2026 UCR Registration for ${entityData.name} | Avoid Fines`,
        description: `Mandatory Unified Carrier Registration (UCR) guide for ${entityData.name.toLowerCase()}. File your 2026 UCR online instantly with $0 upfront. Pay later when certificate is ready.`,
        alternates: {
            canonical: `https://www.quicktrucktax.com/services/ucr-for/${normalizedEntity}`,
        },
    };
}

export default async function UcrEntityPage({ params }) {
    const { entity } = await params;
    const normalizedEntity = entity.toLowerCase();

    if (!entityTypes[normalizedEntity]) {
        notFound();
    }

    const entityData = entityTypes[normalizedEntity];
    const EntityIcon = entityData.icon;

    const faqData = [
        {
            question: `Are ${entityData.name.toLowerCase()} required to file UCR?`,
            answer: `Yes, ${entityData.name.toLowerCase()} operating in interstate commerce are required to file the Unified Carrier Registration (UCR) annually and pay the associated fees.`
        },
        {
            question: "How much are the UCR fees?",
            answer: normalizedEntity === 'brokers' || normalizedEntity === 'leasing-companies' || normalizedEntity === 'freight-forwarders'
                ? `For ${entityData.name.toLowerCase()} that do not operate commercial motor vehicles, the UCR fee is placed in the lowest bracket (0-2 vehicles), which is $46 for 2026.`
                : "UCR fees are determined by the size of your fleet operating in interstate commerce. Brackets range from 0-2 vehicles up to 1,001+ vehicles."
        },
        {
            question: "When is the deadline?",
            answer: "The UCR enforcement period typically begins on January 1st of the registration year. You should file your 2026 UCR by December 31, 2025, to avoid compliance delays and potential fines."
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
                <span>2026 UCR Registration is NOW OPEN for {entityData.name}. File today to avoid detention.</span>
            </div>

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-20 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-emerald-400/30">
                            <EntityIcon className="w-4 h-4" /> Operations Guide: {entityData.name}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            UCR Registration for <span className="text-emerald-400">{entityData.name}</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            {entityData.desc} Streamline your Unified Carrier Registration. Submit your details today for $0 upfront and stay DOT compliant.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/ucr/file"
                                className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 text-center"
                            >
                                File 2026 UCR Now <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-indigo-400" /> Pay Only on Delivery
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Full DOT Compliance
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6 bg-slate-100">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">Frequently Asked Questions</h2>
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
            <div className="py-20 px-6 bg-[var(--color-navy)] text-center text-white">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-4">Complete your {entityData.name} UCR</h2>
                    <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto">It only takes a few minutes. Our system instantly verifies your FMCSA details for accurate filing.</p>
                    <Link
                        href="/ucr/file"
                        className="inline-flex bg-emerald-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-emerald-600 transition shadow-xl items-center gap-2"
                    >
                        Start UCR Filing ($0 Upfront) <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

        </div>
    );
}
