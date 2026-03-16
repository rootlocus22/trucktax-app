'use client';

import Script from 'next/script';

/**
 * Renders FAQ list AND injects FAQPage JSON-LD schema
 */
export function FAQAccordion({ faqs }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="border border-slate-200 rounded-lg p-4 group bg-white"
          >
            <summary className="font-medium cursor-pointer list-none flex justify-between items-center">
              {faq.question}
              <span className="text-slate-400 group-open:rotate-180 transition-transform">
                ↓
              </span>
            </summary>
            <p className="mt-3 text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}
