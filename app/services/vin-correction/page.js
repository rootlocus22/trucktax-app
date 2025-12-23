import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, AlertTriangle, FileText, ArrowRight, ShieldCheck, PhoneOff, Clock } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'Free VIN Correction for Form 2290 | Fix Truck VIN Errors',
    description: 'Correct a wrong VIN on your Schedule 1 for free. QuickTruckTax files IRS Form 2290 amendments instantly. No phone calls needed.',
    keywords: 'vin correction form 2290, fix wrong vin schedule 1, amend form 2290, free vin correction',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/vin-correction',
    },
};

export default function VinCorrectionPage() {
    const faqData = [
        {
            question: "How much does a VIN correction cost?",
            answer: "At QuickTruckTax, VIN corrections are FREE for our customers. If you filed elsewhere, we charge a small service fee to fix it instantly with the IRS."
        },
        {
            question: "Do I need to pay taxes again?",
            answer: "No. A VIN correction (fixing a typo) does not require paying the tax again. You only pay if you are adding a completely different vehicle."
        },
        {
            question: "How long does it take?",
            answer: "E-filed corrections are typically accepted by the IRS within minutes. You will receive a new Schedule 1 with the correct VIN immediately."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "Form 2290 VIN Correction Service",
                    description: "Instant electronic filing to correct Vehicle Identification Numbers on IRS Form 2290.",
                    provider: {
                        "@type": "Organization",
                        name: "QuickTruckTax"
                    },
                    offers: {
                        "@type": "Offer",
                        price: "0.00",
                        priceCurrency: "USD",
                        description: "Free for existing customers"
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
                        <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/30 px-4 py-1.5 text-sm font-bold text-red-100 mb-6">
                            <AlertTriangle className="w-4 h-4" /> Wrong VIN on Schedule 1?
                        </div>
                        <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl mb-6">
                            Fix Your VIN Error <span className="text-[var(--color-orange)]">Instantly</span>.
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-lg leading-relaxed">
                            Don't let a typo stop your registration. We file IRS amendments electronically so you can get a corrected Schedule 1 in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/dashboard/new-filing?type=amendment"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-orange)] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-orange-900/20 transition hover:bg-[#e66a15] hover:scale-105"
                            >
                                Start Free Correction
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <p className="mt-4 text-sm text-blue-200/60">*Free for existing QuickTruckTax filings.</p>
                    </div>

                    <div className="relative bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-green-400" /> Correction Guarantee
                        </h3>
                        <ul className="space-y-4 text-blue-100">
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <span><strong>Instant IRS Acceptance:</strong> No mailing forms.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <span><strong>Correct Schedule 1:</strong> Get a new watermarked PDF.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <span><strong>DMV Ready:</strong> Accepted by all state DOTs.</span>
                            </li>
                            <li className="flex gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <span><strong>No Double Tax:</strong> You don't pay 2290 tax twice.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-4xl text-center mb-16">
                    <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl mb-4">How to Fix a VIN Mistake</h2>
                    <p className="text-lg text-[var(--color-muted)]">The IRS process is simple when you file electronically.</p>
                </div>

                <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-8">
                    {[
                        { title: "1. Select Amendment", desc: "Choose 'VIN Correction' in our wizard. It detects your previous filing automatically.", icon: FileText },
                        { title: "2. Enter Correct VIN", desc: "Type the actual VIN from your cab card. We validate it against standard formats.", icon: CheckCircle },
                        { title: "3. Get New Schedule 1", desc: "We transmit to the IRS. Once accepted, you get a new Schedule 1 with the correct VIN.", icon: Clock }
                    ].map((step, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition text-center">
                            <div className="w-16 h-16 bg-blue-50 text-[var(--color-navy)] rounded-full flex items-center justify-center mx-auto mb-6">
                                <step.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">{step.title}</h3>
                            <p className="text-[var(--color-muted)]">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comparison / Why Us */}
            <section className="bg-slate-100 py-20 px-6">
                <div className="mx-auto max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        <div className="p-10 md:p-12 space-y-6">
                            <h3 className="text-2xl font-bold text-[var(--color-navy)]">Paper Correction vs. E-File</h3>
                            <p className="text-[var(--color-muted)]">Sending a paper Form 2290 to the IRS can take <strong>6 weeks</strong> to process. You can't register your truck while you wait.</p>
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-3 text-red-600">
                                    <PhoneOff className="w-5 h-5" /> <span>No phone support needed</span>
                                </div>
                                <div className="flex items-center gap-3 text-red-600">
                                    <Clock className="w-5 h-5" /> <span>Paper = 4-6 weeks wait</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[var(--color-navy)] p-10 md:p-12 text-white flex flex-col justify-center">
                            <h3 className="text-2xl font-bold mb-6">The QuickTruckTax Way</h3>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-lg"><CheckCircle className="w-6 h-6 text-green-400" /> Done in 15 Minutes</li>
                                <li className="flex items-center gap-3 text-lg"><CheckCircle className="w-6 h-6 text-green-400" /> Instant PDF Download</li>
                                <li className="flex items-center gap-3 text-lg"><CheckCircle className="w-6 h-6 text-green-400" /> Free for Members</li>
                            </ul>
                            <Link
                                href="/dashboard/new-filing?type=amendment"
                                className="block w-full py-4 bg-white text-blue-900 text-center font-bold rounded-xl hover:bg-slate-100 transition"
                            >
                                Fix My VIN Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-[var(--color-text)] mb-10 text-center">Frequently Asked Questions</h2>
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
