import React from 'react';

export default function TermsOfServicePage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

            <div className="prose prose-blue max-w-none text-gray-700 space-y-6">
                <p className="text-sm text-gray-500">Last Updated: December 2025</p>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the QuickTruckTax platform, operated by Vendax System Labs LLC, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Services Provided</h2>
                    <p>
                        QuickTruckTax provides an online platform for preparing and electronically filing IRS Form 2290. We are not a law firm and do not provide legal or tax advice.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Responsibilities</h2>
                    <p>You agree to:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li>Provide accurate, current, and complete information.</li>
                        <li>Maintain the security of your account credentials.</li>
                        <li>Review your return for accuracy before submission.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Fees and Refunds</h2>
                    <p>
                        <strong>Service Fees:</strong> Fees for our services are displayed at the time of payment.
                    </p>
                    <p className="mt-2">
                        <strong>Refund Policy:</strong> If your filing is rejected by the IRS and cannot be corrected, you may request a refund of the service fee. Please contact support to initiate a refund request.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Limitation of Liability</h2>
                    <p>
                        To the fullest extent permitted by law, TruckTax shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
                    <p>
                        For any questions regarding these Terms, please contact us at support@trucktax.com.
                    </p>
                </section>
            </div>
        </div>
    );
}
