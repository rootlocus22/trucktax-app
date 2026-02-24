import Link from 'next/link';
import { Truck, CheckCircle, FileText, ArrowRight, Info } from 'lucide-react';
import SchemaMarkup from '@/components/seo/SchemaMarkup';

export const metadata = {
    title: 'Form 2290 Guide – What It Is, Deadlines, How to E-File | QuickTruckTax',
    description: 'Learn about IRS Form 2290 (HVUT): who must file, due dates, tax rates, and how to e-file. QuickTruckTax is a UCR filing service; we do not file Form 2290.',
    keywords: 'form 2290, hvut, heavy vehicle use tax, 2290 due date, schedule 1, 2290 e-file, trucking tax',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services/form-2290-filing',
    },
};

export default function Form2290GuidePage() {
    const faqData = [
        {
            question: "When is the Form 2290 due date?",
            answer: "The annual tax period runs from July 1 to June 30. Form 2290 must be filed by August 31st for vehicles used in July. For vehicles first used in any other month, file by the last day of the month following the month of first use."
        },
        {
            question: "How much does Form 2290 tax cost?",
            answer: "The tax for vehicles with a taxable gross weight of 55,000 lbs is $100, plus $22 for each additional 1,000 lbs, up to a maximum of $550 for 75,000 lbs and over. Suspended vehicles (under 5,000 miles, or 7,500 for agriculture) are exempt from tax but generally still need to file."
        },
        {
            question: "How do I e-file Form 2290?",
            answer: "The IRS requires e-filing for most filers. You can use IRS-approved software or authorized e-file providers. Visit IRS.gov Form 2290 for the official list and instructions. QuickTruckTax does not file Form 2290; we focus on UCR registration."
        },
        {
            question: "Can I file for a suspended vehicle?",
            answer: "Yes. You can file Form 2290 for a suspended vehicle (Category W) if you expect to drive fewer than 5,000 miles (or 7,500 miles for agricultural vehicles) in the tax year. No tax is due, but you must still file."
        }
    ];

    return (
        <div className="bg-slate-50 min-h-screen">
            <SchemaMarkup type="FAQPage" data={faqData} />

            {/* Disclaimer banner */}
            <div className="bg-amber-500 text-[var(--color-navy)] py-3 px-4 text-center text-sm font-semibold border-b border-amber-600">
                QuickTruckTax does not file Form 2290. We are a <strong>UCR filing service</strong>. This page is for learning only. For 2290 e-filing, use the IRS or an IRS-approved provider.
            </div>

            {/* Hero */}
            <div className="bg-[var(--color-navy)] text-white pt-20 pb-14 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-semibold mb-6 border border-blue-400/30">
                        <Info className="w-4 h-4" /> Learning Guide
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                        Understanding Form 2290 (HVUT)
                    </h1>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                        What it is, who must file, deadlines, tax rates, and how to e-file. Use this guide to stay compliant—then file your <strong>UCR</strong> with us.
                    </p>
                </div>
            </div>

            {/* What is 2290 */}
            <div className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-4">What is Form 2290?</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        Form 2290 is the Heavy Vehicle Use Tax (HVUT) return required by the IRS for trucks with a taxable gross weight of 55,000 pounds or more that operate on public highways. The tax year runs July 1–June 30. Most filers must e-file; the IRS provides a list of approved providers on IRS.gov.
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                        <strong>We do not file Form 2290.</strong> QuickTruckTax focuses on <strong>UCR (Unified Carrier Registration)</strong> filing. If you need to file both, use the IRS or an authorized 2290 e-file service for HVUT, and us for UCR.
                    </p>
                </div>
            </div>

            {/* Key facts */}
            <div className="py-12 px-6 bg-white border-y border-slate-200">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">Key facts</h2>
                    <ul className="space-y-3 text-slate-600">
                        <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> Due date: August 31 for vehicles used in July; other deadlines apply for first-use vehicles.</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> Tax: $100 base plus $22 per 1,000 lbs over 55,000, max $550 (75,000+ lbs).</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> E-filing: Required for most; use IRS.gov or an IRS-approved e-file provider.</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" /> Schedule 1: Proof of payment; you get it after the IRS accepts your return.</li>
                    </ul>
                </div>
            </div>

            {/* Primary CTA: UCR */}
            <div className="py-14 px-6 bg-[var(--color-navy)] text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">We file UCR — not Form 2290</h2>
                    <p className="text-blue-100 mb-8">
                        File your Unified Carrier Registration with us. $0 upfront; pay when your certificate is ready.
                    </p>
                    <Link
                        href="/ucr/file"
                        className="inline-flex items-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#e66a15] transition shadow-lg"
                    >
                        Start UCR Filing <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Resources */}
            <div className="py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-6">Form 2290 resources</h2>
                    <p className="text-slate-600 mb-6">Free guides and tools to understand deadlines and compliance. For actual 2290 e-filing, use the IRS or an IRS-approved provider.</p>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/resources/2290-due-date" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-xl font-semibold text-[var(--color-navy)] hover:bg-slate-50 transition">
                            <FileText className="w-4 h-4" /> 2290 Due Date
                        </Link>
                        <Link href="/resources" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-xl font-semibold text-[var(--color-navy)] hover:bg-slate-50 transition">
                            All Resources <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a href="https://www.irs.gov/forms-pubs/about-form-2290" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 px-5 py-3 rounded-xl font-semibold text-slate-700 hover:bg-slate-200 transition">
                            IRS Form 2290 (official)
                        </a>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="py-12 px-6 bg-white border-t border-slate-200">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-[var(--color-navy)] mb-8">Frequently asked questions</h2>
                    <div className="space-y-6">
                        {faqData.map((faq, i) => (
                            <div key={i} className="border-b border-slate-100 pb-6">
                                <h3 className="text-lg font-bold text-[var(--color-navy)] mb-2">{faq.question}</h3>
                                <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="py-12 px-6 bg-slate-50 text-center">
                <p className="text-slate-600 mb-4">Need to file UCR? We’ve got you.</p>
                <Link href="/ucr/file" className="inline-flex items-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition">
                    Start UCR Filing <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
}
