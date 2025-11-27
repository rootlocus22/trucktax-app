import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { blogPosts } from '../blogData';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.id,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.id === resolvedParams.slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  const baseUrl = 'https://quicktrucktax.com';
  const blogUrl = `${baseUrl}/blog/${post.id}`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords.join(', '),
    authors: [{ name: 'QuickTruckTax Team' }],
    creator: 'QuickTruckTax',
    publisher: 'QuickTruckTax',
    alternates: {
      canonical: blogUrl,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: blogUrl,
      siteName: 'QuickTruckTax',
      type: 'article',
      publishedTime: post.dateISO,
      modifiedTime: post.dateISO,
      authors: ['QuickTruckTax Team'],
      section: post.category,
      tags: post.keywords,
      locale: 'en_US',
      images: [
        {
          url: `${baseUrl}/quicktrucktax-logo.png`,
          width: 1280,
          height: 720,
          alt: `${post.title} - QuickTruckTax`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@quicktrucktax',
      creator: '@quicktrucktax',
      title: post.title,
      description: post.excerpt,
      images: [`${baseUrl}/quicktrucktax-logo.png`],
    },
  };
}

export default async function BlogPost({ params }) {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.id === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const baseUrl = 'https://quicktrucktax.com';
  const blogUrl = `${baseUrl}/blog/${post.id}`;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: `${baseUrl}/quicktrucktax-logo.png`,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    author: {
      '@type': 'Organization',
      name: 'QuickTruckTax',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuickTruckTax',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/quicktrucktax-logo.png`,
        width: 1280,
        height: 720,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': blogUrl,
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
    wordCount: post.readTime,
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: blogUrl,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="min-h-screen bg-[var(--color-page)]">
        {/* Breadcrumb */}
        <div className="bg-[var(--color-card)] border-b border-[var(--color-border)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center text-sm text-[var(--color-muted)]">
              <Link href="/" className="hover:text-[var(--color-navy)]">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-[var(--color-navy)]">Blog</Link>
              <span className="mx-2">/</span>
              <span className="text-[var(--color-text)] font-medium">{post.category}</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <header className="relative bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy-soft)] text-white py-20 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
            <Image
              src="/hero-truck-sunset.png"
              alt="Trucking background"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-[var(--color-sky)]/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold text-[var(--color-sky)]">
                {post.category}
              </span>
              <span className="text-white/80">{post.readTime} read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <p className="text-xl text-white/90 mb-6">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm">
              <span>📅 {post.date}</span>
              <span>✍️ QuickTruckTax Team</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-[var(--color-card)] rounded-lg shadow-lg p-8 md:p-12 border border-[var(--color-border)]">
            {/* Table of Contents */}
            {post.tableOfContents && post.tableOfContents.length > 0 && (
              <nav className="bg-[var(--color-page-alt)] rounded-lg p-6 mb-8 border border-[var(--color-border)]">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-navy)]">📋 Table of Contents</h2>
                <ul className="space-y-2">
                  {post.tableOfContents.map((item, idx) => (
                    <li key={idx}>
                      <a href={`#${item.id}`} className="text-[var(--color-navy)] hover:text-[var(--color-orange)] hover:underline transition-colors">
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none text-[var(--color-text)]">
              {post.content}
            </div>

            {/* Keywords Section */}
            <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
              <h3 className="text-lg font-bold mb-4 text-[var(--color-text)]">Related Keywords:</h3>
              <div className="flex flex-wrap gap-2">
                {post.keywords.map((keyword, idx) => (
                  <span key={idx} className="bg-[var(--color-page-alt)] text-[var(--color-navy)] px-3 py-1 rounded-full text-sm font-medium">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Box */}
            <div className="mt-12 bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy-soft)] text-white rounded-lg p-8 text-center shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Ready to File Your Form 2290?</h3>
              <p className="mb-6 text-white/90">
                Stop reading, start filing! E-file your Form 2290 in minutes and get your Schedule 1 instantly.
              </p>
              <Link
                href="/tools/hvut-calculator"
                className="inline-block bg-[var(--color-orange)] text-white px-8 py-3 rounded-lg font-bold hover:bg-[var(--color-orange)]/90 transition-colors shadow-md"
              >
                Calculate Your HVUT Tax Now →
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-3xl font-bold mb-6 text-[var(--color-text)]">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {post.relatedPosts.map((relatedId) => {
                  const related = blogPosts.find((p) => p.id === relatedId);
                  return related ? (
                    <Link
                      key={related.id}
                      href={`/blog/${related.id}`}
                      className="bg-[var(--color-card)] rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-[var(--color-border)]"
                    >
                      <div className="text-sm text-[var(--color-orange)] font-semibold mb-2">{related.category}</div>
                      <h3 className="font-bold mb-2 hover:underline text-[var(--color-text)]">{related.title}</h3>
                      <p className="text-sm text-[var(--color-muted)]">{related.readTime} read</p>
                    </Link>
                  ) : null;
                })}
              </div>
            </section>
          )}
        </main>
      </article>
    </>
  );
}

