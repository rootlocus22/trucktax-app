'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Redirect agents away from consumer pages
      if (!requiredRole && userData?.role === 'agent') {
        router.push('/agent/dashboard');
        return;
      }
      
      if (requiredRole && userData?.role !== requiredRole) {
        // If agent trying to access non-agent page, redirect to agent dashboard
        if (userData?.role === 'agent') {
          router.push('/agent/dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }
    }
  }, [user, userData, loading, requiredRole, router]);

  if (loading) {
    // Show minimal loading state - don't block the entire page
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-navy)] mx-auto"></div>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && userData?.role !== requiredRole) {
    return null;
  }

  return children;
}

