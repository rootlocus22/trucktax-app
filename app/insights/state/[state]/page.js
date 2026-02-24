import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Map, Truck, FileText, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import usStates from '@/data/us-states.json';

// Generate static params for all states at build time
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
        title: `Form 2290 & IFTA Filing in ${name} | Trucking Compliance`,
        description: `File your IRS Form 2290 (HVUT) and report IFTA fuel taxes in ${name}. Simple, secure online filing for ${name} owner-operators and fleets.`,
        keywords: `form 2290 ${name}, ifta filing ${name}, truck tax ${name}, ${name} dot compliance, irp registration ${name}`,
        alternates: {
            canonical: `https://www.quicktrucktax.com/insights/state/${state}`,
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
            question: `Do I need to file Form 2290 in ${name}?`,
            answer: `Yes. Determining if you owe the Heavy Vehicle Use Tax (HVUT) is a federal requirement, regardless of your base state. If you operate a vehicle with a gross weight of 55,000 lbs or more on public highways in ${name}, you must file Form 2290 with the IRS.`
        },
        {
            question: `How do I get IRP Apportioned Plates in ${name}?`,
            answer: `You must register through the ${stateData.agency}. You'll need your stamped Schedule 1 (proof of 2290 payment) to complete your IRP registration and get your apportioned plates.`
        },
        {
            question: `When are ${name} IFTA taxes due?`,
            answer: `${name} follows the standard IFTA quarterly reporting schedule: April 30, July 31, October 31, and January 31.`
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: `${name} Trucking Compliance Services`,
                    description: `Federal and State trucking compliance filing services for ${name} carriers.`,
                    catalogName: `${name} Truck Tax`,
                    offers: [
                        { name: "Form 2290 Filing", price: "34.99" },
                        { name: "MCS-150 Update", price: "49.00" }
                    ]
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-blue-400/30">
                            <Map className="w-4 h-4" /> {name} Trucking Guide
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Trucking Compliance in <span className="text-[var(--color-orange)]">{name}</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            File UCR for {name} with $0 upfront. We also have a Form 2290 guide—we don&apos;t file 2290; we focus on UCR.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/ucr/file"
                                className="bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                            >
                                File UCR <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link href="/services/form-2290-filing" className="bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition flex items-center justify-center gap-2">
                                Form 2290 guide
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl"></div>
                        {/* Dynamic State Card */}
                        <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border-t-4 border-[var(--color-navy)] flex flex-col items-center justify-center h-64">
                            <div className="text-6xl font-black text-slate-100 mb-4">{code}</div>
                            <div className="text-2xl font-bold text-[var(--color-navy)]">{name}</div>
                            <div className="text-sm text-slate-500 mt-2">{stateData.agency}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance Checklist */}
            <div className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">{name} Trucking Checklist</h2>
                        <p className="text-lg text-slate-600">Ensure you have all the required permits to operate legally in {name}.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Item 1 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                            <div className="shrink-0 bg-green-100 p-4 rounded-full">
                                <FileText className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="grow text-center md:text-left">
                                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">IRS Form 2290 (HVUT)</h3>
                                <p className="text-slate-600">Federal tax for vehicles 55,000 lbs+. We don&apos;t file 2290—see our guide for deadlines and how to e-file.</p>
                            </div>
                            <Link href="/services/form-2290-filing" className="shrink-0 px-6 py-2 bg-slate-100 text-blue-900 font-bold rounded-lg hover:bg-slate-200 transition">
                                Form 2290 guide
                            </Link>
                        </div>

                        {/* Item 2 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                            <div className="shrink-0 bg-purple-100 p-4 rounded-full">
                                <Map className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="grow text-center md:text-left">
                                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">IFTA & IRP</h3>
                                <p className="text-slate-600">If you leave {name} to haul goods in other states, you need IFTA decals and Apportioned Plates.</p>
                            </div>
                            <Link href="/services/ifta-irp" className="shrink-0 px-6 py-2 bg-slate-100 text-blue-900 font-bold rounded-lg hover:bg-slate-200 transition">
                                View Guide
                            </Link>
                        </div>

                        {/* Item 3 */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                            <div className="shrink-0 bg-teal-100 p-4 rounded-full">
                                <ShieldCheck className="w-8 h-8 text-teal-600" />
                            </div>
                            <div className="grow text-center md:text-left">
                                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-2">USDOT Number</h3>
                                <p className="text-slate-600">Required if you operate commercial vehicles involved in interstate commerce, or haul hazardous materials within {name}.</p>
                            </div>
                            <Link href="/services/mcs-150-update" className="shrink-0 px-6 py-2 bg-slate-100 text-blue-900 font-bold rounded-lg hover:bg-slate-200 transition">
                                Update DOT
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">{name} FAQs</h2>
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
                <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">Stay Compliant in {name}</h2>
                <Link
                    href="/ucr/file"
                    className="inline-flex bg-blue-900 !text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition shadow-lg items-center gap-2"
                >
                    Start Compliance Check <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

        </div>
    );
}
