import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getEmailMarketingAllowedEmails, isEmailAllowed } from '@/lib/emailMarketingAllowlist';

async function verifyAccess(req) {
  const authHeader = req.headers.get('authorization');
  const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken) return { error: 'Unauthorized', status: 401 };
  let decoded;
  try { decoded = await adminAuth.verifyIdToken(idToken); } catch { return { error: 'Invalid token', status: 401 }; }
  const callerEmail = decoded.email;
  if (!callerEmail) return { error: 'No email on account', status: 400 };
  const allowedEmails = await getEmailMarketingAllowedEmails();
  if (!isEmailAllowed(allowedEmails, callerEmail)) return { error: 'Access denied', status: 403 };
  return { callerEmail };
}

/**
 * Simple CSV parser that handles quoted fields.
 * Returns array of objects keyed by header row.
 */
function parseCSVText(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = splitCSVLine(line);
    const row = {};
    headers.forEach((h, idx) => { row[h.trim()] = (values[idx] || '').trim(); });
    rows.push(row);
  }
  return rows;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Map CSV row to contact using FMCSA column names or generic column names.
 */
function rowToContact(row) {
  // FMCSA column names
  const email = (row['Email'] || row['email'] || row['EMAIL'] || row['E-Mail'] || '').trim().toLowerCase();
  if (!email || !email.includes('@') || !email.includes('.')) return null;
  return {
    email,
    companyName: (row['Company_Name'] || row['company_name'] || row['Company'] || row['Business_Name'] || row['Name'] || '').trim(),
    contactName: (row['Contact_Name'] || row['contact_name'] || row['Contact'] || row['First_Name'] || '').trim(),
    dotNumber: (row['DOT_Number'] || row['DOT'] || row['dot_number'] || '').toString().trim(),
    fleetBracket: (row['UCR_Fleet_Bracket'] || row['Fleet_Bracket'] || row['fleet_bracket'] || '').trim(),
    govFee: (row['UCR_Gov_Fee_2026'] || row['Gov_Fee'] || row['gov_fee'] || '').trim(),
    totalCost: (row['EasyUCR_Total_2026'] || row['Total_Cost'] || row['total_cost'] || '').trim(),
    state: (row['State'] || row['state'] || '').trim(),
    powerUnits: (row['Power_Units'] || row['power_units'] || '').toString().trim(),
  };
}

/**
 * POST /api/email-marketing/outreach/import
 * Accepts multipart form with:
 *   - file: CSV file
 *   - name: campaign name
 *   - campaignId: template id (default: ucr_outreach)
 *   - bcc: BCC email (optional)
 * Returns: { id, name, total, withEmail, skipped }
 *
 * Stores contacts in Firestore in batches of 500 (Firestore limit).
 * Marks campaign status = 'imported' (ready to send).
 */
export async function POST(req) {
  try {
    const auth = await verifyAccess(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const formData = await req.formData();
    const file = formData.get('file');
    const name = (formData.get('name') || '').trim() || `UCR Outreach — ${new Date().toLocaleDateString()}`;
    const campaignId = (formData.get('campaignId') || 'ucr_outreach').trim();
    const bcc = formData.get('bcc') ? [formData.get('bcc').trim()] : [];

    if (!file || typeof file.text !== 'function') {
      return NextResponse.json({ error: 'No CSV file provided. Send multipart form with field "file".' }, { status: 400 });
    }

    // Read file content
    const text = await file.text();
    const rows = parseCSVText(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty or has no data rows.' }, { status: 400 });
    }

    // Parse contacts
    const contacts = [];
    let skipped = 0;
    for (const row of rows) {
      const contact = rowToContact(row);
      if (!contact) { skipped++; continue; }
      contacts.push(contact);
    }

    if (contacts.length === 0) {
      return NextResponse.json({ error: `No valid email addresses found in ${rows.length} rows. Ensure a column named "Email" exists.` }, { status: 400 });
    }

    // Create campaign in Firestore
    const now = new Date();
    const campaignRef = adminDb.collection('email_outreach_campaigns').doc();
    await campaignRef.set({
      name,
      campaignId,
      status: 'imported',
      total: contacts.length,
      sent: 0,
      failed: 0,
      replied: 0,
      converted: 0,
      pending: contacts.length,
      sentBy: auth.callerEmail,
      bcc,
      sourceFile: file.name || 'uploaded.csv',
      createdAt: now,
      updatedAt: now,
    });

    // Write contacts to subcollection in batches of 500 (Firestore limit)
    const BATCH_SIZE = 500;
    for (let offset = 0; offset < contacts.length; offset += BATCH_SIZE) {
      const batch = adminDb.batch();
      const chunk = contacts.slice(offset, offset + BATCH_SIZE);
      for (const contact of chunk) {
        const contactRef = campaignRef.collection('contacts').doc();
        batch.set(contactRef, { ...contact, status: 'pending', importedAt: now });
      }
      await batch.commit();
    }

    return NextResponse.json({
      id: campaignRef.id,
      name,
      total: contacts.length,
      withEmail: contacts.length,
      skipped,
      status: 'imported',
    });
  } catch (err) {
    console.error('[outreach/import POST]', err);
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 });
  }
}
