'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * When user is logged in, redirects to /dashboard. Use on home (and any page that should only show to guests).
 */
export default function RedirectLoggedInToDashboard({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-navy)]/20 border-t-[var(--color-navy)] rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-navy)]/20 border-t-[var(--color-navy)] rounded-full animate-spin" />
      </div>
    );
  }

  return children;
}
