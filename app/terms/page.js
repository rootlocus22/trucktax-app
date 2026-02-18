export const metadata = {
    title: 'Terms of Service | QuickTruckTax',
    description: 'Terms and conditions for using QuickTruckTax services.',
};

export default function TermsPage() {
    return (
        <div className="bg-slate-50 min-h-screen py-20 px-6">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
                <p className="text-slate-500 mb-8">Last Updated: December 15, 2025</p>

                <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using QuickTruckTax (the "Service") ("we," "us," or "our"), you agree to comply with and be bound by these Terms of Service. If you do not agree, you must not use our Service.
                        </p>
                    </section>

                    <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h2 className="text-xl font-bold text-blue-900 mb-4">2. Important Disclaimer: Not a Government Agency</h2>
                        <ul className="list-disc pl-5 space-y-2 text-blue-800">
                            <li><strong>QuickTruckTax is a private concierge and technology service.</strong> We are <strong>NOT</strong> the Internal Revenue Service (IRS), the Federal Motor Carrier Safety Administration (FMCSA), or any other government agency.</li>
                            <li>We assist you in preparing and submitting your returns; transmission to the IRS and other agencies is carried out in accordance with applicable regulatory requirements.</li>
                            <li>The fees you pay to us are for our concierge service, software, and support. Any government tax liabilities (e.g., HVUT tax amounts) are calculated by us but are your sole responsibility to pay directly to the Treasury or via our facilitated payment methods.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. Services Provided</h2>
                        <p>
                            We provide software-as-a-service to assist with:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>IRS Form 2290</strong> (Heavy Vehicle Use Tax) preparation and e-filing.</li>
                            <li><strong>IRS Form 8849</strong> (Claim for Refund of Excise Taxes).</li>
                            <li><strong>UCR</strong> (Unified Carrier Registration) filings.</li>
                            <li><strong>MCS-150</strong> (Motor Carrier Identification Report) updates.</li>
                        </ul>
                        <p className="mt-4">
                            We do not provide legal or professional tax advice. Our software is designed to assist you in filing forms based on the information you provide. You are solely responsible for the accuracy of all data entered.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. User Responsibilities</h2>
                        <p>
                            You agree to:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>Provide accurate, current, and complete information during registration and filing.</li>
                            <li>Maintain the security of your account credentials.</li>
                            <li>Review all returns for accuracy prior to submission.</li>
                            <li>Pay all service fees and applicable taxes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">5. Fees and Refunds</h2>
                        <p>
                            <strong>Service Fees:</strong> Our fees are for the use of our software and submission services. These are separate from any taxes owed to the IRS or states.
                        </p>
                        <p className="mt-2">
                            <strong>Refund Policy:</strong>
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Before Submission:</strong> You may request a refund if you have not yet transmitted a return to the IRS or relevant agency.</li>
                            <li><strong>After Submission:</strong> Once a return has been transmitted to the IRS/Agency, <strong>no refunds</strong> can be issued, regardless of whether the return is accepted or rejected, as our service works have been performed.</li>
                            <li><strong>Rejection Fixes:</strong> If your return is rejected, you are entitled to correct and resubmit the return through our platform at no additional cost until it is accepted.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">6. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, QuickTruckTax shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues. Our total liability for any claim arising out of these terms or the service shall not exceed the amount you paid us for the specific service in question.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">7. Contact Information</h2>
                        <p>
                            For questions about these Terms, please contact us at:
                        </p>
                        <address className="mt-4 not-italic bg-slate-100 p-4 rounded-lg">
                            <strong>QuickTruckTax</strong><br />
                            28 Geary St STE 650 Suite #500<br />
                            San Francisco, California 94108<br />
                            United States<br />
                            Email: support@quicktrucktax.com
                        </address>
                    </section>
                </div>
            </div>
        </div>
    );
}
