import Link from 'next/link';
import Script from 'next/script';

/**
 * Breadcrumb with BreadcrumbList JSON-LD schema
 */
export function BreadcrumbNav({ items }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.easyucr.com';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href ? `${baseUrl.replace(/\/$/, '')}${item.href}` : undefined,
    })),
  };

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600 mb-6">
        <ol className="flex flex-wrap items-center gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-400">/</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-[var(--color-orange)] transition">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
