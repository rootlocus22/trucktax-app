#!/usr/bin/env node
/**
 * Send the "first customer" thank-you email to a given address.
 * Uses customer data for personalization. Requires AWS SES env vars in .env.local.
 *
 * Usage:
 *   node scripts/send-first-customer-email.js
 *   npm run send:first-customer
 *   node scripts/send-first-customer-email.js other@email.com "Other LLC" "John Doe"
 *
 * Default recipient and data (first customer): mawbea04@yahoo.com, G5 TRUCKING LLC, Belinda Snyder
 */

const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
}

const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const TO = process.argv[2] || 'mawbea04@yahoo.com';
const LEGAL_NAME = process.argv[3] || 'G5 TRUCKING LLC';
const REGISTRANT_NAME = process.argv[4] || 'Belinda Snyder';

const BRAND = 'QuickTruckTax';
const NAVY = '#173b63';
const MIDNIGHT = '#0f2647';
const ORANGE = '#ff8b3d';
const TEXT = '#1b2838';
const MUTED = '#5c6b80';
const BG_PAGE = '#f4f7fb';
const BORDER = '#e2e8f0';
const FOOTER = `© ${new Date().getFullYear()} ${BRAND} / Vendax System Labs. All rights reserved.`;

function buildFollowUpEmail(legalName, registrantName) {
  const firstName = registrantName ? registrantName.trim().split(/\s+/)[0] : '';
  const greeting = firstName ? `Hi ${firstName},` : legalName ? `Hi there,` : 'Hi,';
  const subject = `Quick note from ${BRAND}`;

  const headerBlock = `<div style="background: linear-gradient(135deg, ${MIDNIGHT} 0%, ${NAVY} 100%); border-radius: 16px 16px 0 0; padding: 22px 28px; text-align: center;">
  <span style="font-size: 1.4rem; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">${BRAND}</span>
  <div style="font-size: 10px; font-weight: 600; letter-spacing: 0.18em; color: rgba(255,255,255,0.9); text-transform: uppercase; margin-top: 6px;">Compliance Simplified</div>
</div>`;

  const content = `
    <p style="font-size: 18px; font-weight: 600; color: ${NAVY}; margin-bottom: 16px;">${greeting}</p>
    <p style="color: ${TEXT};">Thanks for getting started with ${BRAND}. We wanted to reach out and say we're here if you need anything.</p>
    <p style="color: ${TEXT};">Your UCR filing for ${legalName || 'your business'} is saved—you can pick up right where you left off whenever you're ready. No rush.</p>
    <p style="color: ${TEXT};">If you have questions or feedback, just reply to this email. We read every message.</p>
    <p style="color: ${TEXT}; margin-bottom: 24px;">Thanks again.</p>
    <p><a href="https://quicktrucktax.com/ucr/file" style="display: inline-block; background: ${ORANGE}; color: #fff !important; padding: 14px 26px; border-radius: 12px; text-decoration: none; font-weight: bold;">Continue your UCR filing</a></p>
    <p style="color: ${MUTED}; font-size: 14px; margin-top: 24px;">The ${BRAND} team</p>
  `;

  const html = `<!DOCTYPE html>
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

  const plainText = `${greeting}\n\nThanks for getting started with ${BRAND}. We wanted to reach out and say we're here if you need anything.\n\nYour UCR filing for ${legalName || 'your business'} is saved—you can pick up right where you left off whenever you're ready. No rush.\n\nIf you have questions or feedback, just reply to this email. We read every message.\n\nThanks again.\n\nThe ${BRAND} team\n\nContinue your filing: https://quicktrucktax.com/ucr/file`;

  return { subject, html, plainText };
}

async function send() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('Missing AWS credentials. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env.local');
    process.exit(1);
  }

  const region = (process.env.AWS_SES_REGION || process.env.AWS_REGION_LOCAL || process.env.AWS_REGION || 'us-east-1').replace(/^'|'$/g, '');
  const fromEmail = process.env.AWS_SES_FROM_EMAIL || 'support@vendaxsystemlabs.com';
  const replyTo = process.env.AWS_SES_REPLY_TO || fromEmail;

  const { subject, html, plainText } = buildFollowUpEmail(LEGAL_NAME, REGISTRANT_NAME);

  console.log('Sending follow-up email to:', TO);
  console.log('Legal name:', LEGAL_NAME, '| Registrant:', REGISTRANT_NAME);
  console.log('Subject:', subject);

  const client = new SESClient({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new SendEmailCommand({
    Source: fromEmail,
    Destination: { ToAddresses: [TO] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: html, Charset: 'UTF-8' },
        Text: { Data: plainText, Charset: 'UTF-8' },
      },
    },
    ReplyToAddresses: [replyTo],
  });

  const result = await client.send(command);
  console.log('Sent. MessageId:', result.MessageId);
}

send().catch((err) => {
  console.error(err);
  process.exit(1);
});
