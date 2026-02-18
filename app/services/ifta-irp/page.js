import Link from 'next/link';
import { Truck, Map, FileText, ArrowRight, Table, CheckCircle } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'IFTA Filing & Apportioned Plates (IRP) | Trucking Compliance',
    description: 'Understand IFTA fuel tax filing and IRP apportioned plates. Get state-specific guides for registering your interstate fleet. Simplify your quarterly tax reporting.',
    keywords: 'ifta filing, irp registration, apportioned plates, ifta fuel tax, interstate trucking authority, ifta calculator',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/ifta-irp',
    },
};

export default function IftaIrpServicePage() {
    const faqData = [
        {
            question: "What is the difference between IFTA and IRP?",
            answer: "IFTA (International Fuel Tax Agreement) simplifies fuel tax reporting for interstate carriers. You file one quarterly report to your base state. IRP (International Registration Plan) allows you to register your vehicle in your base state but allows you to operate in all member jurisdictions (apportioned plates), with fees distributed based on miles."
        },
        {
            question: "Who needs Apportioned Plates (IRP)?",
            answer: "You typically need IRP plates if you operate a vehicle over 26,000 lbs (or with 3+ axles) across state lines (interstate commerce). If you stay within one state, you get standard base plates."
        },
        {
            question: "When are IFTA taxes due?",
            answer: "IFTA reports are filed quarterly. Deadlines are April 30 (Q1), July 31 (Q2), October 31 (Q3), and January 31 (Q4)."
        },
        {
            question: "How do I calculate IFTA tax?",
            answer: "You must track total miles driven in each state and total fuel purchased in each state. The tax is calculated based on the fuel tax rate of each state vs. the fuel you actually consumed there."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "Interstate Compliance Services (IFTA/IRP)",
                    description: "Resources for IFTA Fuel Tax Filing and IRP Apportioned Registration.",
                    catalogName: "Trucking Compliance",
                    offers: []
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-purple-400/30">
                            <Map className="w-4 h-4" /> Cross-Border Mastery
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            IFTA Fuel Tax & <span className="text-purple-400">IRP Plates</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            Navigate the complex world of interstate compliance. From quarterly fuel tax reports to apportioned registration.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/resources"
                                className="bg-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-600 transition shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                            >
                                Guides Coming 2026 <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-3xl"></div>
                        {/* Visual representation of Plates/Tax */}
                        <div className="relative grid gap-6">
                            {/* Plate Card */}
                            <div className="bg-white text-slate-900 p-6 rounded-xl shadow-xl border-l-4 border-purple-500 transform -rotate-2 hover:rotate-0 transition duration-500">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold uppercase text-slate-400">Apportioned</div>
                                    <div className="text-xs font-bold uppercase text-slate-400">IRP</div>
                                </div>
                                <div className="text-4xl font-mono font-black text-[var(--color-navy)] tracking-widest text-center my-4">
                                    AP 1234
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-sm font-bold">TEXAS</div>
                                    <div className="bg-yellow-400 text-[10px] px-1 font-bold rounded">2026</div>
                                </div>
                            </div>

                            {/* IFTA Decal Card */}
                            <div className="bg-white text-slate-900 p-6 rounded-xl shadow-xl border-l-4 border-orange-500 transform rotate-2 hover:rotate-0 transition duration-500 w-3/4 ml-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="font-bold text-lg">IFTA License</div>
                                    <div className="text-2xl font-black text-slate-200">2026</div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-12 w-12 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">TX</div>
                                    <div className="h-12 w-12 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">TX</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* IFTA Deadlines Section */}
            <div className="py-20 px-6 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">IFTA Quarterly Deadlines 2026</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Quarterly fuel tax reports must be filed by the last day of the month following the end of the quarter.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { quarter: "Q1", range: "Jan - Mar", due: "April 30" },
                            { quarter: "Q2", range: "Apr - Jun", due: "July 31" },
                            { quarter: "Q3", range: "Jul - Sep", due: "October 31" },
                            { quarter: "Q4", range: "Oct - Dec", due: "January 31" }
                        ].map((q, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
                                <div className="text-sm font-bold text-orange-600 mb-1">{q.quarter}</div>
                                <div className="text-lg font-bold text-[var(--color-navy)] mb-1">{q.due}</div>
                                <div className="text-xs text-slate-500">{q.range}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Comparison Grid */}
            <div className="py-20 px-6 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">Understanding the Difference</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Two different requirements, often confused. Here is the breakdown.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-purple-100 p-3 rounded-lg"><Truck className="w-6 h-6 text-purple-600" /></div>
                                <h3 className="text-2xl font-bold text-[var(--color-navy)]">IRP (Plates)</h3>
                            </div>
                            <ul className="space-y-4 text-slate-600">
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Registers the vehicle itself.</li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Issued by your base state.</li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Allows travel in all member jurisdictions.</li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Fees apportioned by mileage %.</li>
                            </ul>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-orange-100 p-3 rounded-lg"><FileText className="w-6 h-6 text-orange-600" /></div>
                                <h3 className="text-2xl font-bold text-[var(--color-navy)]">IFTA (Fuel Tax)</h3>
                            </div>
                            <ul className="space-y-4 text-slate-600">
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Reports fuel taxes owed.</li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Quarterly filing requirement.</li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> Balances fuel bought vs. fuel used.</li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-500 shrink-0" /> One license covers all states.</li>
                            </ul>
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
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* State Guide Placeholder (For Future Programmatic SEO) */}
            <div id="state-guides" className="py-20 px-6 bg-white text-center">
                <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">Looking for state-specific requirements?</h2>
                <p className="text-slate-600 mb-8">Select your base state to see detailed IFTA & IRP instructions.</p>
                <div className="inline-block p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-400 italic">
                    State selector coming soon...
                </div>
            </div>

        </div>
    );
}
