import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (server-side)
let auth, db;
let adminInitialized = false;

try {
  if (!getApps().length) {
    const hasClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasClientEmail || !hasPrivateKey) {
      console.warn('⚠️ Firebase Admin credentials not found.');
      adminInitialized = false;
    } else {
      try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        
        const adminApp = initializeApp({
          credential: cert({
            projectId: projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
        });
        
        auth = getAuth(adminApp);
        db = getFirestore(adminApp);
        adminInitialized = true;
      } catch (initError) {
        console.error('❌ Firebase Admin initialization failed:', initError.message);
        adminInitialized = false;
      }
    }
  } else {
    const adminApp = getApps()[0];
    auth = getAuth(adminApp);
    db = getFirestore(adminApp);
    adminInitialized = true;
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  adminInitialized = false;
}

export async function GET(request) {
  try {
    if (!adminInitialized) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get submission ID from query params
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    // Get submission from Firestore
    const submissionRef = db.collection('mcs150Submissions').doc(submissionId);
    const submissionDoc = await submissionRef.get();

    if (!submissionDoc.exists) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    const submissionData = submissionDoc.data();

    // Check if user has permission (agent or owner)
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const isAgent = userData?.role === 'agent';
    const isOwner = submissionData.userId === decodedToken.uid;

    if (!isAgent && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submissionDoc.id,
        pdfUrl: submissionData.pdfUrl,
        status: submissionData.status,
        createdAt: submissionData.createdAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error getting MCS-150 submission:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get submission' },
      { status: 500 }
    );
  }
}

