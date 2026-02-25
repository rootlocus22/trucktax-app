export function getUcrSubmittedPayLaterEmailTemplate({
  legalName,
  dotNumber,
  filingId,
  amountDueLater,
}) {
  const company = legalName || 'your business';
  const dot = dotNumber || 'N/A';
  const filingRef = filingId || 'Pending';
  const dueLater = Number(amountDueLater || 79).toFixed(2);
  const dueLaterCopy = dueLater === '79.00' ? '$99 discounted to $79' : `$${dueLater}`;

  return {
    subject: `UCR Filing Submitted: ${company} (Govt Fee Paid)`,
    preheader: 'Your government fee was paid successfully. Service fee will be due when your certificate is ready.',
    plainText: `Your UCR filing has been submitted for processing.

Business: ${company}
USDOT: ${dot}
Filing ID: ${filingRef}
Govt Fee: Paid Upfront
Service Fee Due Later: ${dueLaterCopy}

What happens next:
1) Our team processes your filing with the UCR board.
2) We upload your official UCR certificate to your dashboard.
3) You verify the certificate and pay the final service fee to unlock your download.

Your federal fee was successfully processed today.

---
QuickTruckTax
Vendax Systems LLC · 28 Geary St STE 650, San Francisco, CA 94108
support@quicktrucktax.com`,
  };
}
