import Link from 'next/link';
import { RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, ArrowRight, FileText, Info } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'MCS-150 Biennial Update Service | FMCSA Compliance',
    description: 'Update your USDOT number (MCS-150) quickly and correctly. Stay compliant with FMCSA biennial update requirements. Avoid fines and deactivation.',
    keywords: 'mcs 150 update, usdot update, biennial update fmcsa, mcs-150 filing, dot number update',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/mcs-150-update',
    },
};

export default function MCS150ServicePage() {
    const faqData = [
        {
            question: "When do I need to file an MCS-150 update?",
            answer: "You must file an MCS-150 update every two years (biennial update) based on the last two digits of your USDOT number. You also need to file an update whenever your company details (address, email, fleet size, etc.) change, or when you are reactivating a USDOT number."
        },
        {
            question: "What happens if I don't update my MCS-150?",
            answer: "Failure to update your MCS-150 can lead to the deactivation of your USDOT number and potential fines of up to $1,000 per day (capped at $10,000)."
        },
        {
            question: "How do I know when my biennial update is due?",
            answer: "The second-to-last digit of your USDOT number determines the year (odd/even), and the last digit determines the month. For example, if your USDOT ends in 12, you file in February of even-numbered years."
        },
        {
            question: "Can I update my MCS-150 here?",
            answer: "Yes! QuickTruckTax provides a simplified, guided workflow to update your MCS-150 data correctly and submit it directly to the FMCSA."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup
                type="Service"
                data={{
                    name: "MCS-150 Biennial Update",
                    description: "FMCSA compliance service for updating USDOT carrier information.",
                    catalogName: "Trucking Compliance Services",
                    offers: [
                        { name: "MCS-150 Update", price: "99.00" },
                        { name: "PIN Retrieval Service", price: "20.00" }
                    ]
                }}
            />
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Hero Section */}
            <div className="bg-[var(--color-navy)] text-white pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-teal-400/30">
                            <ShieldCheck className="w-4 h-4" /> FMCSA Compliance Made Simple
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Update Your MCS-150 <span className="text-teal-400">& Stay Compliant</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            Required every two years or when your details change. Keep your USDOT number active and avoid penalties.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/resources"
                                className="bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-600 transition shadow-lg shadow-teal-900/20 flex items-center justify-center gap-2"
                            >
                                Explore Resources <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Instant Submission
                            </div>
                            <div className="flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Biennial Updates
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-3xl"></div>
                        {/* Visual representation of MCS-150 Update Status */}
                        <div className="relative bg-white text-slate-900 p-8 rounded-2xl shadow-2xl border-t-4 border-teal-500">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 font-bold text-xl">
                                        DOT
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">USDOT Status</div>
                                        <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                                            <CheckCircle className="w-3 h-3" /> Active
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-slate-500">Last Updated</span>
                                    <span className="text-sm font-semibold text-red-500">22 Months Ago</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div className="bg-orange-400 h-2 rounded-full w-[90%]"></div>
                                </div>
                                <div className="mt-2 text-xs text-orange-600 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Update Due Soon
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                                <div className="text-sm font-medium text-slate-500">Action Required:</div>
                                <div className="text-base font-bold text-teal-600">Biennial Update</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guide Grid */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-4">Steps to Compliance</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Updating your MCS-150 form doesn't have to be a headache.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Enter USDOT Number",
                                desc: "We'll pull your current FMCSA data automatically so you don't have to re-type everything."
                            },
                            {
                                step: "02",
                                title: "Review Details",
                                desc: "Confirm your mileage, fleet size, and contact info. Update any changes effortlessly."
                            },
                            {
                                step: "03",
                                title: "Sign & Submit",
                                desc: "E-sign securely. We transmit your update directly to the FMCSA system instantly."
                            }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-teal-200 transition relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 text-6xl font-bold text-slate-100 -z-10 select-none">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold text-[var(--color-navy)] mb-3 pt-4">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white py-20 px-6 border-y border-slate-200">
                <div className="max-w-4xl mx-auto">
                    <div className="flex gap-6 items-start">
                        <div className="shrink-0 p-3 bg-blue-50 rounded-lg">
                            <Info className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-4">Why is this update required?</h2>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                The Federal Motor Carrier Safety Administration (FMCSA) requires all entities with a USDOT number to update their registration information every two years. This ensures that the safety data associated with your DOT number (like fleet size and mileage) is accurate.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Accurate data helps the FMCSA calculate safety scores (CSA scores). If your data is outdated, your safety metrics might be skewed, potentially leading to audits or higher insurance premiums.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-12 text-center">Common Questions</h2>
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

            {/* CTA */}
            <div className="py-16 px-6 bg-[var(--color-navy)] text-center text-white">
                <h2 className="text-2xl font-bold mb-6">Need to update your USDOT number?</h2>
                <div className="inline-block bg-teal-800/50 rounded-xl p-6 backdrop-blur-sm border border-teal-500/30">
                    <p className="text-xl mb-4 text-teal-200">Services launching January 2026</p>
                    <Link
                        href="/resources"
                        className="inline-flex bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-600 transition shadow-lg shadow-teal-900/20 items-center gap-2"
                    >
                        Join Waitlist <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

        </div>
    );
}
