# API Setup Instructions

## Firebase Admin SDK Setup

To use the API routes for uploading files, you need to set up Firebase Admin SDK credentials.

### Step 1: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `modern-eform2290`
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file

### Step 2: Add to Environment Variables

Add these to your `.env.local` file:

```env
# Firebase Admin SDK (from service account JSON)
FIREBASE_PROJECT_ID=modern-eform2290
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@modern-eform2290.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=modern-eform2290.appspot.com
# OR use the newer format:
# FIREBASE_STORAGE_BUCKET=modern-eform2290.firebasestorage.app
# To find your bucket name: Firebase Console → Storage → Settings → Bucket name

# Gemini API Key (already set)
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyCxMEoVEKqb73dILB3iCxCO1rqNTufb_3U
```

**Important Notes:**
- Copy the entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters in the private key
- The private key should be on a single line with `\n` for newlines
- Never commit the `.env.local` file to git

### Step 3: Restart Dev Server

After adding the environment variables, restart your Next.js dev server:

```bash
npm run dev
```

## What This Enables

✅ Server-side file uploads (no CORS issues)  
✅ Secure file handling with authentication  
✅ Direct PDF streaming to Gemini API  
✅ Better error handling and security  

## Troubleshooting

If you see "Firebase Admin not initialized" error:
1. Check that all environment variables are set correctly
2. Make sure the private key includes the BEGIN/END markers
3. Restart the dev server after adding env variables
4. Check that the service account has Storage Admin permissions

