import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UCR_STATES, getStateBySlug } from '@/lib/states';
import { BreadcrumbNav } from '@/components/BreadcrumbNav';
import { UCRFeeCalculator } from '@/components/UCRFeeCalculator';
import { CTABanner } from '@/components/CTABanner';
import { FAQAccordion } from '@/components/FAQAccordion';

export async function generateStaticParams() {
  return UCR_STATES.map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }) {
  const state = getStateBySlug(params.state);
  if (!state) return { title: 'State Not Found | EasyUCR' };
  return {
    title: `UCR Registration for ${state.name} Carriers — File Online | EasyUCR`,
    description: `${state.name} motor carriers: file your 2026 UCR registration online. $79 service fee, no upfront payment. Fast, easy, guaranteed.`,
  };
}

function getStateFAQs(state) {
  const base = [
    { question: `Do I need UCR if I'm based in ${state.name}?`, answer: state.participates ? `Yes. ${state.name} participates in UCR. If you operate in interstate commerce, you must register.` : `${state.name} does not participate in UCR, but if you cross state lines you still must file. Register through a neighboring participating state.` },
    { question: `What is the UCR fee for ${state.name} carriers?`, answer: 'UCR fees are set by fleet size, not by state. Use the calculator above to see your exact fee.' },
  ];
  if (!state.participates) {
    base.push({ question: `How do I file UCR from ${state.name}?`, answer: `Since ${state.name} does not participate, file through a neighboring participating state (e.g., Georgia for Florida). EasyUCR handles this automatically—just enter your DOT number.` });
  }
  return base;
}

export default function StatePage({ params }) {
  const state = getStateBySlug(params.state);
  if (!state) notFound();

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states' },
    { label: state.name, href: null },
  ];

  const faqs = getStateFAQs(state);

  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <BreadcrumbNav items={breadcrumbs} />
        <CTABanner variant={!state.participates ? 'urgent' : 'default'} />
        <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6">
          UCR Registration for {state.name} Motor Carriers
        </h1>
        <p className="text-lg text-slate-600 mb-6">
          {state.participates
            ? `${state.name} participates in the UCR program. File your 2026 UCR registration online. $79 service fee, no upfront payment.`
            : `${state.name} does not participate in UCR. If you operate in interstate commerce, you still must file—register through a neighboring participating state. EasyUCR handles this for you.`}
        </p>
        {!state.participates && (
          <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Non-participating state:</strong> You must file UCR through a participating state. We will use the correct state for your filing.
            </p>
          </div>
        )}
        <div className="mb-12">
          <UCRFeeCalculator />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">State-Specific Information</h2>
        <p className="text-slate-600 mb-8">
          {state.participates
            ? `${state.name} enforces UCR compliance. File by December 31 to avoid penalties.`
            : `Carriers based in ${state.name} who cross state lines must register. We file through the appropriate participating state.`}
        </p>
        <div className="mb-8">
          <Link
            href="/ucr/file"
            className="inline-block bg-[var(--color-orange)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#e66a15] transition"
          >
            File your {state.name} UCR now →
          </Link>
        </div>
        <div className="mb-8">
          <h3 className="font-semibold text-slate-900 mb-2">Related resources</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/learn/what-is-ucr" className="text-[var(--color-orange)] hover:underline">What is UCR?</Link></li>
            <li><Link href="/pricing" className="text-[var(--color-orange)] hover:underline">Pricing</Link></li>
            <li><Link href="/learn/ucr-deadline-2026" className="text-[var(--color-orange)] hover:underline">UCR Deadline 2026</Link></li>
          </ul>
        </div>
        <FAQAccordion faqs={faqs} />
        <div className="mt-12"><CTABanner /></div>
      </article>
    </div>
  );
}
