'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AuthNav() {
  const { user, userData, signOut, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {userData?.role === 'agent' && (
          <Link
            href="/agent"
            className="rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
          >
            Agent Portal
          </Link>
        )}
        <Link
          href="/dashboard"
          className="rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
        >
          Dashboard
        </Link>
        <button
          onClick={async () => {
            await signOut();
            router.push('/');
          }}
          className="rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-white px-3 py-1 text-[var(--color-navy)] font-semibold transition hover:bg-white/90"
      >
        Sign Up
      </Link>
    </div>
  );
}

