'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect to UCR filing. This app is UCR-only.
 */
export default function NewFilingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/ucr/file');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[var(--color-orange)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-slate-600">Redirecting to UCR filing...</p>
      </div>
    </div>
  );
}
