import Link from 'next/link';
import { DollarSign, CheckCircle, RotateCcw, Truck, ArrowRight, ClipboardCheck } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'Form 8849: Claim Your 2290 Tax Refund | Schedule 6 | QuickTruckTax',
    description: 'Claim a refund for sold, stolen, or destroyed vehicles. File IRS Form 8849 Schedule 6 and get your HVUT money back fast. Check eligibility now.',
    keywords: '2290 refund, form 8849, schedule 6, hvut refund, claim 2290 refund, sold vehicle tax refund',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/form-8849-refund',
    },
};

export default function RefundServicePage() {
    const faqData = [
        {
            question: "Can I get a refund if I sold my truck?",
            answer: "Yes! If you paid the 2290 tax and then sold, destroyed, or had your vehicle stolen before June 1st of the tax period, you can claim a pro-rated refund for the remaining months."
        },
        {
            question: "What is Form 8849 Schedule 6?",
            answer: "Form 8849 is the 'Claim for Refund of Excise Taxes'. Schedule 6 specifically covers claims for the Heavy Highway Vehicle Use Tax (Form 2290). This is the form you file to get money back."
        },
        {
            question: "How much refund will I get?",
            answer: "The refund is pro-rated. For example, if you paid $550 for the year but sold the truck in December, you can claim a refund for the months of January through June (6 months), which would be roughly $275."
        },
        {
            question: "What about low mileage refunds?",
            answer: "If you paid the tax expecting to drive over 5,000 miles, but ended up driving less than that (or 7,500 for agriculture) during the tax period, you can claim a full refund of the tax paid. However, you can only file this after the tax period ends (after June 30th)."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "Form 8849 Refund Filing",
                    description: "File to claim refunds for Overpayment of 2290 Tax (Sold/Stolen/Low Mileage).",
                    catalogName: "IRS Tax Refund Services",
                    offers: [
                        { name: "Form 8849 Schedule 6", price: "24.99" }
                    ]
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-green-400/30">
                            <DollarSign className="w-4 h-4" /> Get Money Back
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Sold a Truck? Claim Your <span className="text-green-400">2290 Refund</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            Don't leave money on the table. File Form 8849 Schedule 6 easily for sold, stolen, or low-mileage vehicles.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/resources"
                                className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                            >
                                Explore Resources <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Pro-Rated Calculation
                            </div>
                            <div className="flex items-center gap-2">
                                <ClipboardCheck className="w-4 h-4" /> Expert Filing
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-green-500/10 rounded-full blur-3xl"></div>
                        {/* Visual representation of Refund Check */}
                        <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border-t-4 border-green-500">
                            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500">Estimated Refund Amount</div>
                                    <div className="text-3xl font-bold text-slate-900">$275.00</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Tax Paid</span>
                                    <span className="font-semibold">$550.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Months Used</span>
                                    <span className="font-semibold">6 Months</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Reason</span>
                                    <span className="font-semibold text-green-600">Vehicle Sold</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Eligibility Grid */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">Are You Eligible?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">You can file a claim for refund for any of these reasons:</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <RotateCcw className="w-10 h-10 text-green-600" />,
                                title: "Sold / Stolen / Destroyed",
                                desc: "If the vehicle was sold, destroyed, or stolen before June 1st, you get a refund for the unused months."
                            },
                            {
                                icon: <Truck className="w-10 h-10 text-green-600" />,
                                title: "Low Mileage",
                                desc: "If you paid tax but drove less than 5,000 miles (7,500 for agriculture) in the tax year."
                            },
                            {
                                icon: <DollarSign className="w-10 h-10 text-green-600" />,
                                title: "Overpayment",
                                desc: "If you made a mistake on a previous 2290 and paid too much tax to the IRS."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-green-200 transition">
                                <div className="mb-6 bg-green-50 w-16 h-16 rounded-full flex items-center justify-center">{item.icon}</div>
                                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">Refund FAQs</h2>
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
                <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">Start your refund claim today</h2>
                <div className="inline-block bg-green-50 p-6 rounded-xl border border-green-100">
                    <p className="text-green-800 font-medium mb-4">Service opens Jan 2026</p>
                    <Link
                        href="/resources"
                        className="inline-flex bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition shadow-lg shadow-green-900/20 items-center gap-2"
                    >
                        Claim Waitlist <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

        </div>
    );
}
