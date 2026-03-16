import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { blogPosts } from '../blogData';
import StickyFileCTA from '@/app/components/StickyFileCTA';
import { Calendar, Clock, ChevronRight, Hash, Share2, ArrowLeft } from 'lucide-react';

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

  const baseUrl = 'https://www.easyucr.com';
  const blogUrl = `${baseUrl}/blog/${post.id}`;

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords?.join(', '),
    authors: [{ name: 'easyucr.com Team' }],
    creator: 'easyucr.com',
    publisher: 'easyucr.com',
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
      siteName: 'easyucr.com',
      type: 'article',
      publishedTime: post.dateISO,
      modifiedTime: post.dateISO,
      authors: ['easyucr.com Team'],
      section: post.category,
      tags: post.keywords,
      locale: 'en_US',
      images: [
        {
          url: post.image || `${baseUrl}/blog/blog-banner.webp`,
          width: 1200,
          height: 628,
          alt: `${post.title} - easyucr.com`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@easyucr',
      creator: '@easyucr',
      title: post.title,
      description: post.excerpt,
      images: [post.image || `${baseUrl}/blog/blog-banner.webp`],
    },
  };
}

export default async function BlogPost({ params }) {
  const resolvedParams = await params;
  const post = blogPosts.find((p) => p.id === resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const baseUrl = 'https://www.easyucr.com';
  const blogUrl = `${baseUrl}/blog/${post.id}`;

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image || `${baseUrl}/blog/blog-banner.webp`,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    author: {
      '@type': 'Organization',
      name: 'easyucr.com',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'easyucr.com',
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
    keywords: post.keywords?.join(', '),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="min-h-screen bg-slate-50">
        {/* Progress bar - Hidden on mobile */}
        <div className="fixed top-[var(--header-height)] left-0 w-full h-1 bg-slate-200 z-50">
          <div className="h-full bg-[var(--color-sky)] w-0" id="reading-progress"></div>
        </div>

        {/* Hero Section - Full Width Design */}
        <header className="relative bg-[var(--color-midnight)] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,var(--color-sky),transparent)]"></div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/blog" className="flex items-center gap-1.5 text-[var(--color-sky)] font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Blog
                  </Link>
                  <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                  <span className="px-3 py-1 rounded-full bg-[var(--color-sky)] text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">
                    {post.category}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  {post.title}
                </h1>

                <p className="text-xl text-slate-300 leading-relaxed max-w-3xl">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--color-sky)]" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-orange)]" />
                    {post.readTime} Read
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Article
                  </div>
                </div>
              </div>

              {/* Standardized Banner Image */}
              <div className="w-full lg:w-[450px] aspect-[1200/628] relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <Image
                  src={post.image || '/blog/blog-banner.webp'}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Content & Sidebar Layout */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10 lg:p-12">

                {/* Blog Content Rendering */}
                <div className="prose prose-slate prose-lg max-w-none 
                  prose-headings:text-[var(--color-midnight)] prose-headings:font-black prose-headings:tracking-tight
                  prose-p:text-slate-600 prose-p:leading-relaxed
                  prose-strong:text-[var(--color-midnight)] prose-strong:font-bold
                  prose-li:text-slate-600
                  prose-img:rounded-2xl prose-img:shadow-xl
                  prose-blockquote:border-l-[var(--color-sky)] prose-blockquote:bg-slate-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic
                  ">
                  {post.content}
                </div>

                {/* Tags / Keywords */}
                <div className="mt-16 pt-10 border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Article Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.keywords?.map((keyword, idx) => (
                      <span key={idx} className="flex items-center gap-1 text-xs bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-100 font-bold hover:bg-slate-100 transition-colors">
                        <Hash className="w-3 h-3" />
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Author Section */}
              <div className="mt-12 bg-white rounded-3xl p-8 border border-slate-100 flex flex-col md:flex-row gap-8 items-center shadow-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-midnight)] flex items-center justify-center text-white font-black text-3xl">
                  QT
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="text-xl font-bold text-[var(--color-midnight)] mb-2">Written by easyucr.com Compliance Team</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Our team of industry experts and compliance professionals works tirelessly to bring you the most accurate and up-to-date information regarding UCR registration and trucking compliance for the 2026 registration year.
                  </p>
                </div>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-8">

                {/* Table of Contents - Dynamic */}
                {post.tableOfContents && post.tableOfContents.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                      Table of Contents
                    </h3>
                    <nav className="space-y-1">
                      {post.tableOfContents.map((item, idx) => (
                        <a
                          key={idx}
                          href={`#${item.id}`}
                          className="group flex items-start gap-3 py-2 text-sm text-slate-600 hover:text-[var(--color-sky)] transition-all font-medium"
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-slate-300 group-hover:bg-[var(--color-sky)] transition-colors"></span>
                          {item.title}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Contextual CTA */}
                <div className="bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-midnight)] rounded-2xl p-6 shadow-xl border border-white/5 text-white overflow-hidden relative group">
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--color-orange)]/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                  <h3 className="text-xl font-bold mb-4 relative z-10 leading-tight">Fast UCR Filing for 2026</h3>
                  <p className="text-slate-300 text-xs mb-6 relative z-10 leading-relaxed uppercase tracking-wider font-bold">
                    Join 50,000+ drivers who trust us for instant UCR confirmation.
                  </p>
                  <Link
                    href="/ucr/file"
                    className="block w-full py-3 bg-[var(--color-orange)] text-white text-center rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/20 relative z-10"
                  >
                    File UCR Now
                  </Link>
                </div>

                {/* Related Posts */}
                {post.relatedPosts && post.relatedPosts.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                      Keep Reading
                    </h3>
                    <div className="space-y-4">
                      {post.relatedPosts.slice(0, 3).map((relatedId) => {
                        const related = blogPosts.find((p) => p.id === relatedId);
                        return related ? (
                          <Link
                            key={related.id}
                            href={`/blog/${related.id}`}
                            className="block group"
                          >
                            <div className="text-[10px] font-black text-[var(--color-sky)] uppercase tracking-wider mb-1">
                              {related.category}
                            </div>
                            <h4 className="text-sm font-bold text-[var(--color-midnight)] group-hover:text-[var(--color-sky)] transition-colors line-clamp-2 leading-snug">
                              {related.title}
                            </h4>
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* Global Related Posts Bottom - Grid */}
        <section className="bg-slate-100 border-t border-slate-200 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-[var(--color-midnight)] mb-12 flex items-center gap-4 tracking-tight">
              More Insights for your Fleet
              <span className="flex-1 h-px bg-slate-200"></span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts
                .filter(p => p.category === post.category && p.id !== post.id)
                .slice(0, 3)
                .map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/50"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={relatedPost.image || '/blog/blog-banner.webp'}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="font-bold text-[var(--color-midnight)] group-hover:text-[var(--color-sky)] transition-colors line-clamp-2 leading-snug">
                        {relatedPost.title}
                      </h4>
                      <p className="mt-3 text-xs text-slate-400 flex items-center gap-2 font-bold uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {relatedPost.readTime} Read
                      </p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* Dynamic Sticky CTA */}
        <StickyFileCTA />
      </article>
    </>
  );
}

