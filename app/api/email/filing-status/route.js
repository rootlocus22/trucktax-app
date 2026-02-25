import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/ses';
import {
  getFilingSubmittedEmailTemplate,
  getFilingProcessingStartedEmailTemplate,
  getFilingCompletedPayDownloadEmailTemplate,
} from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { filingId, status } = body;

    if (!filingId || !status) {
      return NextResponse.json({ error: 'filingId and status are required' }, { status: 400 });
    }

    const filingRef = adminDb.collection('filings').doc(filingId);
    const filingSnap = await filingRef.get();
    if (!filingSnap.exists) {
      return NextResponse.json({ error: 'Filing not found' }, { status: 404 });
    }

    const filing = filingSnap.data();
    const userId = filing.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Filing has no userId' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();
    const user = userSnap.exists ? userSnap.data() : null;
    const to = filing.email || user?.email;
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: 'No valid email for filing' }, { status: 400 });
    }

    const legalName = filing.legalName || '';
    const amount = filing.servicePrice ?? filing.amountDueOnCertificateDownload ?? 79;

    if (status === 'submitted') {
      const { subject, html } = getFilingSubmittedEmailTemplate({ legalName, filingId, email: to });
      await sendEmail(to, subject, html);
      return NextResponse.json({ ok: true, email: 'submitted' });
    }

    if (status === 'processing') {
      const { subject, html } = getFilingProcessingStartedEmailTemplate({ legalName, filingId, email: to });
      await sendEmail(to, subject, html);
      return NextResponse.json({ ok: true, email: 'processing_started' });
    }

    if (status === 'completed') {
      const { subject, html } = getFilingCompletedPayDownloadEmailTemplate({ legalName, filingId, amount, email: to });
      await sendEmail(to, subject, html);
      return NextResponse.json({ ok: true, email: 'completed_pay_download' });
    }

    return NextResponse.json({ error: 'Unsupported status for email' }, { status: 400 });
  } catch (err) {
    console.error('[email/filing-status]', err);
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 });
  }
}
