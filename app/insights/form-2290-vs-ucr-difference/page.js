import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers, CheckCircle2, DollarSign, ChevronRight } from 'lucide-react';

export const metadata = {
    title: 'Form 2290 vs. UCR: What’s the Difference? | QuickTruckTax',
    description: 'Confused between IRS Form 2290 and the Unified Carrier Registration (UCR)? We break down exactly what both DOT compliance filings are and if you need them.',
};

export default function Difference2290UcrGuide() {
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
                    <div className="bg-[var(--color-navy)] px-6 py-10 sm:px-10 sm:py-12 text-center text-white relative flex flex-col items-center">

                        <div className="flex gap-4 mb-6">
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                                <FileTextIcon className="w-8 h-8 text-blue-200" />
                            </div>
                            <div className="flex items-center text-blue-400 font-bold italic">VS</div>
                            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                                <TruckIcon className="w-8 h-8 text-orange-300" />
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Form 2290 vs. UCR: What’s the Difference?
                        </h1>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                            Two major federal trucking requirements, two very different rules. Here's a clear breakdown so you know exactly what your compliance obligations are.
                        </p>
                    </div>

                    <div className="p-6 sm:p-10 lg:p-12">
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-[var(--color-navy)] hover:prose-a:text-blue-700">

                            <p className="lead text-xl text-slate-500 mb-8 border-l-4 border-blue-500 pl-4">
                                As a commercial trucker, staying compliant can feel like an endless alphabet soup of acronyms: FMCSA, IFTA, IRP, UCR, HVUT... The two most frequently confused filings are the <strong>IRS Form 2290 (HVUT)</strong> and the <strong>Unified Carrier Registration (UCR)</strong>.
                            </p>
                            <p>
                                Many owner-operators assume that paying one covers the other. This is a crucial mistake that leads to heavy fines. Let's break down the differences.
                            </p>

                            <hr className="my-8" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
                                <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-[var(--color-navy)] mt-0 border-b pb-3 mb-4">
                                        IRS Form 2290 (HVUT)
                                    </h3>
                                    <ul className="space-y-3 m-0 pl-0 list-none text-sm">
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> <strong>What it is:</strong> A federal tax (Heavy Vehicle Use Tax).</li>
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> <strong>Who receives the money:</strong> The IRS.</li>
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> <strong>Triggered by:</strong> Vehicle Weight (55,000 lbs+).</li>
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> <strong>Borders matter?:</strong> No. Even if you never leave your county, heavy trucks must pay.</li>
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> <strong>Filing Deadline:</strong> August 31st (annually).</li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-[var(--color-navy)] mt-0 border-b border-blue-200 pb-3 mb-4">
                                        Unified Carrier Registration (UCR)
                                    </h3>
                                    <ul className="space-y-3 m-0 pl-0 list-none text-sm">
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[var(--color-orange)] flex-shrink-0" /> <strong>What it is:</strong> A registration agreement between states.</li>
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[var(--color-orange)] flex-shrink-0" /> <strong>Who receives the money:</strong> Participating States (via UCR Board).</li>
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[var(--color-orange)] flex-shrink-0" /> <strong>Triggered by:</strong> State Lines (Interstate Commerce).</li>
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[var(--color-orange)] flex-shrink-0" /> <strong>Borders matter?:</strong> Yes. Only applies if you haul across state or national borders.</li>
                                        <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-[var(--color-orange)] flex-shrink-0" /> <strong>Filing Deadline:</strong> December 31st (annually).</li>
                                    </ul>
                                </div>
                            </div>

                            <h2>The Deep Dive: Form 2290 Explained</h2>
                            <p>
                                The <strong>Form 2290</strong> is collected by the Internal Revenue Service (IRS). It is a tax specifically designed to pay for highway maintenance and construction. The rule is strictly weight-based. If your commercial vehicle has a gross taxable weight of <strong>55,000 pounds or more</strong> and operates on public highways, you must file a 2290 and pay the Heavy Vehicle Use Tax (HVUT).
                            </p>
                            <p>
                                It doesn't matter if your truck is purely intrastate (e.g., a massive dump truck that only operates within Houston, Texas). Because of its weight, it causes wear-down on the highway, and the IRS demands its tax.
                            </p>

                            <h2>The Deep Dive: UCR Explained</h2>
                            <p>
                                The <strong>UCR</strong>, on the other hand, cares nothing about 55,000-pound limits. The UCR targets <em>interstate commerce</em>. It is a system designed so that carriers don't have to pay individual registration fees to every single state they drive through.
                            </p>
                            <p>
                                A commercial vehicle under UCR definitions is any vehicle over <strong>10,000 pounds</strong>. If you drive a 12,000-pound box truck from New York into New Jersey, you do <em>not</em> need to file a Form 2290 (because it is under 55k lbs), but you <strong>absolutely must file a UCR</strong> (because you crossed state lines in a vehicle over 10k lbs).
                            </p>

                            <div className="bg-slate-100 p-6 rounded-lg my-8 italic">
                                <strong>Even Brokers Pay UCR:</strong> Remember, you don't even have to own a truck to owe UCR fees. Freight forwarders and brokers arranging interstate transport must also file a UCR! (They do not, however, file a 2290). Read our guide on <Link href="/insights/who-needs-ucr-registration">Who needs a UCR</Link> for more context.
                            </div>

                            <h2>Do I Need Both?</h2>
                            <p>
                                <strong>Very Frequently: YES.</strong>
                            </p>
                            <p>
                                If you are a standard long-haul OTR (Over-the-Road) trucker driving an 80,000-pound semi-truck across the country, you must file <strong>both</strong> the Form 2290 (because your truck is over 55,000 lbs) AND the UCR (because you leave your base state).
                            </p>

                            <hr className="my-10" />

                            <div className="bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-navy-light)] text-white rounded-2xl p-8 sm:p-10 my-10 shadow-lg text-center">
                                <h3 className="text-white mt-0 mb-4 h3">Ready to Handle Your UCR Registration?</h3>
                                <p className="text-blue-100 mb-6 text-lg max-w-xl mx-auto">
                                    While Form 2290 requires extensive IRS Schedule 1 generation, the UCR can be handled incredibly quickly through QuickTruckTax. Calculate your fees and file securely in under 5 minutes.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link href="/ucr/file" className="inline-flex items-center justify-center bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition shadow-lg no-underline group text-lg w-full sm:w-auto">
                                        File Your UCR Now
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <div className="mt-4">
                                    <Link href="/tools/ucr-calculator" className="text-sm font-semibold underline text-blue-200">Use our calculator to see today's UCR fees</Link>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Temporary inline icons until Lucide imports are synced across files
function FileTextIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    );
}

function TruckIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
            <path d="M14 9h4l4 4v5c0 .6-.4 1-1 1h-2" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
        </svg>
    );
}
