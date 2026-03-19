import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';

const region = (process.env.AWS_SES_REGION || process.env.AWS_REGION_LOCAL || process.env.AWS_REGION || 'us-east-1').replace(/^'|'$/g, '');
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'support@vendaxsystemlabs.com';
const REPLY_TO = process.env.AWS_SES_REPLY_TO || FROM_EMAIL;
// Display name for inbox recognition (e.g. "easyucr.com" <support@...>)
const FROM_DISPLAY = process.env.AWS_SES_FROM_DISPLAY || 'easyucr.com';
const SOURCE = FROM_DISPLAY ? `"${FROM_DISPLAY.replace(/"/g, '')}" <${FROM_EMAIL}>` : FROM_EMAIL;

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS SES: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set');
    }
    client = new SESClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
}

/**
 * Wrap base64 at 76 chars per MIME spec (RFC 2045).
 */
function wrapBase64(b64) {
  return b64.match(/.{1,76}/g)?.join('\r\n') ?? b64;
}

/**
 * Strip HTML tags to produce a plain text fallback.
 */
function htmlToPlainText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Build a multipart/alternative MIME email with deliverability headers.
 * BCC is passed via Destinations (not in headers) so recipients don't see it.
 */
function buildRawMime({ source, to, cc, replyTo, subject, html, text, listUnsubscribeUrl }) {
  const boundary = `=_Part_${Date.now().toString(16)}_${Math.random().toString(16).slice(2)}`;
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
  const plainContent = text || htmlToPlainText(html);

  const headers = [
    `MIME-Version: 1.0`,
    `From: ${source}`,
    `To: ${to}`,
    ...(cc?.length ? [`Cc: ${cc.join(', ')}`] : []),
    `Reply-To: ${replyTo}`,
    `Subject: ${encodedSubject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `X-Mailer: easyucr.com`,
    `Precedence: bulk`,
    ...(listUnsubscribeUrl ? [
      `List-Unsubscribe: <${listUnsubscribeUrl}>`,
      `List-Unsubscribe-Post: List-Unsubscribe=One-Click`,
    ] : []),
  ];

  const parts = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    wrapBase64(Buffer.from(plainContent, 'utf8').toString('base64')),
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    wrapBase64(Buffer.from(html, 'utf8').toString('base64')),
    ``,
    `--${boundary}--`,
  ];

  return [...headers, ``, ...parts].join('\r\n');
}

/**
 * Send a single email via AWS SES.
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} htmlBody - HTML body
 * @param {string} [textBody] - Optional plain text body (auto-generated from HTML if omitted)
 * @param {{ bcc?: string[], cc?: string[], replyTo?: string, listUnsubscribe?: string }} [options]
 * @returns {Promise<{ messageId: string }>}
 */
export async function sendEmail(to, subject, htmlBody, textBody = null, options = {}) {
  const ses = getClient();

  const rawMime = buildRawMime({
    source: SOURCE,
    to,
    cc: options.cc?.length ? options.cc : undefined,
    replyTo: options.replyTo || REPLY_TO,
    subject,
    html: htmlBody,
    text: textBody || null,
    listUnsubscribeUrl: options.listUnsubscribe || null,
  });

  // Destinations includes To + CC + BCC (SES routes to all; BCC not exposed in headers)
  const destinations = [to, ...(options.cc || []), ...(options.bcc || [])];

  const command = new SendRawEmailCommand({
    Source: SOURCE,
    Destinations: destinations,
    RawMessage: { Data: Buffer.from(rawMime, 'utf8') },
  });

  const result = await ses.send(command);
  return { messageId: result.MessageId };
}
