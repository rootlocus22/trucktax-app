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
      { href: '/dashboard/filings', label: 'My Filings' },
      { href: '/dashboard/businesses', label: 'Businesses' },
    ],
    resources: [
      { href: '/blog', label: 'Blog' },
      { href: '/insights', label: 'Insights & Guides' },
      { href: '/tools/ucr-calculator', label: 'UCR Calculator' },
    ],
    compliance: [
      { href: '/insights/ucr-renewal-guide', label: 'UCR Renewal Guide' },
      { href: '/insights', label: 'Compliance Guides' },
    ],
  };

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white shadow-lg">
      <div className="w-full px-4 lg:px-6">
        {/* Desktop Header */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-16 w-full">
          {/* Logo Column */}
          <div className="flex justify-start">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-[var(--color-orange)] transition-colors">
                  QuickTruckTax
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 group-hover:text-white/80 transition-colors">
                  UCR Filing Service
                </span>
              </div>
            </Link>
          </div>

          {/* Main Navigation Column (Centered) */}
          <nav className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/how-it-works" className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  How it Works
                </Link>
                <Link href="/insights" className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  Guides
                </Link>
                <Link href="/faq" className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
                  FAQ
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${isActive('/dashboard') && pathname === '/dashboard' ? 'bg-white text-[#0f2647] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/filings"
                  className={`px-4 py-2 text-sm font-black rounded-lg transition-all ${isActive('/dashboard/filings') ? 'bg-white text-[#0f2647] shadow-md' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                >
                  My Filings
                </Link>
              </>
            )}

            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="px-3 py-1.5 text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-1.5">
                Resources
                <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-56 opacity-0 translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-[100]">
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
          </nav>

          {/* Auth Column (Right) */}
          <div className="flex justify-end gap-3 items-center">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/ucr/file"
                  className="px-5 py-2 bg-[#ff8b3d] hover:bg-[#f07a2d] text-white rounded-xl font-black text-sm shadow-xl shadow-orange-500/20 transition-all flex items-center gap-2"
                >
                  File UCR
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition group"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff8b3d] to-[#f07a2d] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-orange-500/20">
                      {getUserInitials()}
                    </div>
                    <svg className={`w-4 h-4 text-white/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                        <div className="py-2">
                          <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 transition !text-[#0f172a]">
                            Dashboard
                          </Link>
                          <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold hover:bg-slate-50 transition !text-[#0f172a]">
                            Profile
                          </Link>
                          <button
                            onClick={async () => {
                              setUserMenuOpen(false);
                              await signOut();
                              router.push('/');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition text-left"
                          >
                            Sign Out
                          </button>
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
                  href="/ucr/file"
                  className="px-6 py-2 bg-[#ff8b3d] hover:bg-[#f07a2d] text-white rounded-xl text-sm font-black transition-all shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  File UCR
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16">
          <Link href="/" className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white">QuickTruckTax</span>
          </Link>

          <div className="flex items-center gap-3">
            {!loading && !user && (
              <Link href="/ucr/file" className="px-4 py-1.5 bg-[#ff8b3d] text-white rounded-lg text-sm font-black shadow-lg">
                File Now
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-white/80 hover:text-white rounded-xl transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setMobileMenuOpen(false)}></div>
            <div className="fixed right-0 top-0 bottom-0 w-[80vw] bg-[#0f172a] z-[101] p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <span className="font-black text-white">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/50">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-4 mt-8">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-white font-bold text-lg">Home</Link>
                <Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-white font-bold text-lg">How it Works</Link>
                <Link href="/insights" onClick={() => setMobileMenuOpen(false)} className="text-white font-bold text-lg">Guides</Link>
                <Link href="/ucr/file" onClick={() => setMobileMenuOpen(false)} className="text-[var(--color-orange)] font-bold text-lg">File UCR Now</Link>
                <div className="border-t border-white/10 my-4 pt-4">
                  {!user ? (
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-white font-bold">Login</Link>
                  ) : (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-white font-bold block mb-4">Dashboard</Link>
                      <button onClick={async () => { await signOut(); setMobileMenuOpen(false); router.push('/'); }} className="text-red-400 font-bold">Sign Out</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
