import Link from "next/link";
import Image from "next/image";
import { FileText, Calendar, Clock, BookOpen, AlertCircle, CheckSquare } from "lucide-react";

export const metadata = {
    title: "Trucking Compliance Resources & Guides | QuickTruckTax",
    description:
        "Free resources for truckers: 2026 tax deadlines, Form 2290 checklists, HVUT penalty calculators, and compliance guides.",
    alternates: {
        canonical: "https://www.quicktrucktax.com/resources",
    },
    openGraph: {
        title: "Trucking Compliance Resources | QuickTruckTax",
        description:
            "Essential free tools and guides for Form 2290 HVUT, IFTA, and FMCSA compliance.",
        url: "https://www.quicktrucktax.com/resources",
        siteName: "QuickTruckTax",
        type: "website",
        images: [
            {
                url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
                width: 1280,
                height: 720,
                alt: "QuickTruckTax Resources",
            },
        ],
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trucking Compliance Resources",
    description:
        "Collection of guides, deadlines, and tools for trucking tax compliance.",
    url: "https://www.quicktrucktax.com/resources",
    publisher: {
        "@type": "Organization",
        name: "QuickTruckTax",
        logo: {
            "@type": "ImageObject",
            url: "https://www.quicktrucktax.com/quicktrucktax-logo-new.png",
        },
    },
};

const resources = [
    {
        name: "2290 Due Dates & Deadlines",
        description:
            "Official IRS Form 2290 filing deadlines for the 2025-2026 and 2026-2027 tax years. Avoid penalties by knowing exactly when to file.",
        href: "/resources/2290-due-date",
        icon: Clock,
        badge: "Essential",
    },
    {
        name: "Complete Form 2290 Filing Checklist",
        description:
            "A printable checklist of everything you need—EIN, VINs, Gross Weights—before you start your tax return.",
        href: "/insights/form-2290-checklist-download",
        icon: CheckSquare,
    },
    {
        name: "2026 Trucking Compliance Calendar",
        description:
            "Never miss a date. A full year view of HVUT, IFTA, UCR, and IRP deadlines for owner-operators.",
        href: "/insights/trucking-compliance-calendar",
        icon: Calendar,
    },
    {
        name: "HVUT Tax & Penalty Rates",
        description:
            "Current tax tables for vehicles over 55,000 lbs and penalty calculations for late filing.",
        href: "/resources/2290-due-date", // Linking to due date page which covers penalties for now
        icon: AlertCircle,
    },
    {
        name: "UCR Registration Guide",
        description:
            "Everything you need to know about the Unified Carrier Registration, fees by fleet size, and renewal periods.",
        href: "/insights/ucr-renewal-guide",
        icon: FileText,
    },
    {
        name: "Ultimate Guide to Form 2290",
        description:
            "The comprehensive handbook on Heavy Vehicle Use Tax. Who files, when to file, and how to file correctly.",
        href: "/insights/form-2290-ultimate-guide",
        icon: BookOpen,
    },
];

export default function ResourcesIndex() {
    return (
        <div className="flex flex-col gap-12 sm:gap-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header Section */}
            <header className="relative overflow-hidden rounded-3xl px-4 py-14 text-white shadow-xl shadow-[rgba(10,23,43,0.2)] sm:px-6 lg:px-8 min-h-[220px]">
                <div className="absolute inset-0">
                    <Image src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=75" alt="" fill className="object-cover opacity-40" sizes="(max-width: 1200px) 100vw, 1200px" />
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)]" />
                </div>
                <div className="absolute right-0 top-0 h-56 w-56 translate-x-1/3 -translate-y-1/3 rounded-full bg-[var(--color-orange)]/20 blur-3xl" />
                <div className="relative z-10 space-y-5">
                    <span className="inline-flex rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-sand)]">
                        Resource Library
                    </span>
                    <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                        Guides, Deadlines, & Tax Help
                    </h1>
                    <p className="text-base leading-7 text-white/80 sm:text-lg max-w-2xl">
                        Navigating trucking taxes shouldn't be a mystery. Access our library of free guides, official deadlines, and downloadable checklists to keep your fleet compliant.
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <section className="space-y-12">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {resources.map((resource) => (
                        <Link
                            key={resource.name}
                            href={resource.href}
                            className="group flex flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--color-orange)]/50 hover:shadow-md"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-[var(--color-navy)] group-hover:bg-[var(--color-orange)] group-hover:text-white transition-colors duration-300">
                                        <resource.icon className="h-5 w-5" />
                                    </div>
                                    {resource.badge && (
                                        <span className="rounded-full bg-[var(--color-sand)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-orange)]">
                                            {resource.badge}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-orange)] transition-colors">
                                        {resource.name}
                                    </h3>
                                    <p className="text-sm leading-6 text-[var(--color-muted)]">
                                        {resource.description}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex items-center text-sm font-semibold text-[var(--color-navy)] group-hover:text-[var(--color-orange)] transition-colors">
                                View Resource <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="rounded-3xl bg-slate-50 border border-slate-100 p-8 sm:p-12 text-center">
                    <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">
                        Looking for Interactive Tools?
                    </h2>
                    <p className="text-lg text-[var(--color-muted)] mb-8 max-w-2xl mx-auto">
                        Need to calculate your specific tax amount or check your filing status? Visit our Tools section for improved calculators and checkers.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href="/tools"
                            className="inline-flex items-center justify-center rounded-full bg-[var(--color-navy)] px-6 py-3 text-sm font-bold !text-white shadow-lg transition hover:bg-[var(--color-midnight)] hover:scale-105"
                        >
                            Go to Tools
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
