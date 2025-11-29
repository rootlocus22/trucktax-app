import Link from 'next/link';
import { CheckCircle, ArrowRight, TrendingDown, Users, Truck, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Pricing | QuickTruckTax',
  description: 'Simple, transparent pricing for Form 2290 filing. One flat rate, no hidden fees.',
};

export default function PricingPage() {
  const tiers = [
    {
      title: 'Suspended / Low Miles',
      subtitle: 'Category W',
      price: '$29.99', // Increased from $24.99 to cover basic ad spend
      priceSubtext: '/ filing',
      description: 'For trucks driving less than 5,000 miles (No Tax Due)',
      buttonText: 'File Suspended Now',
      buttonHref: '/signup',
      popular: false,
      features: [
        'Guaranteed "Category W" Selection',
        'We Ensure You Pay $0 Road Tax',
        'Valid Schedule 1 for Tags/DMV',
        'Standard Processing Speed',
      ],
      icon: TrendingDown,
    },
    {
      title: 'Standard Filing',
      subtitle: 'Most Popular',
      price: '$39.99', // Increased from $34.99 to break even on Ad Spend
      priceSubtext: '/ filing',
      description: 'Full Service Concierge Filing',
      buttonText: 'File Standard Now',
      buttonHref: '/signup',
      popular: true,
      features: [
        'Full Concierge Service (We type it)',
        'Schedule 1 sent via WhatsApp & Email',
        'FREE VIN Corrections',
        'Instant Text Alerts',
        'Support in Hindi, Punjabi, English',
      ],
      icon: Truck,
    },
    {
      title: 'VIP + Audit Defense',
      subtitle: 'Maximum Protection',
      price: '$49.99', // The "Profit Maker" Tier
      priceSubtext: '/ filing',
      description: 'Priority handling & audit protection peace of mind',
      buttonText: 'File VIP Now',
      buttonHref: '/signup',
      popular: false,
      features: [
        'Everything in Standard',
        '🚀 Priority "Skip the Line" Processing',
        '🛡️ IRS Audit Defense Support',
        'Dedicated Senior Agent Review',
        '5-Year Secure Document Vault',
      ],
      icon: ShieldCheck, // Changed icon to Shield
    },
  ];

  const comparisonData = [
    {
      feature: 'Filing Fee',
      quicktrucktax: '$39.99',
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
      feature: 'Audit Defense',
      quicktrucktax: 'Available (VIP)',
      bigSoftware: '$49.99 Extra',
      localCPA: '$150/hr',
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
      feature: 'Total Real Cost',
      quicktrucktax: '$39.99',
      bigSoftware: '$50+ (w/ hidden fees)',
      localCPA: '$100+',
      highlight: 'quicktrucktax',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Headline Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-4">
          Simple Pricing. <span className="text-[var(--color-orange)]">Profitable Results.</span>
        </h1>
        <p className="text-base text-[var(--color-muted)] max-w-2xl mx-auto">
          Don't risk IRS penalties with cheap software. Get a certified professional to handle your 2290 filing for less than half the cost of a CPA.
        </p>
      </div>

      {/* 3-Tier Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          return (
            <div
              key={index}
              className={`bg-[var(--color-card)] rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${tier.popular
                  ? 'border-[var(--color-orange)] shadow-xl ring-1 ring-[var(--color-orange)]/20 relative z-10'
                  : 'border-[var(--color-border)] shadow-sm hover:shadow-md'
                } p-6 flex flex-col`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                    {tier.subtitle}
                  </span>
                </div>
              )}

              <div className="text-center mb-8 pt-2">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${tier.popular ? 'bg-[var(--color-orange)]/10' : 'bg-[var(--color-page-alt)]'
                  }`}>
                  <Icon className={`w-7 h-7 ${tier.popular ? 'text-[var(--color-orange)]' : 'text-[var(--color-text)]'}`} />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-text)] mb-1">
                  {tier.title}
                </h3>
                {!tier.popular && (
                  <p className="text-xs text-[var(--color-muted)] font-medium">{tier.subtitle}</p>
                )}
                <div className="mt-4 mb-2 flex items-baseline justify-center">
                  <span className="text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
                    {tier.price}
                  </span>
                  <span className="text-sm text-[var(--color-muted)] ml-1 font-medium">
                    {tier.priceSubtext}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)] px-4">{tier.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.popular ? 'text-[var(--color-orange)]' : 'text-green-500'
                      }`} />
                    <span className="text-sm text-[var(--color-text)]/90">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.buttonHref}
                className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${tier.popular
                    ? 'bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white shadow-lg hover:shadow-orange-500/25 hover:scale-[1.02]'
                    : 'bg-[var(--color-page-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)] hover:text-black border border-transparent'
                  }`}
              >
                {tier.buttonText}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="mb-20">
        <h2 className="text-2xl font-bold text-center text-[var(--color-text)] mb-8">
          The "True Cost" Comparison
        </h2>
        <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-page-alt)] border-b border-[var(--color-border)]">
                  <th className="text-left px-6 py-4 text-sm font-bold text-[var(--color-text)]">
                    Feature
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-bold text-[var(--color-orange)] bg-[var(--color-orange)]/5">
                    QuickTruckTax
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[var(--color-muted)]">
                    Competitor Software
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[var(--color-muted)]">
                    Typical CPA
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-page-alt)]/50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-text)]">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-sm text-center font-bold text-[var(--color-text)] bg-[var(--color-orange)]/5 border-x border-[var(--color-orange)]/10">
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

      {/* CTA Section */}
      <div className="relative overflow-hidden bg-[var(--color-midnight)] rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl">
        {/* Background Gradient Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[var(--color-navy)]/50 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">
            Ready to File?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto text-lg">
            Join thousands of owner-operators who save time and money with QuickTruckTax.
            Get your stamped Schedule 1 in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[var(--color-orange)] text-white px-8 py-4 rounded-xl font-bold text-base transition hover:bg-[#ff7a20] shadow-lg hover:shadow-orange-500/20"
            >
              Start Filing Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="mt-6 text-xs text-white/40">
            Secure 256-bit SSL Encryption • IRS Authorized Provider via Partner Network
          </p>
        </div>
      </div>
    </div>
  );
}