
import Link from 'next/link';
import { CheckCircle, HelpCircle, ArrowRight, ShieldCheck, CreditCard, Award, Truck } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'Simple, Transparent Pricing | QuickTruckTax',
    description: 'File IRS Form 2290 for just $34.99. No hidden fees. Includes free VIN corrections, instant Schedule 1, and SMS alerts.',
    keywords: '2290 filing price, hvut cost, quicktrucktax pricing, form 2290 fee',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/pricing',
    },
};

export default function PricingPage() {
    const faqData = [
        {
            question: "Are there any hidden fees?",
            answer: "None. The price you see is the price you pay for our service. The only other cost is the actual tax amount due to the IRS, which we calculate for you."
        },
        {
            question: "Do you charge for VIN corrections?",
            answer: "No. Unlike other providers, VIN corrections (Form 2290 Amendments) are 100% FREE for our customers."
        },
        {
            question: "Is there a subscription fee?",
            answer: "No. You pay per filing. There are no monthly subscriptions or recurring charges."
        },
        {
            question: "What if my return is rejected?",
            answer: "If the IRS rejects your return for any reason, you can resubmit it through us for FREE until it's accepted."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "QuickTruckTax Filing Service",
                    description: "Electronic filing service for IRS Form 2290.",
                    offers: {
                        "@type": "Offer",
                        price: "34.99",
                        priceCurrency: "USD"
                    }
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-blue-100 leading-relaxed">
                        Stop overpaying. Get the industry's most advanced e-filing service for nearly half the price of the "old guys".
                    </p>
                </div>
            </div>

            {/* Pricing Card Section */}
            <div className="py-16 px-6 -mt-16">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">

                    {/* The "Other Guys" Card */}
                    <div className="bg-slate-200 rounded-3xl p-8 opacity-75 grayscale hover:grayscale-0 transition duration-500 relative order-2 md:order-1">
                        <div className="absolute top-0 right-0 bg-slate-400 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-widest">Competitors</div>
                        <h3 className="text-2xl font-bold text-slate-600 mb-2">The "Old Guard"</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold text-slate-500">$60.00+</span>
                            <span className="text-slate-500">/ filing</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-slate-600">
                            <li className="flex gap-3"><span className="text-red-500">✕</span> Clunky, outdated interface</li>
                            <li className="flex gap-3"><span className="text-red-500">✕</span> Charge extra for VIN corrections</li>
                            <li className="flex gap-3"><span className="text-red-500">✕</span> No SMS alerts</li>
                            <li className="flex gap-3"><span className="text-red-500">✕</span> Slow email support</li>
                        </ul>
                    </div>

                    {/* QuickTruckTax Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-[var(--color-orange)] relative transform md:-translate-y-8 order-1 md:order-2">
                        <div className="absolute top-0 right-0 bg-[var(--color-orange)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-widest">Best Value</div>
                        <h3 className="text-2xl font-bold text-[var(--color-navy)] mb-2">Form 2290 & Suspended</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-5xl font-black text-[var(--color-navy)]">$34.99</span>
                            <span className="text-slate-500">/ filing</span>
                        </div>
                        <p className="text-green-600 font-bold text-sm mb-6 bg-green-50 inline-block px-3 py-1 rounded-full">Save 40% instantly</p>

                        <div className="border-t border-slate-100 py-6 space-y-4">
                            {[
                                "Valid for Standard & Suspended (Cat W)",
                                "Instant IRS Schedule 1",
                                "Free VIN Corrections",
                                "Instant SMS Status Alerts",
                                "Free Resubmissions",
                                "5-Year Record Storage",
                                "US-Based Support"
                            ].map((feature, i) => (
                                <li key={i} className="flex gap-3 text-[var(--color-text)] font-medium">
                                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </div>

                        <Link
                            href="/early-access"
                            className="block w-full text-center bg-[var(--color-orange)] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg shadow-orange-900/20"
                        >
                            Start Filing Now
                        </Link>
                        <p className="text-center text-xs text-slate-400 mt-4">No credit card required to start.</p>
                    </div>
                </div>

                {/* MCS-150 Section */}
                <div className="max-w-5xl mx-auto mt-16 bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mb-4">
                                <Truck className="w-4 h-4" /> USDOT Compliance
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--color-navy)] mb-2">MCS-150 Biennial Update</h3>
                            <p className="text-slate-600 max-w-xl">
                                Mandatory every two years. Update your mileage and company details to stay compliant and avoid deactivation.
                            </p>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm text-slate-400 line-through font-medium">Others $149+</span>
                                <span className="text-4xl font-black text-[var(--color-navy)]">$99.99</span>
                            </div>
                            <Link
                                href="/services/mcs-150-update"
                                className="inline-flex items-center gap-2 bg-blue-900 !text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition"
                            >
                                Update DOT Number <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Table */}
            <div className="py-16 px-6 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-[var(--color-navy)] text-center mb-12">Everything Included</h2>
                <div className="grid sm:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl h-fit"><ShieldCheck className="w-6 h-6 text-blue-600" /></div>
                        <div>
                            <h3 className="font-bold text-lg text-[var(--color-navy)]">Audit Protection</h3>
                            <p className="text-slate-600 text-sm mt-1">We securely store your Schedule 1s for 5 years. Access them anytime if you get audited.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-green-100 p-3 rounded-xl h-fit"><Award className="w-6 h-6 text-green-600" /></div>
                        <div>
                            <h3 className="font-bold text-lg text-[var(--color-navy)]">Satisfaction Guarantee</h3>
                            <p className="text-slate-600 text-sm mt-1">If you're not happy with our service, we'll make it right. Our support team is here to help.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-purple-100 p-3 rounded-xl h-fit"><CreditCard className="w-6 h-6 text-purple-600" /></div>
                        <div>
                            <h3 className="font-bold text-lg text-[var(--color-navy)]">Secure Payments</h3>
                            <p className="text-slate-600 text-sm mt-1">We use bank-level 256-bit encryption to process payments. Your data is never stored on our servers.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-orange-100 p-3 rounded-xl h-fit"><HelpCircle className="w-6 h-6 text-orange-600" /></div>
                        <div>
                            <h3 className="font-bold text-lg text-[var(--color-navy)]">Live Support</h3>
                            <p className="text-slate-600 text-sm mt-1">Stuck on a question? Our US-based experts are ready to guide you through the process.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="py-20 px-6 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">Common Questions</h2>
                    <div className="space-y-6">
                        {faqData.map((faq, i) => (
                            <div key={i} className="bg-slate-50 p-6 rounded-2xl">
                                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
