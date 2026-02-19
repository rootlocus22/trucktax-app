import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Leaf, FileText, ArrowRight, TrendingDown, HelpCircle, Truck } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'File Suspended Vehicle Form 2290 | Low Mileage Exemption',
    description: 'Operating under 5,000 miles? File as a Suspended Vehicle and pay $0 tax. QuickTruckTax makes claiming exemptions easy and audit-proof.',
    keywords: 'suspended vehicle form 2290, low mileage exemption, category w 2290, schedule 1 suspended',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/suspended-vehicle',
    },
};

export default function SuspendedVehiclePage() {
    const faqData = [
        {
            question: "Who qualifies for a suspended vehicle?",
            answer: "Vehicles expected to travel fewer than 5,000 miles (7,500 miles for agricultural vehicles) on public highways during the tax period (July 1 - June 30)."
        },
        {
            question: "Do I still need to file Form 2290?",
            answer: "Yes! You must file Form 2290 to report the vehicle as 'Suspended' (Category W). You will receive a Schedule 1 as proof for registration, but you will pay $0 tax."
        },
        {
            question: "What if I exceed the mileage limit later?",
            answer: "If you exceed the 5,000-mile limit, you must file an amendment (Form 2290) by the end of the month following the month the limit was exceeded and pay the full tax."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "Suspended Vehicle (Category W) Filing",
                    description: "IRS Form 2290 filing for low-mileage exempt vehicles.",
                    provider: {
                        "@type": "Organization",
                        name: "QuickTruckTax"
                    },
                    offers: {
                        "@type": "Offer",
                        price: "34.99",
                        priceCurrency: "USD",
                        description: "Filing fee for tax-exempt return"
                    }
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[var(--color-navy)] pt-24 pb-20 text-white">
                <div className="absolute inset-0 z-0 opacity-10">
                    <Image
                        src="/hero-truck.svg"
                        alt="Background pattern"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative z-10 mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-green-500/20 border border-green-500/30 px-4 py-1.5 text-sm font-bold text-green-100 mb-6">
                            <Leaf className="w-4 h-4" /> Save $550 With Exemption
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl mb-6">
                            Drive Less? <span className="text-[var(--color-orange)]">Pay $0 Tax</span>.
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-lg leading-relaxed">
                            If you drive under 5,000 miles/year, file as a <strong>Suspended Vehicle</strong>. Get your Schedule 1 for registration without paying the Heavy Vehicle Use Tax.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/ucr/file"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-900/20 transition hover:bg-[#e66a15] hover:scale-105"
                            >
                                File Exempt Return
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <p className="mt-4 text-sm text-blue-200/60 font-semibold">$34.99 filing fee • $0 IRS Tax • Instant Schedule 1</p>
                    </div>

                    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Truck className="w-6 h-6 text-[var(--color-orange)]" /> Who Qualifies?
                        </h3>
                        <ul className="space-y-4 text-blue-100">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <span><strong>Public Highway Mileage:</strong> Less than 5,000 miles.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <span><strong>Agricultural Vehicles:</strong> Less than 7,500 miles.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <span><strong>Proof Required:</strong> File Form 2290 (Category W).</span>
                            </li>
                        </ul>
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-sm italic opacity-80">
                                "I use my truck seasonally. QuickTruckTax saved me the full $550 tax bill by filing it as suspended."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-4">Why File Suspended?</h2>
                        <p className="text-lg text-[var(--color-muted)]">Don't pay taxes you don't owe. Claim your legal exemption.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-6">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Reduce Operating Costs</h3>
                            <p className="text-[var(--color-muted)]">Save $550 per truck annually. Ideal for backup trucks, seasonal harvest vehicles, or local yard dogs.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-6">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Get Schedule 1 Proof</h3>
                            <p className="text-[var(--color-muted)]">Even with $0 tax, DMV requires a stamped Schedule 1 to renew tags. We get you this document instantly.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-6">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">Audit Protection</h3>
                            <p className="text-[var(--color-muted)]">We store your mileage declaration and filing history securely for 3 years in case of IRS questions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Box */}
            <section className="py-10 px-6">
                <div className="mx-auto max-w-5xl bg-[var(--color-navy)] rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-orange)] rounded-full blur-[100px] opacity-20"></div>
                    <h2 className="text-3xl font-bold mb-6 relative z-10">Start Your Suspended Vehicle Return</h2>
                    <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto relative z-10">
                        It takes less than 5 minutes. Select "Suspended/Exempt" effectively skipping the payment screen.
                    </p>
                    <Link
                        href="/ucr/file"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-blue-900 px-10 py-4 text-lg font-bold shadow-lg transition hover:bg-slate-100 relative z-10"
                    >
                        File Now - $34.99
                    </Link>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-[var(--color-text)] mb-10 text-center">Common Questions</h2>
                <div className="space-y-6">
                    {faqData.map((faq, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">{faq.question}</h3>
                            <p className="text-[var(--color-muted)]">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
