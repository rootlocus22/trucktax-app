'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  CheckCircle2,
  FileCheck,
  Clock
} from 'lucide-react';

function SignupContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-page)]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 border-t-slate-900"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push(redirectTo);
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: ShieldCheck,
      title: 'All-Inclusive UCR Filing',
      description: 'One payment covers everything — government fee included. Pay once, we handle the rest.'
    },
    {
      icon: Zap,
      title: 'Instant FMCSA Sync',
      description: 'Pulls your power units automatically for accurate fee calculation.'
    },
    {
      icon: FileCheck,
      title: 'Certificate Storage',
      description: 'Store and access your official UCR registration proof anytime.'
    },
    {
      icon: Clock,
      title: 'Renewal Reminders',
      description: 'Never miss a UCR deadline again with our automated compliance alerts.'
    }
  ];


  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero (matches home page design) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-midnight)] text-white p-10 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/quicktruck-hero.webp"
            alt="Trucking logistics"
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d2137] via-[#0d2137]/95 to-[#153a5e]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)]/95 via-[var(--color-midnight)]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-midnight)] via-transparent to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 80px, white 80px, white 82px)' }} />
        </div>

        <div className="relative z-10">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-[1.15] tracking-tight">
              Start Your <span className="text-[var(--color-orange)]">UCR Compliance</span> Journey
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              The easiest way to file UCR with all-inclusive pricing: one payment covers everything, government fee included.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold mb-0.5 tracking-tight">{benefit.title}</h3>
                  <p className="text-white/80 text-xs leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[var(--color-amber)] text-base">★</span>
                ))}
              </div>
              <span className="text-lg font-bold">4.9/5</span>
              <span className="text-white/70 text-sm">(2,500+ reviews)</span>
            </div>
            <p className="text-white/90 italic text-sm mb-1">
              "I've been using easyucr.com for 3 years. Their service is fast, reliable, and saves me hours every filing season."
            </p>
            <p className="text-white/70 text-xs">— Sarah Martinez, Fleet Manager</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mt-auto relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-[var(--color-orange)]" />
            <h3 className="text-sm font-bold">Join 10,000+ Success Stories</h3>
          </div>
          <p className="text-white/80 text-xs font-light">Get started in minutes. Calculate your UCR fee, file with ease, and secure your compliance dashboard today.</p>
        </div>

      </div>

      {/* Right Panel - Signup Form (no redundant hero - header has logo) */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-[calc(100vh-60px)] lg:min-h-0 bg-[var(--color-page)] lg:bg-gradient-to-br lg:from-[var(--color-page)] lg:via-white lg:to-[var(--color-page)]">
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-12 max-w-md mx-auto w-full">
          <div className="mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-1.5">Create Account</h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)]">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--color-navy)] font-semibold hover:text-[var(--color-orange)] transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 min-h-[44px] sm:min-h-[48px] border border-slate-200 bg-white py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 transition disabled:opacity-50 mb-4 shadow-sm touch-manipulation"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[var(--color-page)] text-slate-400">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]/20 focus:border-[var(--color-navy)] transition text-sm bg-white"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]/20 focus:border-[var(--color-navy)] transition text-sm bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 font-light">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[var(--color-navy)]/20 focus:border-[var(--color-navy)] transition text-sm bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] sm:min-h-[48px] bg-[var(--color-navy)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-navy)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  Create Your Free Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600">Secure</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-1.5">
                  <Lock className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600">Private</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mb-1.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-700" />
                </div>
                <span className="text-[10px] font-medium text-slate-600">Free to Start</span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-center text-slate-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-[var(--color-navy)] hover:underline font-medium">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[var(--color-navy)] hover:underline font-medium">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-navy)]" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
