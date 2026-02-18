import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

export const metadata = {
    title: 'Resources & Guides | QuickTruckTax',
    description: 'QuickTruckTax is a content and resource site for Form 2290, HVUT, and trucking compliance. Guides, checklists, and tools.',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/pricing',
    },
};

export default function PricingPage() {
    return (
        <div className="bg-slate-50 min-h-screen py-20 px-6">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Guides &amp; Resources</h1>
                <p className="text-lg text-slate-600 mb-8">
                    QuickTruckTax is a content application. We provide free guides, checklists, and tools for Form 2290 and trucking compliance. Filing services and pricing will be available when we launch.
                </p>
                <Link
                    href="/resources"
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-navy)] text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                    <FileText className="w-5 h-5" />
                    Explore Resources
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
