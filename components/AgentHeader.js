'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, LogOut, LayoutDashboard, FileText, History } from 'lucide-react';

export function AgentHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, userData, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const getUserInitials = () => {
    if (userData?.displayName) {
      return userData.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'A';
  };

  const getUserDisplayName = () => {
    return userData?.displayName || user?.email?.split('@')[0] || 'Agent';
  };

  const isActive = (href) => {
    if (href === '/agent/dashboard') {
      return pathname === '/agent/dashboard' || pathname === '/agent';
    }
    if (href === '/agent/history') {
      return pathname === '/agent/history';
    }
    if (href === '/agent') {
      return pathname === '/agent' && pathname !== '/agent/dashboard' && pathname !== '/agent/history';
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/agent/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-orange)] to-[#ff7a20] rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-text)]">Agent Portal</div>
              <div className="text-xs text-[var(--color-muted)]">QuickTruckTax</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/agent/dashboard"
              className={`text-sm font-medium transition ${
                isActive('/agent/dashboard')
                  ? 'text-[var(--color-navy)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/agent"
              className={`text-sm font-medium transition ${
                isActive('/agent') && !isActive('/agent/dashboard') && !isActive('/agent/history')
                  ? 'text-[var(--color-navy)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Active Queue
            </Link>
            <Link
              href="/agent/history"
              className={`text-sm font-medium transition ${
                isActive('/agent/history')
                  ? 'text-[var(--color-navy)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              Filing History
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop User Menu */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-orange)] to-[#ff7a20] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {getUserInitials()}
                </div>
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {getUserDisplayName()}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-[var(--color-text)]">{getUserDisplayName()}</p>
                      <p className="text-xs text-[var(--color-muted)] truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut();
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 transition text-left"
                        style={{ color: '#dc2626' }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[var(--color-text)]" />
              ) : (
                <Menu className="w-5 h-5 text-[var(--color-text)]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/agent/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/agent/dashboard')
                  ? 'bg-[var(--color-page-alt)] text-[var(--color-navy)]'
                  : 'text-[var(--color-text)] hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/agent"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/agent') && !isActive('/agent/dashboard') && !isActive('/agent/history')
                  ? 'bg-[var(--color-page-alt)] text-[var(--color-navy)]'
                  : 'text-[var(--color-text)] hover:bg-gray-50'
              }`}
            >
              <FileText className="w-5 h-5" />
              Active Queue
            </Link>
            <Link
              href="/agent/history"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/agent/history')
                  ? 'bg-[var(--color-page-alt)] text-[var(--color-navy)]'
                  : 'text-[var(--color-text)] hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5" />
              Filing History
            </Link>
            <div className="pt-3 border-t border-gray-200">
              <div className="px-3 py-2 mb-2">
                <p className="text-sm font-medium text-[var(--color-text)]">{getUserDisplayName()}</p>
                <p className="text-xs text-[var(--color-muted)] truncate">{user?.email}</p>
              </div>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                  router.push('/');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-red-50 transition rounded-lg text-left"
                style={{ color: '#dc2626' }}
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

