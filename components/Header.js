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
    management: [
      { href: '/dashboard/filings', label: 'Filing List' },
      { href: '/dashboard/upload-schedule1', label: 'Upload PDF' },
      { href: '/dashboard/schedule1', label: 'Schedule 1' },
      { href: '/dashboard/businesses', label: 'Businesses' },
      { href: '/dashboard/vehicles', label: 'Vehicles' },
    ],
    resources: [
      { href: '/blog', label: 'Blog' },
      { href: '/insights', label: 'Insights & Guides' },
      { href: '/tools', label: 'All Tools' },
      { href: '/tools/hvut-calculator', label: 'HVUT Calculator' },
    ],
    compliance: [
      { href: '/insights/form-2290-ultimate-guide', label: 'Form 2290 Guide' },
      { href: '/insights/ucr-renewal-guide', label: 'UCR Renewal' },
      { href: '/insights/mcs150-update-guide', label: 'MCS-150 Updates' },
      { href: '/insights/ifta-filing-basics', label: 'IFTA Basics' },
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
        {/* 3-Column Grid for Perfect Centering */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-16 w-full">
          {/* Logo Column */}
          <div className="flex justify-start">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-[var(--color-orange)] transition-colors">
                  QuickTruckTax
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-white/80 transition-colors">
                  Filing Made Simple
                </span>
              </div>
            </Link>
          </div>

          {/* Main Navigation Column (Centered) */}
          <nav className="flex items-center gap-4">
            {!user ? (
              // Landing page navigation
              <>
                <Link href="/how-it-works" className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  How it Works
                </Link>
                <Link href="/features" className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  Features
                </Link>
                <Link href="/pricing" className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  Pricing
                </Link>
                <div className="h-4 w-px bg-white/10 mx-2"></div>
              </>
            ) : (
              // Logged in navigation
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${isActive('/dashboard') && !isActive('/dashboard/filings') && !isActive('/dashboard/businesses') && !isActive('/dashboard/vehicles') && !isActive('/dashboard/upload-schedule1') && !isActive('/dashboard/schedule1')
                    ? 'bg-white shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  style={isActive('/dashboard') && !isActive('/dashboard/filings') && !isActive('/dashboard/businesses') && !isActive('/dashboard/vehicles') && !isActive('/dashboard/upload-schedule1') && !isActive('/dashboard/schedule1') ? { color: '#0f2647' } : {}}
                >
                  Dashboard
                </Link>

                {/* Management Dropdown */}
                <div className="relative group">
                  <button className={`px-3 py-1.5 text-sm font-black rounded-lg transition-all flex items-center gap-1.5 ${isActive('/dashboard/filings') || isActive('/dashboard/vehicles') || isActive('/dashboard/businesses')
                    ? 'text-white bg-white/10'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}>
                    Manage
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-56 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-[100]">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-2">
                      {navigation.management.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center px-4 py-2.5 text-sm font-black rounded-xl transition-colors ${isActive(item.href) ? 'bg-orange-50 !text-[#ff8b3d]' : '!text-[#0f172a] hover:bg-slate-50'}`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Compliance Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1.5">
                Compliance
                <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-[100]">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-2">
                  {navigation.compliance.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-2.5 text-sm font-bold !text-[#0f172a] hover:bg-slate-50 hover:text-[#ff8b3d] rounded-xl transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1.5">
                Resources
                <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-60 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-[100]">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-2">
                  {navigation.resources.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-2.5 text-sm font-bold !text-[#0f172a] hover:bg-slate-50 hover:text-[#ff8b3d] rounded-xl transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Auth Column (Right) */}
          <div className="flex justify-end gap-3 items-center">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard/filings/new"
                  className="px-5 py-2.5 bg-white rounded-xl font-black text-sm shadow-xl shadow-white/5 hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center gap-2"
                  style={{ color: '#0f2647' }}
                >
                  <svg className="w-4 h-4" style={{ color: '#0f2647' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  File Now
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition group min-h-[44px]"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#ff8b3d] to-[#f07a2d] flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/20">
                      {getUserInitials()}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-bold text-white leading-tight">{getUserDisplayName()}</div>
                      <div className="text-[10px] text-white/50 font-medium">My Account</div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-white/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
                        <div className="py-2">
                          <div className="px-4 py-3 border-b border-slate-100 mb-2">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                          </div>

                          <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-black hover:bg-slate-50 transition !text-[#0f172a]">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            Dashboard
                          </Link>

                          <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-black hover:bg-slate-50 transition !text-[#0f172a]">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Profile
                          </Link>

                          <Link href="/dashboard/payment-history" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-black hover:bg-slate-50 transition !text-[#0f172a]">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            Payments
                          </Link>

                          <div className="border-t border-slate-100 mt-2 pt-2">
                            <button
                              onClick={async () => {
                                setUserMenuOpen(false);
                                await signOut();
                                router.push('/');
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-5 py-2 text-sm font-bold text-white hover:bg-white/10 rounded-xl transition">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-[#ff8b3d] hover:bg-[#f07a2d] text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-orange-500/20 active:scale-95 whitespace-nowrap"
                >
                  File Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white">QuickTruckTax</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">Filing Made Simple</span>
            </Link>

            <div className="flex items-center gap-3">
              {!loading && !user && (
                <Link href="/signup" className="px-4 py-1.5 bg-[#ff8b3d] text-white rounded-lg text-sm font-black shadow-lg shadow-orange-500/20 active:scale-95 transition">
                  File Now
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
                onClick={() => setMobileMenuOpen(false)}
              ></div>
              <div className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] z-[101] overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10 px-6 py-5 flex items-center justify-between z-10">
                  {!user ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff8b3d] to-[#f07a2d] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-orange-500/20">QT</div>
                      <span className="font-black text-white text-base">QuickTruckTax</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff8b3d] to-[#f07a2d] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-orange-500/20">
                        {getUserInitials()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-black text-sm truncate leading-tight">{getUserDisplayName()}</div>
                        <div className="text-white/40 text-[10px] truncate font-medium mt-0.5">{user?.email}</div>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-xl transition text-white/50 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
                  {!user ? (
                    /* Guest Navigation */
                    <div className="space-y-2">
                      <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 py-3 group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <span className="font-bold text-white text-base">How it Works</span>
                      </Link>
                      <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 py-3 group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="font-bold text-white text-base">Features</span>
                      </Link>
                      <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 py-3 group">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span className="font-bold text-white text-base">Pricing</span>
                      </Link>
                      <div className="pt-8 space-y-4">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full py-3.5 text-center text-white font-bold bg-white/5 rounded-xl border border-white/10 transition">Login</Link>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block w-full py-3.5 text-center text-white font-black bg-[#ff8b3d] rounded-xl shadow-xl shadow-orange-500/20 transition">File Now</Link>
                      </div>
                    </div>
                  ) : (
                    /* App Navigation */
                    <div className="space-y-10">
                      <div>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Core</p>
                        <div className="space-y-1">
                          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${isActive('/dashboard') && !isActive('/dashboard/filings') ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            <span className="font-bold">Dashboard</span>
                          </Link>
                          {navigation.management.map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition ${isActive(item.href) ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                              <span className="font-bold">{item.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-[#60a5fa] uppercase tracking-[0.2em] mb-4">Compliance</p>
                        <div className="space-y-3 pl-4 border-l border-white/5">
                          {navigation.compliance.map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-white/50 hover:text-white transition-colors">{item.label}</Link>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em] mb-4">Resources</p>
                        <div className="space-y-3 pl-4 border-l border-white/5">
                          {navigation.resources.map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-white/50 hover:text-white transition-colors">{item.label}</Link>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/10 space-y-4">
                        <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition">
                          <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span className="font-bold">Settings</span>
                        </Link>
                        <button
                          onClick={async () => {
                            await signOut();
                            setMobileMenuOpen(false);
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-4 px-4 py-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition font-black"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Sign Out
                        </button>
                      </div>
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

