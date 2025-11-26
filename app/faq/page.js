import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'FAQ | QuickTruckTax',
  description: 'Frequently asked questions about Form 2290 filing, pricing, and our services.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'Do I need to pay if my truck drives less than 5,000 miles?',
      answer: 'No tax is due, but you MUST still file Form 2290 to report it as a "Suspended Vehicle" (Category W). We handle this for you. Even if your vehicle qualifies for suspension, the IRS requires you to file Form 2290 to document this status.',
    },
    {
      question: 'How fast will I get my Schedule 1?',
      answer: 'Usually within 15-30 minutes after the IRS accepts the return. Once our certified tax professionals review and file your return, the IRS typically processes it within minutes. You\'ll receive an email and SMS notification as soon as your stamped Schedule 1 is ready for download.',
    },
    {
      question: 'Can I file for multiple trucks?',
      answer: 'Yes, our dashboard lets you add as many trucks as you need. Each vehicle requires a separate Form 2290 filing, but you can manage all of them from one convenient dashboard. Upload multiple Schedule 1 PDFs or use our manual entry for each vehicle.',
    },
    {
      question: 'Is this legitimate?',
      answer: 'Yes. Your return is filed directly with the IRS system. You receive the official IRS-watermarked Schedule 1 PDF, which is valid for DMV registration. We are an authorized IRS E-File Provider through our partner network, and all filings are handled by PTIN-certified tax professionals.',
    },
    {
      question: 'What information do I need to file?',
      answer: 'You\'ll need your business EIN, vehicle VIN numbers, gross weight categories, and the first month each vehicle was used. If you have a previous Schedule 1, you can simply upload it and we\'ll extract all the necessary information automatically using AI technology.',
    },
    {
      question: 'What if I make a mistake?',
      answer: 'Our expert review process catches errors before filing. If an error is discovered after filing, we\'ll help you file an amended return. VIN corrections are included at no additional cost if needed.',
    },
    {
      question: 'How do I pay?',
      answer: 'We accept all major credit cards and debit cards. Payment is processed securely through our encrypted payment system. You only pay once your filing is successfully submitted to the IRS.',
    },
    {
      question: 'What if my filing is rejected by the IRS?',
      answer: 'If your filing is rejected, we\'ll immediately notify you and help you correct any issues at no additional charge. Our team works with you to resolve rejections quickly so you can get your Schedule 1 without delay.',
    },
    {
      question: 'Do you store my information securely?',
      answer: 'Yes. We use bank-level encryption to protect all your data. Your information is stored securely for 5 years as required by IRS regulations, and you can access your records anytime through your dashboard.',
    },
    {
      question: 'Can I file for previous tax years?',
      answer: 'Form 2290 is typically filed for the current tax year (July 1 - June 30). If you need to file for a previous year, please contact our support team for assistance with late filings.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--color-text)] mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-[var(--color-muted)]">
          Everything you need to know about Form 2290 filing with QuickTruckTax
        </p>
      </div>

      {/* FAQ List */}
      <div className="space-y-6 mb-16">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-6 hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-text)]">
              {faq.question}
            </h3>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      {/* Still Have Questions CTA */}
      <div className="bg-gradient-to-br from-[var(--color-midnight)] via-[var(--color-navy)] to-[var(--color-navy-soft)] rounded-2xl p-8 text-center text-white mb-8">
        <h2 className="text-2xl font-semibold mb-3">
          Still Have Questions?
        </h2>
        <p className="text-sm text-white/80 mb-6 max-w-2xl mx-auto">
          Our support team is here to help. Get in touch and we'll answer any questions you have.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-orange)] to-[#ff7a20] text-white px-6 py-3 rounded-lg font-semibold text-sm transition shadow-md hover:shadow-lg"
          >
            Start Filing Now
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold text-sm transition hover:bg-white/10"
          >
            View Guides
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/pricing"
          className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md transition text-center"
        >
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
            View Pricing
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            See our simple, transparent pricing
          </p>
        </Link>
        <Link
          href="/insights"
          className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] p-5 hover:shadow-md transition text-center"
        >
          <h3 className="text-base font-semibold text-[var(--color-text)] mb-1">
            Learn More
          </h3>
          <p className="text-xs text-[var(--color-muted)]">
            Read our comprehensive guides
          </p>
        </Link>
      </div>
    </div>
  );
}

