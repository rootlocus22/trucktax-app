'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, Rocket, FileText, Calendar, Truck, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    const isActive = (path) => pathname === path;

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/services", label: "Services" },
        { href: "/insights", label: "Guides" },
        { href: "/tools", label: "Tools" },
        { href: "/blog", label: "Blog" },
    ];

    const quickLinks = [
        { href: "/services/form-2290-filing", label: "File Form 2290", icon: FileText },
        { href: "/services/mcs-150-update", label: "MCS-150 Update", icon: Truck },
        { href: "/services/ucr-registration", label: "UCR Registration", icon: ShieldCheck },
        { href: "/insights/trucking-compliance-calendar", label: "Compliance Calendar", icon: Calendar },
    ];

    return (
        <>
            <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3'
                : 'bg-[var(--color-midnight)] border-b border-white/10 py-4'
                }`}>
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-4 group">
                            <div className="bg-white p-1.5 rounded-lg shadow-sm transition-transform group-hover:scale-105">
                                <img
                                    src="/logofinal.svg"
                                    alt="QuickTruckTax Logo"
                                    className="h-10 md:h-12 w-auto"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-xl md:text-2xl font-bold tracking-tight ${isScrolled ? 'text-[var(--color-navy)]' : 'text-white'}`}>
                                    QuickTruckTax
                                </span>
                                <span className={`text-[11px] font-bold uppercase tracking-[0.3em] ${isScrolled ? 'text-slate-500' : 'text-blue-200'}`}>
                                    Compliance Simplified
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${isScrolled
                                        ? (isActive(link.href) ? 'text-[var(--color-orange)] font-bold' : 'text-slate-600 hover:text-[var(--color-navy)]')
                                        : (isActive(link.href) ? '!text-white font-bold' : '!text-white opacity-90 hover:opacity-100')
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* CTA Button */}
                        <div className="hidden md:block">
                            <Link
                                href="/early-access"
                                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition shadow-lg ${isScrolled
                                    ? 'bg-blue-900 !text-white hover:bg-blue-800 shadow-blue-900/10'
                                    : 'bg-white !text-blue-900 hover:bg-blue-50 shadow-white/10'
                                    }`}
                            >
                                <Rocket className="w-4 h-4" />
                                Get Early Access
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-lg transition"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className={`w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
                            ) : (
                                <Menu className={`w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Portal */}
            {mounted && isMenuOpen && createPortal(
                <div className="fixed inset-0 z-[100] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    {/* Slide-over Drawer */}
                    <div className="absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                            <span className="font-bold text-lg text-slate-900">Menu</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="p-5 flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`px-4 py-3 rounded-xl text-base font-medium transition ${isActive(link.href)
                                            ? 'bg-blue-50 text-blue-700 font-bold'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="bg-slate-50 p-5 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Services</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {quickLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition shadow-sm"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                <link.icon className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700">{link.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-100 shrink-0">
                            <Link
                                href="/early-access"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full bg-[var(--color-orange)] text-white px-4 py-4 rounded-xl text-center font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 hover:bg-[#ff7a20] transition"
                            >
                                <Rocket className="w-5 h-5" />
                                Get Early Access
                            </Link>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
