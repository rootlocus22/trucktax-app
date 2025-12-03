'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is logged in, redirect based on role
    if (!loading && user) {
      if (userData?.role === 'agent') {
        router.push('/agent/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, userData, loading, router]);



  // If user is logged in, don't show landing page (will redirect)
  if (user) {
    return null;
  }

  // Show landing page for non-logged-in users
  return <LandingPage />;
}
