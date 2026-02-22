import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
}

const db = getFirestore();

/**
 * POST /api/ucr/submit-ach
 * Body: { userId, filingPayload, billing, ach, consentGiven }
 * filingPayload: same as Stripe flow (legalName, dotNumber, ucrFee, etc.)
 * billing: { name, address, city, state, postalCode }
 * ach: { accountType: 'personal'|'company', routingNumber, accountNumber }
 * Creates a filing with paymentMethod: 'ach', status: 'pending_ach', and stores
 * ACH details for the agent to use when filing on UCR.gov. Does not charge the user.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, filingPayload, billing, ach, consentGiven } = body;

    if (!userId || !filingPayload) {
      return NextResponse.json({ error: 'userId and filingPayload are required' }, { status: 400 });
    }
    if (!billing?.name || !billing?.address || !billing?.city || !billing?.state || !billing?.postalCode) {
      return NextResponse.json({ error: 'Billing name, address, city, state, and postal code are required' }, { status: 400 });
    }
    if (!ach?.routingNumber || !ach?.accountNumber) {
      return NextResponse.json({ error: 'Routing number and account number are required' }, { status: 400 });
    }
    if (!consentGiven) {
      return NextResponse.json({ error: 'ACH authorization consent is required' }, { status: 400 });
    }

    const routing = String(ach.routingNumber).replace(/\D/g, '');
    if (routing.length !== 9) {
      return NextResponse.json({ error: 'Routing number must be 9 digits' }, { status: 400 });
    }
    const accountNumber = String(ach.accountNumber).replace(/\s/g, '');
    if (accountNumber.length < 4) {
      return NextResponse.json({ error: 'Account number is required' }, { status: 400 });
    }

    const payload = {
      ...filingPayload,
      userId,
      filingType: 'ucr',
      filingYear: filingPayload.filingYear || 2026,
      status: 'pending_ach',
      paymentMethod: 'ach',
      priority: 'high',
      paymentStatus: 'pending',
      paymentRequiredAtDownload: true,
      amountDueOnCertificateDownload: filingPayload.servicePrice ?? 0,
    };

    const now = new Date();
    const filingIdRef = db.collection('filings').doc();
    const filingId = filingIdRef.id;

    await filingIdRef.set({
      ...payload,
      billing: {
        name: billing.name,
        address: billing.address,
        city: billing.city,
        state: billing.state,
        postalCode: billing.postalCode,
      },
      achDetails: {
        accountType: ach.accountType || 'personal',
        routingNumber: routing,
        accountNumberLast4: accountNumber.slice(-4),
        accountNumber,
      },
      achConsentGivenAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      filingId,
      legalName: payload.legalName,
      dotNumber: payload.dotNumber,
      email: payload.email,
      total: payload.total,
      amountDueLater: payload.servicePrice,
    });
  } catch (err) {
    console.error('UCR ACH submit error:', err);
    return NextResponse.json(
      { error: err.message || 'Submission failed' },
      { status: 500 }
    );
  }
}
