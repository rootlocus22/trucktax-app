'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, FileText, Calendar, Truck, ShieldCheck, LogIn, UserPlus, LayoutDashboard, ChevronDown, User, CreditCard, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';

const FILING_ROUTES = ['/ucr/file', '/login', '/signup'];
const DASHBOARD_ROUTES = ['/dashboard'];

function isMinimalHeader(pathname) {
  if (!pathname) return false;
  return FILING_ROUTES.some(r => pathname.startsWith(r)) || DASHBOARD_ROUTES.some(r => pathname.startsWith(r));
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef(null);

  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, loading: authLoading, signOut } = useAuth();
  const minimal = isMinimalHeader(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    await signOut();
    window.location.href = '/';
  };

  const isActive = (path) => pathname === path;
  const isDashboardSection = pathname?.startsWith('/dashboard');
  const headerDark = !minimal && !isScrolled;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/insights', label: 'Guides' },
    { href: '/resources', label: 'Resources' },
    { href: '/tools', label: 'Tools' },
    { href: '/blog', label: 'Blog' },
  ];

  const quickLinks = [
    { href: '/services/form-2290-filing', label: 'File Form 2290', icon: FileText },
    { href: '/services/mcs-150-update', label: 'MCS-150 Update', icon: Truck },
    { href: '/services/ucr-registration', label: 'UCR Registration', icon: ShieldCheck },
    { href: '/insights/trucking-compliance-calendar', label: 'Compliance Calendar', icon: Calendar },
  ];

  const redirectQuery = pathname?.startsWith('/ucr') ? '?redirect=' + encodeURIComponent(pathname || '/ucr/file') : '';

  // ----- Minimal header (filing / login / signup / dashboard)
  if (minimal) {
    return (
      <>
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 py-2 shadow-sm">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 min-h-[44px]">
              <div className="flex items-center gap-3 min-w-0">
                <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 shrink-0">
                  <Logo dark={false} compact />
                </Link>
                {!authLoading && user && (
                  <nav className="hidden sm:flex items-center gap-1" aria-label="Dashboard navigation">
                    <Link
                      href="/dashboard"
                      aria-current={pathname === '/dashboard' ? 'page' : undefined}
                      className={`inline-flex items-center min-h-[36px] px-2.5 py-1 rounded-md text-xs font-semibold transition ${pathname === '/dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/filings"
                      aria-current={isActive('/dashboard/filings') ? 'page' : undefined}
                      className={`inline-flex items-center min-h-[36px] px-2.5 py-1 rounded-md text-xs font-semibold transition ${isActive('/dashboard/filings') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                    >
                      Filings
                    </Link>
                  </nav>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!authLoading && (
                  user ? (
                    <div className="relative" ref={userMenuRef}>
                      <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="inline-flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition border border-slate-200"
                      >
                        {(userData?.photoURL || user?.photoURL) ? (
                          <img
                            src={userData?.photoURL || user?.photoURL}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover bg-slate-200"
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }}
                          />
                        ) : null}
                        <span className={`w-7 h-7 rounded-full bg-[var(--color-navy)] !text-white flex items-center justify-center text-xs font-bold shrink-0 ${(userData?.photoURL || user?.photoURL) ? 'hidden' : ''}`}>
                          {(userData?.displayName || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                        </span>
                        <span className="hidden sm:inline max-w-[120px] truncate">{userData?.displayName || user?.email?.split('@')[0] || 'Account'}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition ${userDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {userDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                          <Link href="/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link href="/dashboard/filings" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation">
                            <FileText className="w-4 h-4" /> Filings
                          </Link>
                          <Link href="/dashboard/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation">
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          <Link href="/dashboard/payment-history" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation">
                            <CreditCard className="w-4 h-4" /> Payment History
                          </Link>
                          <hr className="my-1 border-slate-100" />
                          <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-red-600 hover:bg-red-50 touch-manipulation text-left">
                            <LogOut className="w-4 h-4" /> Log out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link href={`/login${redirectQuery}`} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition touch-manipulation items-center">
                        <LogIn className="w-4 h-4" /> Log in
                      </Link>
                      <Link href={`/signup${redirectQuery}`} className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold bg-[var(--color-navy)] !text-white hover:bg-[var(--color-navy-soft)] transition touch-manipulation items-center">
                        <UserPlus className="w-4 h-4" /> Sign up
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
            {!authLoading && user && (
              <nav className="sm:hidden flex items-center gap-2 pb-1 pt-1" aria-label="Dashboard quick links">
                <Link
                  href="/dashboard"
                  aria-current={pathname === '/dashboard' ? 'page' : undefined}
                  className={`inline-flex items-center min-h-[36px] px-2.5 py-1 rounded-md text-xs font-semibold transition ${pathname === '/dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/filings"
                  aria-current={isActive('/dashboard/filings') ? 'page' : undefined}
                  className={`inline-flex items-center min-h-[36px] px-2.5 py-1 rounded-md text-xs font-semibold transition ${isActive('/dashboard/filings') ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Filings
                </Link>
              </nav>
            )}
          </div>
        </header>
      </>
    );
  }

  // ----- Full header (marketing pages)
  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-2' : 'bg-[var(--color-midnight)] border-b border-white/10 py-2'}`}>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 min-h-[48px]">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 shrink-0">
              <Logo dark={headerDark} compact={false} />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const href = (link.href === '/' && user) ? '/dashboard' : link.href;
                return (
                  <Link
                    key={link.href}
                    href={href}
                    className={`text-sm font-medium transition-colors ${isScrolled ? (isActive(href) ? 'text-[var(--color-orange)] font-bold' : 'text-slate-600 hover:text-[var(--color-navy)]') : (isActive(href) ? '!text-white font-bold' : '!text-white opacity-90 hover:opacity-100')}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {!authLoading && (
                user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
                    >
                      {(userData?.photoURL || user?.photoURL) ? (
                        <img
                          src={userData?.photoURL || user?.photoURL}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover bg-slate-200"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }}
                        />
                      ) : null}
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${(userData?.photoURL || user?.photoURL) ? 'hidden' : ''} ${isScrolled ? 'bg-[var(--color-navy)] !text-white' : 'bg-white/20 text-white'}`}>
                        {(userData?.displayName || user?.email?.split('@')[0] || 'U').charAt(0).toUpperCase()}
                      </span>
                      <span className="max-w-[140px] truncate">{userData?.displayName || user?.email?.split('@')[0] || 'Account'}</span>
                      <ChevronDown className={`w-4 h-4 transition ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {userDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                        <Link href="/dashboard" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link href="/dashboard/filings" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation">
                          <FileText className="w-4 h-4" /> Filings
                        </Link>
                        <Link href="/dashboard/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link href="/dashboard/payment-history" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 touch-manipulation">
                          <CreditCard className="w-4 h-4" /> Payment History
                        </Link>
                        <hr className="my-1 border-slate-100" />
                        <button onClick={handleSignOut} className="flex w-full items-center gap-2 px-4 py-3 min-h-[44px] text-sm font-medium text-red-600 hover:bg-red-50 touch-manipulation text-left">
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/login" className={`inline-flex items-center gap-2 min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold transition touch-manipulation ${isScrolled ? 'text-slate-600 hover:bg-slate-100' : 'bg-white !text-[var(--color-navy)] hover:bg-blue-50'}`}>
                      <LogIn className="w-4 h-4" /> Log in
                    </Link>
                    <Link href="/signup" className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md touch-manipulation ${isScrolled ? 'bg-[var(--color-orange)] !text-white hover:bg-[#e66a15]' : 'bg-white !text-[var(--color-navy)] hover:bg-blue-50'}`}>
                      <UserPlus className="w-4 h-4" /> Sign up
                    </Link>
                  </>
                )
              )}
              {!user && (
                <Link href="/ucr/file" className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg text-sm font-bold touch-manipulation ${isScrolled ? 'bg-[var(--color-orange)] !text-white hover:bg-[#e66a15]' : 'bg-[var(--color-orange)] !text-white hover:bg-[#e66a15] shadow-md'}`}>
                  <FileText className="w-4 h-4" /> Start UCR Filing
                </Link>
              )}
            </div>

            <button className="md:hidden min-h-[44px] min-w-[44px] p-2 rounded-lg transition touch-manipulation flex items-center justify-center" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
              {isMenuOpen ? <X className={`w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} /> : <Menu className={`w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />}
            </button>
          </div>
        </div>
      </header>

      {mounted && isMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <span className="font-bold text-slate-900">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              {navLinks.map((link) => {
                const href = (link.href === '/' && user) ? '/dashboard' : link.href;
                return (
                  <Link key={link.href} href={href} onClick={() => setIsMenuOpen(false)} className={`min-h-[48px] flex items-center px-4 py-3 rounded-xl text-base font-medium transition touch-manipulation ${isActive(href) ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 space-y-2 pb-safe">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Account</h4>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 min-h-[48px] p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 touch-manipulation">
                    <LayoutDashboard className="w-5 h-5 text-[var(--color-navy)]" /> Dashboard
                  </Link>
                  <Link href="/dashboard/filings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 min-h-[48px] p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 touch-manipulation">
                    <FileText className="w-5 h-5 text-[var(--color-navy)]" /> Filings
                  </Link>
                  <Link href="/dashboard/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 min-h-[48px] p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 touch-manipulation">
                    <User className="w-5 h-5" /> Profile
                  </Link>
                  <Link href="/dashboard/payment-history" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 min-h-[48px] p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 touch-manipulation">
                    <CreditCard className="w-5 h-5" /> Payment History
                  </Link>
                  <button onClick={() => { setIsMenuOpen(false); handleSignOut(); }} className="flex w-full items-center gap-3 min-h-[48px] p-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 touch-manipulation text-left">
                    <LogOut className="w-5 h-5" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 min-h-[48px] p-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 touch-manipulation">
                    <LogIn className="w-5 h-5" /> Log in
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 min-h-[48px] p-3 bg-[var(--color-navy)] !text-white rounded-xl font-semibold touch-manipulation">
                    <UserPlus className="w-5 h-5" /> Sign up
                  </Link>
                </>
              )}
              <Link href="/ucr/file" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 w-full min-h-[52px] bg-[var(--color-orange)] !text-white py-3 rounded-xl font-bold mt-2 touch-manipulation">
                <FileText className="w-5 h-5" /> Start UCR Filing
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
