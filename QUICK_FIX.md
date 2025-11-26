# Quick Fix for Permission Errors

## The Problem
You're seeing: `FirebaseError: Missing or insufficient permissions`

This happens because Firestore security rules haven't been deployed yet.

## Quick Solution (2 minutes)

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com
2. Select project: **modern-eform2290**
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab

### Step 2: Copy & Paste These Rules

Copy the entire content from `firestore.rules` file, or use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document (including creation)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own businesses
    match /businesses/{businessId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Users can read/write their own vehicles
    match /vehicles/{vehicleId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Users can read their own filings, agents can read/write all
    match /filings/{filingId} {
      allow read: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
      allow write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Step 3: Publish
1. Click **Publish** button
2. Wait for confirmation
3. Refresh your app

## What This Fixes
✅ Google sign-in will create user records in Firestore  
✅ Users can create businesses, vehicles, and filings  
✅ No more permission errors  

## Note
The app will still work even without these rules (it uses minimal user data), but user data won't be saved to Firestore until rules are deployed.

