import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

            <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
                <p className="text-sm text-gray-500">Last Updated: December 2025</p>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                    <p>
                        QuickTruckTax ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our tax filing services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
                    <p>We collect information that you provide directly to us, including:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and mailing address.</li>
                        <li><strong>Business Information:</strong> EIN, business name, and address.</li>
                        <li><strong>Vehicle Information:</strong> VIN, gross weight, and vehicle type.</li>
                        <li><strong>Payment Information:</strong> Credit card details (processed securely by our payment processor).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                    <p>We use your information to:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Prepare and file your IRS Form 2290.</li>
                        <li>Communicate with you about your filing status.</li>
                        <li>Process payments and refunds.</li>
                        <li>Comply with IRS regulations and legal obligations.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">4. IRS Section 7216 Compliance</h2>
                    <p>
                        We are a compliant tax preparation firm. Pursuant to Internal Revenue Code Section 7216, we do not use or disclose your tax return information for any purpose other than preparing your return, unless you provide specific, written consent.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Security</h2>
                    <p>
                        We implement industry-standard security measures, including encryption and secure socket layer (SSL) technology, to protect your personal and financial information.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, please contact us at support@trucktax.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
