# Firebase Storage Security Rules Setup

## Important: Deploy Storage Security Rules

To fix the "User does not have permission to access" error for MCS-150 submissions, you need to deploy the Firebase Storage security rules.

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `modern-eform2290`
3. Navigate to **Storage** → **Rules** tab
4. Copy and paste the rules from `storage.rules` file:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Filings - agents can write, authenticated users can read
    match /filings/{filingId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
    }
    
    // MCS-150 Submissions - users can write to their own folder, agents can read all
    match /mcs150-submissions/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Temp uploads - users can write to their own folder
    match /temp-uploads/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Click **Publish** to deploy the rules

### Option 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only storage
```

## What These Rules Do

- **`/filings/{filingId}/**`**: Agents and admins can write, all authenticated users can read
- **`/mcs150-submissions/{userId}/**`**: Users can write to their own folder (based on their user ID), all authenticated users can read
- **`/temp-uploads/{userId}/**`**: Users can write to their own temp folder, all authenticated users can read

## Testing

After deploying the rules, try uploading the driver license and signature again. The upload should now work correctly.

