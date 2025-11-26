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

  // Show loading state while checking auth
  if (loading) {
  return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-navy)] mx-auto"></div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Loading...</p>
        </div>
    </div>
    );
  }

  // If user is logged in, don't show landing page (will redirect)
  if (user) {
    return null;
  }

  // Show landing page for non-logged-in users
  return <LandingPage />;
}
