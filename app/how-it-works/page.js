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
    <div className="max-w-7xl mx-auto">
      {/* Hero with truck/highway vibe */}
      <div className="relative rounded-2xl overflow-hidden mb-16 h-56 sm:h-72">
        <Image
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=85"
          alt="Highway and trucks - life on the road"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-midnight)]/80 via-[var(--color-midnight)]/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            How QuickTruckTax Works
          </h1>
          <p className="text-white/90 max-w-xl text-sm sm:text-base">
            From upload to stamped Schedule 1—we handle everything so you can focus on the road.
          </p>
        </div>
      </div>

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

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-3">
          Explore Our Resources
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-6 max-w-2xl mx-auto">
          Guides, checklists, and tools for Form 2290 and trucking compliance.
        </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/resources"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
          >
            Explore Resources
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
          <div className="mt-8 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 font-light">
              Expert Team • Fast Processing • Free VIN Corrections • 24/7 Support
            </p>
        </div>
      </div>
    </div>
  );
}
