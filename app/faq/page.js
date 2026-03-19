import Link from 'next/link';
import { HelpCircle, Truck, DollarSign, Calendar, FileText, Shield } from 'lucide-react';

export const metadata = {
  title: 'UCR FAQ - Complete Guide for Truckers | easyucr.com',
  description: 'Comprehensive FAQ about UCR registration. Get answers about fees, deadlines, who needs to file, and how to stay compliant.',
  keywords: ['ucr faq', 'ucr questions', 'ucr registration help', 'unified carrier registration'],
};

export default function FAQPage() {
  const faqs = [
    {
      category: 'UCR Basics',
      icon: FileText,
      questions: [
        {
          q: 'What is UCR registration?',
          a: 'UCR (Unified Carrier Registration) is a federally-mandated program requiring motor carriers, brokers, freight forwarders, and leasing companies operating in interstate commerce to register annually and pay a fee based on fleet size.'
        },
        {
          q: 'Who needs to file UCR?',
          a: 'Motor carriers, brokers, freight forwarders, and leasing companies that operate in interstate commerce must register for UCR. If you cross state lines with a commercial vehicle, you need UCR.'
        },
        {
          q: 'When is the UCR deadline?',
          a: 'The 2026 UCR filing deadline is December 31, 2025. Registration opens October 1, 2025. Enforcement starts January 1, 2026.'
        },
        {
          q: 'What happens if I miss the UCR deadline?',
          a: 'Late filing can result in state fines ($100–$5,000+), roadside detentions, and out-of-service orders. File as soon as possible to get back in compliance.'
        },
        {
          q: 'Do I need UCR if I only have one truck?',
          a: 'Yes. Owner-operators with 1–2 trucks pay the minimum $46 government fee. With EasyUCR, total is $125. You pay only after your confirmation number is issued.'
        },
      ]
    },
    {
      category: 'Pricing & Costs',
      icon: DollarSign,
      questions: [
        {
          q: 'How much does UCR cost?',
          a: 'Government UCR fees are set by fleet size: 0–2 trucks $46, 3–5 $138, 6–20 $276, 21–100 $963, 101–1,000 $4,592, 1,001+ $44,836. EasyUCR adds a tiered service fee (from $79 for small fleets) for guided filing—see easyucr.com/ucr/pricing for the full table.'
        },
        {
          q: 'Do brokers pay the same fee?',
          a: 'Brokers and freight forwarders pay the minimum $46 government fee regardless of fleet size, since they don\'t operate vehicles. Total with EasyUCR: $125.'
        },
        {
          q: 'Are there hidden fees?',
          a: 'No. You pay the official government UCR fee plus our tiered service fee—both are shown before you complete payment. No setup fees, no annual membership. You pay when your filing is confirmed.'
        },
        {
          q: 'What if my filing fails?',
          a: 'If filing fails for any reason, you pay nothing. Ever. We only charge when your UCR confirmation number is issued.'
        },
      ]
    },
    {
      category: 'Filing Process',
      icon: Calendar,
      questions: [
        {
          q: 'How long does UCR filing take?',
          a: 'With EasyUCR, most filings are completed in under 10 minutes. You enter your DOT number and fleet info; we file with the government.'
        },
        {
          q: 'Why do I pay after filing and not before?',
          a: 'We file your UCR first. You pay only when your confirmation number is issued. This removes risk—if filing fails, you owe nothing.'
        },
        {
          q: 'What if I\'m in a non-participating state (Florida, NJ, Oregon, Hawaii)?',
          a: 'You still need UCR if you cross state lines. You file through a participating state. EasyUCR handles this automatically—just enter your DOT number.'
        },
        {
          q: 'Can I file UCR myself for free?',
          a: 'You still pay the government fee. You can file directly through your state\'s UCR portal, but it can be confusing. EasyUCR handles the process for $79 and you pay only after confirmation.'
        },
      ]
    },
    {
      category: 'Support & Security',
      icon: Shield,
      questions: [
        {
          q: 'Is EasyUCR affiliated with the government?',
          a: 'No. EasyUCR is an independent filing service. We submit your UCR to the correct state on your behalf. We are not a government agency.'
        },
        {
          q: 'Is online filing safe?',
          a: 'Yes. We use bank-level encryption. Your data is secure and never sold or shared with third parties for marketing.'
        },
        {
          q: 'What customer support do you offer?',
          a: 'We offer email at support@vendaxsystemlabs.com and US phone support at +1 (347) 801-8631 during extended hours, especially during peak filing season (October–December).'
        },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--color-page)] to-white">
      {/* Hero Section */}
      <div className="bg-[var(--color-midnight)] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-6 text-blue-200" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            UCR Frequently Asked Questions
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Get expert answers to all your Unified Carrier Registration questions
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {faqs.map((category, idx) => {
          const IconComponent = category.icon;
          return (
            <section key={idx} className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-orange-soft)] flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-[var(--color-orange)]" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">{category.category}</h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((faq, i) => (
                  <details key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <summary className="flex justify-between items-center cursor-pointer p-6 font-bold text-slate-900 hover:bg-slate-50 transition">
                      <span className="text-lg">{faq.q}</span>
                      <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          );
        })}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-[var(--color-midnight)] to-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to File UCR?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Get your 2026 UCR done in under 10 minutes. $79 service fee, pay only after your confirmation number is issued.
          </p>
          <Link
            href="/ucr/file"
            className="inline-block bg-[var(--color-orange)] hover:bg-[var(--color-orange-hover)] text-white font-bold py-4 px-8 rounded-full transition-all hover:scale-105 shadow-lg"
          >
            Start UCR Filing →
          </Link>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <Link href="/resources" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition group">
            <h3 className="font-bold text-[var(--color-navy)] mb-2 group-hover:text-[var(--color-orange)]">Resource Library →</h3>
            <p className="text-sm text-slate-600">UCR guides, deadlines, and checklists</p>
          </Link>
          <Link href="/learn" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition group">
            <h3 className="font-bold text-[var(--color-navy)] mb-2 group-hover:text-[var(--color-orange)]">UCR Education Hub →</h3>
            <p className="text-sm text-slate-600">Learn everything about UCR</p>
          </Link>
          <Link href="/compare" className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition group">
            <h3 className="font-bold text-[var(--color-navy)] mb-2 group-hover:text-[var(--color-orange)]">Compare Providers →</h3>
            <p className="text-sm text-slate-600">See why EasyUCR is the best choice</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
