import Link from 'next/link';
import { Calendar, AlertTriangle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: '2290 Filing Deadline 2025-2026 | When is Form 2290 Due? | QuickTruckTax',
    description: 'When is Form 2290 due? The deadline is August 31st. Check due dates for new vehicles, penalties for late filing, and how to file instantly. Avoid IRS fines.',
    keywords: '2290 filing deadline, when is 2290 due, form 2290 due date 2025, late filing penalty 2290, hvut deadline',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/resources/2290-due-date',
    },
};

export default function DeadlinePage() {
    const faqData = [
        {
            question: "When is the Form 2290 due date for 2025?",
            answer: "For the tax period beginning July 1, 2025, the Form 2290 filing deadline is September 2, 2025 (since August 31st falls on a Sunday and September 1st is Labor Day)."
        },
        {
            question: "What is the deadline for a newly purchased vehicle?",
            answer: "If you buy a new truck, you must file Form 2290 by the last day of the month following the month of first use. For example, if you drive it in October, file by November 30th."
        },
        {
            question: "What is the penalty for filing late?",
            answer: "The penalty for failing to file on time is 4.5% of the total tax due, accruing monthly for up to 5 months. You may also face an additional penalty of 0.5% per month for late payment, plus interest."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Article"
                data={{
                    headline: "Form 2290 Due Dates & Deadlines 2025-2026",
                    description: "Comprehensive guide to Heavy Vehicle Use Tax deadlines, penalties, and filing requirements.",
                    author: { name: "QuickTruckTax Compliance Team" },
                    datePublished: "2025-12-01",
                    dateModified: "2025-12-16"
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-red-400/30">
                        <AlertTriangle className="w-4 h-4" /> Don't Miss the Deadline
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        When is Form 2290 Due?
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        The general deadline is <span className="text-[var(--color-orange)] font-bold">August 31st</span> every year. Filing late can cost you hundreds in IRS penalties.
                    </p>

                    {/* Countdown / Status Box */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-white/10">
                            <div>
                                <div className="text-3xl font-bold text-[var(--color-orange)]">2026</div>
                                <div className="text-xs text-blue-200 uppercase tracking-wider mt-1">Tax Year</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">Aug 31</div>
                                <div className="text-xs text-blue-200 uppercase tracking-wider mt-1">Due Date</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-green-400">Soon</div>
                                <div className="text-xs text-blue-200 uppercase tracking-wider mt-1">Pre-File</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">Jul 1</div>
                                <div className="text-xs text-blue-200 uppercase tracking-wider mt-1">Season Opens</div>
                            </div>
                        </div>
                    </div>
                    <p className="text-blue-100 text-sm mt-6 max-w-xl mx-auto">
                        QuickTruckTax is primarily a UCR filing service; we also offer Form 2290 e-filing.
                    </p>
                    <Link
                        href="/services/form-2290-filing"
                        className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white border border-white/30 px-8 py-4 rounded-xl font-bold mt-4 transition"
                    >
                        Form 2290 guide & how to e-file <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-16 px-6">
                <div className="max-w-4xl mx-auto grid gap-12">

                    {/* Key Deadlines Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--color-navy)]">Key Filing Deadlines</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="py-4 font-bold text-slate-500 text-sm uppercase">Vehicle Usage</th>
                                        <th className="py-4 font-bold text-slate-500 text-sm uppercase">Filing Due Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="py-4 pr-4 font-medium text-[var(--color-navy)]">On the road in July 2026</td>
                                        <td className="py-4 text-[var(--color-orange)] font-bold">August 31, 2026</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 pr-4 font-medium text-[var(--color-navy)]">New Truck (First used in Jan 2026)</td>
                                        <td className="py-4 text-slate-600">February 28, 2026</td>
                                    </tr>
                                    <tr>
                                        <td className="py-4 pr-4 font-medium text-[var(--color-navy)]">New Truck (First used in May 2026)</td>
                                        <td className="py-4 text-slate-600">June 30, 2026</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Penalty Calculator Teaser */}
                    <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <AlertTriangle className="w-64 h-64" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">Avoid the 4.5% Late Penalty</h2>
                            <p className="text-blue-200 mb-8 max-w-xl text-lg">
                                The IRS charges 4.5% of the total tax due for every month you are late (up to 5 months). Don't let a $550 tax bill turn into a $700 headache.
                            </p>
                            <p className="text-white/80 text-sm mb-4">We&apos;re primarily a UCR filing service; we also e-file Form 2290.</p>
                            <Link
                                href="/services/form-2290-filing"
                                className="inline-flex items-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#ff7a20] transition hover:shadow-lg hover:scale-105 transform duration-200"
                            >
                                Form 2290 guide & e-file options <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* FAQ Content */}
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-8">Deadline FAQs</h2>
                        <div className="grid gap-6">
                            {faqData.map((faq, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200">
                                    <h3 className="font-bold text-[var(--color-navy)] mb-2">{faq.question}</h3>
                                    <p className="text-slate-600">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
