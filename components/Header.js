'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, userData, signOut, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const getUserInitials = () => {
    if (userData?.displayName) {
      return userData.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    return userData?.displayName || user?.email?.split('@')[0] || 'User';
  };

  const navigation = {
    resources: [
      { href: '/', label: 'Home' },
      { href: '/blog', label: 'Blog' },
      { href: '/insights', label: 'Insights' },
    ],
    compliance: [
      { href: '/insights/form-2290-ultimate-guide', label: 'Form 2290' },
      { href: '/insights/ucr-renewal-guide', label: 'UCR' },
      { href: '/insights/mcs150-update-guide', label: 'MCS-150' },
      { href: '/insights/ifta-filing-basics', label: 'IFTA' },
    ],
    tools: [
      { href: '/tools', label: 'All Tools' },
      { href: '/tools/hvut-calculator', label: 'HVUT Calculator' },
    ],
  };

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white shadow-lg overflow-visible">
      <div className="w-full px-3 sm:px-4 lg:px-6 overflow-visible">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-[var(--color-sand)] transition">
                QuickTruckTax
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/60">
                Filing Made Simple
              </span>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center gap-2 relative z-50 flex-1 justify-center">
            {!user ? (
              // Landing page navigation (not logged in)
              <>
                <Link href="/how-it-works" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition">
                  How it Works
                </Link>
                <Link href="/features" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition">
                  Features
                </Link>
                <Link href="/insights" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition">
                  Insights
                </Link>
                <Link href="/pricing" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition">
                  Pricing
                </Link>
                <Link href="/faq" className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition">
                  FAQ
                </Link>
                <Link
                  href="/signup"
                  className="ml-4 px-5 py-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                >
                  File Now
                </Link>
              </>
            ) : (
              // Logged in - navigation links are in sidebar, so header is empty here
              null
            )}

            {/* Auth Navigation */}
            {!loading && (
              <div className={`${user ? 'ml-auto' : 'ml-2 pl-4 border-l border-white/20'} flex-shrink-0`}>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition group"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-orange)] to-[#ff7a20] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {getUserInitials()}
                      </div>
                      <div className="hidden md:block text-left">
                        <div className="text-sm font-semibold text-white">{getUserDisplayName()}</div>
                        <div className="text-xs text-white/70">{user?.email}</div>
                      </div>
                      <svg
                        className={`w-4 h-4 text-white/70 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* User Menu Dropdown */}
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-300 z-50 overflow-hidden">
                          <div className="py-2" style={{ backgroundColor: '#ffffff' }}>
                            <Link
                              href="/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                              style={{ color: '#1b2838', textDecoration: 'none' }}
                            >
                              <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              <span style={{ color: '#1b2838' }}>Dashboard</span>
                            </Link>

                            <Link
                              href="/dashboard/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                              style={{ color: '#1b2838', textDecoration: 'none' }}
                            >
                              <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span style={{ color: '#1b2838' }}>Profile</span>
                            </Link>

                            <Link
                              href="/dashboard/payment-history"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                              style={{ color: '#1b2838', textDecoration: 'none' }}
                            >
                              <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                              <span style={{ color: '#1b2838' }}>Payment History</span>
                            </Link>

                            <Link
                              href="/dashboard/settings"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition"
                              style={{ color: '#1b2838', textDecoration: 'none' }}
                            >
                              <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span style={{ color: '#1b2838' }}>Settings</span>
                            </Link>

                            {userData?.role === 'agent' && (
                              <Link
                                href="/agent"
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition border-t border-gray-100 mt-2 pt-2"
                                style={{ color: '#1b2838', textDecoration: 'none' }}
                              >
                                <svg className="w-5 h-5" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span style={{ color: '#1b2838' }}>Agent Portal</span>
                              </Link>
                            )}

                            <div className="border-t border-gray-100 mt-2 pt-2">
                              <button
                                onClick={async () => {
                                  setUserMenuOpen(false);
                                  await signOut();
                                  router.push('/');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 transition"
                                style={{ color: '#dc2626', textDecoration: 'none' }}
                              >
                                <svg className="w-5 h-5" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span style={{ color: '#dc2626' }}>Sign Out</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="px-3 py-2 text-sm font-medium bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white">QuickTruckTax</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/60">
                Filing Made Simple
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {!loading && !user && (
                <Link
                  href="/signup"
                  className="px-3 py-1.5 bg-[var(--color-orange)] text-white rounded-lg text-sm font-semibold hover:bg-[#ff7a20] transition"
                >
                  File Now
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu - Sidebar Style */}
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              ></div>
              <div className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto shadow-2xl lg:hidden">
                {/* User Profile Section */}
                {user && (
                  <div className="bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-orange)] to-[#ff7a20] flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-lg truncate">{getUserDisplayName()}</div>
                        <div className="text-white/80 text-sm truncate">{user?.email}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="py-4">
                  {!user ? (
                    // Landing page mobile menu (not logged in)
                    <>
                      <Link
                        href="/features"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition"
                        style={{ color: '#1b2838', textDecoration: 'none' }}
                      >
                        <span style={{ color: '#1b2838' }}>Features</span>
                      </Link>
                      <Link
                        href="/how-it-works"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition"
                        style={{ color: '#1b2838', textDecoration: 'none' }}
                      >
                        <span style={{ color: '#1b2838' }}>How it Works</span>
                      </Link>
                      <Link
                        href="/insights"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition"
                        style={{ color: '#1b2838', textDecoration: 'none' }}
                      >
                        <span style={{ color: '#1b2838' }}>Insights</span>
                      </Link>
                      <Link
                        href="/pricing"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition"
                        style={{ color: '#1b2838', textDecoration: 'none' }}
                      >
                        <span style={{ color: '#1b2838' }}>Pricing</span>
                      </Link>
                      <Link
                        href="/faq"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition"
                        style={{ color: '#1b2838', textDecoration: 'none' }}
                      >
                        <span style={{ color: '#1b2838' }}>FAQ</span>
                      </Link>
                      <div className="px-6 py-4 border-t border-gray-200 mt-4">
                        <Link
                          href="/signup"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block w-full text-center bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
                        >
                          File Now
                        </Link>
                      </div>
                    </>
                  ) : (
                    // Logged in mobile menu
                    <>
                      {/* TRANSACTIONS Section */}
                      <div className="mt-2">
                        <div className="flex items-center gap-2 px-6 py-2 mb-2">
                          <div className="w-1 h-4 bg-[var(--color-orange)] rounded"></div>
                          <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">TRANSACTIONS</span>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition ${isActive('/dashboard') && !isActive('/dashboard/schedule1') && !isActive('/dashboard/businesses') && !isActive('/dashboard/vehicles') && !isActive('/dashboard/filings') ? 'bg-[var(--color-page-alt)] border-l-4 border-[var(--color-orange)]' : ''
                            }`}
                          style={{ color: '#1b2838', textDecoration: 'none' }}
                        >
                          <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span style={{ color: '#1b2838' }}>Dashboard</span>
                        </Link>
                        <Link
                          href="/dashboard/filings"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition ${isActive('/dashboard/filings') ? 'bg-[var(--color-page-alt)] border-l-4 border-[var(--color-orange)]' : ''
                            }`}
                          style={{ color: '#1b2838', textDecoration: 'none' }}
                        >
                          <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span style={{ color: '#1b2838' }}>Filing List</span>
                        </Link>
                        <Link
                          href="/dashboard/schedule1"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition ${isActive('/dashboard/schedule1') ? 'bg-[var(--color-page-alt)] border-l-4 border-[var(--color-orange)]' : ''
                            }`}
                          style={{ color: '#1b2838', textDecoration: 'none' }}
                        >
                          <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span style={{ color: '#1b2838' }}>Schedule 1</span>
                        </Link>
                        <Link
                          href="/dashboard/businesses"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition ${isActive('/dashboard/businesses') ? 'bg-[var(--color-page-alt)] border-l-4 border-[var(--color-orange)]' : ''
                            }`}
                          style={{ color: '#1b2838', textDecoration: 'none' }}
                        >
                          <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span style={{ color: '#1b2838' }}>Businesses</span>
                        </Link>
                        <Link
                          href="/dashboard/vehicles"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition ${isActive('/dashboard/vehicles') ? 'bg-[var(--color-page-alt)] border-l-4 border-[var(--color-orange)]' : ''
                            }`}
                          style={{ color: '#1b2838', textDecoration: 'none' }}
                        >
                          <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                          <span style={{ color: '#1b2838' }}>Vehicles</span>
                        </Link>
                      </div>

                      {/* ACCOUNT Section */}
                      <div className="mt-6">
                        <div className="flex items-center gap-2 px-6 py-2 mb-2">
                          <div className="w-1 h-4 bg-[var(--color-navy)] rounded"></div>
                          <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">ACCOUNT</span>
                        </div>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition"
                          style={{ color: '#1b2838', textDecoration: 'none' }}
                        >
                          <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span style={{ color: '#1b2838' }}>Profile</span>
                        </Link>
                        <Link
                          href="/dashboard/payment-history"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition"
                          style={{ color: '#1b2838', textDecoration: 'none' }}
                        >
                          <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          <span style={{ color: '#1b2838' }}>Payment History</span>
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition"
                          style={{ color: '#1b2838', textDecoration: 'none' }}
                        >
                          <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span style={{ color: '#1b2838' }}>Settings</span>
                        </Link>
                        {userData?.role === 'agent' && (
                          <Link
                            href="/agent"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition"
                            style={{ color: '#1b2838', textDecoration: 'none' }}
                          >
                            <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span style={{ color: '#1b2838' }}>Agent Portal</span>
                          </Link>
                        )}
                      </div>

                      {/* RESOURCES Section */}
                      <div className="mt-6">
                        <div className="flex items-center gap-2 px-6 py-2 mb-2">
                          <div className="w-1 h-4 bg-[var(--color-sky)] rounded"></div>
                          <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">RESOURCES</span>
                        </div>
                        {navigation.resources.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition ${isActive(item.href) ? 'bg-[var(--color-page-alt)] border-l-4 border-[var(--color-sky)]' : ''
                              }`}
                            style={{ color: '#1b2838', textDecoration: 'none' }}
                          >
                            <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span style={{ color: '#1b2838' }}>{item.label}</span>
                          </Link>
                        ))}
                      </div>

                      {/* COMPLIANCE Section */}
                      <div className="mt-6">
                        <div className="flex items-center gap-2 px-6 py-2 mb-2">
                          <div className="w-1 h-4 bg-[var(--color-cyan)] rounded"></div>
                          <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">COMPLIANCE</span>
                        </div>
                        {navigation.compliance.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition ${isActive(item.href) ? 'bg-[var(--color-page-alt)] border-l-4 border-[var(--color-cyan)]' : ''
                              }`}
                            style={{ color: '#1b2838', textDecoration: 'none' }}
                          >
                            <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span style={{ color: '#1b2838' }}>{item.label}</span>
                          </Link>
                        ))}
                      </div>

                      {/* TOOLS Section */}
                      <div className="mt-6">
                        <div className="flex items-center gap-2 px-6 py-2 mb-2">
                          <div className="w-1 h-4 bg-[var(--color-orange)] rounded"></div>
                          <svg className="w-4 h-4 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">TOOLS</span>
                        </div>
                        {navigation.tools.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-4 px-6 py-3 hover:bg-[var(--color-page-alt)] transition ${isActive(item.href) ? 'bg-[var(--color-page-alt)] border-l-4 border-[var(--color-orange)]' : ''
                              }`}
                            style={{ color: '#1b2838', textDecoration: 'none' }}
                          >
                            <svg className="w-6 h-6" style={{ color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span style={{ color: '#1b2838' }}>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Sign Out / Auth */}
                  {user && (
                    <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                      <button
                        onClick={async () => {
                          await signOut();
                          setMobileMenuOpen(false);
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-4 px-6 py-3 hover:bg-red-50 transition"
                        style={{ color: '#dc2626', textDecoration: 'none' }}
                      >
                        <svg className="w-6 h-6" style={{ color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium" style={{ color: '#dc2626' }}>Sign Out</span>
                      </button>
                    </div>
                  )}

                  {!user && (
                    <div className="mt-6 px-6 space-y-3">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center border-2 border-[var(--color-navy)] text-[var(--color-navy)] rounded-lg font-semibold hover:bg-[var(--color-navy)] hover:text-white transition"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white rounded-lg font-semibold hover:shadow-lg transition"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

