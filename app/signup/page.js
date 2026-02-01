'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  FileCheck,
  Clock,
  DollarSign
} from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

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
      router.push('/dashboard');
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
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Users,
      title: 'Expert Team Review',
      description: 'Our tax professionals handle your Form 2290 filing from start to finish.'
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Get your Schedule 1 typically within 24 hours, often much faster.'
    },
    {
      icon: ShieldCheck,
      title: '100% Accuracy',
      description: 'We catch errors before submission and offer free corrections if needed.'
    },
    {
      icon: DollarSign,
      title: 'Transparent Pricing',
      description: 'Flat $34.99 fee with no hidden charges. Free VIN corrections included.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Panel - Professional Marketing */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-truck-sunset.png"
            alt="Truck on highway"
            fill
            className="object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/90 to-transparent" />
        </div>
        
        <div className="relative z-10 p-10 xl:p-12 flex flex-col justify-between w-full">
          <div>
            <div className="mb-12">
              <h1 className="text-3xl font-bold mb-2 tracking-tight">QuickTruckTax</h1>
              <p className="text-white/70 text-base font-light">Expert Form 2290 Filing Service</p>
            </div>

            <div className="mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
                Start Your <span className="text-[var(--color-orange)]">Compliant</span> Journey
              </h2>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed font-light max-w-lg">
                Join thousands of trucking professionals who trust QuickTruckTax for expert Form 2290 filing and compliance management.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-12">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                    <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold mb-1.5 tracking-tight">{benefit.title}</h3>
                    <p className="text-white/70 text-xs leading-relaxed font-light">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-xl font-bold">4.9/5</span>
                <span className="text-white/60 text-sm font-light">(10,000+ reviews)</span>
              </div>
              <p className="text-white/90 italic mb-2 text-sm leading-relaxed">
                "I've been using QuickTruckTax for 3 years. Their service is fast, reliable, and saves me hours every filing season."
              </p>
              <p className="text-white/60 text-xs">— Sarah Martinez, Fleet Manager</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-[var(--color-orange)]" />
              <h3 className="text-lg font-bold">Join 10,000+ Success Stories</h3>
            </div>
            <p className="text-white/80 text-sm font-light">Get started in minutes. File your first Form 2290 today and experience the difference.</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col p-6 sm:p-8 lg:p-12 xl:p-16">
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Create Your Account</h1>
            <p className="text-sm sm:text-base text-slate-600 font-light">
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
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 bg-white py-3.5 rounded-xl font-semibold text-slate-900 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed mb-6 shadow-sm min-h-[52px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-light">Or sign up with email</span>
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
              <p className="mt-1.5 text-xs text-slate-500 font-light">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-navy)] focus:border-[var(--color-navy)] transition text-base bg-white"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
              className="w-full bg-[var(--color-navy)] text-white py-3.5 rounded-xl font-semibold hover:bg-[var(--color-navy-soft)] active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-navy)]/20 min-h-[52px]"
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
                <span className="text-xs font-medium text-slate-600">Free to Start</span>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-center text-slate-500 font-light">
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
