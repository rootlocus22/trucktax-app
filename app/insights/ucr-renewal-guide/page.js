import Link from 'next/link';
import { ArrowLeft, CheckCircle, RefreshCcw, DollarSign, Clock, AlertTriangle, ChevronRight, Truck } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
    title: 'How to Renew Your UCR Registration for 2026 | QuickTruckTax',
    description: 'A complete step-by-step guide to UCR renewal, 2026 UCR fees, updating truck info, and avoiding roadside out-of-service penalties for missed deadlines.',
};

export default function UcrRenewalGuide() {
    return (
        <div className="bg-slate-50 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/insights"
                    className="inline-flex items-center text-sm font-medium text-[var(--color-navy)] hover:text-blue-700 transition mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Insights
                </Link>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* ENHANCED HERO BANNER */}
                    <div className="bg-gradient-to-br from-slate-900 to-[var(--color-navy)] relative overflow-hidden text-center text-white pb-16">
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
                        <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 flex flex-col items-center">
                            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm border border-white/30 text-blue-100">
                                Registration & Compliance
                            </span>
                            <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-400/30">
                                <RefreshCcw className="w-10 h-10 text-blue-300" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                                The Ultimate Guide to UCR Renewal (2026)
                            </h1>
                            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-4 font-medium">
                                Step-by-step instructions on how to renew your Unified Carrier Registration, update fleet info, and navigate the latest pricing brackets.
                            </p>
                            <p className="text-blue-200/90 text-sm mb-6">We&apos;re your UCR filing partner—file with $0 upfront, pay when your certificate is ready.</p>
                            <Link
                                href="/ucr/file"
                                className="inline-flex items-center gap-2 bg-[var(--color-orange)] text-white px-6 py-3.5 rounded-xl font-bold hover:opacity-95 transition shadow-lg"
                            >
                                Renew UCR Now – $0 Upfront <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                        {/* Wavy bottom edge */}
                        <div className="absolute bottom-0 w-full overflow-hidden leading-none rotate-180 transform">
                            <svg className="block w-full h-12" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
                            </svg>
                        </div>
                    </div>

                    <div className="px-6 sm:px-10 lg:px-12 pb-12 pt-4">
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-[var(--color-navy)] hover:prose-a:text-blue-700">

                            {/* Engaging Lead Paragraph */}
                            <p className="lead text-xl text-slate-700 mb-8 border-l-4 border-[var(--color-navy)] pl-5 py-2 bg-slate-50 italic">
                                "If you haul interstate, your UCR isn't a suggestion—it's the ticket to staying on the road. Miss the renewal deadline, and a simple roadside stop can turn into thousands in fines and a sidelined truck."
                            </p>

                            <p>
                                The Unified Carrier Registration (UCR) is an annual federal requirement for anyone operating commercial vehicles across state lines. Unlike Form 2290 which is due in the summer, the UCR renewal period opens in the fall for the <em>following</em> calendar year.
                            </p>

                            <h2>UCR Renewal Cost & Fee Brackets</h2>
                            <p>
                                A common question we receive is: <strong>"What is the UCR renewal cost?"</strong> The cost to renew your UCR is heavily dependent on the size of your fleet. The UCR board operates on a tiered bracket system.
                            </p>

                            {/* Visual Graphic Table */}
                            <div className="my-10 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                                    <h3 className="m-0 text-lg flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> 2026 UCR Fee Schedule</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left mb-0">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">Fleet Size (Vehicles)</th>
                                                <th scope="col" className="px-6 py-3">UCR Fee</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white border-b">
                                                <td className="px-6 py-4 font-semibold text-slate-900">Tier 1: 0 to 2</td>
                                                <td className="px-6 py-4">$46.00</td>
                                            </tr>
                                            <tr className="bg-slate-50 border-b">
                                                <td className="px-6 py-4 font-semibold text-slate-900">Tier 2: 3 to 5</td>
                                                <td className="px-6 py-4">$138.00</td>
                                            </tr>
                                            <tr className="bg-white border-b">
                                                <td className="px-6 py-4 font-semibold text-slate-900">Tier 3: 6 to 20</td>
                                                <td className="px-6 py-4">$276.00</td>
                                            </tr>
                                            <tr className="bg-slate-50 border-b">
                                                <td className="px-6 py-4 font-semibold text-slate-900">Tier 4: 21 to 100</td>
                                                <td className="px-6 py-4">$963.00</td>
                                            </tr>
                                            <tr className="bg-white border-b">
                                                <td className="px-6 py-4 font-semibold text-slate-900">Tier 5: 101 to 1,000</td>
                                                <td className="px-6 py-4">$4,592.00</td>
                                            </tr>
                                            <tr className="bg-slate-50">
                                                <td className="px-6 py-4 font-semibold text-slate-900">Tier 6: 1,001+</td>
                                                <td className="px-6 py-4">$44,836.00</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mt-2 mb-8">
                                * Note: Brokers and Leasing Companies who do not operate trucks are required to pay the Tier 1 fee ($46.00). QuickTruckTax charges a nominal processing fee to guarantee instant cross-referencing with federal databases.
                            </p>

                            <h2>How to Update UCR Truck Info During Renewal</h2>
                            <p>
                                One of the most critical steps during the <strong>UCR Registration Renewal</strong> is updating your vehicle count.
                            </p>
                            <p>
                                The number of vehicles you report on your UCR <strong>must match</strong> the number of Interstate vehicles reported on your most recent MCS-150 (Biennial Update). If you have added or removed trucks from your fleet since last year, you must update your UCR truck info during the renewal process to ensure you are placed in the correct fee bracket. Failing to synchronize your DOT number records with your UCR filing will trigger a compliance audit.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8">
                                <h3 className="text-blue-800 mt-0 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> Pro-Tip for Renewing
                                </h3>
                                <p className="text-blue-900 m-0">
                                    Always file your MCS-150 update <em>before</em> initiating your UCR renewal if your fleet size has changed. This ensures the federal databases match your declared numbers.
                                </p>
                            </div>

                            <h2>When is the UCR Renewal Deadline?</h2>
                            <p>
                                You must renew UCR registration by <strong>December 31st</strong> of the preceding year. For example, the 2026 UCR registration must be completed and paid for by December 31, 2025.
                            </p>
                            <p>
                                Enforcement strictly begins on January 1st.
                            </p>

                            {/* Alert Box for Penalties */}
                            <div className="bg-red-50 border-l-4 border-red-500 p-6 my-10 rounded-r-xl shadow-sm">
                                <h3 className="text-red-800 mt-0 flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6" /> What are the penalties for late renewal?
                                </h3>
                                <p className="text-red-900">
                                    If your truck is caught operating across state lines after Jan 1st without an updated UCR on file:
                                </p>
                                <ul className="text-red-900 mb-0">
                                    <li><strong>Fines:</strong> States can assess fines ranging from $100 up to $5,000 per violation depending on the state where you are stopped.</li>
                                    <li><strong>Out-of-Service Order:</strong> Your truck can be impounded and placed out-of-service immediately. You will not be allowed to move the truck until the UCR fee is paid and processed.</li>
                                    <li><strong>Delays:</strong> Paying roadside means waiting hours for the databases to sync before the officer releases your truck.</li>
                                </ul>
                            </div>

                            <h2>How to Renew UCR Online Instantly</h2>
                            <p>
                                The fastest and most secure way to process your <strong>unified carrier registration renewal</strong> is through an authorized third-party provider like QuickTruckTax.
                            </p>

                            <div className="grid md:grid-cols-3 gap-6 my-10">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-[var(--color-navy)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                                    <h4 className="font-bold text-slate-800 mb-2">Enter DOT or MC</h4>
                                    <p className="text-sm text-slate-500">We auto-pull your fleet data directly from federal systems.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-[var(--color-navy)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                                    <h4 className="font-bold text-slate-800 mb-2">Verify Fleet Size</h4>
                                    <p className="text-sm text-slate-500">Review your bracket tier and confirm the corresponding fee.</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-[var(--color-orange)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                                    <h4 className="font-bold text-slate-800 mb-2">Pay & Get Receipt</h4>
                                    <p className="text-sm text-slate-500">Pay securely via Stripe and get your PDF receipt instantly.</p>
                                </div>
                            </div>

                            {/* Call to Action Box */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 sm:p-10 my-12 text-center shadow-xl relative overflow-hidden">
                                {/* Truck icon watermark */}
                                <Truck className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-700/50 -rotate-12" />

                                <div className="relative z-10">
                                    <h3 className="text-white mt-0 mb-3 text-3xl h2">Ready to Renew Your UCR?</h3>
                                    <p className="text-slate-300 mb-8 text-lg max-w-xl mx-auto">
                                        Don't let a missed deadline jeopardize your loads. File now, get your instant receipt, and secure your compliance for the entire year.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link href="/ucr/file" className="inline-flex items-center justify-center bg-[var(--color-orange)] !text-white hover:!text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition shadow-lg no-underline group text-lg w-full sm:w-auto">
                                            Renew UCR Now
                                            <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <p className="text-center text-sm text-slate-500 font-medium">
                                Have questions? Check out our <Link href="/insights/who-needs-ucr-registration">Who Needs a UCR guide</Link> if you are unsure about your filing status.
                            </p>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
