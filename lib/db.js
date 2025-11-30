import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Users collection helpers
export async function createUser(uid, userData) {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Check if user already exists
    const existingUser = await getDoc(userRef);
    
    if (existingUser.exists()) {
      // User exists, only update the fields that might have changed
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      console.log('User updated in Firestore:', uid);
    } else {
      // New user, create with createdAt
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('User created in Firestore:', uid);
    }
    
    return userRef;
  } catch (error) {
    // Only log non-permission errors to avoid console spam
    if (error.code !== 'permission-denied' && !error.message?.includes('permission')) {
      console.error('Error in createUser:', error);
    }
    throw error;
  }
}

export async function getUser(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    }
    return null;
  } catch (error) {
    // Suppress AbortErrors from browser extensions
    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      // Return null silently - this is likely a browser extension interfering
      return null;
    }
    // Re-throw other errors
    throw error;
  }
}

// Businesses collection helpers
export async function createBusiness(userId, businessData) {
  const businessesRef = collection(db, 'businesses');
  const docRef = await addDoc(businessesRef, {
    ...businessData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getBusinessesByUser(userId) {
  const businessesRef = collection(db, 'businesses');
  const q = query(businessesRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getBusiness(businessId) {
  const businessRef = doc(db, 'businesses', businessId);
  const businessSnap = await getDoc(businessRef);
  if (businessSnap.exists()) {
    return { id: businessSnap.id, ...businessSnap.data() };
  }
  return null;
}

export async function updateBusiness(businessId, updates) {
  const businessRef = doc(db, 'businesses', businessId);
  await updateDoc(businessRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

// Vehicles collection helpers
export async function createVehicle(userId, vehicleData) {
  const vehiclesRef = collection(db, 'vehicles');
  const docRef = await addDoc(vehiclesRef, {
    ...vehicleData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getVehiclesByUser(userId) {
  const vehiclesRef = collection(db, 'vehicles');
  const q = query(vehiclesRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getVehicle(vehicleId) {
  const vehicleRef = doc(db, 'vehicles', vehicleId);
  const vehicleSnap = await getDoc(vehicleRef);
  if (vehicleSnap.exists()) {
    return { id: vehicleSnap.id, ...vehicleSnap.data() };
  }
  return null;
}

export async function updateVehicle(vehicleId, updates) {
  const vehicleRef = doc(db, 'vehicles', vehicleId);
  await updateDoc(vehicleRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

// Filings collection helpers
export async function createFiling(filingData) {
  const filingsRef = collection(db, 'filings');
  const docRef = await addDoc(filingsRef, {
    ...filingData,
    status: 'submitted',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getFilingsByUser(userId) {
  const filingsRef = collection(db, 'filings');
  const q = query(
    filingsRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null
  }));
}

// Real-time subscription to user filings
export function subscribeToUserFilings(userId, callback) {
  const filingsRef = collection(db, 'filings');
  const q = query(
    filingsRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const filings = querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      updatedAt: doc.data().updatedAt?.toDate?.() || null
    }));
    callback(filings);
  }, (error) => {
    console.error('Error in filings subscription:', error);
  });
}

// Real-time subscription to a single filing
export function subscribeToFiling(filingId, callback) {
  const filingRef = doc(db, 'filings', filingId);
  
  return onSnapshot(filingRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({ 
        id: docSnap.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in filing subscription:', error);
  });
}

export async function getFiling(filingId) {
  const filingRef = doc(db, 'filings', filingId);
  const filingSnap = await getDoc(filingRef);
  if (filingSnap.exists()) {
    const data = filingSnap.data();
    return { 
      id: filingSnap.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null
    };
  }
  return null;
}

export async function updateFiling(filingId, updates) {
  const filingRef = doc(db, 'filings', filingId);
  await updateDoc(filingRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

// Agent queue helpers
export async function getAgentQueue() {
  try {
    const filingsRef = collection(db, 'filings');
    
    // Try the optimized query first (requires composite index)
    let querySnapshot;
    try {
      const q = query(
        filingsRef,
        where('status', 'in', ['submitted', 'processing', 'action_required']),
        orderBy('createdAt', 'asc')
      );
      querySnapshot = await getDocs(q);
      console.log('Query successful with orderBy');
    } catch (indexError) {
      // If composite index is missing, fall back to simpler query
      console.warn('Composite index missing, using fallback query:', indexError);
      try {
        const q = query(
          filingsRef,
          where('status', 'in', ['submitted', 'processing', 'action_required'])
        );
        querySnapshot = await getDocs(q);
        console.log('Query successful without orderBy');
      } catch (queryError) {
        // If that also fails, try getting all filings and filter client-side
        console.warn('Status query failed, trying to get all filings:', queryError);
        const allFilingsQuery = query(filingsRef);
        querySnapshot = await getDocs(allFilingsQuery);
        console.log('Got all filings, will filter client-side');
      }
    }
    
    let filings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    });
    
    // Always filter by status to ensure we only get the right ones
    filings = filings.filter(f => 
      f.status && ['submitted', 'processing', 'action_required'].includes(f.status)
    );
    
    console.log(`Filtered to ${filings.length} filings with status: submitted, processing, or action_required`);
    
    // Sort manually if orderBy failed
    filings.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
    
    // Fetch user and business details for each filing
    const filingsWithDetails = await Promise.all(
      filings.map(async (filing) => {
        let user = null;
        let business = null;
        
        // Try to load user
        if (filing.userId) {
          try {
            user = await getUser(filing.userId);
            if (!user) {
              console.warn(`User not found for filing ${filing.id}, userId: ${filing.userId}`);
            }
          } catch (err) {
            console.error(`Error loading user for filing ${filing.id}:`, err);
          }
        } else {
          console.warn(`Filing ${filing.id} has no userId`);
        }
        
        // Try to load business (may be null for Schedule 1 uploads)
        if (filing.businessId) {
          try {
            business = await getBusiness(filing.businessId);
            if (!business) {
              console.warn(`Business not found for filing ${filing.id}, businessId: ${filing.businessId}`);
            }
          } catch (err) {
            console.error(`Error loading business for filing ${filing.id}:`, err);
          }
        } else {
          console.log(`Filing ${filing.id} has no businessId (may be from Schedule 1 upload)`);
        }
        
        return {
          ...filing,
          user,
          business
        };
      })
    );
    
    console.log('Filings with details:', filingsWithDetails.map(f => ({
      id: f.id,
      userId: f.userId,
      businessId: f.businessId,
      hasUser: !!f.user,
      hasBusiness: !!f.business,
      userEmail: f.user?.email,
      businessName: f.business?.businessName
    })));
    
    return filingsWithDetails;
  } catch (error) {
    console.error('Error in getAgentQueue:', error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
}

export async function getAllFilings() {
  const filingsRef = collection(db, 'filings');
  const q = query(filingsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null
    };
  });
}

// Real-time subscription to agent queue
export function subscribeToAgentQueue(callback) {
  const filingsRef = collection(db, 'filings');
  
  // Try to create optimized query with orderBy
  let q;
  try {
    q = query(
      filingsRef,
      where('status', 'in', ['submitted', 'processing', 'action_required']),
      orderBy('createdAt', 'asc')
    );
  } catch (error) {
    // Fallback to simpler query if index is missing
    console.warn('Composite index missing, using fallback query for subscription');
    q = query(
      filingsRef,
      where('status', 'in', ['submitted', 'processing', 'action_required'])
    );
  }
  
  return onSnapshot(q, async (querySnapshot) => {
    let filings = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    });

    // Always filter by status to ensure we only get the right ones
    filings = filings.filter(f => 
      f.status && ['submitted', 'processing', 'action_required'].includes(f.status)
    );

    // Sort manually if orderBy wasn't applied
    filings.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Load user and business details for each filing
    const filingsWithDetails = await Promise.all(
      filings.map(async (filing) => {
        let user = null;
        let business = null;
        
        // Try to load user
        if (filing.userId) {
          try {
            user = await getUser(filing.userId);
          } catch (err) {
            console.error(`Error loading user for filing ${filing.id}:`, err);
          }
        }
        
        // Try to load business
        if (filing.businessId) {
          try {
            business = await getBusiness(filing.businessId);
          } catch (err) {
            console.error(`Error loading business for filing ${filing.id}:`, err);
          }
        }
        
        return {
          ...filing,
          user,
          business
        };
      })
    );

    callback(filingsWithDetails);
  }, (error) => {
    console.error('Error in agent queue subscription:', error);
    // Call callback with empty array on error to prevent UI crash
    callback([]);
  });
}

