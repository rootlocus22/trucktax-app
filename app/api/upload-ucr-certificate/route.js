import { NextResponse } from 'next/server';
import { adminAuth, adminStorage } from '@/lib/firebase-admin';

/**
 * POST /api/upload-ucr-certificate
 * Upload UCR certificate PDF for agent workflow. UCR-only.
 */
export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.slice(7);
    await adminAuth.verifyIdToken(idToken);

    const formData = await request.formData();
    const file = formData.get('file');
    const filingId = formData.get('filingId');
    if (!file || !filingId) {
      return NextResponse.json({ error: 'Missing file or filingId' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = adminStorage.bucket();
    const path = `filings/${filingId}/ucr-certificate-${Date.now()}.pdf`;
    const fileRef = bucket.file(path);
    await fileRef.save(buffer, { contentType: file.type || 'application/pdf' });
    await fileRef.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading UCR certificate:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
