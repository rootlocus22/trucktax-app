'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser, createUser } from '@/lib/db';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Firebase Auth automatically restores the session from localStorage
    // onAuthStateChanged will fire immediately with the persisted user if available
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user data from Firestore
        try {
          let data = null;
          try {
            data = await getUser(firebaseUser.uid);
          } catch (getUserError) {
            // Suppress AbortErrors from browser extensions
            if (getUserError?.name !== 'AbortError' && !getUserError?.message?.includes('aborted')) {
              throw getUserError;
            }
            // If it's an AbortError, continue with data = null
          }
          
          if (!data) {
            // Create user record if it doesn't exist (for Google sign-in or any other provider)
            console.log('User record not found, creating new record for:', firebaseUser.uid);
            try {
              await createUser(firebaseUser.uid, {
                email: firebaseUser.email,
                role: 'customer',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                photoURL: firebaseUser.photoURL || null
              });
              // Fetch the newly created user data
              data = await getUser(firebaseUser.uid);
              console.log('User record created successfully in onAuthStateChanged');
              firebaseUser.getIdToken().then((token) => {
                setTimeout(() => {
                  fetch('/api/email/welcome', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
                }, 800);
              }).catch(() => {});
            } catch (createError) {
              // Only log detailed error if it's not a permission error
              if (createError.code !== 'permission-denied' && !createError.message?.includes('permission')) {
                console.error('Error creating user record in onAuthStateChanged:', createError);
                console.error('Error code:', createError.code);
                console.error('Error message:', createError.message);
              } else {
                // Silent permission error - user will still be able to use the app
                // The Firestore rules need to be deployed for user creation to work
                console.warn('⚠️ Firestore permissions not configured. User can still use the app, but user data won\'t be saved. Please deploy firestore.rules to Firebase Console.');
              }
              
              // Set minimal user data even if creation fails
              // This allows the app to continue working
              setUserData({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                role: 'customer',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
              });
            }
          }
          
          if (data) {
            setUserData(data);
          }
        } catch (error) {
          // Only log non-permission errors to avoid console spam
          if (error.code !== 'permission-denied' && !error.message?.includes('permission')) {
            console.error('Error fetching/creating user data:', error);
          }
          
          // Set minimal user data even if Firestore operations fail
          // This allows the app to continue working even without Firestore access
          setUserData({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'customer',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
          });
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email, password, userData = {}) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await createUser(result.user.uid, {
      email,
      role: 'customer',
      ...userData
    });
    result.user.getIdToken().then((token) => {
      setTimeout(() => {
        fetch('/api/email/welcome', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
      }, 800);
    }).catch(() => {});
    return result;
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Ensure user record exists in Firestore
      const data = await getUser(result.user.uid);
      if (!data) {
        console.log('Creating new user record for Google sign-in:', result.user.uid);
        try {
          await createUser(result.user.uid, {
            email: result.user.email,
            role: 'customer',
            displayName: result.user.displayName || result.user.email?.split('@')[0] || 'User',
            photoURL: result.user.photoURL || null
          });
          console.log('User record created successfully');
          result.user.getIdToken().then((token) => {
            setTimeout(() => {
              fetch('/api/email/welcome', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
            }, 800);
          }).catch(() => {});
        } catch (createError) {
          console.error('Error creating user record:', createError);
          // Don't throw - the onAuthStateChanged will handle it
        }
      } else {
        console.log('User record already exists');
      }
      
      return result;
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

