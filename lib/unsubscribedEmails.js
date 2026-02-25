import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION = 'unsubscribed_emails';

function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Add an email to the unsubscribed list. Idempotent.
 */
export async function addUnsubscribed(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes('@')) return;
  const ref = adminDb.collection(COLLECTION).doc(normalized);
  await ref.set(
    {
      email: normalized,
      unsubscribedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

/**
 * Check if an email is in the unsubscribed list. Use before sending campaign emails.
 */
export async function isUnsubscribed(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes('@')) return false;
  const ref = adminDb.collection(COLLECTION).doc(normalized);
  const snap = await ref.get();
  return snap.exists;
}
