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
  FileCheck
} from 'lucide-react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, user, loading: authLoading } = useAuth();
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
    setLoading(true);

    try {
      await signIn(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err.message || 'Failed to sign in');
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

  const features = [
    {
      icon: ShieldCheck,
      title: 'All-Inclusive UCR Filing',
      description: '$79 service fee + official government UCR fee — one payment, we pay the government on your behalf.'
    },
    {
      icon: FileCheck,
      title: 'Compliance Dashboard',
      description: 'Track your filing status in real-time and access your UCR certificates anytime.'
    },
    {
      icon: Zap,
      title: 'Smart Fleet Sync',
      description: 'Automatically pull your latest power unit data from FMCSA to ensure accurate filing.'
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
              Welcome to Your <span className="text-[var(--color-orange)]">UCR Compliance</span> Hub
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              Continue managing your UCR filings with transparent pricing. $79 service fee + official government UCR fee — one payment, we handle the rest.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-0.5 tracking-tight">{feature.title}</h3>
                    <p className="text-white/80 text-xs leading-relaxed">{feature.description}</p>
                  </div>
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
            </div>
            <p className="text-white/90 italic text-sm mb-1">
              "Finally a UCR platform that makes sense. I filed my 2026 registration in 5 minutes and got my certificate instantly!"
            </p>
            <p className="text-white/70 text-xs">— Mark Dawson, Logistics Manager</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mt-auto relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-[var(--color-orange)]" />
            <h3 className="text-sm font-bold">Trusted by 10,000+ Truckers</h3>
          </div>
          <p className="text-white/80 text-xs font-light">Join thousands of professionals who trust easyucr.com for their UCR and compliance needs.</p>
        </div>

      </div>

      {/* Right Panel - Login Form (no redundant hero - header has logo) */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-[calc(100vh-60px)] lg:min-h-0 bg-[var(--color-page)] lg:bg-gradient-to-br lg:from-[var(--color-page)] lg:via-white lg:to-[var(--color-page)]">
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-12 max-w-md mx-auto w-full">
          <div className="mb-5 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)] mb-1.5">Welcome Back</h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)]">
              New to easyucr.com?{' '}
              <Link href="/signup" className="text-[var(--color-navy)] font-semibold hover:text-[var(--color-orange)] transition-colors">
                Create your free account
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
            Continue with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[var(--color-page)] text-slate-400">or sign in with email</span>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] sm:min-h-[48px] bg-[var(--color-navy)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-navy)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  Sign In to Your Account
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
                <span className="text-[10px] font-medium text-slate-600">Trusted</span>
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-center text-slate-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-[var(--color-navy)] hover:underline font-medium">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[var(--color-navy)] hover:underline font-medium">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-navy)]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
