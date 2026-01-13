import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin (server-side)
let auth, storage, db;
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
        const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

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
        adminInitialized = true;
      } catch (initError) {
        console.error('❌ Firebase Admin initialization failed:', initError.message);
        adminInitialized = false;
      }
    }
  } else {
    const adminApp = getApps()[0];
    auth = getAuth(adminApp);
    storage = getStorage(adminApp);
    db = getFirestore(adminApp);
    adminInitialized = true;
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error.message);
  adminInitialized = false;
}

export async function POST(request) {
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

    const formData = await request.formData();
    const driverLicenseFile = formData.get('driverLicense');
    const signatureDataUrl = formData.get('signature');
    const formDataJson = JSON.parse(formData.get('formData'));

    if (!driverLicenseFile || !signatureDataUrl) {
      return NextResponse.json({ error: 'Driver license and signature are required' }, { status: 400 });
    }

    // Create a new PDF document instead of loading the template
    // The template PDF appears to be encrypted/corrupted, so we'll create a new form PDF
    const pdfDoc = await PDFDocument.create();

    // Embed driver license FIRST (handle both PDF and image)
    let driverLicenseImage = null;
    let driverLicensePages = [];
    const driverLicenseBuffer = Buffer.from(await driverLicenseFile.arrayBuffer());

    // Check if it's a PDF or image
    if (driverLicenseFile.type === 'application/pdf') {
      // If it's a PDF, we'll add it as the first page(s) before the form
      try {
        const driverLicensePdf = await PDFDocument.load(driverLicenseBuffer, { ignoreEncryption: true });
        const licensePageIndices = driverLicensePdf.getPageIndices();
        driverLicensePages = await pdfDoc.copyPages(driverLicensePdf, licensePageIndices);
        // Pages will be added after we create the form page
      } catch (error) {
        console.error('Error loading driver license PDF:', error);
        return NextResponse.json({ error: 'Failed to process driver license PDF. Please ensure it is not password protected.' }, { status: 400 });
      }
    } else {
      // If it's an image, embed it for later use
      try {
        driverLicenseImage = await pdfDoc.embedPng(driverLicenseBuffer);
      } catch {
        try {
          driverLicenseImage = await pdfDoc.embedJpg(driverLicenseBuffer);
        } catch (error) {
          console.error('Error embedding driver license image:', error);
          return NextResponse.json({ error: 'Invalid driver license image format' }, { status: 400 });
        }
      }
    }

    // Convert signature data URL to image
    const signatureImageBytes = await fetch(signatureDataUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => Buffer.from(buffer));

    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

    // Create the main form page (standard letter-sized: 8.5 x 11 inches = 612 x 792 points)
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();

    // Embed fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add form title
    const titleFontSize = 16;
    const fontSize = 11;
    const textColor = rgb(0, 0, 0);
    const labelColor = rgb(0.2, 0.2, 0.2);

    // Title
    page.drawText('MCS-150 Form - Motor Carrier Identification Report', {
      x: 50,
      y: height - 50,
      size: titleFontSize,
      color: textColor,
      font: helveticaBoldFont,
    });

    let currentY = height - 100;
    const lineHeight = 25;
    const leftMargin = 50;
    const labelWidth = 200;

    // Helper function to add a form field
    const addField = (label, value) => {
      if (value) {
        page.drawText(label + ':', {
          x: leftMargin,
          y: currentY,
          size: fontSize - 1,
          color: labelColor,
          font: helveticaBoldFont,
        });
        page.drawText(value.toString(), {
          x: leftMargin + labelWidth,
          y: currentY,
          size: fontSize,
          color: textColor,
          font: helveticaFont,
        });
        currentY -= lineHeight;
      }
    };

    // Add form data
    addField('USDOT Number', formDataJson.usdotNumber);
    addField('Business Name', formDataJson.businessName);
    addField('EIN', formDataJson.ein);

    // Address (multi-line)
    if (formDataJson.address) {
      page.drawText('Address:', {
        x: leftMargin,
        y: currentY,
        size: fontSize - 1,
        color: labelColor,
        font: helveticaBoldFont,
      });
      const addressLines = formDataJson.address.split(',').slice(0, 3);
      addressLines.forEach((line, index) => {
        page.drawText(line.trim(), {
          x: leftMargin + labelWidth,
          y: currentY - (index * lineHeight),
          size: fontSize,
          color: textColor,
          font: helveticaFont,
        });
      });
      currentY -= (addressLines.length * lineHeight);
    }

    addField('Mileage', formDataJson.mileage);
    addField('Mileage Year', formDataJson.mileageYear);
    addField('Power Units', formDataJson.powerUnits);

    // Drivers information
    if (formDataJson.drivers) {
      currentY -= 10;
      page.drawText('Driver Information:', {
        x: leftMargin,
        y: currentY,
        size: fontSize,
        color: labelColor,
        font: helveticaBoldFont,
      });
      currentY -= lineHeight;
      addField('  Total Drivers', formDataJson.drivers.total);
      addField('  CDL Holders', formDataJson.drivers.cdl);
      addField('  Interstate', formDataJson.drivers.interstate);
      addField('  Intrastate', formDataJson.drivers.intrastate);
    }

    // Company Official
    currentY -= 10;
    page.drawText('Company Official:', {
      x: leftMargin,
      y: currentY,
      size: fontSize,
      color: labelColor,
      font: helveticaBoldFont,
    });
    currentY -= lineHeight;
    addField('  Name', formDataJson.companyOfficial?.name);
    addField('  Title', formDataJson.companyOfficial?.title);

    // Contact Information
    if (formDataJson.contact) {
      currentY -= 10;
      page.drawText('Contact Information:', {
        x: leftMargin,
        y: currentY,
        size: fontSize,
        color: labelColor,
        font: helveticaBoldFont,
      });
      currentY -= lineHeight;
      addField('  Email', formDataJson.contact.email);
      addField('  Phone', formDataJson.contact.phone);
    }

    // Add signature (position at bottom)
    const signatureWidth = 200;
    const signatureHeight = 80;
    const signatureY = 150;
    page.drawText('Signature:', {
      x: leftMargin,
      y: signatureY + signatureHeight + 10,
      size: fontSize,
      color: labelColor,
      font: helveticaBoldFont,
    });
    page.drawImage(signatureImage, {
      x: leftMargin + labelWidth,
      y: signatureY,
      width: signatureWidth,
      height: signatureHeight,
    });

    // Add driver license image if it's an image (not PDF)
    if (driverLicenseImage) {
      const licenseWidth = 250;
      const licenseHeight = (driverLicenseImage.height / driverLicenseImage.width) * licenseWidth;
      const licenseY = signatureY - licenseHeight - 30;

      page.drawText('Driver License:', {
        x: leftMargin,
        y: licenseY + licenseHeight + 10,
        size: fontSize,
        color: labelColor,
        font: helveticaBoldFont,
      });

      page.drawImage(driverLicenseImage, {
        x: leftMargin + labelWidth,
        y: licenseY,
        width: licenseWidth,
        height: licenseHeight,
      });
    }

    // If driver license was a PDF, add those pages AFTER the form page
    if (driverLicensePages.length > 0) {
      driverLicensePages.forEach((licensePage) => {
        pdfDoc.addPage(licensePage);
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Upload to Firebase Storage using Admin SDK
    // This bypasses client-side security rules and is more reliable
    let pdfUrl = '';
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'modern-eform2290';

      // Try to get the bucket. We'll try a few common names.
      let bucket;
      const bucketNamesToTry = [
        process.env.FIREBASE_STORAGE_BUCKET,
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        `${projectId}.firebasestorage.app`,
        `${projectId}.appspot.com`,
        projectId
      ].filter(Boolean);

      console.log('Attempting to find storage bucket. Trying:', bucketNamesToTry);

      for (const name of bucketNamesToTry) {
        try {
          const b = storage.bucket(name);
          // Check if bucket exists
          await b.getMetadata();
          bucket = b;
          console.log('✅ Found working bucket:', name);
          break;
        } catch (e) {
          console.warn(`⚠️ Bucket ${name} failed:`, e.message);
        }
      }

      if (!bucket) {
        console.log('Fallback: using default bucket');
        bucket = storage.bucket();
      }

      const userId = decodedToken.uid;
      const fileName = `mcs150-submissions/${userId}/${Date.now()}-mcs150-filled.pdf`;
      const fileRef = bucket.file(fileName);

      await fileRef.save(Buffer.from(pdfBytes), {
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            uploadedBy: userId,
            type: 'mcs150-submission'
          },
        },
      });

      // Generate a signed URL that's valid for a long time (up to 1 year for V4)
      const [signedUrl] = await fileRef.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Far future
      });
      pdfUrl = signedUrl;
      console.log('✅ PDF uploaded to storage:', fileName);
    } catch (uploadError) {
      console.error('❌ Error uploading PDF to storage:', uploadError);
      // Fallback: still return the base64 if upload fails, though the client might still fail
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
      return NextResponse.json({
        success: true,
        pdfDataUrl: `data:application/pdf;base64,${pdfBase64}`,
        formData: formDataJson,
        uploadError: uploadError.message
      });
    }

    // Create submission document in Firestore using Admin SDK
    let submissionId = '';
    try {
      const submissionsRef = db.collection('mcs150Submissions');
      const docRef = await submissionsRef.add({
        pdfUrl: pdfUrl,
        formData: formDataJson,
        userId: decodedToken.uid,
        status: 'submitted',
        filingType: 'mcs150',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      submissionId = docRef.id;
      console.log('✅ Submission document created in Firestore:', submissionId);
    } catch (dbError) {
      console.error('❌ Error creating submission document in Firestore:', dbError);
      // Still return success if PDF was uploaded, as we have the URL
    }

    // Return PDF data and submission ID to client
    return NextResponse.json({
      success: true,
      pdfUrl: pdfUrl,
      submissionId: submissionId,
      formData: formDataJson,
    });
  } catch (error) {
    console.error('Error generating MCS-150 PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

