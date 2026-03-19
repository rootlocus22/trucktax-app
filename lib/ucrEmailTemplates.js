export function getUcrSubmittedPayLaterEmailTemplate({
  legalName,
  dotNumber,
  filingId,
  amountDueLater,
  total,
  filingYear,
}) {
  const company = legalName || 'your business';
  const dot = dotNumber || 'N/A';
  const filingRef = filingId || 'Pending';
  const year = filingYear || 2026;
  const totalPaid = Number(total || 0).toFixed(2);

  return {
    subject: `UCR ${year} Filing Submitted: ${company} — Payment Received`,
    preheader: `Your ${year} UCR registration is being processed. Total paid: $${totalPaid}.`,
    plainText: `Your UCR filing has been submitted for processing.

Business: ${company}
USDOT: ${dot}
Filing Year: ${year}
Filing ID: ${filingRef}
Total Paid: $${totalPaid}

What happens next:
1) Our team files your UCR registration on ucr.gov.
2) We pay the government fee on your behalf using our corporate account.
3) Your official UCR certificate is uploaded to your dashboard.
4) You'll receive an email notification when your certificate is ready.

Your payment has been processed successfully. No further payment is required.

---
easyucr.com
Vendax Systems LLC · 28 Geary St STE 650, San Francisco, CA 94108
support@vendaxsystemlabs.com · +1 (347) 801-8631`,
  };
}
