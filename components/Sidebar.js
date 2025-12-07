'use client';

import { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Create context for sidebar state
const SidebarContext = createContext({
  isCollapsed: false,
  setIsCollapsed: () => { },
});

export const useSidebar = () => useContext(SidebarContext);
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  Building2,
  Truck,
  BookOpen,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export function Sidebar({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' && !pathname.startsWith('/dashboard/');
    }
    return pathname?.startsWith(href);
  };

  const navigation = {
    main: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/filings', label: 'Filing List', icon: FileText },
      { href: '/dashboard/new-filing', label: 'New Filing', icon: FileCheck },
      { href: '/dashboard/schedule1', label: 'Schedule 1', icon: FileCheck },
      { href: '/dashboard/businesses', label: 'Businesses', icon: Building2 },
      { href: '/dashboard/vehicles', label: 'Vehicles', icon: Truck },
    ],
    resources: [
      { href: '/blog', label: 'Blog', icon: BookOpen },
      { href: '/insights', label: 'Insights', icon: BookOpen },
      { href: '/tools', label: 'Tools', icon: Wrench },
    ],
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : 'w-full'}`}>
      {/* Logo Section */}
      <div className={`flex items-center justify-between p-4 border-b border-[var(--color-border)] ${mobile ? '' : ''}`}>
        {!isCollapsed && !mobile && (
          <Link href="/dashboard" className="flex items-center space-x-2 group">
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--color-text)] group-hover:text-[var(--color-orange)] transition">
                QuickTruckTax
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--color-muted)]">
                Filing Made Simple
              </span>
            </div>
          </Link>
        )}
        {mobile && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-[var(--color-text)]">
                QuickTruckTax
              </span>
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-[var(--color-muted)]">
                Filing Made Simple
              </span>
            </div>
          </Link>
        )}
        {!mobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-[var(--color-page-alt)] transition text-[var(--color-muted)] hover:text-[var(--color-text)]"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
        {mobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-[var(--color-page-alt)] transition text-[var(--color-muted)] hover:text-[var(--color-text)]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Navigation */}
        <div className="mb-6">
          {!isCollapsed && !mobile && (
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">MAIN</span>
            </div>
          )}
          <nav className="space-y-1 px-2">
            {navigation.main.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition group ${active
                    ? 'bg-[var(--color-orange)]/10 text-[var(--color-orange)] border-l-4 border-[var(--color-orange)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-page-alt)] hover:text-[var(--color-text)]'
                    } ${isCollapsed && !mobile ? 'justify-center px-2' : ''}`}
                  title={isCollapsed && !mobile ? item.label : ''}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed && !mobile ? '' : ''}`} />
                  {(!isCollapsed || mobile) && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Resources Section */}
        <div className="mb-6">
          {!isCollapsed && !mobile && (
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">RESOURCES</span>
            </div>
          )}
          <nav className="space-y-1 px-2">
            {navigation.resources.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition group ${active
                    ? 'bg-[var(--color-sky)]/10 text-[var(--color-sky)] border-l-4 border-[var(--color-sky)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-page-alt)] hover:text-[var(--color-text)]'
                    } ${isCollapsed && !mobile ? 'justify-center px-2' : ''}`}
                  title={isCollapsed && !mobile ? item.label : ''}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!isCollapsed || mobile) && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

      </div>
    </div>
  );

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="flex h-full w-full overflow-hidden">
        {/* Desktop Sidebar - In Flow */}
        <aside
          className={`hidden lg:flex flex-col bg-[var(--color-card)] border-r border-[var(--color-border)] shadow-lg z-30 transition-all duration-300 h-full flex-shrink-0 relative ${isCollapsed ? 'w-20' : 'w-64'
            }`}
        >
          <div className="w-full h-full overflow-y-auto no-scrollbar">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile Menu Button - Absolute */}
        <div className="lg:hidden fixed top-20 left-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] shadow-lg text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Sidebar - Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside
              className="lg:hidden fixed left-0 top-16 bottom-12 w-64 bg-[var(--color-card)] border-r border-[var(--color-border)] shadow-2xl z-50 overflow-y-auto"
            >
              <SidebarContent mobile />
            </aside>
          </>
        )}

        {/* Content wrapper - Flex Child - Scrollable by default */}
        <div className="flex-1 h-full min-w-0 overflow-y-auto overflow-x-hidden flex flex-col relative w-full">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
