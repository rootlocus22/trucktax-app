import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | QuickTruckTax',
    description: 'How we collect, use, and protect your data.',
};

const CONTACT_EMAIL = 'support@quicktrucktax.com';
const CONTACT_PHONE = '+1 (347) 801-8631';
const CONTACT_PHONE_TEL = 'tel:+13478018631';
const PRIVACY_EMAIL = 'privacy@quicktrucktax.com';
const ADDRESS = '28 Geary St STE 650 Suite #500, San Francisco, California 94108, United States';

export default function PrivacyPage() {
    return (
        <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg z-50">
                Skip to content
            </a>
            <div id="main-content" className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
                <p className="text-slate-500 mb-8">Updated: October 1, 2024</p>

                <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                        <p>
                            QuickTruckTax ("we," "us," or "our") We respect your privacy and are committed to protecting the sensitive personal and business information you trust us with. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you use our website and services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                        <p>
                            We collect information necessary to prepare and file your UCR (Unified Carrier Registration) filings. Currently we only operate UCR services; other services may be added in the future. The information we collect includes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Personal & Business Info:</strong> Name, Company/Legal Name, DBA, USDOT Number, Address, Phone Number, Email, and related registration details required for UCR.</li>
                            <li><strong>Fleet/Carrier Info:</strong> Power units, entity type, and other information required for UCR registration and fee calculation.</li>
                            <li><strong>Financial Info:</strong> Payment method details (processed securely via third-party processors) for UCR fees and our service charges.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                        <p>
                            We use your data solely for the following purposes in connection with our UCR services:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>To prepare and submit your UCR registration and filings with the appropriate state or registration system.</li>
                            <li>To communicate with you regarding the status of your UCR filings (e.g., submission, completion, certificate delivery).</li>
                            <li>To provide customer support and troubleshoot issues.</li>
                            <li>To send important compliance reminders related to UCR (e.g., renewal or filing deadlines).</li>
                        </ul>
                        <p className="mt-2">If we add other services (e.g., Form 2290, MCS-150) in the future, we may collect and use additional information as described in updates to this Privacy Policy.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">4. Data Security</h2>
                        <p>
                            We use industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Encryption:</strong> All data transmitted between your browser and our servers is encrypted using SSL/TLS. Sensitive data stored in our databases is also encrypted.</li>
                            <li><strong>Access Control:</strong> Access to your personal data is restricted to authorized personnel who need it to perform their job duties.</li>
                            <li><strong>Industry Standards:</strong> We follow industry-standard and regulatory security and privacy practices for handling tax and personal data.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">5. Data Retention</h2>
                        <p>
                            We retain your account and filing data for at least seven (7) years, or as long as required by tax and regulatory requirements, to support audits, customer service, and legal compliance. You may request deletion of certain personal data subject to our retention obligations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">6. Cookies and Tracking</h2>
                        <p>
                            We use essential cookies for session management and security. We do not sell cookie or tracking data to third parties. You can control cookies through your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">7. Sharing of Information</h2>
                        <p>
                            We do <strong>not</strong> sell your personal information to third parties. We typically only share your information in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li><strong>Government/Registration Authorities:</strong> We transmit your UCR registration data to the appropriate state or registration authorities as needed to complete your UCR filings.</li>
                            <li><strong>Service Providers:</strong> We use trusted third-party service providers (e.g., payment processors, email delivery services) to help us operate our business. These parties are contractually obligated to keep your data confidential.</li>
                            <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">8. Your Rights (Including California)</h2>
                        <p>
                            We do not sell your personal information. California residents may have additional rights to request access, correction, or deletion of personal information—contact us using the details below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">9. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us:
                        </p>
                        <address className="mt-4 not-italic bg-slate-100 p-4 rounded-lg text-sm">
                            <strong>QuickTruckTax</strong><br />
                            {ADDRESS}<br />
                            General: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-navy)] hover:underline">{CONTACT_EMAIL}</a><br />
                            Phone: <a href={CONTACT_PHONE_TEL} className="text-[var(--color-navy)] hover:underline">{CONTACT_PHONE}</a><br />
                            Privacy: <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[var(--color-navy)] hover:underline">{PRIVACY_EMAIL}</a>
                        </address>
                    </section>
                </div>

                {/* Footer disclaimer */}
                <div className="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-500 space-y-2">
                    <p>The information and images on this website are the property of QuickTruckTax and may not be reproduced, reused, or appropriated without the express written consent of the owner.</p>
                    <p>QuickTruckTax is a private third-party provider offering services for a fee. This website serves as a commercial solicitation and advertisement. We are not affiliated with any government authority such as the IRS, USDOT, or FMCSA.</p>
                    <p className="pt-2">&copy; 2026 QuickTruckTax, All Rights Reserved.</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <Link href="/terms" className="text-[var(--color-navy)] hover:underline">Terms &amp; Conditions</Link>
                    <Link href="/refund-policy" className="text-[var(--color-navy)] hover:underline">Refund Policy</Link>
                    <Link href="/privacy-policy" className="text-[var(--color-navy)] hover:underline">Privacy Policy</Link>
                    <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-navy)] hover:underline">Contact Us</a>
                    <a href={CONTACT_PHONE_TEL} className="text-[var(--color-navy)] hover:underline">{CONTACT_PHONE}</a>
                </div>
            </div>
        </div>
    );
}
