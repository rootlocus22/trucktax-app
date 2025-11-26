# NorthFlow Tax Portal - Setup Guide

## Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable the following services:
   - Authentication (Email/Password and Google)
   - Firestore Database
   - Storage

3. Create a `.env.local` file in the root directory with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Firestore Security Rules

Set up these security rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own businesses
    match /businesses/{businessId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
    }
    
    // Users can read/write their own vehicles
    match /vehicles/{vehicleId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
    }
    
    // Users can read their own filings, agents can read/write all
    match /filings/{filingId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
      allow write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
    }
  }
}
```

## Storage Security Rules

Set up these security rules in Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /filings/{filingId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'agent' || 
         request.auth.token.role == 'admin');
    }
  }
}
```

## Creating an Agent User

To create an agent user, you'll need to manually update the user's role in Firestore:

1. Go to Firestore Console
2. Navigate to the `users` collection
3. Find the user document
4. Update the `role` field to `"agent"`

Alternatively, you can do this programmatically through the Firebase Console or create a script.

## Running the Application

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000

## Features Implemented

### Customer Portal
- ✅ User authentication (Email/Password and Google)
- ✅ Dashboard showing all filings
- ✅ Multi-step filing wizard:
  - Step 1: Business information (select or create)
  - Step 2: Vehicles (select or create with VIN validation)
  - Step 3: Documents upload (optional)
  - Step 4: Review and submit
- ✅ Filing detail page with status tracking
- ✅ Download Schedule 1 when completed

### Agent Portal
- ✅ Agent queue showing all pending filings
- ✅ Work station with:
  - Customer data view (with copy-to-clipboard functionality)
  - Status update dropdown
  - Notes to customer
  - Schedule 1 PDF upload
- ✅ Automatic status updates
- ✅ File upload to Firebase Storage

## Database Schema

- `users`: User accounts with role (customer/agent/admin)
- `businesses`: Business information linked to users
- `vehicles`: Vehicle information (VIN, weight category, suspended status)
- `filings`: Filing requests with status tracking

## Status Flow

1. `submitted` - User submits filing request
2. `processing` - Agent is working on the filing
3. `action_required` - Agent needs more information from customer
4. `completed` - Filing is done, Schedule 1 is ready

