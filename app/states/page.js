import Link from 'next/link';
import { StateCard } from '@/components/StateCard';
import { UCR_STATES } from '@/lib/states';
import { CTABanner } from '@/components/CTABanner';

export const metadata = {
  title: 'UCR Registration by State — All 41 States | EasyUCR',
  description: 'File UCR for your state. 41 participating states plus non-participating (FL, NJ, OR, HI). $79 service fee, pay after filing.',
};

export default function StatesPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <nav className="text-sm text-slate-600 mb-8">
          <Link href="/" className="hover:text-[var(--color-orange)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">States</span>
        </nav>
        <h1 className="text-3xl font-bold text-slate-900 mb-6">UCR Registration by State</h1>
        <p className="text-lg text-slate-600 mb-12">
          Select your state to see state-specific UCR information. Most states participate in UCR. Florida, New Jersey, Oregon, and Hawaii do not—carriers there still need UCR if crossing state lines.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
          {UCR_STATES.map((state) => (
            <StateCard key={state.slug} state={state} />
          ))}
        </div>
        <CTABanner />
      </div>
    </div>
  );
}
