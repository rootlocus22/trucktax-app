#!/usr/bin/env node
/**
 * One-time seed: create Firestore config/emailMarketing with allowedEmails so
 * /email-marketing is accessible. Add more emails later by editing that document in Firestore.
 *
 * Usage: node scripts/seed-email-marketing-allowlist.js
 * Requires Firebase Admin env vars in .env.local (or service-account-key.json).
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

const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  if (serviceAccount.privateKey && serviceAccount.clientEmail) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    try {
      const keyPath = path.join(__dirname, '..', 'service-account-key.json');
      admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
    } catch (e) {
      console.error('Firebase Admin: set FIREBASE_* in .env.local or add service-account-key.json');
      process.exit(1);
    }
  }
}

const db = admin.firestore();
const DEFAULT_ALLOWED_EMAILS = ['rahuldubey220890@gmail.com'];

async function run() {
  const ref = db.collection('config').doc('emailMarketing');
  const snap = await ref.get();
  if (snap.exists) {
    console.log('config/emailMarketing already exists. allowedEmails:', snap.data()?.allowedEmails);
    console.log('Edit that document in Firestore to add or remove emails.');
    return;
  }
  await ref.set({ allowedEmails: DEFAULT_ALLOWED_EMAILS, updatedAt: new Date() });
  console.log('Created config/emailMarketing with allowedEmails:', DEFAULT_ALLOWED_EMAILS);
  console.log('Sign in with one of these emails to access /email-marketing.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
