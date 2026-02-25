import crypto from 'crypto';

const SECRET = process.env.UNSUBSCRIBE_SECRET || process.env.NEXT_PUBLIC_APP_URL || 'quicktrucktax-unsubscribe';
const EXPIRY_DAYS = 365;

function base64UrlEncode(str) {
  return Buffer.from(str, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return Buffer.from(b64, 'base64').toString('utf8');
}

/**
 * Create a signed token for unsubscribe link. Use in emails only (server-side).
 */
export function createUnsubscribeToken(email) {
  if (!email || typeof email !== 'string') return '';
  const payload = JSON.stringify({
    email: email.trim().toLowerCase(),
    exp: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  });
  const payloadB64 = base64UrlEncode(payload);
  const sig = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${payloadB64}.${sig}`;
}

/**
 * Verify token and return email if valid, else null.
 */
export function verifyUnsubscribeToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET).update(payloadB64).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (expectedSig !== sig) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Date.now() > payload.exp) return null;
    if (!payload.email) return null;
    return payload.email;
  } catch {
    return null;
  }
}
