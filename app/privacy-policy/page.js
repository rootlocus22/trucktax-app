export const metadata = {
    title: 'Privacy Policy | QuickTruckTax',
    description: 'How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return (
        <div className="bg-slate-50 min-h-screen py-20 px-6">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
                <p className="text-slate-500 mb-8">Last Updated: December 15, 2025</p>

                <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                        <p>
                            Vendax Systems LLC ("we," "us," or "our") operates QuickTruckTax. We respect your privacy and are committed to protecting the sensitive personal and business information you trust us with. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you use our website and services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                        <p>
                            We collect information necessary to prepare and file your tax forms and compliance documents:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Personal & Business Info:</strong> Name, Company Name, EIN (Employer Identification Number), Address, Phone Number, Email.</li>
                            <li><strong>Vehicle Info:</strong> VIN (Vehicle Identification Number), Gross Taxable Weight, License Plate Numbers.</li>
                            <li><strong>Financial Info:</strong> Payment method details (processed securely via third-party processors like Stripe/Razorpay) and bank account information for tax payments to the IRS.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                        <p>
                            We use your data solely for the following purposes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>To prepare and electronically file your forms (2290, 8849, etc.) with the IRS and other government agencies.</li>
                            <li>To communicate with you regarding the status of your filings (e.g., acceptance, rejection, Schedule 1 delivery).</li>
                            <li>To provide customer support and troubleshoot issues.</li>
                            <li>To send important compliance reminders (e.g., "Your 2290 is due soon").</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                        <p>
                            We use industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using SSL/TLS. Sensitive data stored in our databases is also encrypted.</li>
                            <li><strong>Access Control:</strong> Access to your personal data is restricted to authorized personnel who need it to perform their job duties.</li>
                            <li><strong>IRS Standards:</strong> As an e-file provider, we adhere to security and privacy standards mandated by the IRS.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">5. Sharing of Information</h2>
                        <p>
                            We do <strong>not</strong> sell your personal information to third parties. We typically only share your information in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Government Agencies:</strong> We transmit your tax data to the IRS, FMCSA, or state agencies as instructed by you to complete your filings.</li>
                            <li><strong>Service Providers:</strong> We use trusted third-party service providers (e.g., payment processors, email delivery services) to help us operate our business. These parties are contractually obligated to keep your data confidential.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <address className="mt-4 not-italic bg-slate-100 p-4 rounded-lg">
                            <strong>Vendax Systems LLC</strong><br />
                            28 Geary St STE 650 Suite #500<br />
                            San Francisco, California 94108<br />
                            United States<br />
                            Email: privacy@quicktrucktax.com
                        </address>
                    </section>
                </div>
            </div>
        </div>
    );
}
