
import Link from 'next/link';
import { CheckCircle, Truck, Zap, ShieldCheck, HelpCircle, FileText, LayoutGrid, Info } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';
import { PRICING_CONFIG } from '@/lib/pricing-config';

export const metadata = {
    title: 'Transparent Pricing | Form 2290 E-Filing Costs | QuickTruckTax',
    description: 'Affordable and transparent pricing for IRS Form 2290 e-filing. From single trucks to large fleets, get the best value with QuickTruckTax.',
    keywords: '2290 filing price, hvut cost, quicktrucktax pricing, form 2290 fee, fleet pricing',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/pricing',
    },
};

export default function PricingPage() {
    const faqData = [
        {
            question: "Are there any hidden fees?",
            answer: "None. The price you see in the table is exactly what we charge for our e-filing service. Government tax liabilities are separate and paid to the IRS."
        },
        {
            question: "Do you charge for VIN corrections?",
            answer: "No. VIN corrections for Form 2290 are 100% FREE on our platform. We believe in supporting our truckers when mistakes happen."
        },
        {
            question: "What is included in the 'Concierge Service'?",
            answer: "Our $34.99 concierge service is a 'Done-For-You' experience. We don't just provide a form; we manage the secure transmission to the IRS, provide instant SMS status alerts, offer 5-year secure record storage (Audit Protection), and provide expert US-based support."
        },
        {
            question: "Do you offer fleet discounts?",
            answer: "Yes! Our tiered pricing automatically applies discounts as the number of vehicles in your filing increases. For fleets over 500 trucks, we offer fixed enterprise rates."
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
                        "@type": "AggregateOffer",
                        lowPrice: Math.min(...PRICING_CONFIG.form2290.tiers.map(t => t.price)).toString(),
                        highPrice: Math.max(...PRICING_CONFIG.form2290.tiers.map(t => t.price)).toString(),
                        priceCurrency: "USD"
                    }
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-32 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 rounded-full text-blue-300 text-sm font-bold mb-6">
                        <Zap className="w-4 h-4 fill-current" />
                        Most Competitive Pricing in the Industry
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Transparent Pricing. No Surprises.</h1>
                    <p className="text-xl text-blue-100/80 leading-relaxed max-w-2xl mx-auto">
                        Simple, tiered pricing designed for owner-operators and fleet managers alike.
                        Pay only for what you file.
                    </p>
                </div>
            </div>

            {/* Main Pricing Table */}
            <div className="max-w-6xl mx-auto px-6 -mt-20 space-y-12 pb-24">

                {/* 2290 Table */}
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
                    <div className="bg-slate-50 border-b border-slate-100 p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-[var(--color-navy)] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10">
                                <Truck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-[var(--color-navy)] leading-none">{PRICING_CONFIG.form2290.title}</h2>
                                <p className="text-slate-500 font-medium text-sm mt-1">{PRICING_CONFIG.form2290.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-emerald-700 font-bold text-sm tracking-tight uppercase">Instant Schedule 1</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/30">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Vehicle Range</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Service Fee</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {PRICING_CONFIG.form2290.tiers.map((tier, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-slate-900 text-lg group-hover:text-[var(--color-navy)] transition-colors">{tier.label}</div>
                                            <div className="text-xs text-slate-500 font-medium">Full Service E-filing Package</div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black uppercase tracking-wider italic">
                                                {tier.count}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="text-2xl font-black text-[var(--color-navy)] tracking-tight">
                                                ${tier.price.toFixed(2)}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">per filing</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-8 border-t border-slate-100">
                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                            <Info className="w-4 h-4" /> Prices are flat-rate per submission. All fees include SMS alerts and secure storage.
                        </p>
                        <Link
                            href="/dashboard/new-filing"
                            className="bg-[var(--color-orange)] text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-[#ff7a2d] transition-all shadow-xl shadow-orange-900/20 active:scale-95 whitespace-nowrap"
                        >
                            Start My Filing Now
                        </Link>
                    </div>
                </div>

                {/* Amendments and Annual Grid */}
                <div className="grid md:grid-cols-2 gap-12">

                    {/* Amendments */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--color-navy)]">{PRICING_CONFIG.amendments.title}</h3>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 font-medium">
                            {PRICING_CONFIG.amendments.items.map((item, idx) => (
                                <div key={idx} className="p-6 flex justify-between items-center group hover:bg-slate-50 transition-colors">
                                    <div>
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            {item.label}
                                            {item.badge && (
                                                <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">{item.badge}</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500">{item.description}</div>
                                    </div>
                                    <div className="text-xl font-black text-[var(--color-navy)] group-hover:scale-110 transition-transform">
                                        ${item.price.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Annual Plans */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--color-navy)]">{PRICING_CONFIG.annual.title}</h3>
                        </div>
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100">
                            {PRICING_CONFIG.annual.items.map((item, idx) => (
                                <div key={idx} className="p-6 flex justify-between items-center group hover:bg-slate-50 transition-colors">
                                    <div className="max-w-[70%]">
                                        <div className="font-bold text-slate-900 text-lg">{item.label}</div>
                                        <div className="text-xs text-slate-500 leading-snug">{item.description}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-[var(--color-navy)] whitespace-nowrap group-hover:scale-105 transition-transform">
                                            ${item.price.toFixed(2)}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">per season</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Additional Trust Section */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center shadow-xl">
                    <h2 className="text-3xl font-black text-[var(--color-navy)] mb-4">Everything You Need is Included</h2>
                    <p className="text-slate-500 mb-12 max-w-2xl mx-auto">
                        No matter which tier you choose, you get full access to our premium features
                        designed to make 2290 filing stress-free.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h4 className="font-bold text-[var(--color-navy)] mb-1 italic uppercase tracking-wider text-xs">Audit Protection</h4>
                            <p className="text-slate-500 text-xs">5-Year Secure Storage</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-blue-500">
                                <Zap className="w-6 h-6 fill-current" />
                            </div>
                            <h4 className="font-bold text-[var(--color-navy)] mb-1 italic uppercase tracking-wider text-xs">SMS Mastery</h4>
                            <p className="text-slate-500 text-xs">Instant Status Updates</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                <HelpCircle className="w-6 h-6 text-[#ff8b3d]" />
                            </div>
                            <h4 className="font-bold text-[var(--color-navy)] mb-1 italic uppercase tracking-wider text-xs">Human Support</h4>
                            <p className="text-slate-500 text-xs">US-Based Expert Help</p>
                        </div>
                    </div>
                </div>

                {/* FAQ Sidebar style */}
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-black text-[var(--color-navy)] mb-8">Pricing FAQ</h2>
                    <div className="space-y-4 text-left font-medium">
                        {faqData.map((faq, i) => (
                            <details key={i} className="bg-white border border-slate-200 rounded-2xl p-6 group cursor-pointer transition-all hover:border-[var(--color-orange)]">
                                <summary className="flex justify-between items-center list-none">
                                    <span className="font-bold text-[var(--color-navy)] text-lg">{faq.question}</span>
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform font-bold">+</span>
                                </summary>
                                <p className="mt-4 text-slate-600 leading-relaxed text-sm">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>

            </div>

            {/* Final CTA Strip */}
            <div className="bg-[var(--color-navy)] py-12 px-6 text-center text-white border-t border-white/5">
                <p className="text-blue-100 mb-6 font-bold uppercase tracking-[0.2em] text-xs italic">Trusted by owner-operators nationwide</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <span className="text-2xl font-light italic">Join 10,000+ truckers filing today</span>
                    <Link
                        href="/login"
                        className="bg-[var(--color-orange)] text-white px-10 py-4 rounded-xl font-black text-xl hover:bg-[#ff7a2d] transition-all shadow-xl shadow-black/20 active:scale-95"
                    >
                        Get Started Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
