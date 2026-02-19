import Link from 'next/link';
import { Truck, CheckCircle, Clock, ShieldCheck, ArrowRight, FileText, DollarSign } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'E-File Form 2290 for 2025-2026 Tax Year | Instant Schedule 1',
    description: 'File IRS Form 2290 for tax year 2025-2026 online. Expert concierge service—we handle the filing. Get your Schedule 1 fast. $34.99 flat.',
    keywords: 'e-file form 2290, file 2290 online, hvut filing, schedule 1, 2290 tax, heavy vehicle use tax, 2025-2026 tax year',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/form-2290-filing',
    },
};

export default function Form2290ServicePage() {
    const faqData = [
        {
            question: "When is the Form 2290 due date?",
            answer: "The annual tax period runs from July 1 to June 30. Form 2290 must be filed by August 31st for vehicles used in July. For vehicles first used in any other month, file by the last day of the month following the month of first use."
        },
        {
            question: "How much does Form 2290 cost?",
            answer: "The tax for vehicles with a taxable gross weight of 55,000 lbs is $100, plus $22 for each additional 1,000 lbs, up to a maximum of $550 for 75,000 lbs and over. Suspended vehicles (under 5,000 miles, or 7,500 for agriculture) are exempt from tax but generally still need to file."
        },
        {
            question: "How soon do I get my Schedule 1?",
            answer: "With QuickTruckTax, you typically receive your IRS-stamped Schedule 1 proof of payment via email within minutes of the IRS accepting your return."
        },
        {
            question: "Can I file for a suspended vehicle?",
            answer: "Yes. You can file Form 2290 for a suspended vehicle (Category W) if you expect to drive fewer than 5,000 miles (or 7,500 miles for agricultural vehicles) in the tax year. No tax is due, but you must still file."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "Form 2290 E-Filing",
                    description: "Expert concierge service for Form 2290 (HVUT). We file on your behalf and get your Schedule 1 fast.",
                    catalogName: "Trucking Tax Filing Services",
                    offers: [
                        { name: "Standard 2290 Filing", price: "19.99" },
                        { name: "VIN Correction", price: "0.00" }
                    ]
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-blue-400/30">
                            <CheckCircle className="w-4 h-4" /> Expert Concierge Service
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            E-file Form 2290 & Get Schedule 1 <span className="text-[var(--color-orange)]">Instantly</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            The fastest, most secure way to file your Heavy Vehicle Use Tax (HVUT). Avoid IRS lines and complex paperwork.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/resources"
                                className="bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                            >
                                Explore Resources <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Bank-Level Security
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" /> 2-Minute Process
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl"></div>
                        {/* Abstract UI representation of a Schedule 1 */}
                        <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border-t-4 border-[var(--color-orange)]">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-[var(--color-navy)]" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">Schedule 1</div>
                                        <div className="text-sm text-slate-500">Proof of Payment</div>
                                    </div>
                                </div>
                                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    IRS Stamped
                                </div>
                            </div>
                            <div className="space-y-4 mb-6">
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="text-sm font-medium text-slate-500">Received:</div>
                                <div className="text-lg font-bold text-[var(--color-navy)]">Just Now</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">Why File 2290 With Us?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">We've stripped away the confusion. Our smart wizard guides you through the process in plain English.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Clock className="w-10 h-10 text-[var(--color-orange)]" />,
                                title: "Instant Schedule 1",
                                desc: "Don't wait days. Get your watermarked Schedule 1 immediately after IRS acceptance."
                            },
                            {
                                icon: <Truck className="w-10 h-10 text-[var(--color-orange)]" />,
                                title: "VIN Correction",
                                desc: "Made a typo? We handle free VIN corrections (Form 2290 Amendment) to keep you moving."
                            },
                            {
                                icon: <DollarSign className="w-10 h-10 text-[var(--color-orange)]" />,
                                title: "Smart Tax Calc",
                                desc: "Our system automatically calculates tax based on vehicle weight and category. No math required."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
                                <div className="mb-6">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3">{feature.title}</h3>
                                <p className="text-slate-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-[var(--color-navy)] text-white py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Guides &amp; Tools</h2>
                    <p className="text-xl text-blue-200 mb-10">
                        Free checklists, due-date guides, and HVUT calculators to help you stay compliant.
                    </p>
                    <div className="flex justify-center">
                        <Link
                            href="/resources"
                            className="bg-white !text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-lg flex items-center gap-2"
                        >
                            Explore Resources <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">Frequently Asked Questions</h2>
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

            {/* Bottom CTA */}
            <div className="py-16 px-6 bg-slate-50 text-center">
                <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">More Form 2290 resources</h2>
                <Link
                    href="/resources"
                    className="inline-flex bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg shadow-orange-900/20 items-center gap-2"
                >
                    Explore Resources <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

        </div>
    );
}
