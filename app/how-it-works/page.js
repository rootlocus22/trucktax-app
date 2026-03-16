import Link from 'next/link';
import Script from 'next/script';
import { CTABanner } from '@/components/CTABanner';

export const metadata = {
  title: 'How EasyUCR Works — File UCR in 3 Steps | EasyUCR',
  description: 'File your UCR in under 10 minutes. Enter DOT number, we file with the government, pay only after confirmation. No upfront fees.',
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to File UCR with EasyUCR',
  description: 'File your UCR registration in 3 simple steps. No upfront payment.',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Enter your DOT number and fleet info',
      text: 'Enter your USDOT number and confirm your fleet size. Takes about 2 minutes.',
    },
    {
      '@type': 'HowToStep',
      name: 'We file your UCR with the government',
      text: 'We file your UCR using AI automation. No manual forms, no state websites.',
    },
    {
      '@type': 'HowToStep',
      name: 'Pay only after confirmation',
      text: 'Pay the $79 service fee plus government fee only when your UCR confirmation number is issued.',
    },
  ],
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/" className="hover:text-[var(--color-orange)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">How It Works</span>
        </nav>
        <CTABanner />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">How EasyUCR Works</h1>
        <p className="text-lg text-slate-600 mb-12">
          File your UCR in under 10 minutes. No upfront fees. Pay only when your confirmation number is issued.
        </p>

        <div className="space-y-12 mb-16">
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-orange)] text-white font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Enter your DOT number and fleet info (2 minutes)</h2>
              <p className="text-slate-600">Start by entering your USDOT number. Confirm your fleet size for accurate fee calculation.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-orange)] text-white font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">We file your UCR with the government using AI automation</h2>
              <p className="text-slate-600">We submit your registration to the correct state. No manual forms, no confusing state websites.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-orange)] text-white font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Pay $79 service fee only after your confirmation number is issued</h2>
              <p className="text-slate-600">You pay nothing until your UCR is confirmed. If filing fails, you owe nothing. Ever.</p>
            </div>
          </div>
        </div>

        <CTABanner />
      </div>
    </div>
  );
}
