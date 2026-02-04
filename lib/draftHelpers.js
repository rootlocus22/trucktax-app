/**
 * Draft Filing Helpers
 * Manages draft filings that are in progress but not yet submitted
 */

import { db } from './firebase';
import { collection, addDoc, setDoc, doc, getDoc, deleteDoc, query, where, getDocs, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

/**
 * Save a draft filing to Firestore
 * @param {string} userId - User ID
 * @param {Object} draftData - Draft filing data
 * @returns {Promise<string>} - Draft filing ID
 */
export async function saveDraftFiling(userId, draftData) {
  
  const draftsRef = collection(db, 'draftFilings');
  
  const draftFiling = {
    userId,
    ...draftData,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // If draft already exists (has ID), update it; otherwise create new
  if (draftData.draftId) {
    const draftDocRef = doc(db, 'draftFilings', draftData.draftId);
    await setDoc(draftDocRef, {
      ...draftFiling,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return draftData.draftId;
  } else {
    const docRef = await addDoc(draftsRef, draftFiling);
    return docRef.id;
  }
}

/**
 * Get all draft filings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of draft filings
 */
export async function getDraftFilingsByUser(userId) {
  
  const draftsRef = collection(db, 'draftFilings');
  const q = query(
    draftsRef,
    where('userId', '==', userId),
    where('status', '==', 'draft'),
    orderBy('updatedAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    draftId: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null
  }));
}

/**
 * Get all draft filings for a user (regardless of status)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of all draft filings
 */
export async function getAllDraftFilingsByUser(userId) {
  
  const draftsRef = collection(db, 'draftFilings');
  // Query without orderBy to avoid index requirement - we'll sort client-side
  const q = query(
    draftsRef,
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  const drafts = querySnapshot.docs.map(doc => ({
    id: doc.id,
    draftId: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null
  }));
  
  // Sort client-side by updatedAt descending
  return drafts.sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Get a specific draft filing
 * @param {string} draftId - Draft filing ID
 * @returns {Promise<Object|null>} - Draft filing or null
 */
export async function getDraftFiling(draftId) {
  
  const draftDocRef = doc(db, 'draftFilings', draftId);
  const draftDoc = await getDoc(draftDocRef);
  
  if (!draftDoc.exists()) {
    return null;
  }

  return {
    id: draftDoc.id,
    draftId: draftDoc.id,
    ...draftDoc.data(),
    createdAt: draftDoc.data().createdAt?.toDate?.() || null,
    updatedAt: draftDoc.data().updatedAt?.toDate?.() || null
  };
}

/**
 * Delete a draft filing
 * @param {string} draftId - Draft filing ID
 */
export async function deleteDraftFiling(draftId) {
  
  const draftDocRef = doc(db, 'draftFilings', draftId);
  await deleteDoc(draftDocRef);
}

/**
 * Subscribe to draft filings for a user (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} - Unsubscribe function
 */
export function subscribeToDraftFilings(userId, callback) {
  const draftsRef = collection(db, 'draftFilings');
  
  // Try with orderBy first, fallback to simpler query if index missing
  let q;
  try {
    q = query(
      draftsRef,
      where('userId', '==', userId),
      where('status', '==', 'draft'),
      orderBy('updatedAt', 'desc')
    );
  } catch (error) {
    console.warn('Draft filings orderBy index missing, using fallback query:', error);
    q = query(
      draftsRef,
      where('userId', '==', userId),
      where('status', '==', 'draft')
    );
  }

  return onSnapshot(q, (querySnapshot) => {
    let drafts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      draftId: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      updatedAt: doc.data().updatedAt?.toDate?.() || null
    }));
    
    // Sort manually if orderBy wasn't applied
    drafts.sort((a, b) => {
      if (!a.updatedAt || !b.updatedAt) return 0;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
    
    console.log(`Loaded ${drafts.length} draft filings for user ${userId}`);
    callback(drafts);
  }, (error) => {
    console.error('Error in draft filings subscription:', error);
    callback([]); // Return empty array on error
  });
}

