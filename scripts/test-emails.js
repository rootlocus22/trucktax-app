#!/usr/bin/env node
/**
 * Test all (or one) email types by sending to the given address.
 * Usage:
 *   node scripts/test-emails.js your@email.com           # send all 6 emails
 *   node scripts/test-emails.js your@email.com welcome     # send only welcome
 *
 * Requires dev server running: npm run dev
 * In development no secret is needed. For production set EMAIL_TEST_SECRET and pass it.
 */

const to = process.argv[2];
const type = process.argv[3] || '';

if (!to || !to.includes('@')) {
  console.error('Usage: node scripts/test-emails.js <to@email.com> [type]');
  console.error('Types: welcome, abandon, invoice, filing_submitted, filing_processing_started, filing_completed');
  console.error('Omit type to send all.');
  process.exit(1);
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const secret = process.env.EMAIL_TEST_SECRET;

async function run() {
  const body = { to: to.trim(), ...(type ? { type: type.trim() } : {}) };
  const headers = {
    'Content-Type': 'application/json',
    ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
  };

  console.log('POST', baseUrl + '/api/email/test', body);
  const res = await fetch(baseUrl + '/api/email/test', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('Error:', res.status, data.error || data);
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
  if (data.results) {
    const failed = data.results.filter((r) => !r.ok);
    if (failed.length) {
      console.error('Failed:', failed);
      process.exit(1);
    }
  }
  console.log('Done. Check inbox for', to);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
