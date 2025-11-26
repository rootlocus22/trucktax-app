# Firestore Security Rules Setup

## Important: Deploy Firestore Security Rules

To fix the "Missing or insufficient permissions" error, you need to deploy the Firestore security rules to your Firebase project.

### Option 1: Using Firebase Console (Recommended for Quick Setup)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `modern-eform2290`
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy and paste the rules from `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document (including creation)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow creation of own user document
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own businesses
    match /businesses/{businessId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
      // Allow creation if userId matches
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Users can read/write their own vehicles
    match /vehicles/{vehicleId} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
      // Allow creation if userId matches
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
      // Allow creation if userId matches
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

5. Click **Publish** to deploy the rules

### Option 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## What These Rules Do

1. **Users Collection**: Users can create, read, and update their own user document
2. **Businesses Collection**: Users can create and manage their own businesses
3. **Vehicles Collection**: Users can create and manage their own vehicles
4. **Filings Collection**: Users can create and read their own filings; agents can access all filings

## Testing

After deploying the rules:
1. Try signing in with Google again
2. Check the browser console for any permission errors
3. Verify that a user document is created in Firestore under the `users` collection

## Troubleshooting

If you still see permission errors:
1. Make sure you're logged in (check Firebase Auth)
2. Verify the rules were published successfully
3. Check the browser console for specific error messages
4. Ensure your Firebase project ID matches: `modern-eform2290`

