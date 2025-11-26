'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Download } from 'lucide-react';

export function Schedule1Listener() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const notifiedSchedule1s = useRef(new Set());
  const previousSchedule1Urls = useRef(new Map());

  useEffect(() => {
    if (!user) return;

    // Load previously notified Schedule 1s from localStorage
    const storageKey = `notified_schedule1_${user.uid}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const notifiedIds = JSON.parse(stored);
        notifiedSchedule1s.current = new Set(notifiedIds);
      }
    } catch (e) {
      console.error('Error loading notified Schedule 1s:', e);
    }

    const filingsRef = collection(db, 'filings');
    const q = query(
      filingsRef, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Only process document changes, not the full snapshot
      querySnapshot.docChanges().forEach((change) => {
        // Only process modified documents (new uploads)
        if (change.type === 'modified') {
          const filingData = change.doc.data();
          const filingId = change.doc.id;
          
          // Check if finalSchedule1Url was just added
          const previousUrl = previousSchedule1Urls.current.get(filingId);
          const currentUrl = filingData.finalSchedule1Url;
          
          // Only notify if:
          // 1. finalSchedule1Url exists now
          // 2. It didn't exist before (or was different)
          // 3. We haven't already notified for this specific Schedule 1
          if (currentUrl && previousUrl !== currentUrl) {
            // Create a unique key for this Schedule 1 (filingId + URL hash)
            const notificationKey = `${filingId}_${currentUrl}`;
            
            // Check if we've already notified for this specific Schedule 1
            if (!notifiedSchedule1s.current.has(notificationKey)) {
              // Mark as notified
              notifiedSchedule1s.current.add(notificationKey);
              
              // Save to localStorage
              try {
                localStorage.setItem(storageKey, JSON.stringify(Array.from(notifiedSchedule1s.current)));
              } catch (e) {
                console.error('Error saving notified Schedule 1s:', e);
              }
              
              // Show notification
              addNotification({
                type: 'schedule1',
                title: 'Schedule 1 Ready!',
                message: `Your Schedule 1 for tax year ${filingData.taxYear || 'N/A'} is ready for download.`,
                persistent: true,
                action: {
                  label: 'View Schedule 1',
                  href: `/dashboard/schedule1`,
                  icon: Download,
                },
              });
            }
          }
          
          // Update the previous URL for this filing
          previousSchedule1Urls.current.set(filingId, currentUrl || null);
        } else if (change.type === 'added') {
          // For new documents, just track the initial state
          const filingData = change.doc.data();
          const filingId = change.doc.id;
          previousSchedule1Urls.current.set(filingId, filingData.finalSchedule1Url || null);
        }
      });
    }, (error) => {
      console.error('Error in Schedule 1 subscription:', error);
    });

    return () => unsubscribe();
  }, [user, addNotification]);

  return null;
}

