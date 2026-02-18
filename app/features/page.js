'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
    FileText,
    AlertTriangle,
    RefreshCw,
    Upload,
    CheckCircle,
    ShieldCheck,
    Smartphone,
    Zap
} from 'lucide-react';

export default function FeaturesPage() {
    const features = [
        {
            title: "Standard 2290 Filing",
            description: "File your Form 2290 for vehicles 55,000 lbs or more. Get your stamped Schedule 1 in minutes.",
            icon: <FileText className="w-8 h-8 text-blue-600" />,
            color: "bg-blue-100"
        },
        {
            title: "VIN Corrections (Amendments)",
            description: "Made a mistake? Easily file an amendment to correct VINs or report weight increases.",
            icon: <AlertTriangle className="w-8 h-8 text-amber-600" />,
            color: "bg-amber-100"
        },
        {
            title: "Refund Claims (Form 8849)",
            description: "Sold a vehicle or drove less than 5,000 miles? Claim your credit or refund directly through the app.",
            icon: <RefreshCw className="w-8 h-8 text-green-600" />,
            color: "bg-green-100"
        },
        {
            title: "Bulk Vehicle Upload",
            description: "Managing a large fleet? Upload your entire vehicle list via CSV to save hours of data entry.",
            icon: <Upload className="w-8 h-8 text-purple-600" />,
            color: "bg-purple-100"
        },
        {
            title: "Instant Schedule 1",
            description: "Download your IRS-stamped Schedule 1 proof of payment immediately after acceptance.",
            icon: <Zap className="w-8 h-8 text-yellow-600" />,
            color: "bg-yellow-100"
        },
        {
            title: "Bank-Level Security",
            description: "Your data is protected with 256-bit SSL encryption and secure cloud storage.",
            icon: <ShieldCheck className="w-8 h-8 text-indigo-600" />,
            color: "bg-indigo-100"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[var(--color-page)]">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="absolute inset-0 z-0 opacity-20">
                    <Image
                        src="/hero-truck-sunset.png"
                        alt="Background"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold mb-6 drop-shadow-lg tracking-tight leading-[1.1]">
                        Everything You Need to Manage Fleet Taxes
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-[1.375rem] text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed">
                        From single owner-operators to large fleets, QuickTruckTax provides all the tools to stay compliant with the IRS and FMCSA.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/resources"
                            className="px-8 py-4 bg-[var(--color-orange)] text-white rounded-full font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
                        >
                            Explore Resources
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Features Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
                        Powerful Features for Modern Trucking
                    </h2>
                    <p className="text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
                        We've built a comprehensive platform to handle all your tax filing scenarios, so you can focus on the road.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-[var(--color-card)] rounded-2xl p-8 shadow-lg border border-[var(--color-border)] hover:shadow-xl transition hover:-translate-y-1"
                        >
                            <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-[var(--color-muted)] leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mobile App Section */}
            <section className="bg-[var(--color-card)] py-20 px-4 sm:px-6 lg:px-8 border-y border-[var(--color-border)]">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold uppercase tracking-wide mb-6">
                            <Smartphone className="w-4 h-4" />
                            Mobile First Design
                        </div>
                        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-6">
                            File from Anywhere, on Any Device
                        </h2>
                        <p className="text-lg text-[var(--color-muted)] mb-8 leading-relaxed">
                            You're not always at a desk, so your tax software shouldn't be either. QuickTruckTax is fully optimized for mobile phones and tablets.
                        </p>
                        <ul className="space-y-4 mb-10">
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span className="text-[var(--color-text)]">Responsive design works on all screen sizes</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span className="text-[var(--color-text)]">Upload documents directly from your camera</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <span className="text-[var(--color-text)]">Access your Schedule 1 PDFs on the go</span>
                            </li>
                        </ul>
                        <Link
                            href="/signup"
                            className="inline-flex items-center justify-center px-8 py-3 bg-[var(--color-orange)] text-white rounded-lg font-semibold hover:bg-[#ff7a20] transition shadow-md hover:shadow-lg"
                            style={{ color: '#ffffff' }}
                        >
                            Try It on Mobile
                        </Link>
                    </div>
                    <div className="order-1 lg:order-2 relative h-[500px] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
                        <Image
                            src="/mobile-filing-app.png"
                            alt="Mobile App Interface"
                            fill
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
                <div className="max-w-4xl mx-auto bg-[var(--color-navy)] rounded-3xl p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/hero-truck.svg')] opacity-10 bg-center bg-cover mix-blend-overlay"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
                        <p className="text-xl text-white/80 mb-10">
                            Join thousands of satisfied customers who have simplified their tax filing process.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-block px-10 py-4 bg-[var(--color-orange)] text-white rounded-full font-bold text-lg hover:bg-[#ff7a20] transition shadow-lg hover:shadow-xl hover:scale-105 transform duration-200"
                        >
                            Create Free Account
                        </Link>
                        <p className="mt-6 text-sm text-white/60">
                            No credit card required to sign up. Pay only when you file.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
