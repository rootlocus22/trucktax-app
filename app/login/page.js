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
  Users,
  Zap,
  Award,
  Star,
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
      title: 'Official UCR Filing',
      description: 'Simple 3-step wizard to file your 2026 UCR registration correctly based on fleet size.'
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
      {/* Left Panel - Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-orange)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-sky)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">QuickTruckTax</h1>
            <p className="text-white/80 text-lg sm:text-xl">The Smart UCR Filing & Compliance Platform</p>
          </div>

          <div className="mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold mb-4 leading-[1.1] tracking-tight">
              Welcome to Your <span className="text-[var(--color-amber)]">UCR Compliance</span> Hub
            </h2>
            <p className="text-lg sm:text-xl lg:text-[1.375rem] text-white/90 leading-relaxed">
              Continue managing your trucking fleet with our guided UCR filing wizard, fee calculator, and secure certificate storage.
            </p>
          </div>

          <div className="space-y-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1 tracking-tight">{feature.title}</h3>
                    <p className="text-white/80 text-base leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>


          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[var(--color-amber)] text-xl">★</span>
                ))}
              </div>
              <span className="text-2xl font-bold">4.9/5</span>
            </div>
            <p className="text-white/90 italic mb-2">
              "Finally a UCR platform that makes sense. I filed my 2026 registration in 5 minutes and got my certificate instantly!"
            </p>
            <p className="text-white/70 text-sm">— Mark Dawson, Logistics Manager</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mt-auto">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-[var(--color-orange)]" />
            <h3 className="text-lg font-bold">Trusted by 10,000+ Truckers</h3>
          </div>
          <p className="text-white/80 text-sm font-light">Join thousands of professionals who trust QuickTruckTax for their UCR and compliance needs.</p>
        </div>

      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-white via-[var(--color-page)] to-white flex flex-col p-4 sm:p-6 lg:p-12 pb-safe">
        <div className="w-full max-w-md mx-auto flex-1">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">Welcome Back!</h1>
            <p className="text-[var(--color-muted)]">
              New to QuickTruckTax?{' '}
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
            className="w-full flex items-center justify-center gap-3 min-h-[52px] border-2 border-[var(--color-border)] bg-white py-3.5 rounded-xl font-semibold text-[var(--color-text)] hover:bg-[var(--color-page-alt)] transition disabled:opacity-50 mb-6 shadow-sm touch-manipulation"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-light">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] transition text-base bg-white"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] transition text-base bg-white"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
              className="w-full min-h-[52px] bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-navy-soft)] text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
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

          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                  <ShieldCheck className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-xs font-medium text-slate-600">Secure</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                  <Lock className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-xs font-medium text-slate-600">Private</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-xs font-medium text-slate-600">Trusted</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-center text-[var(--color-muted)]">
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
