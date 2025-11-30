import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (server-side)
let auth, storage, db;
let adminInitialized = false;

try {
  if (!getApps().length) {
    // Check if we have the required credentials
    const hasClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const hasPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasClientEmail || !hasPrivateKey) {
      console.warn('⚠️ Firebase Admin credentials not found.');
      console.warn('Missing:', {
        clientEmail: !hasClientEmail,
        privateKey: !hasPrivateKey
      });
      console.warn('API routes require FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local');
      adminInitialized = false;
    } else {
      try {
        // Validate private key format
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
          throw new Error('Private key format is invalid. It should include BEGIN/END PRIVATE KEY markers.');
        }
        
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        
        console.log('Initializing Firebase Admin with:');
        console.log('  Project ID:', projectId);
        console.log('  Storage Bucket:', storageBucket);
        
        if (!storageBucket) {
          console.warn('⚠️ FIREBASE_STORAGE_BUCKET not set, will use default bucket');
        }
        
        const adminApp = initializeApp({
          credential: cert({
            projectId: projectId,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
          storageBucket: storageBucket,
        });
        
        auth = getAuth(adminApp);
        storage = getStorage(adminApp);
        db = getFirestore(adminApp);
        
        // Test that auth is actually working
        if (!auth || typeof auth.verifyIdToken !== 'function') {
          throw new Error('Auth object is not properly initialized');
        }
        
        adminInitialized = true;
        console.log('✅ Firebase Admin initialized successfully');
        console.log('  Storage bucket configured:', storageBucket || 'default');
      } catch (initError) {
        console.error('❌ Firebase Admin initialization failed:', initError.message);
        console.error('Error details:', initError.stack);
        adminInitialized = false;
        auth = null;
        storage = null;
        db = null;
      }
    }
  } else {
    const adminApp = getApps()[0];
    auth = getAuth(adminApp);
    storage = getStorage(adminApp);
    db = getFirestore(adminApp);
    
    // Verify auth is working
    if (auth && typeof auth.verifyIdToken === 'function') {
      adminInitialized = true;
      console.log('✅ Firebase Admin already initialized');
    } else {
      console.error('❌ Firebase Admin app exists but auth is not working');
      adminInitialized = false;
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  console.error('Error stack:', error.stack);
  adminInitialized = false;
  auth = null;
  storage = null;
  db = null;
}

export async function POST(request) {
  try {
    // Check Firebase Admin initialization
    if (!adminInitialized || !auth || !storage || !db) {
      console.error('Firebase Admin not initialized.');
      console.error('Initialized:', adminInitialized);
      console.error('Auth:', !!auth, 'Storage:', !!storage, 'DB:', !!db);
      console.error('Has Client Email:', !!process.env.FIREBASE_CLIENT_EMAIL);
      console.error('Has Private Key:', !!process.env.FIREBASE_PRIVATE_KEY);
      
      return NextResponse.json(
        { 
          error: 'Firebase Admin not initialized. Please set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local',
          debug: {
            initialized: adminInitialized,
            hasAuth: !!auth,
            hasStorage: !!storage,
            hasDb: !!db,
            hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY
          }
        },
        { status: 500 }
      );
    }

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header received:', authHeader ? 'Present' : 'Missing', authHeader?.substring(0, 20));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Unauthorized - No token provided',
        debug: { hasHeader: !!authHeader, headerStart: authHeader?.substring(0, 20) }
      }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1]?.trim();
    console.log('Token extracted:', idToken ? `Length: ${idToken.length}` : 'NULL');
    
    // Validate token before passing to Firebase
    if (!idToken) {
      return NextResponse.json({ 
        error: 'Unauthorized - Token is null or empty',
        debug: { tokenValue: idToken, tokenType: typeof idToken }
      }, { status: 401 });
    }
    
    if (idToken === 'null' || idToken === 'undefined') {
      return NextResponse.json({ 
        error: 'Unauthorized - Token is string "null" or "undefined"'
      }, { status: 401 });
    }
    
    if (typeof idToken !== 'string') {
      return NextResponse.json({ 
        error: 'Unauthorized - Token is not a string',
        debug: { tokenType: typeof idToken }
      }, { status: 401 });
    }
    
    if (idToken.length < 10) {
      return NextResponse.json({ 
        error: 'Unauthorized - Token too short',
        debug: { tokenLength: idToken.length }
      }, { status: 401 });
    }
    
    // Verify the token
    let decodedToken;
    try {
      // Final validation before calling verifyIdToken
      if (!idToken || typeof idToken !== 'string' || idToken.length === 0) {
        console.error('Token validation failed before verifyIdToken:', {
          isNull: idToken === null,
          isUndefined: idToken === undefined,
          type: typeof idToken,
          length: idToken?.length
        });
        return NextResponse.json({ 
          error: 'Invalid token - Token is null or invalid',
          debug: { tokenType: typeof idToken, tokenLength: idToken?.length }
        }, { status: 401 });
      }
      
      // Ensure auth object is valid
      if (!auth || typeof auth.verifyIdToken !== 'function') {
        console.error('Auth object is invalid:', { hasAuth: !!auth, hasMethod: !!auth?.verifyIdToken });
        return NextResponse.json({ 
          error: 'Authentication service error',
          details: 'Auth object is not properly initialized'
        }, { status: 500 });
      }
      
      console.log('Attempting to verify token, length:', idToken.length, 'first 20 chars:', idToken.substring(0, 20));
      decodedToken = await auth.verifyIdToken(idToken, true); // Check revoked tokens
      console.log('Token verified successfully, user ID:', decodedToken?.uid);
      
      if (!decodedToken || !decodedToken.uid) {
        return NextResponse.json({ error: 'Invalid token - No user ID' }, { status: 401 });
      }
    } catch (error) {
      console.error('Token verification error:', error.message, error.code);
      console.error('Error name:', error.name);
      console.error('Error stack:', error.stack);
      
      // Check if it's the specific "payload" error
      if (error.message?.includes('payload') || error.code === 'ERR_INVALID_ARG_TYPE') {
        console.error('CRITICAL: Token or auth object is null when calling verifyIdToken');
        return NextResponse.json({ 
          error: 'Authentication service error - Token validation failed',
          details: 'The authentication token could not be processed. Please try logging in again.',
          code: error.code
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'Invalid or expired token', 
        details: error.message,
        code: error.code
      }, { status: 401 });
    }

    const userId = decodedToken.uid;
    console.log('Processing upload for user:', userId);

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const filingId = formData.get('filingId');

    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    // filingId is optional - can be 'temp' for initial upload before filing creation
    const isTempFiling = !filingId || filingId === 'temp';

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    // Convert file to buffer
    let buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      console.log('File converted to buffer, size:', buffer.length);
    } catch (bufferError) {
      console.error('Error converting file to buffer:', bufferError);
      throw new Error('Failed to process file: ' + bufferError.message);
    }

    // Upload to Firebase Storage
    let publicUrl;
    let fileName;
    try {
      // Get bucket name from env or construct from project ID
      let bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      
      // If no bucket name, try default format
      if (!bucketName && projectId) {
        // Try common bucket name formats
        bucketName = `${projectId}.appspot.com`;
        console.log('No bucket name in env, using default format:', bucketName);
      }
      
      if (!bucketName) {
        throw new Error('FIREBASE_STORAGE_BUCKET is not set and cannot be determined from project ID');
      }
      
      console.log('Using storage bucket:', bucketName);
      
      const bucket = storage.bucket(bucketName);
      if (!bucket) {
        throw new Error(`Storage bucket "${bucketName}" is not available`);
      }
      
      // Try to verify bucket exists (but don't fail if metadata check fails)
      try {
        await bucket.getMetadata();
        console.log('✅ Bucket verified:', bucketName);
      } catch (metadataError) {
        console.warn('⚠️ Could not verify bucket metadata, proceeding anyway:', metadataError.message);
        // Continue anyway - the upload will fail if bucket doesn't exist
      }
      
      // Use a temporary path if filingId is 'temp' or missing
      const storagePath = isTempFiling 
        ? `temp-uploads/${userId}/schedule1-${Date.now()}.pdf`
        : `filings/${filingId}/input-docs/schedule1-${Date.now()}.pdf`;
      fileName = storagePath;
      const fileRef = bucket.file(fileName);
      
      console.log('Uploading file to:', fileName, 'in bucket:', bucketName);

      await fileRef.save(buffer, {
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });
      
      console.log('File uploaded successfully');

      // Generate signed URL (valid for 1 year) instead of making public
      try {
        const [signedUrl] = await fileRef.getSignedUrl({
          action: 'read',
          expires: '03-09-2491', // Far future date
        });
        publicUrl = signedUrl;
        console.log('Signed URL generated');
      } catch (urlError) {
        console.error('Error generating signed URL:', urlError);
        // Fallback to public URL if signed URL fails
        await fileRef.makePublic();
        publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log('Using public URL as fallback');
      }
    } catch (storageError) {
      console.error('Error uploading to Firebase Storage:', storageError);
      throw new Error('Failed to upload to storage: ' + storageError.message);
    }

    // Get form data (already read above, but get isFinal flag)
    const isFinal = formData.get('isFinal') === 'true';
    
    console.log('Upload request - isFinal:', isFinal, 'filingId:', filingId, 'isTemp:', isTempFiling);
    
    // Only update Firestore if we have a valid filingId (not 'temp')
    if (!isTempFiling && filingId) {
      const updateData = {
        updatedAt: new Date(),
      };

      if (isFinal) {
        // Agent uploading final Schedule 1
        updateData.finalSchedule1Url = publicUrl;
        updateData.status = 'completed';
        console.log('Updating as final Schedule 1 and marking as completed');
      } else {
        // Customer uploading input document
        updateData.schedule1Url = publicUrl;
        // Get existing inputDocuments or create new array
        try {
          const filingDoc = await db.collection('filings').doc(filingId).get();
          if (filingDoc.exists) {
            const existingInputDocs = filingDoc.data()?.inputDocuments || [];
            updateData.inputDocuments = [...existingInputDocs, publicUrl];
            console.log('Updating as input document');
          } else {
            // Filing doesn't exist yet, just set inputDocuments
            updateData.inputDocuments = [publicUrl];
            console.log('Filing does not exist yet, setting inputDocuments');
          }
        } catch (docError) {
          console.warn('Error reading filing document:', docError?.message || 'Unknown error');
          // Continue with just the URL
          updateData.inputDocuments = [publicUrl];
        }
      }

      // Update filing in Firestore
      try {
        const filingRef = db.collection('filings').doc(filingId);
        await filingRef.update(updateData);
        console.log('Filing updated in Firestore successfully');
      } catch (firestoreError) {
        // Safely log the error without causing issues
        const errorMessage = firestoreError?.message || 'Unknown error';
        const errorCode = firestoreError?.code || 'UNKNOWN';
        console.error('Error updating Firestore:', errorMessage);
        console.error('Error code:', errorCode);
        
        // Don't fail the whole request if Firestore update fails
        // The file is already uploaded
        console.warn('File uploaded but Firestore update failed - file URL:', publicUrl);
      }
    } else {
      console.log('Skipping Firestore update - temporary upload (filing will be created later)');
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName || 'schedule1.pdf',
    });

  } catch (error) {
    // Safely log error information
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace';
    const errorName = error?.name || 'Error';
    const errorCode = error?.code || 'UNKNOWN';
    
    console.error('Error uploading Schedule 1:', errorMessage);
    if (errorStack && errorStack !== 'No stack trace') {
      console.error('Error stack:', errorStack);
    }
    console.error('Error name:', errorName);
    console.error('Error code:', errorCode);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        details: error.message,
        code: error.code,
        name: error.name
      },
      { status: 500 }
    );
  }
}

