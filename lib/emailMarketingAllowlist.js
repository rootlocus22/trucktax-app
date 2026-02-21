import { adminDb } from '@/lib/firebase-admin';

const CONFIG_COLLECTION = 'config';
const DOC_ID = 'emailMarketing';
const FIELD_ALLOWED_EMAILS = 'allowedEmails';

/**
 * Returns the list of emails allowed to access /email-marketing (and send emails).
 * Stored in Firestore: config/emailMarketing.allowedEmails (array of strings).
 */
export async function getEmailMarketingAllowedEmails() {
  const ref = adminDb.collection(CONFIG_COLLECTION).doc(DOC_ID);
  const snap = await ref.get();
  const data = snap.exists ? snap.data() : null;
  const list = data?.[FIELD_ALLOWED_EMAILS];
  if (!Array.isArray(list)) return [];
  return list.map((e) => String(e).trim().toLowerCase()).filter(Boolean);
}

export function isEmailAllowed(allowedEmails, email) {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  return allowedEmails.includes(normalized);
}
