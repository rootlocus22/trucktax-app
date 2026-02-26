import Link from 'next/link';
import { HelpCircle, Truck, DollarSign, Calendar, FileText, Shield } from 'lucide-react';

export const metadata = {
    title: 'Form 2290 FAQ - Complete Guide for Truckers | QuickTruckTax',
    description: 'Comprehensive FAQ about Form 2290 Heavy Vehicle Use Tax. Get answers from our expert concierge team.',
    keywords: ['form 2290 faq', 'hvut questions', 'truck tax help', 'schedule 1 questions'],
};

export default function FAQPage() {
    const faqs = [
        {
            category: 'Filing Basics',
            icon: FileText,
            questions: [
                {
                    q: 'What is Form 2290?',
                    a: 'Form 2290 is the Heavy Vehicle Use Tax (HVUT) form required by the IRS for trucks over 55,000 lbs gross weight. It is an annual tax due in August for the tax year (July 1 - June 30).'
                },
                {
                    q: 'When is Form 2290 due?',
                    a: 'For the annual tax period (July 1 - June 30), Form 2290 is due by August 31. For newly purchased vehicles, it is due by the end of the month following the month of first use.'
                },
                {
                    q: 'Can I file Form 2290 online?',
                    a: 'Yes! QuickTruckTax is an expert concierge service. You provide your info, we handle the filing and you get your stamped Schedule 1 quickly—often within 24 hours.'
                },
                {
                    q: 'What is Schedule 1 and why do I need it?',
                    a: 'Schedule 1 is the IRS proof of payment for Form 2290. You need it to register your vehicle with the DMV or renew your IRP plates.'
                },
                {
                    q: 'Do I need to file if my truck is suspended?',
                    a: 'Yes, even suspended vehicles (under 5,000 miles or 7,500 for agricultural) must file Form 2290. However, you pay $0 tax.'
                },
            ]
        },
        {
            category: 'Pricing & Costs',
            icon: DollarSign,
            questions: [
                {
                    q: 'How much does it cost to file Form 2290?',
                    a: 'QuickTruckTax charges a flat $34.99 for our concierge filing service, with fleet discounts available. The IRS tax itself ranges from $100-$550 depending on your vehicle weight.'
                },
                {
                    q: 'What are the HVUT tax rates for 2025-2026?',
                    a: '55,000 lbs: $100 | 60,000 lbs: $210 | 70,000 lbs: $430 | 75,000 lbs: $550 (maximum). Logging vehicles qualify for reduced rates.'
                },
                {
                    q: 'Are there additional fees?',
                    a: 'No hidden fees. Our price includes expert filing, Schedule 1 delivery, and free VIN corrections if needed.'
                },
                {
                    q: 'Do you offer fleet discounts?',
                    a: 'Yes! We offer fleet pricing for multiple vehicles. Contact us or check the pricing page for current rates.'
                },
            ]
        },
        {
            category: 'Deadlines & Penalties',
            icon: Calendar,
            questions: [
                {
                    q: 'What happens if I file late?',
                    a: 'Late filing results in IRS penalties ranging from $50 to $535 per vehicle, plus potential interest charges. File on time to avoid penalties.'
                },
                {
                    q: 'Can I file Form 2290 for previous years?',
                    a: 'Yes, you can file late returns for previous tax years. However, penalties will apply. Contact QuickTruckTax support for assistance with late filings.'
                },
                {
                    q: 'When does the tax year start?',
                    a: 'The Form 2290 tax year runs from July 1 to June 30, not the calendar year. The 2025-2026 tax year runs July 1, 2025 - June 30, 2026.'
                },
            ]
        },
        {
            category: 'Vehicle & VIN Issues',
            icon: Truck,
            questions: [
                {
                    q: 'I got IRS rejection code R0000-058. What does this mean?',
                    a: 'This is a VIN error. Use our free manufacturer-specific VIN decoder (Freightliner, Peterbilt, etc.) to verify your VIN format.'
                },
                {
                    q: 'Where do I find my VIN?',
                    a: 'Check three locations: 1) Driver-side door jamb sticker, 2) Dashboard (visible through windshield), 3) Vehicle registration. All should match.'
                },
                {
                    q: 'Can I correct my VIN after filing?',
                    a: 'Yes, QuickTruckTax offers free VIN corrections. Submit an amendment within 30 days of the original filing.'
                },
                {
                    q: 'What if my truck weight increased during the year?',
                    a: 'You must file an amended return if your gross weight increases. We handle weight increase amendments for $9.99.'
                },
            ]
        },
        {
            category: 'Security & Support',
            icon: Shield,
            questions: [
                {
                    q: 'Is online filing safe?',
                    a: 'Yes, QuickTruckTax uses bank-level encryption and secure channels. Your data is secure and never sold or shared with third parties for marketing.'
                },
                {
                    q: 'How do I pay the IRS tax?',
                    a: 'You can pay via credit card, debit card, bank withdrawal (EFTPS), or check. We guide you through the payment process during filing.'
                },
                {
                    q: 'What customer support do you offer?',
                    a: 'We offer live chat support, email at support@quicktrucktax.com, and US phone support at +1 (347) 801-8631 during extended hours, especially during peak season (July-September).'
                },
                {
                    q: 'Can I file in Spanish?',
                    a: 'Yes, QuickTruckTax offers bilingual support in English and Spanish for both the filing process and customer service.'
                },
            ]
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <div className="bg-[#173b63] text-white py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <HelpCircle className="w-16 h-16 mx-auto mb-6 text-blue-200" />
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        Form 2290 Frequently Asked Questions
                    </h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Get expert answers to all your Heavy Vehicle Use Tax questions from our concierge team
                    </p>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="max-w-5xl mx-auto px-6 py-16">
                {faqs.map((category, idx) => {
                    const IconComponent = category.icon;
                    return (
                        <section key={idx} className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <IconComponent className="w-6 h-6 text-[#173b63]" />
                                </div>
                                <h2 className="text-3xl font-bold text-[#0f172a]">{category.category}</h2>
                            </div>

                            <div className="space-y-4">
                                {category.questions.map((faq, i) => (
                                    <details key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <summary className="flex justify-between items-center cursor-pointer p-6 font-bold text-slate-900 hover:bg-slate-50 transition">
                                            <span className="text-lg">{faq.q}</span>
                                            <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                        </summary>
                                        <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                                            {faq.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>
                    );
                })}

                {/* CTA Section */}
                <div className="mt-16 bg-gradient-to-br from-[#173b63] to-[#0f172a] rounded-3xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to File UCR?</h2>
                    <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                        We file UCR—$0 upfront, pay when your certificate is ready. For Form 2290, see our guide or use an IRS-approved provider.
                    </p>
                    <Link
                        href="/ucr/file"
                        className="inline-block bg-[#f97316] hover:bg-[#ea580c] text-white font-bold py-4 px-8 rounded-full transition-all hover:scale-105 shadow-lg"
                    >
                        Start UCR Filing →
                    </Link>
                    <Link href="/services/form-2290-filing" className="inline-block ml-4 text-blue-200 hover:text-white font-semibold">Form 2290 guide</Link>
                </div>

                {/* Additional Resources */}
                <div className="mt-16 grid md:grid-cols-3 gap-6">
                    <Link href="/resources/2290-tax-directory" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition group">
                        <h3 className="font-bold text-[#173b63] mb-2 group-hover:text-[#f97316]">Tax Guide Directory →</h3>
                        <p className="text-sm text-slate-600">Browse 2,300+ state and vehicle-specific guides</p>
                    </Link>
                    <Link href="/filing-2290-august-2026" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition group">
                        <h3 className="font-bold text-[#173b63] mb-2 group-hover:text-[#f97316]">August Deadline Guide →</h3>
                        <p className="text-sm text-slate-600">Everything you need for peak filing season</p>
                    </Link>
                    <Link href="/comparisons" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition group">
                        <h3 className="font-bold text-[#173b63] mb-2 group-hover:text-[#f97316]">Compare Providers →</h3>
                        <p className="text-sm text-slate-600">See why QuickTruckTax is the best choice</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
