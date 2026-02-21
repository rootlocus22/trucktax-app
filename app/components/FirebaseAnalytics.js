'use client';

import { useEffect } from 'react';
import { getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

export default function FirebaseAnalytics() {
    useEffect(() => {
        const initAnalytics = async () => {
            // Check if Firebase is supported in this environment
            const supported = await isSupported();
            if (supported) {
                // Initialize Firebase App if not already initialized
                if (getApps().length === 0) {
                    initializeApp(firebaseConfig);
                }

                // Get the default app (either newly initialized or existing)
                const app = getApps()[0];

                // Initialize Analytics
                getAnalytics(app);
                console.log('Firebase Analytics initialized');
            }
        };

        // Delay Firebase initialization to clear the main thread for LCP and TBT
        const timer = setTimeout(() => {
            initAnalytics();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
