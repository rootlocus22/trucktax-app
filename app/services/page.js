
import Link from 'next/link';
import { ArrowRight, Truck, FileText, BadgeCheck, DollarSign, Map, Calculator, Tractor } from 'lucide-react';

export const metadata = {
    title: 'Trucking Services | QuickTruckTax',
    description: 'Comprehensive trucking compliance services including Form 2290, MCS-150 updates, UCR registration, and IFTA filing.',
    keywords: 'trucking services, form 2290 filing, mcs-150 update, ucr registration, ifta filing, trucking compliance',
    alternates: {
        canonical: 'https://www.quicktrucktax.com/services',
    },
};

export default function ServicesPage() {
    const services = [
        {
            title: "Form 2290 Filing",
            description: "File your Heavy Vehicle Use Tax (HVUT) quickly and securely. Get your stamped Schedule 1 in minutes.",
            status: "Launching Jan 2026",
            icon: <Truck className="w-8 h-8 text-orange-500" />,
            link: "/services/form-2290-filing",
            color: "orange"
        },
        {
            title: "MCS-150 Biennial Update",
            description: "Keep your USDOT number active. Mandatory every two years to avoid penalties and deactivation.",
            status: "Launching Jan 2026",
            icon: <BadgeCheck className="w-8 h-8 text-teal-500" />,
            link: "/services/mcs-150-update",
            color: "teal"
        },
        {
            title: "Agricultural & Logging",
            description: "Specialized rules for farmers (7,500 mile limit) and reduced tax rates for logging vehicles.",
            status: "Live",
            icon: <Tractor className="w-8 h-8 text-green-600" />,
            link: "/services/agricultural-logging",
            color: "green"
        },
        {
            title: "UCR Registration",
            description: "Unified Carrier Registration for interstate carriers. Instant proof of payment and compliance.",
            status: "Launching Jan 2026",
            icon: <FileText className="w-8 h-8 text-indigo-500" />,
            link: "/services/ucr-registration",
            color: "indigo"
        },
        {
            title: "Form 8849 Refund",
            description: "Claim a refund for sold, stolen, or destroyed vehicles. Don't leave money on the table.",
            status: "Launching Jan 2026",
            icon: <DollarSign className="w-8 h-8 text-green-500" />,
            link: "/services/form-8849-refund",
            color: "green"
        },
        {
            title: "IFTA Filing",
            description: "International Fuel Tax Agreement quarterly filings. Calculate your fuel tax accurately.",
            status: "Guides Available",
            icon: <Map className="w-8 h-8 text-purple-500" />,
            link: "/services/ifta-irp",
            color: "purple"
        },
        {
            title: "Suspended Vehicle Filing",
            description: "Low mileage exemption (Category W). Pay $0 tax if you drive under 5,000 miles/year.",
            status: "Live",
            icon: <Truck className="w-8 h-8 text-blue-500" />,
            link: "/services/suspended-vehicle",
            color: "blue"
        },
        {
            title: "VIN Correction",
            description: "Fix a typo on your Schedule 1 instantly. Free for existing customers.",
            status: "Live",
            icon: <FileText className="w-8 h-8 text-red-500" />,
            link: "/services/vin-correction",
            color: "red"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-[var(--color-navy)] text-white py-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Trucking Compliance Services</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Everything you need to keep your fleet legal and on the road. Fast, secure expert concierge solutions.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl transition-all duration-300 group">
                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-${service.color}-50 group-hover:bg-${service.color}-100 transition`}>
                                    {service.icon}
                                </div>

                                <div className="mb-4">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-${service.color}-100 text-${service.color}-700 border border-${service.color}-200 mb-3`}>
                                        {service.status}
                                    </span>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{service.title}</h3>
                                    <p className="text-slate-600 mb-6">{service.description}</p>
                                </div>

                                <div className="flex items-center justify-end pt-6 border-t border-slate-100 mt-auto">
                                    <Link
                                        href={service.link}
                                        className={`text-${service.color}-600 font-bold flex items-center gap-1 hover:gap-2 transition-all`}
                                    >
                                        Learn more <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom CTA */}
            <div className="py-20 px-6 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-[var(--color-navy)] mb-6">Guides &amp; tools for trucking compliance</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                        Free checklists, due-date guides, and calculators to help you stay compliant.
                    </p>
                    <Link
                        href="/resources"
                        className="inline-flex bg-[var(--color-orange)] text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg shadow-orange-900/20 items-center gap-2"
                    >
                        Explore Resources <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
