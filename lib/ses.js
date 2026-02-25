import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const region = (process.env.AWS_SES_REGION || process.env.AWS_REGION_LOCAL || process.env.AWS_REGION || 'us-east-1').replace(/^'|'$/g, '');
const FROM_EMAIL = process.env.AWS_SES_FROM_EMAIL || 'support@vendaxsystemlabs.com';
const REPLY_TO = process.env.AWS_SES_REPLY_TO || FROM_EMAIL;
// Display name for inbox recognition (e.g. "QuickTruckTax" <support@...>)
const FROM_DISPLAY = process.env.AWS_SES_FROM_DISPLAY || 'QuickTruckTax';
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
 * Send a single email via AWS SES.
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} htmlBody - HTML body
 * @param {string} [textBody] - Optional plain text body
 * @returns {Promise<{ messageId: string }>}
 */
export async function sendEmail(to, subject, htmlBody, textBody = null) {
  const ses = getClient();
  const params = {
    Source: SOURCE,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
        ...(textBody ? { Text: { Data: textBody, Charset: 'UTF-8' } } : {}),
      },
    },
    ReplyToAddresses: [REPLY_TO],
  };
  // Optional: uncomment and set AWS_SES_CONFIGURATION_SET in env only after creating that set in AWS SES
  // if (process.env.AWS_SES_CONFIGURATION_SET?.trim()) params.ConfigurationSetName = process.env.AWS_SES_CONFIGURATION_SET.trim();
  const command = new SendEmailCommand(params);
  const result = await ses.send(command);
  return { messageId: result.MessageId };
}
