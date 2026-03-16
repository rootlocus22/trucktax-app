import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Map, ArrowRight, ShieldCheck } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import usStates from '@/data/us-states.json';

export async function generateStaticParams() {
    return usStates.map((state) => ({
        state: state.name.toLowerCase().replace(/\s+/g, '-'),
    }));
}

export async function generateMetadata({ params }) {
    const { state } = await params;
    const stateData = usStates.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === state);

    if (!stateData) return {};

    const name = stateData.name;

    return {
        title: `UCR Filing in ${name} | easyucr.com`,
        description: `File UCR for ${name} with $0 upfront. UCR registration for ${name} truckers and fleets.`,
        keywords: `ucr filing ${name}, ucr registration ${name}, ${name} ucr`,
        alternates: {
            canonical: `https://www.easyucr.com/insights/state/${state}`,
        },
    };
}

export default async function StateCompliancePage({ params }) {
    const { state } = await params;
    const stateData = usStates.find(s => s.name.toLowerCase().replace(/\s+/g, '-') === state);

    if (!stateData) {
        notFound();
    }

    const name = stateData.name;
    const code = stateData.code;

    const faqData = [
        {
            question: `Do ${name} truckers need UCR?`,
            answer: `Yes. If you operate in interstate commerce (cross state lines), you must register for UCR regardless of your base state. File by December 31. easyucr.com helps you file UCR for ${name} with $0 upfront.`
        },
        {
            question: `When is UCR due for ${name} carriers?`,
            answer: `UCR must be renewed by December 31 each year. Registration opens October 1. File early to avoid the year-end rush.`
        },
        {
            question: `How much does UCR cost for ${name} fleets?`,
            answer: `UCR fees are based on fleet size (0–2 vehicles: $46, up to 1,001+: $44,836). easyucr.com charges a $79 filing fee plus the official UCR fee. File with $0 upfront.`
        },
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: `${name} UCR Filing`,
                    description: `UCR filing for ${name} carriers. File UCR with $0 upfront.`,
                    catalogName: `easyucr.com`,
                    offers: [{ name: "UCR Filing", price: "79" }]
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-blue-400/30">
                            <Map className="w-4 h-4" /> {name} UCR Guide
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            UCR Filing in <span className="text-[var(--color-orange)]">{name}</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            File UCR for {name} with $0 upfront. We focus on UCR filing only.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/ucr/file"
                                className="bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                            >
                                File UCR <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/insights/ucr-renewal-guide" className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition flex items-center justify-center gap-2">
                                UCR Renewal Guide
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border-t-4 border-[var(--color-navy)] flex flex-col items-center justify-center h-64">
                            <div className="text-6xl font-black text-slate-100 mb-4">{code}</div>
                            <div className="text-2xl font-bold text-[var(--color-navy)]">{name}</div>
                            <div className="text-sm text-slate-500 mt-2">{stateData.agency}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">{name} UCR Checklist</h2>
                        <p className="text-lg text-slate-600">Ensure you have UCR compliance for interstate operations.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                            <div className="shrink-0 bg-green-100 p-4 rounded-full">
                                <ShieldCheck className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="grow text-center md:text-left">
                                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">UCR Registration</h3>
                                <p className="text-slate-600">Required for interstate motor carriers. File by December 31. Fee based on fleet size.</p>
                            </div>
                            <Link href="/ucr/file" className="shrink-0 px-6 py-2 bg-[var(--color-orange)] text-white font-bold rounded-lg hover:bg-[#e66a15] transition">
                                File UCR
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">{name} UCR FAQs</h2>
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

            <div className="py-16 px-6 bg-slate-50 text-center">
                <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">File UCR for {name}</h2>
                <Link
                    href="/ucr/file"
                    className="inline-flex bg-[var(--color-orange)] !text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e66a15] transition shadow-lg items-center gap-2"
                >
                    File UCR Now <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
