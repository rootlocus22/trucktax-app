import Link from 'next/link';
import { CheckCircle, ArrowRight, TrendingDown, Users, Truck } from 'lucide-react';

export const metadata = {
  title: 'Pricing | QuickTruckTax',
  description: 'Simple, transparent pricing for Form 2290 filing. One flat rate, no hidden fees.',
};

export default function PricingPage() {
  const tiers = [
    {
      title: 'Single Truck',
      subtitle: 'Most Popular',
      price: '$34.99',
      priceSubtext: '/ filing',
      description: 'Includes IRS Tax Payment Processing',
      buttonText: 'File 1 Truck Now',
      buttonHref: '/signup',
      popular: true,
      features: [
        'Full Concierge Service (We type it for you)',
        'Instant WhatsApp Updates',
        'Schedule 1 sent via Email & SMS',
        'FREE VIN Corrections (Saves you $20)',
        '5-Year Document Storage',
        'Support in English, Hindi, & Punjabi',
      ],
      icon: Truck,
    },
    {
      title: 'Small Fleet',
      subtitle: 'High Value',
      price: '$29.99',
      priceSubtext: '/ per truck',
      description: 'Perfect for growing companies (2-24 trucks)',
      buttonText: 'Start Fleet Filing',
      buttonHref: '/signup',
      popular: false,
      features: [
        'Everything in Single Truck',
        'Bulk Upload (Send us one photo of your list)',
        'Priority Processing (First in line)',
        'Dedicated Account Manager',
        'Monthly Compliance Check',
      ],
      icon: Users,
    },
    {
      title: 'Low Mileage / Suspended',
      subtitle: 'Strategic Niche',
      price: '$24.99',
      priceSubtext: '/ filing',
      description: 'For trucks driving less than 5,000 miles',
      buttonText: 'File Suspended Vehicle',
      buttonHref: '/signup',
      popular: false,
      features: [
        'Correct "Category W" Selection (Guaranteed)',
        'No Tax Due to IRS (We ensure you pay $0 tax)',
        'Valid Schedule 1 for Tags/Registration',
      ],
      icon: TrendingDown,
    },
  ];

  const comparisonData = [
    {
      feature: 'Filing Fee',
      quicktrucktax: '$34.99',
      bigSoftware: '$9.95',
      localCPA: '$75 - $150',
      highlight: 'quicktrucktax',
    },
    {
      feature: 'VIN Corrections',
      quicktrucktax: 'FREE',
      bigSoftware: '$20 - $30',
      localCPA: 'Billable Hours',
      highlight: 'quicktrucktax',
    },
    {
      feature: 'Do I have to type?',
      quicktrucktax: 'NO (Send photo)',
      bigSoftware: 'YES (Complex forms)',
      localCPA: 'NO',
      highlight: 'quicktrucktax',
    },
    {
      feature: 'Text Alerts',
      quicktrucktax: 'FREE',
      bigSoftware: '$2 - $5',
      localCPA: 'NO',
      highlight: 'quicktrucktax',
    },
    {
      feature: 'Support Language',
      quicktrucktax: 'English/Hindi/Punjabi',
      bigSoftware: 'English Only',
      localCPA: 'English Only',
      highlight: 'quicktrucktax',
    },
    {
      feature: 'Total Real Cost',
      quicktrucktax: '$34.99',
      bigSoftware: '$40+ (w/ hidden fees)',
      localCPA: '$100+',
      highlight: 'quicktrucktax',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Headline Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--color-text)] mb-3">
          File Your 2290 in 5 Minutes. No Math. No Accounts.
        </h1>
        <p className="text-base text-[var(--color-muted)] max-w-3xl mx-auto">
          Most services charge you extra for text alerts and VIN corrections. We include everything in one flat fee.
        </p>
      </div>

      {/* 3-Tier Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          return (
            <div
              key={index}
              className={`bg-[var(--color-card)] rounded-xl border-2 ${
                tier.popular
                  ? 'border-[var(--color-orange)] shadow-lg'
                  : 'border-[var(--color-border)]'
              } p-6 relative`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-4 py-1 rounded-full text-xs font-semibold">
                    {tier.subtitle}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6 pt-2">
                <div className="w-12 h-12 bg-[var(--color-page-alt)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-[var(--color-orange)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-1">
                  {tier.title}
                </h3>
                {!tier.popular && (
                  <p className="text-xs text-[var(--color-muted)] mb-3">{tier.subtitle}</p>
                )}
                <div className="mb-2">
                  <span className="text-3xl font-semibold text-[var(--color-text)]">
                    {tier.price}
                  </span>
                  <span className="text-sm text-[var(--color-muted)] ml-1">
                    {tier.priceSubtext}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)]">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--color-orange)] flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-[var(--color-text)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.buttonHref}
                className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition ${
                  tier.popular
                    ? 'bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white shadow-md hover:shadow-lg'
                    : 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-page-alt)]'
                }`}
              >
                {tier.buttonText}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-center text-[var(--color-text)] mb-6">
          Why We Are Cheaper
        </h2>
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-page-alt)] border-b border-[var(--color-border)]">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-[var(--color-text)]">
                    Feature
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-[var(--color-orange)]">
                    QuickTruckTax
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-[var(--color-text)]">
                    The "Big" Software
                  </th>
                  <th className="text-center px-6 py-3 text-sm font-semibold text-[var(--color-text)]">
                    Your Local CPA
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-page-alt)] transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-[var(--color-orange)]">
                      {row.quicktrucktax}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-[var(--color-muted)]">
                      {row.bigSoftware}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-[var(--color-muted)]">
                      {row.localCPA}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pricing FAQ */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-center text-[var(--color-text)] mb-8">
          Pricing Questions
        </h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              Do I have to pay the IRS tax separately?
            </h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              Yes. This $34.99 is our service fee for preparing, reviewing, and filing your return. You will pay the actual road tax (usually $550) directly to the IRS inside our secure portal via Credit Card or Bank Debit.
            </p>
          </div>
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              What if my return gets rejected?
            </h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              We fix it for <strong>FREE</strong>. If you made a typo on the VIN, we will file a correction at zero cost to you. Most other companies charge $25 for this.
            </p>
          </div>
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6">
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              Is there a monthly subscription?
            </h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              No. You only pay once per year when you file.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] rounded-2xl p-8 text-center text-white">
        <h2 className="text-2xl font-semibold mb-3">
          Ready to Get Started?
        </h2>
        <p className="text-sm text-white/80 mb-6 max-w-2xl mx-auto">
          Join thousands of owner-operators who trust QuickTruckTax for their Form 2290 filing needs.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
        >
          Start Filing Now
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
