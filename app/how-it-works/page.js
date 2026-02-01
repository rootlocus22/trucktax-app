"use client";

import Link from 'next/link';
import Image from 'next/image';
import { 
  UserPlus, 
  Upload, 
  Sparkles, 
  FileCheck, 
  Clock, 
  ArrowRight, 
  ShieldCheck,
  Users,
  Zap,
  Award,
  Lock,
  Star,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up in seconds with Google or email. No complicated forms—just your basic information to get started.',
      image: '/dashboard-mockup-v2.png',
    },
    {
      number: 2,
      icon: Upload,
      title: 'Upload Your Documents',
      description: 'Upload a photo or PDF of your previous Schedule 1 or vehicle registration. Our system accepts multiple file formats and works with photos from your phone.',
      image: '/upload-filing-icon.png',
    },
    {
      number: 3,
      icon: Sparkles,
      title: 'AI Extracts Your Information',
      description: 'Our advanced AI technology automatically extracts all necessary information: business EIN, vehicle VINs, weight categories, and filing details. No manual typing required.',
      image: '/smart_filing_features_1764806445772.png',
    },
    {
      number: 4,
      icon: FileCheck,
      title: 'Expert Team Reviews & Files',
      description: 'Our tax professionals review the extracted data, verify accuracy, and file your Form 2290 with the IRS on your behalf. We handle everything.',
      image: '/schedule1-mockup.png',
    },
    {
      number: 5,
      icon: Clock,
      title: 'Receive Your Schedule 1',
      description: 'Once the IRS processes your filing, you\'ll receive your Schedule 1 PDF via email and SMS. Typically within 24 hours, often much faster.',
      image: '/schedule1-mockup.png',
    },
  ];

  const benefits = [
    {
      icon: Sparkles,
      title: 'AI-Powered Technology',
      description: 'Advanced AI extracts data automatically, eliminating manual entry errors and saving you time.',
    },
    {
      icon: Users,
      title: 'Expert Team Review',
      description: 'Our tax professionals review every filing to ensure accuracy and compliance before submission.',
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Get your Schedule 1 quickly. Most filings are processed within 24 hours, often much faster.',
    },
    {
      icon: ShieldCheck,
      title: '100% Accuracy Guarantee',
      description: 'We catch errors before submission and offer free corrections if needed. Your filing is in expert hands.',
    },
    {
      icon: MessageSquare,
      title: '24/7 Support',
      description: 'Get help when you need it. Our support team is available around the clock to assist you.',
    },
    {
      icon: Award,
      title: 'Trusted by Thousands',
      description: 'Join 10,000+ truckers who trust QuickTruckTax for their Form 2290 filing needs.',
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section - Professional */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] text-white py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0">
          <Image
            src="/hero-truck-sunset.png"
            alt="Truck on highway"
            fill
            className="object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)] via-[var(--color-midnight)]/90 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 mb-8">
              <Users className="w-3.5 h-3.5" /> <span>Expert Concierge Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              How Our <span className="text-[var(--color-orange)]">Concierge Service</span> Works
        </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-light">
              Our expert team handles your Form 2290 filing from start to finish. You provide the information, we handle everything else—review, filing, and delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-orange-500/20 transition hover:bg-[#e66a15] active:scale-[0.98] min-h-[56px]"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base transition hover:bg-white/20 active:scale-[0.98] min-h-[56px]"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner - Refined */}
      <div className="bg-white border-b border-slate-200 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Users className="w-7 h-7 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Expert Team</p>
                <p className="text-xs text-slate-500 mt-1">Tax Professionals</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Lock className="w-7 h-7 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Secure & Private</p>
                <p className="text-xs text-slate-500 mt-1">256-Bit SSL</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Award className="w-7 h-7 text-slate-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">99.8% Success</p>
                <p className="text-xs text-slate-500 mt-1">Accuracy Rate</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Star className="w-7 h-7 text-slate-700 fill-slate-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">4.9/5 Rating</p>
                <p className="text-xs text-slate-500 mt-1">10,000+ Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section - Professional Design */}
      <section className="py-20 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Simple 5-Step Process
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-light">
              From signup to Schedule 1, we make Form 2290 filing effortless
            </p>
          </div>

          <div className="space-y-16 sm:space-y-20 lg:space-y-24">
        {steps.map((step, index) => {
          const Icon = step.icon;
              const isEven = index % 2 === 0;
              
          return (
            <div key={step.number} className="relative">
                  {/* Desktop: Professional Alternating Layout */}
                  <div className={`hidden lg:grid lg:grid-cols-12 gap-8 xl:gap-12 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}>
                    {/* Image - Left on even, Right on odd */}
                    <div className={`relative h-96 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 ${!isEven ? 'lg:col-start-7 lg:col-span-6' : 'lg:col-span-6'}`}>
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-slate-900/10 to-transparent" />
                      {/* Step Number Badge */}
                      <div className="absolute top-6 left-6">
                        <div className="w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 flex items-center justify-center shadow-lg">
                          <span className="text-xl font-bold text-slate-900">{step.number}</span>
                        </div>
                      </div>
                      {/* Icon Badge */}
                      <div className="absolute bottom-6 right-6">
                        <div className="w-14 h-14 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-xl">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`space-y-5 ${!isEven ? 'lg:col-start-1 lg:col-span-5 lg:row-start-1' : 'lg:col-start-7 lg:col-span-5'}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-slate-300" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step {step.number}</span>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Mobile: Professional Stacked Layout */}
                  <div className="lg:hidden">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Image */}
                      <div className="relative h-56 bg-slate-100">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-slate-900/20 to-transparent" />
                        {/* Step Number */}
                        <div className="absolute top-4 left-4">
                          <div className="w-10 h-10 rounded-lg bg-white/95 backdrop-blur-sm border border-slate-200 flex items-center justify-center shadow-md">
                            <span className="text-lg font-bold text-slate-900">{step.number}</span>
                          </div>
                        </div>
                        {/* Icon */}
                        <div className="absolute bottom-4 right-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-lg">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                  </div>
                </div>

                {/* Content */}
                      <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-px w-8 bg-slate-300" />
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Step {step.number}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
                    {step.title}
                  </h3>
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>
              </div>
                  </div>

                  {/* Connector Line (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex justify-center my-12">
                      <div className="w-px h-16 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent" />
                    </div>
                  )}
            </div>
          );
        })}
      </div>
        </div>
      </section>

      {/* Benefits Section - Enterprise Design */}
      <section className="py-20 sm:py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Why Choose Our Service?
        </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-light">
              More than just filing—we're your dedicated compliance partner
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors">
                    <Icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
            </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section - Professional */}
      <section className="py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
            <div>
              <div className="flex items-center gap-2 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-3 text-2xl font-bold">4.9/5</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
                Trusted by Thousands of Truckers
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed font-light">
                "QuickTruckTax made filing so easy. Their team handled everything—I just provided my info and they took care of the rest. Got my Schedule 1 the next day. Best service I've used!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-lg">Mike Thompson</p>
                  <p className="text-slate-400 text-sm">Owner-Operator, 15+ Years</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <p className="text-4xl sm:text-5xl font-bold mb-2">10,000+</p>
                <p className="text-slate-400 text-sm">Happy Customers</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <p className="text-4xl sm:text-5xl font-bold mb-2">99.8%</p>
                <p className="text-slate-400 text-sm">Success Rate</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <p className="text-4xl sm:text-5xl font-bold mb-2">24/7</p>
                <p className="text-slate-400 text-sm">Support</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center">
                <p className="text-4xl sm:text-5xl font-bold mb-2">2 min</p>
                <p className="text-slate-400 text-sm">Avg Setup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Professional */}
      <section className="py-20 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Ready to Get Started?
        </h2>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-light">
            Join thousands of truckers who trust QuickTruckTax. Let our expert team handle your Form 2290 filing.
        </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-orange-500/20 transition hover:bg-[#e66a15] active:scale-[0.98] min-h-[56px]"
          >
            Start Filing Now
              <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/pricing"
              className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 text-slate-900 px-8 py-4 rounded-xl font-semibold text-base transition hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] min-h-[56px]"
          >
            View Pricing
          </Link>
        </div>
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 font-light">
              Expert Team • Fast Processing • Free VIN Corrections • 24/7 Support
            </p>
          </div>
      </div>
      </section>
    </div>
  );
}
