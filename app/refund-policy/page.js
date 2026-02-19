import Link from 'next/link';

export const metadata = {
  title: 'Refund Policy | QuickTruckTax',
  description: 'Refund and cancellation policy for QuickTruckTax services.',
};

const CONTACT_EMAIL = 'support@quicktrucktax.com';
const ADDRESS = '28 Geary St STE 650 Suite #500, San Francisco, California 94108, United States';

export default function RefundPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg z-50">
        Skip to content
      </a>
      <div id="main-content" className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Refund Policy</h1>
        <p className="text-slate-500 mb-8">Updated: October 1, 2024</p>

        <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Refunds</h2>
            <p>
              QuickTruckTax currently offers only UCR (Unified Carrier Registration) filing services. We offer refunds for UCR services purchased within 30 days of payment under specific conditions. To request a refund, please contact us within this 30-day period with your order number and the reason for your request. Refunds will only be granted if the service was not provided as described or if the service has not been accessed or used. Note that we do not offer refunds for services that have already been accessed or used (e.g., once a UCR filing has been submitted or completed). Customized services created specifically for you are also non-refundable.
            </p>
            <p className="mt-4">
              A transaction fee of up to 10% may be deducted from the refund amount to cover bank or credit card processing fees.
            </p>
            <p className="mt-4">
              If a refund is approved, it will be credited to the original payment method. Please allow up to 10 business days for the refund to be processed and reflected in your account. Refunds cannot be issued after the 30-day period has expired. For any questions regarding our refund policy, please contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-navy)] hover:underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Cancellations</h2>
            <p>
              The Customer has the right to cancel any Order within thirty (30) days of placement, provided the service has not been accessed or used and the filing has not been initiated or completed. QuickTruckTax will send an email confirmation upon fulfillment and completion of the Order. No refunds will be issued after QuickTruckTax has sent this confirmation. If the confirmation has not been sent and the Customer cancels within thirty (30) days of placing the Order, and the service has not been accessed or used, a refund will be issued within ten business days of receiving a written cancellation notice.
            </p>
            <p className="mt-4">
              To cancel an Order, the Customer must email QuickTruckTax at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-navy)] hover:underline">{CONTACT_EMAIL}</a> by midnight of the third (3rd) day following the Order placement.
            </p>
            <p className="mt-4">
              For cancellations requested before the service has been provided, a partial refund may be available. No refund will be granted if the service has already been delivered. If we request additional information and more than 30 days have passed since the order, no refund will be issued. Once a service has been initiated or processed, orders cannot be adjusted or canceled. In the event of cancellation or dispute after payment, you will be responsible for reimbursing us for all fees incurred during service preparation, including the original quoted cost and sales tax.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Pricing or Description Errors</h2>
            <p>
              In cases of pricing or description errors on our website, we reserve the right to cancel or refuse orders placed at incorrect prices. If your account has been charged for a purchase and the order is canceled due to such an error, we will issue a credit for the incorrect amount charged.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p>For any questions or concerns about refunds or cancellations, please contact us:</p>
            <address className="mt-4 not-italic bg-slate-100 p-4 rounded-lg text-sm">
              <strong>QuickTruckTax</strong><br />
              {ADDRESS}<br />
              Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-navy)] hover:underline">{CONTACT_EMAIL}</a>
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
        </div>
      </div>
    </div>
  );
}
