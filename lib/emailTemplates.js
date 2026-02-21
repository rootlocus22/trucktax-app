/**
 * QuickTruckTax email templates. Theme colors from app/globals.css.
 */

const BRAND = 'QuickTruckTax';
const TAGLINE = 'Compliance Simplified';

// Theme (match app: navy, midnight, orange)
const NAVY = '#173b63';
const MIDNIGHT = '#0f2647';
const ORANGE = '#ff8b3d';
const ORANGE_HOVER = '#f07a2d';
const TEXT = '#1b2838';
const MUTED = '#5c6b80';
const BG_PAGE = '#f4f7fb';
const BORDER = '#e2e8f0';

const FOOTER = `&copy; ${new Date().getFullYear()} ${BRAND} / Vendax System Labs. All rights reserved.`;

function wrapHtml(content) {
  const headerBlock = `<div style="background: linear-gradient(135deg, ${MIDNIGHT} 0%, ${NAVY} 100%); border-radius: 16px 16px 0 0; padding: 22px 28px; text-align: center;">
  <span style="font-size: 1.4rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">${BRAND}</span>
  <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: rgba(255,255,255,0.9); text-transform: uppercase; margin-top: 6px;">${TAGLINE}</div>
</div>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${BRAND}</title></head>
<body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: ${TEXT}; max-width: 560px; margin: 0 auto; padding: 24px; background: ${BG_PAGE};">
  <div style="background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15,38,71,0.08);">
  ${headerBlock}
  <div style="padding: 28px 32px 32px;">
    ${content}
    <p style="color: ${MUTED}; font-size: 12px; margin-top: 28px; border-top: 1px solid ${BORDER}; padding-top: 16px;">${FOOTER}</p>
  </div>
  </div>
</body>
</html>`;
}

export function getWelcomeEmailTemplate({ displayName = '' }) {
  const greeting = displayName ? `Hi ${displayName},` : 'Hi,';
  const subject = `Welcome to ${BRAND}`;
  const content = `
    <p style="font-size: 18px; font-weight: 600; color: ${NAVY}; margin-bottom: 16px;">${greeting}</p>
    <p style="color: ${TEXT};">Thanks for signing up. You're all set to use ${BRAND} for UCR filings and compliance.</p>
    <ul style="margin: 16px 0; padding-left: 20px; color: ${TEXT};">
      <li>File UCR in minutes with our guided wizard</li>
      <li>Pay later when your certificate is ready to download</li>
      <li>Track filings and documents in your dashboard</li>
    </ul>
    <p><a href="https://quicktrucktax.com/dashboard" style="display: inline-block; background: ${ORANGE}; color: #fff !important; padding: 14px 26px; border-radius: 12px; text-decoration: none; font-weight: bold;">Go to Dashboard</a></p>
    <p style="color: ${MUTED}; font-size: 14px;">If you have questions, reply to this email.</p>
  `;
  return { subject, html: wrapHtml(content) };
}

export function getInvoiceEmailTemplate({ amount = 79, filingId, legalName, date }) {
  const d = date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const subject = `Your ${BRAND} invoice – $${Number(amount).toFixed(2)}`;
  const amountPaidCell = Number(amount) === 79
    ? `<td style="padding: 10px 0; text-align: right;"><span style="color: ${MUTED}; text-decoration: line-through;">$99</span> <span style="font-weight: 700; color: ${ORANGE};">$79</span> <span style="font-size: 11px; font-weight: 600; color: #059669; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;">Discounted</span></td>`
    : `<td style="padding: 10px 0; text-align: right; font-weight: 700; color: ${ORANGE};">$${Number(amount).toFixed(2)}</td>`;
  const content = `
    <p style="font-size: 18px; font-weight: 600; color: ${NAVY}; margin-bottom: 16px;">Thank you for your payment</p>
    <p style="color: ${TEXT};">This is your invoice for the UCR certificate unlock${filingId ? ` (Filing #${filingId})` : ''}.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr style="border-bottom: 1px solid ${BORDER};"><td style="padding: 10px 0; color: ${MUTED};">Date</td><td style="padding: 10px 0; text-align: right; color: ${TEXT};">${d}</td></tr>
      <tr style="border-bottom: 1px solid ${BORDER};"><td style="padding: 10px 0; color: ${MUTED};">Amount paid</td>${amountPaidCell}</tr>
      ${legalName ? `<tr style="border-bottom: 1px solid ${BORDER};"><td style="padding: 10px 0; color: ${MUTED};">Business</td><td style="padding: 10px 0; text-align: right; color: ${TEXT};">${legalName}</td></tr>` : ''}
    </table>
    <p style="color: ${MUTED}; font-size: 14px;">Keep this email for your records. If you need a formal receipt, visit your dashboard.</p>
  `;
  return { subject, html: wrapHtml(content) };
}

export function getFilingSubmittedEmailTemplate({ legalName, filingId }) {
  const subject = `UCR filing submitted – ${BRAND}`;
  const content = `
    <p style="font-size: 18px; font-weight: 600; color: ${NAVY}; margin-bottom: 16px;">Filing received</p>
    <p style="color: ${TEXT};">We've received your UCR filing${legalName ? ` for <strong style="color: ${NAVY};">${legalName}</strong>` : ''}.</p>
    <p style="color: ${TEXT}; font-weight: 600;">What happens next:</p>
    <ul style="margin: 16px 0; padding-left: 20px; color: ${TEXT};">
      <li>Our team will start processing your filing shortly.</li>
      <li>You'll get an email when processing begins and when your certificate is ready.</li>
      <li>No upfront charge was taken. You pay only when your certificate is ready to download.</li>
    </ul>
    ${filingId ? `<p style="color: ${TEXT};">Filing ID: <strong>${filingId}</strong>. <a href="https://quicktrucktax.com/dashboard/filings" style="color: ${ORANGE}; font-weight: 600;">Track status in your dashboard</a>.</p>` : ''}
  `;
  return { subject, html: wrapHtml(content) };
}

export function getFilingProcessingStartedEmailTemplate({ legalName, filingId }) {
  const subject = `We're processing your UCR filing – ${BRAND}`;
  const content = `
    <p style="font-size: 18px; font-weight: 600; color: ${NAVY}; margin-bottom: 16px;">Processing has started</p>
    <p style="color: ${TEXT};">An agent has started processing your UCR filing${legalName ? ` for <strong style="color: ${NAVY};">${legalName}</strong>` : ''}.</p>
    <p style="color: ${TEXT};">We'll notify you as soon as your certificate is ready. You can also check status anytime in your dashboard.</p>
    ${filingId ? `<p><a href="https://quicktrucktax.com/dashboard/filings/${filingId}" style="display: inline-block; background: ${ORANGE}; color: #fff !important; padding: 14px 26px; border-radius: 12px; text-decoration: none; font-weight: bold;">View filing</a></p>` : ''}
  `;
  return { subject, html: wrapHtml(content) };
}

export function getAbandonEmailTemplate({ firstName = '' }) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const subject = `Complete your UCR filing — ${BRAND}`;
  const content = `
    <p style="font-size: 18px; font-weight: 600; color: ${NAVY}; margin-bottom: 16px;">${greeting}</p>
    <p style="color: ${TEXT};">You started a UCR filing on ${BRAND} but didn't finish. Your progress is saved — you can pick up where you left off.</p>
    <p style="color: ${TEXT}; font-weight: 600;">Why complete your UCR?</p>
    <ul style="margin: 16px 0; padding-left: 20px; color: ${TEXT};">
      <li>Stay compliant with state and federal requirements</li>
      <li>File in under 5 minutes with our guided wizard</li>
      <li>Pay later: we charge only when your certificate is ready to download</li>
    </ul>
    <p><a href="https://quicktrucktax.com/ucr/file" style="display: inline-block; background: ${ORANGE}; color: #fff !important; padding: 14px 26px; border-radius: 12px; text-decoration: none; font-weight: bold;">Continue your UCR filing</a></p>
    <p style="color: ${MUTED}; font-size: 14px; margin-top: 24px;">If you didn't start a UCR filing, you can ignore this email.</p>
  `;
  return { subject, html: wrapHtml(content) };
}

/**
 * Personalized follow-up email (e.g. after starting a UCR draft). Normal, friendly message—no “first customer” wording.
 */
export function getCustomerFollowUpEmailTemplate({ legalName = '', registrantName = '' }) {
  const firstName = registrantName ? registrantName.trim().split(/\s+/)[0] : '';
  const greeting = firstName ? `Hi ${firstName},` : legalName ? `Hi there,` : 'Hi,';
  const subject = `Quick note from ${BRAND}`;
  const content = `
    <p style="font-size: 18px; font-weight: 600; color: ${NAVY}; margin-bottom: 16px;">${greeting}</p>
    <p style="color: ${TEXT};">Thanks for getting started with ${BRAND}. We wanted to reach out and say we’re here if you need anything.</p>
    <p style="color: ${TEXT};">Your UCR filing for ${legalName || 'your business'} is saved—you can pick up right where you left off whenever you’re ready. No rush.</p>
    <p style="color: ${TEXT};">If you have questions or feedback, just reply to this email. We read every message.</p>
    <p style="color: ${TEXT}; margin-bottom: 24px;">Thanks again.</p>
    <p><a href="https://quicktrucktax.com/ucr/file" style="display: inline-block; background: ${ORANGE}; color: #fff !important; padding: 14px 26px; border-radius: 12px; text-decoration: none; font-weight: bold;">Continue your UCR filing</a></p>
    <p style="color: ${MUTED}; font-size: 14px; margin-top: 24px;">The ${BRAND} team</p>
  `;
  const plainText = `${greeting}\n\nThanks for getting started with ${BRAND}. We wanted to reach out and say we're here if you need anything.\n\nYour UCR filing for ${legalName || 'your business'} is saved—you can pick up right where you left off whenever you're ready. No rush.\n\nIf you have questions or feedback, just reply to this email. We read every message.\n\nThanks again.\n\nThe ${BRAND} team\n\nContinue your filing: https://quicktrucktax.com/ucr/file`;
  return { subject, html: wrapHtml(content), plainText };
}

export function getFilingCompletedPayDownloadEmailTemplate({ legalName, filingId, amount = 79 }) {
  const subject = `Your UCR certificate is ready – pay & download – ${BRAND}`;
  const url = filingId ? `https://quicktrucktax.com/dashboard/filings/${filingId}` : 'https://quicktrucktax.com/dashboard/filings';
  const amountDisplay = Number(amount) === 79
    ? `<span style="color: ${MUTED}; text-decoration: line-through;">$99</span> <span style="color: ${ORANGE}; font-weight: 700;">$79</span> <span style="font-size: 11px; font-weight: 600; color: #059669;">(discounted)</span>`
    : `<span style="color: ${ORANGE}; font-weight: 700;">$${Number(amount).toFixed(2)}</span>`;
  const content = `
    <p style="font-size: 18px; font-weight: 600; color: ${NAVY}; margin-bottom: 16px;">Your certificate is ready</p>
    <p style="color: ${TEXT};">Your UCR filing${legalName ? ` for <strong style="color: ${NAVY};">${legalName}</strong>` : ''} is complete. You can now pay and download your certificate.</p>
    <p style="color: ${TEXT};"><strong>Amount to pay:</strong> ${amountDisplay} (one-time unlock for full-quality download)</p>
    <p><a href="${url}" style="display: inline-block; background: ${ORANGE}; color: #fff !important; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Pay &amp; download certificate</a></p>
    <p style="color: ${MUTED}; font-size: 14px;">This link takes you to your filing in the dashboard where you can complete payment and download.</p>
  `;
  return { subject, html: wrapHtml(content) };
}
