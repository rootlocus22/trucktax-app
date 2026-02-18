import Link from 'next/link';
import Image from 'next/image';
import { UserPlus, LogIn, Upload, Sparkles, FileCheck, Clock, ArrowRight, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'How It Works | QuickTruckTax',
  description: 'Learn how QuickTruckTax makes Form 2290 filing simple. Upload your Schedule 1, AI extracts data, and our agents file it for you.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      icon: UserPlus,
      title: 'Sign Up or Login',
      description: 'Create your account in seconds with one-click Google login, or use email and password. No complicated forms to fill out.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      number: 2,
      icon: Upload,
      title: 'Upload Schedule 1 PDF',
      description: 'Simply upload a photo or PDF of your previous Schedule 1 or vehicle registration. Our system accepts multiple file formats.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      number: 3,
      icon: Sparkles,
      title: 'AI Automatically Extracts Information',
      description: 'Our advanced AI technology instantly extracts all necessary information: business EIN, vehicle VINs, weight categories, and filing details. No manual typing required.',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      number: 4,
      icon: FileCheck,
      title: 'Expert Agents Review & File',
      description: 'Our PTIN-certified tax professionals review the extracted data, verify accuracy, and electronically file your Form 2290 directly with the IRS.',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      number: 5,
      icon: Clock,
      title: 'Get Your Schedule 1 Within Hours',
      description: 'Once the IRS accepts your filing, you\'ll receive your stamped Schedule 1 PDF via email and SMS. Usually within 15-30 minutes, guaranteed within hours.',
      color: 'from-[var(--color-orange)] to-[#ff7a20]',
      bgColor: 'bg-[var(--color-page-alt)]',
      iconColor: 'text-[var(--color-orange)]',
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

      {/* Header (for accessibility, minimal duplicate) */}
      <div className="text-center mb-12 sr-only">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--color-text)] mb-3">
          How QuickTruckTax Works
        </h1>
        <p className="text-base text-[var(--color-muted)] max-w-2xl mx-auto">
          Our done-for-you service makes Form 2290 filing effortless. From upload to stamped Schedule 1, we handle everything.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-8 mb-16">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-[var(--color-border)] to-transparent hidden md:block"></div>
              )}
              
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="mt-2 text-center md:text-left">
                    <span className="text-xs font-medium text-[var(--color-muted)]">Step {step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 ${step.bgColor} rounded-xl p-6 border border-[var(--color-border)]`}>
                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] rounded-2xl p-8 text-white mb-12">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Why Choose Our Service?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-[var(--color-sand)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Extraction</h3>
            <p className="text-sm text-white/80">
              Advanced AI technology extracts all data automatically, eliminating manual entry errors.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileCheck className="w-6 h-6 text-[var(--color-sand)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Expert Review</h3>
            <p className="text-sm text-white/80">
              PTIN-certified tax professionals review every filing to ensure accuracy and compliance.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-[var(--color-sand)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast Turnaround</h3>
            <p className="text-sm text-white/80">
              Get your stamped Schedule 1 within hours, not days. Most filings complete in 15-30 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-3">
          Explore Our Resources
        </h2>
        <p className="text-sm text-[var(--color-muted)] mb-6 max-w-2xl mx-auto">
          Guides, checklists, and tools for Form 2290 and trucking compliance.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/resources"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
          >
            Explore Resources
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

