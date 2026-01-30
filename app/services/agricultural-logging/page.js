import Link from 'next/link';
import Image from 'next/image';
import { Tractor, Trees, CheckCircle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'Agricultural & Logging Vehicle Tax | Form 2290 Exemptions',
    description: 'Special Form 2290 rules for farmers and loggers. Claim the 7,500-mile agricultural limit or reduced logging tax rates. File online instantly.',
    keywords: 'agricultural vehicle form 2290, logging truck tax, 2290 farm exemption, logging vehicle credit',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/agricultural-logging',
    },
};

export default function AgLoggingPage() {
    const faqData = [
        {
            question: "What is the mileage limit for agricultural vehicles?",
            answer: "Agricultural vehicles can travel up to 7,500 miles on public highways annually without paying HVUT. This is higher than the standard 5,000-mile limit."
        },
        {
            question: "Do logging trucks get a discount?",
            answer: "Yes. Logging vehicles are taxed at a reduced rate compared to standard heavy trucks. You must notify the IRS of your logging status on Form 2290."
        },
        {
            question: "What if I use my farm truck for other work?",
            answer: "To qualify for the agricultural exemption, the vehicle must be used primarily for farming purposes. Commercial hauling unrelated to the farm may disqualify you."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "Agricultural & Logging Truck Tax Filing",
                    description: "Specialized Form 2290 filing for farm and logging operations.",
                    provider: {
                        "@type": "Organization",
                        name: "QuickTruckTax"
                    },
                    offers: {
                        "@type": "Offer",
                        price: "34.99",
                        priceCurrency: "USD",
                        description: "Filing fee for specialized returns"
                    }
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-[#1a3a2a] pt-24 pb-20 text-white">
                <div className="absolute inset-0 z-0 opacity-20">
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
                            <Tractor className="w-4 h-4" /> Farmers & Loggers
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl mb-6">
                            Special Tax Rules for <span className="text-green-400">Ag & Timber</span>.
                        </h1>
                        <p className="text-xl text-green-50 mb-8 max-w-lg leading-relaxed">
                            Don't pay the full highway rate if you don't have to. We specialize in exemptions for agricultural fleets and credits for logging trucks.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/dashboard/new-filing?type=ag"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-green-900/40 transition hover:bg-green-500 hover:scale-105"
                            >
                                File Ag/Logging Return
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl flex items-start gap-4">
                            <div className="bg-green-500/20 p-3 rounded-lg"><Tractor className="w-8 h-8 text-green-300" /></div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Agricultural Vehicles</h3>
                                <p className="text-green-100/80">
                                    <strong>7,500 Mile Limit:</strong> Use 50% more highway miles than standard trucks before paying tax.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl flex items-start gap-4">
                            <div className="bg-amber-500/20 p-3 rounded-lg"><Trees className="w-8 h-8 text-amber-300" /></div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Logging Vehicles</h3>
                                <p className="text-green-100/80">
                                    <strong>Reduced Tax Rate:</strong> Hauling timber? You qualify for a significantly lower tax rate per pound.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Details Section */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-6">Farming & Agriculture</h2>
                            <p className="text-lg text-[var(--color-muted)] mb-6">
                                Vehicles used primarily for farming purposes are eligible for the suspended status if they travel fewer than 7,500 miles on public highways.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-600" /> <span>Must be registered for farm use</span></li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-600" /> <span>Hauls farm produce/supplies</span></li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-green-600" /> <span>Can include livestock transporters</span></li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-6">Logging Operations</h2>
                            <p className="text-lg text-[var(--color-muted)] mb-6">
                                Logging vehicles are taxed at a reduced rate. To qualify, the vehicle must be designed to transport harvested forest products.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-amber-600" /> <span>Hauls from forest to mill/yard</span></li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-amber-600" /> <span>Lower tax rate applies instantly</span></li>
                                <li className="flex gap-3"><CheckCircle className="w-5 h-5 text-amber-600" /> <span>No mileage limit for reduced rate</span></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-slate-100">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-6">Ready to File?</h2>
                    <p className="text-lg text-[var(--color-muted)] mb-8">
                        Our smart system asks simple questions to determine if you qualify for Ag or Logging benefits automatically.
                    </p>
                    <Link
                        href="/dashboard/new-filing"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-10 py-4 text-lg font-bold !text-white shadow-lg transition hover:scale-105"
                    >
                        Start Compliance Check
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-[var(--color-text)] mb-10 text-center">Compliance Questions</h2>
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
