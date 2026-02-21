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
    subject: `UCR Filing Submitted: ${company} (Pay Later)`,
    preheader: 'Your filing is submitted with no upfront charge. Pay when certificate is ready.',
    plainText: `Your UCR filing is submitted.

Business: ${company}
USDOT: ${dot}
Filing ID: ${filingRef}
Amount due later: ${dueLaterCopy}

What happens next:
1) Our team processes your filing.
2) We upload your UCR certificate to your dashboard.
3) You preview and unlock full download when ready.

No upfront payment was taken.`,
  };
}
