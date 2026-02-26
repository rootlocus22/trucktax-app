import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions | QuickTruckTax',
  description: 'Terms and conditions for using QuickTruckTax website and services.',
};

const CONTACT_EMAIL = 'support@quicktrucktax.com';
const CONTACT_PHONE = '+1 (347) 801-8631';
const CONTACT_PHONE_TEL = 'tel:+13478018631';
const ADDRESS = '28 Geary St STE 650 Suite #500, San Francisco, California 94108, United States';

export default function TermsPage() {
    return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg z-50">
        Skip to content
      </a>
      <div id="main-content" className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms & Conditions</h1>
        <p className="text-slate-500 mb-8">Updated: October 1, 2024</p>

                <div className="prose prose-slate max-w-none text-slate-600 space-y-8">
                    <section>
            <p className="leading-relaxed">
              Welcome to the QuickTruckTax website and services. The following terms and conditions (&quot;Terms&quot;), along with our <Link href="/privacy-policy" className="text-[var(--color-navy)] hover:underline">Privacy Policy</Link>, <Link href="/refund-policy" className="text-[var(--color-navy)] hover:underline">Refund Policy</Link> and any linked agreements, govern your access to and use of the website, including any content, features, and services offered through it. By accessing or using the website, you agree to be bound by these Terms. Please carefully review these Terms before using the website.
                        </p>
                    </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">1. Consent and Agreement</h2>
            <p>By accessing or using the QuickTruckTax website, you agree to abide by these Terms, our Privacy Policy, and all applicable laws and regulations. If you do not agree to these Terms, you are not authorized to use the website. QuickTruckTax may update these Terms at any time, and your continued use of the website constitutes acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">2. Eligibility and Responsibility</h2>
            <p>The website is intended for users aged eighteen (18) or older. By using the website, you represent that you are of legal age and meet all eligibility requirements. You are responsible for ensuring that anyone accessing the website through your account complies with these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">3. Reservation of Rights</h2>
            <p>QuickTruckTax reserves the right to modify or discontinue the website or any services provided on it without prior notice. QuickTruckTax may also restrict access to certain parts of the website as needed. These Terms constitute an agreement between QuickTruckTax and you, the Customer, whether an individual or entity involved in commercial vehicle operations. QuickTruckTax may amend these Terms at any time without notice and shall not be liable for any losses resulting from unforeseen circumstances.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Services</h2>
            <p>QuickTruckTax currently operates only <strong>Unified Carrier Registration (UCR)</strong> services. We provide fee calculation, registration assistance, and UCR filing services for trucking companies, brokers, leasing companies, and freight forwarders operating in multiple states.</p>
            <p className="mt-4">Other services may be offered in the future and will be marked as &quot;Coming Soon&quot; or &quot;Upcoming&quot; on the website until they are available. Such services may include, but are not limited to: IRS Form 2290 (Heavy Vehicle Use Tax), IRS Form 8849 (Claim for Refund of Excise Taxes), MCS-150 / Biennial Update, and other FMCSA or motor carrier compliance-related services. Until those services are launched, all operations, orders, and filings are for UCR only.</p>
            <p className="mt-4 border-l-4 border-[var(--color-navy)] pl-4 bg-slate-50 py-2"><strong>QuickTruckTax is a private third-party filing assistance service.</strong> We are not the IRS, USDOT, UCR Board, FMCSA, or any government agency. We assist you in preparing and submitting UCR filings; you remain solely responsible for the accuracy of your provided data (like your DOT number and fleet size) and any separate applicable government taxes or fees.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Orders</h2>
            <p>Customers can place orders for UCR registration and filing services through the website. Customers are responsible for providing accurate and complete information. QuickTruckTax will use and store this information in accordance with its Privacy Policy. QuickTruckTax relies on the accuracy of the information provided by the customer and is not liable for damages arising from incorrect or incomplete information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">6. Filing Process</h2>
            <p>Upon receipt of required information and payment, QuickTruckTax will process your UCR order. The customer authorizes QuickTruckTax to charge the payment method on file and agrees to follow the dispute resolution process without charge-backs where the service has been performed. The UCR registration and filing process commences upon receipt of payment. QuickTruckTax aims to fulfill UCR orders in a timely manner.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">7. Cost of Services</h2>
            <p>Pricing for services is determined by the specific order and services requested. Prices may change without prior notice; review the current prices on the website for accurate pricing information. All permits and services are subject to these pricing terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">8. Payments</h2>
            <p>By using the services, the Customer agrees to pay according to the fees and payment terms outlined. The Customer must provide accurate billing information, including full legal name, address, telephone number, and valid payment details. The Customer is responsible for any applicable taxes associated with their use of the website and services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">9. Collections</h2>
            <p>In the event of late payment, QuickTruckTax may charge late fees and interest at a rate of 1.5% per month on the outstanding balance. Delinquent accounts may be referred to a collections agency, and the Customer will be responsible for any additional collection costs and fees, including attorney&apos;s fees and court costs.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">10. Refunds and Cancellations</h2>
            <p>Details regarding refunds and cancellations can be found in our <Link href="/refund-policy" className="text-[var(--color-navy)] hover:underline">Refund Policy</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">11. Monitoring and Recording</h2>
            <p>QuickTruckTax may monitor and record communications for quality control and service purposes without further notice. This includes communications with service providers and customers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">12. Disclaimer</h2>
            <p className="uppercase text-sm font-semibold text-slate-700">Your use of the website is at your own risk.</p>
            <p className="mt-2">We make no representations or warranties about the operation of the website or the information, materials, goods or services appearing or offered on the website, all of which are provided &quot;as is.&quot; We disclaim all warranties, express or implied, including but not limited to warranties of merchantability and fitness for a particular purpose; warranties against infringement of any third-party intellectual property or proprietary rights; warranties relating to the transmission or delivery of the website; warranties relating to the accuracy, reliability, correctness or completeness of data made available on the website or otherwise; and warranties otherwise relating to performance, nonperformance or other acts or omissions by QuickTruckTax or any third party. QuickTruckTax does not warrant that the website will meet your needs or requirements. We make no warranties that the website or any email we send you is free of viruses or other harmful components, or that the website, content, functions or materials will be timely, secure, accurate, complete, or uninterrupted. If applicable law does not allow the exclusion of some or all of the above warranties, the above exclusions will apply to you to the fullest extent permitted by applicable law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">13. Limitation of Liability</h2>
            <p className="uppercase text-sm font-semibold text-slate-700">Under no circumstances, including negligence, will QuickTruckTax (or its officers, directors, affiliates, agents, employees, suppliers, or any party involved in creating, producing or delivering the website) be liable for damages or losses, including direct, incidental, consequential, indirect, special, exemplary or punitive damages and lost profits, arising out of your access, use, misuse or inability to use the website, content, or any linked sites.</p>
            <p className="mt-2">These limitations apply whether the alleged liability is based on contract, tort, negligence, strict liability or any other basis, even if QuickTruckTax has been advised of the possibility of such damage. In no event will QuickTruckTax&apos;s aggregate liability arising out of or in connection with these Terms, the website, or the services exceed $100. Because some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages, QuickTruckTax&apos;s liability in such jurisdictions shall be limited to the extent permitted by law. QuickTruckTax cannot be held liable for any failure to file or complete documents or tasks on time, nor for any consequences arising from inaccurate parsing of customer-provided business data (e.g. DOT numbers, EINs). It is the sole responsibility of individuals or organizations to ensure all necessary actions are taken promptly and the supplied information is accurate representation of the entity. If any part of this limitation on liability is found to be invalid or unenforceable, our aggregate liability shall not exceed $100.00.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">14. Entire Agreement</h2>
            <p>These terms, along with the information on the website, the Privacy Policy, and Refund Policy, constitute the entire agreement between QuickTruckTax and the Customer, superseding any prior agreements. If any provision is found to be invalid or unenforceable, the remaining provisions shall remain in effect.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">15. Waiver</h2>
            <p>The failure of QuickTruckTax to enforce any right or provision of these Terms will not constitute a waiver of such right or provision.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">16. Arbitration</h2>
            <p>Disputes shall be resolved through arbitration in accordance with the Rules of Arbitration of the American Arbitration Association. The arbitration shall be governed by the laws of the State of California. The parties waive the right to a jury trial and elect arbitration. Claims exempt from arbitration are excluded from this provision.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">17. Right to Opt Out of Arbitration</h2>
            <p>Users may opt out of the Arbitration provision within 30 days of registering for the site by notifying QuickTruckTax in writing at {CONTACT_EMAIL}. Opting out will not affect other terms of the Agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">18. Class Action</h2>
            <p>With respect to any and all disputes arising out of or in connection with the site, services, or these Terms, QuickTruckTax and you agree to first negotiate in good faith. If you and QuickTruckTax do not resolve any dispute by informal negotiation within 60 days, any other effort to resolve the dispute will be conducted exclusively by confidential binding arbitration in San Francisco, California, or another forum mutually agreed upon by the parties, pursuant to the Commercial Rules of Arbitration of the American Arbitration Association. Any proceedings to resolve or litigate any dispute will be conducted solely on an individual basis. Neither you nor QuickTruckTax will seek to have any dispute heard as a class action or in any other proceeding in which either party acts or proposes to act in a representative capacity. Any claim or dispute under this agreement must be filed within one year from when the claim or notice of dispute first could be filed; otherwise it is permanently barred.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">19. Governing Law</h2>
            <p>This agreement and disputes arising from it shall be governed by the laws of the State of California.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">20. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold QuickTruckTax and its affiliates harmless from any losses, claims, suits, actions, demands, judgments, costs, expenses, fees, or proceedings resulting from: breaches of these Terms; claims that your content infringes third-party rights; claims arising from your use of the website; violations of law or contractual obligations; or acts or omissions by you or your agents.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">21. Intellectual Property</h2>
            <p>QuickTruckTax and its licensors own all rights to the website and its content. You may not use the website or its content for any purpose not explicitly granted in these Terms.</p>
                    </section>

                    <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">22. Notice</h2>
            <p>Any required notices shall be emailed to <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-navy)] hover:underline">{CONTACT_EMAIL}</a>.</p>
                    </section>

                    <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">23. Assignment</h2>
            <p>You may not assign this agreement or transfer rights to use the services without QuickTruckTax&apos;s prior written consent.</p>
                    </section>

                    <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">24. Headings</h2>
            <p>Headings in this agreement are for convenience only and shall not affect its interpretation.</p>
                    </section>

                    <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">25. Miscellaneous</h2>
            <p>These Terms, together with any other applicable agreements you may have entered into regarding our services, constitute the entire agreement between QuickTruckTax and you regarding your use of the services. In the event any provision of these Terms is held unenforceable, it will not affect the validity or enforceability of the remaining provisions. No joint venture, partnership, employment or agency relationship exists between you and QuickTruckTax as a result of these Terms or your access to and use of the site. Our failure to enforce any provisions of these Terms does not waive our right to subsequently enforce any terms or conditions.</p>
                    </section>

                    <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p>If you have questions about these Terms, contact QuickTruckTax at <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-navy)] hover:underline">{CONTACT_EMAIL}</a> or <a href={CONTACT_PHONE_TEL} className="text-[var(--color-navy)] hover:underline">{CONTACT_PHONE}</a>.</p>
            <address className="mt-4 not-italic bg-slate-100 p-4 rounded-lg text-sm">
              <strong>QuickTruckTax</strong><br />
              {ADDRESS}<br />
              Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-navy)] hover:underline">{CONTACT_EMAIL}</a><br />
              Phone: <a href={CONTACT_PHONE_TEL} className="text-[var(--color-navy)] hover:underline">{CONTACT_PHONE}</a>
                        </address>
                    </section>
                </div>

        {/* Footer disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-500 space-y-2">
          <p>The information and images on this website are the property of QuickTruckTax and may not be reproduced, reused, or appropriated without the express written consent of the owner.</p>
          <p>QuickTruckTax is a private third-party provider offering services for a fee. This website serves as a commercial solicitation and advertisement. We are not a government agency and are not affiliated with any government authority such as the UCR Board, IRS, USDOT, or FMCSA.</p>
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
