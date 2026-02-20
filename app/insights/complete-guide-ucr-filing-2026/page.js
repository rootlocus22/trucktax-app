import Link from 'next/link';
import { ArrowLeft, CheckCircle, Calculator, ChevronRight, FileText } from 'lucide-react';

export const metadata = {
    title: 'The Complete Guide to UCR Filing (2026 Registration Year)',
    description: 'Everything you need to know about Unified Carrier Registration (UCR) for 2026. Learn about deadlines, fees, who needs to file, and how to stay compliant.',
};

export default function CompleteUcrGuide() {
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
                    <div className="bg-[var(--color-navy)] px-6 py-10 sm:px-10 sm:py-12 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>

                        <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm border border-white/30">
                            Compliance Guide
                        </span>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight relative z-10">
                            The Complete Guide to UCR Filing (2026)
                        </h1>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto relative z-10">
                            Everything you need to know about the Unified Carrier Registration, who needs it, how much it costs, and how to file quickly.
                        </p>
                    </div>

                    <div className="p-6 sm:p-10 lg:p-12">
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-[var(--color-navy)] hover:prose-a:text-blue-700 prose-strong:text-slate-800">

                            <p className="lead text-xl text-slate-500 mb-8 border-l-4 border-[var(--color-orange)] pl-4">
                                If you operate a commercial vehicle across state lines, the Unified Carrier Registration (UCR) isn't optional—it's federal law. With the new 2026 registration period approaching, here is everything you need to know to stay compliant and keep your trucks on the road.
                            </p>

                            <h2>What is the UCR?</h2>
                            <p>
                                The <strong>Unified Carrier Registration (UCR)</strong> is a federally mandated program established under the UCR Act of 2005. Its primary purpose is to simplify the collection of registration fees from motor carriers, freight forwarders, brokers, and leasing companies that operate in interstate or international commerce.
                            </p>
                            <p>
                                Instead of paying separate registration fees to every state you drive through, the UCR allows you to pay a single annual fee through your base state, which is then distributed among participating states to fund motor carrier safety enforcement programs.
                            </p>

                            <h2>Who Needs to File a UCR?</h2>
                            <p>
                                The rule is simple: if you move freight across state lines for commerce, you likely need a UCR. This applies to:
                            </p>
                            <ul>
                                <li><strong>For-Hire Motor Carriers:</strong> Transporting property or passengers.</li>
                                <li><strong>Private Motor Carriers:</strong> Transporting your own goods as part of a business.</li>
                                <li><strong>Freight Forwarders & Brokers:</strong> Even if you don't own the trucks, you arrange the transport.</li>
                                <li><strong>Leasing Companies:</strong> Companies that lease commercial vehicles.</li>
                            </ul>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 my-8">
                                <h3 className="text-blue-900 mt-0 mb-2 flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-blue-600" /> Wait, does my specific business need it?
                                </h3>
                                <p className="text-blue-800 m-0 text-sm">
                                    We built a comprehensive guide breaking down exactly who qualifies. Read our deep dive: <Link href="/insights/who-needs-ucr-registration" className="font-semibold underline">Who Exactly Needs a UCR?</Link>
                                </p>
                            </div>

                            <h2>How are UCR Fees Calculated?</h2>
                            <p>
                                Unlike the Heavy Vehicle Use Tax (Form 2290) which calculates fees based purely on gross vehicle weight, the UCR fee structure is based on the <strong>total number of commercial motor vehicles</strong> in your fleet.
                            </p>
                            <p>
                                A commercial motor vehicle for UCR purposes is defined as:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>A vehicle with a gross vehicle weight rating (GVWR) of 10,001 pounds or more.</li>
                                <li>A vehicle designed to transport more than 10 passengers (including the driver).</li>
                                <li>A vehicle used in transporting hazardous materials that require placarding.</li>
                            </ul>
                            <p>
                                Brokers and freight forwarders who do not operate commercial motor vehicles pay the lowest fee bracket (Tier 1).
                            </p>

                            {/* Call to Action box */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 my-8 text-center">
                                <h3 className="mt-0 mb-3 text-center">Calculate Your exact 2026 UCR Fee</h3>
                                <p className="text-center mb-4 text-sm max-w-lg mx-auto">Stop guessing brackets. Use our free tool to instantly calculate what you owe based on your exact fleet size, or see the official breakdown.</p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/tools/ucr-calculator" className="inline-flex justify-center items-center bg-white border border-slate-300 !text-slate-700 hover:!text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition no-underline">
                                        <Calculator className="w-4 h-4 mr-2" /> UCR Calculator
                                    </Link>
                                    <Link href="/ucr/pricing" className="inline-flex justify-center items-center bg-[var(--color-navy)] !text-white hover:!text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition no-underline">
                                        View Fee Table <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>

                            <h2>UCR Deadlines and Penalties (2026)</h2>
                            <p>
                                UCR registration is an annual requirement. The registration period for the upcoming year typically opens on October 1st, and <strong>fees must be paid by December 31st</strong> of the preceding year.
                            </p>
                            <p>
                                Failure to pay your UCR fee by the deadline can result in severe consequences, including:
                            </p>
                            <ul>
                                <li>Significant fines and penalties which vary by state (often running into hundreds or thousands of dollars).</li>
                                <li>Vehicle detainment at weigh stations or during roadside inspections.</li>
                                <li>Potential suspension of your operating authority.</li>
                            </ul>
                            <p>
                                <em>Curious about specific fines? Read our full breakdown on <Link href="/insights/ucr-deadlines-penalties-explained">UCR Deadlines & Penalties</Link>.</em>
                            </p>

                            <h2>How to the File Your 2026 UCR Today</h2>
                            <p>
                                Filing your UCR doesn't have to be a headache. While you can navigate the state systems manually, third-party assistance services like QuickTruckTax streamline the process, verify your DOT records, and ensure you get confirmation instantly.
                            </p>

                            <div className="bg-gradient-to-br from-[var(--color-navy)] to-slate-800 text-white rounded-2xl p-8 sm:p-10 my-10 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h3 className="text-white mt-0 mb-4 text-2xl">Ready to file your UCR?</h3>
                                <p className="text-blue-100 mb-6 text-lg max-w-xl">
                                    Get compliant in under 5 minutes. Enter your DOT number, let us verify your fleet size, and receive your official PDF receipt instantly.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/ucr/file" className="inline-flex items-center justify-center bg-[var(--color-orange)] !text-white hover:!text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition shadow-lg no-underline group text-lg">
                                        Start UCR Filing
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <div className="mt-6 flex flex-wrap gap-4 text-sm text-blue-200">
                                    <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Takes 5 minutes</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Instant PDF Access</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-400" /> Automatic DOT Sync</span>
                                </div>
                            </div>

                            <h2>Frequently Asked Questions</h2>
                            <div className="space-y-6 mt-8">
                                <div>
                                    <h4 className="text-lg font-bold">What is the difference between UCR and Form 2290?</h4>
                                    <p className="text-base text-slate-600 mt-2">
                                        UCR is an active registration required for crossing state lines based on fleet count. Form 2290 (Heavy Vehicle Use Tax) is an IRS tax required for operating very heavy vehicles (55,000 lbs+) on public highways, regardless of whether you cross state lines. <Link href="/insights/form-2290-vs-ucr-difference">Learn the difference here.</Link>
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold">Do I have to file UCR in my base state?</h4>
                                    <p className="text-base text-slate-600 mt-2">
                                        If your base state participates in the UCR program, yes. If your base state does not participate (e.g., Oregon, Wyoming, Florida), but you operate interstate, you must select a neighboring participating state to act as your base state for UCR purposes.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
