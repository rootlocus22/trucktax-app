import Link from 'next/link';
import { ArrowLeft, CheckCircle, HelpCircle, AlertTriangle, ChevronRight } from 'lucide-react';

export const metadata = {
    title: 'Who Exactly Needs a Unified Carrier Registration (UCR)? | QuickTruckTax',
    description: 'Unsure if you need a UCR? Discover exactly who needs to file for Unified Carrier Registration, including rules for brokers, freight forwarders, and intrastate carriers.',
};

export default function WhoNeedsUcrGuide() {
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
                    <div className="bg-gradient-to-br from-slate-900 to-[var(--color-navy)] px-6 py-10 sm:px-10 sm:py-12 text-center text-white relative flex flex-col items-center">
                        <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm border border-white/30">
                            UCR Rules & Requirements
                        </span>
                        <HelpCircle className="w-16 h-16 text-blue-300 mb-6 opacity-80" />
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Who Exactly Needs a UCR?
                        </h1>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                            Breaking down the Unified Carrier Registration requirements for motor carriers, freight forwarders, brokers, and owner-operators.
                        </p>
                    </div>

                    <div className="p-6 sm:p-10 lg:p-12">
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 prose-headings:text-slate-900 prose-headings:font-bold prose-a:text-[var(--color-navy)] hover:prose-a:text-blue-700">

                            <p className="lead text-xl text-slate-500 mb-8 border-l-4 border-emerald-500 pl-4">
                                The most common question we receive at QuickTruckTax is: <em>"Does my business actually need to file a UCR?"</em> The short answer is: If you operate commercial motor vehicles in interstate commerce (across state lines), yes. But let's look at the specific requirements.
                            </p>

                            <h2>The Basic Rule of Thumb</h2>
                            <p>
                                The Unified Carrier Registration (UCR) program requires individuals and companies that operate commercial motor vehicles in <strong>interstate or international commerce</strong> to register their business and pay an annual fee.
                            </p>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 my-8">
                                <h3 className="text-yellow-800 mt-0 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" /> What counts as a Commercial Motor Vehicle (CMV) for UCR?
                                </h3>
                                <p className="text-yellow-800 text-sm m-0">A vehicle is a CMV if it meets <strong>any</strong> of the following criteria:</p>
                                <ul className="text-sm mt-3 mb-0 text-yellow-800">
                                    <li>Has a gross vehicle weight rating (GVWR) or gross vehicle weight of 10,001 pounds or more.</li>
                                    <li>Is designed to transport more than 10 passengers (including the driver).</li>
                                    <li>Is used in transporting hazardous materials in a quantity requiring placarding.</li>
                                </ul>
                            </div>

                            <h2>Breaking Down Who Must File</h2>

                            <h3>1. For-Hire Motor Carriers</h3>
                            <p>
                                If you transport property or passengers across state lines for compensation, you must file a UCR. This includes everyone from major nationwide trucking fleets to independent owner-operators acting under their own authority.
                            </p>

                            <h3>2. Private Motor Carriers</h3>
                            <p>
                                A private motor carrier transports its own goods. For example, if you own a landscaping business in New York and drive a 12,000-pound truck to a job site in New Jersey carrying your own equipment, you are a private motor carrier operating in interstate commerce. <strong>You must file a UCR.</strong>
                            </p>

                            <h3>3. Freight Forwarders & Brokers</h3>
                            <p>
                                This often surprises people. Even if your business does not own or operate a single truck, if you arrange the transportation of property across state lines (functioning as a broker or freight forwarder), you are legally required to register.
                            </p>
                            <p>
                                Brokers and freight forwarders fall into the lowest tier of the UCR fee structure (Tier 1: 0-2 vehicles), but the registration is strictly mandatory.
                            </p>

                            <h3>4. Leasing Companies</h3>
                            <p>
                                Companies that lease commercial motor vehicles for use in interstate commerce must also register and pay the UCR fee.
                            </p>

                            <hr className="my-10" />

                            <h2>Common Exemptions: Who DOES NOT need a UCR?</h2>

                            <h3>Intrastate-Only Carriers</h3>
                            <p>
                                If your commercial vehicles <strong>never</strong> cross state lines and you do not haul freight that originated in another state or country (interstate freight), you are an "intrastate" carrier. Intrastate carriers do NOT need to file a federal UCR.
                            </p>
                            <p className="text-sm bg-slate-100 p-4 rounded text-slate-600 italic">
                                <strong>Exception Warning:</strong> Some states have their own state-level registration requirements for intrastate carriers. Always check with your local DOT.
                            </p>

                            <h3>Non-Participating States</h3>
                            <p>
                                Currently, 41 states participate in the UCR program. The non-participating states are:
                                <strong> Arizona, Florida, Hawaii, Maryland, Nevada, New Jersey, Oregon, Wyoming, and the District of Columbia.</strong>
                            </p>
                            <p>
                                <strong>However, read carefully:</strong> If your business is based in a non-participating state (like Florida), but you drive your commercial vehicle into a participating state (like Georgia), <strong>you still need a UCR</strong>. You just have to select a neighboring participating state as your "Base State" for filing purposes.
                            </p>

                            <div className="bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-accent)] text-white rounded-2xl p-8 sm:p-10 my-10 shadow-lg relative overflow-hidden">
                                <h3 className="text-white mt-0 mb-4 h3">Ready to Handle Your Registration?</h3>
                                <p className="text-blue-100 mb-6 text-lg">
                                    If you fall into any of the required categories, you need to secure your 2026 UCR before the deadline to avoid steep roadside fines. QuickTruckTax can process your UCR instantly.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link href="/ucr/file" className="inline-flex items-center justify-center bg-[var(--color-orange)] !text-white hover:!text-white px-8 py-4 rounded-xl font-bold hover:bg-[#e66a15] transition shadow-lg no-underline group">
                                        File Your UCR Now
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link href="/tools/ucr-calculator" className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 !text-white hover:!text-white border border-white/30 px-8 py-4 rounded-xl font-bold transition no-underline">
                                        Calculate My Fee First
                                    </Link>
                                </div>
                            </div>

                            <h2>Still have questions?</h2>
                            <p>
                                Compliance can be confusing. If you are still unsure whether your specific operation requires a UCR, or if you need to know how it interacts with other federal taxes, check out our <Link href="/insights/complete-guide-ucr-filing-2026">Complete Guide to UCR Filing</Link> or understand the difference in our <Link href="/insights/form-2290-vs-ucr-difference">UCR vs Form 2290 Breakdown</Link>.
                            </p>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
