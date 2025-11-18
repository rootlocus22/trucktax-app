import Link from 'next/link';
import { blogPosts } from './blogData';

export const metadata = {
  title: 'Form 2290 Blog - Expert HVUT Filing Guides & Tips',
  description: 'Comprehensive guides on IRS Form 2290 filing, HVUT deadlines, common mistakes, e-filing tips, and trucking tax compliance. Stay updated with the latest 2026 regulations.',
  keywords: 'Form 2290 blog, HVUT guides, IRS Form 2290 tips, heavy vehicle use tax, trucking tax blog, Form 2290 deadline, e-file HVUT',
  alternates: {
    canonical: 'https://quicktrucktax.com/blog',
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
    title: 'Form 2290 Blog - Expert HVUT Filing Guides & Tips',
    description: 'Comprehensive guides on IRS Form 2290 filing, HVUT deadlines, and trucking tax compliance.',
    url: 'https://quicktrucktax.com/blog',
    siteName: 'QuickTruckTax',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://quicktrucktax.com/quicktrucktax-logo.png',
        width: 1280,
        height: 720,
        alt: 'QuickTruckTax Blog - Form 2290 & HVUT Guides',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@quicktrucktax',
    creator: '@quicktrucktax',
    title: 'Form 2290 Blog - Expert HVUT Filing Guides',
    description: 'Comprehensive guides on IRS Form 2290 filing and trucking tax compliance.',
    images: ['https://quicktrucktax.com/quicktrucktax-logo.png'],
  },
};

const categories = ['All', 'Getting Started', 'Tips & Tricks', 'Deadlines', 'Owner-Operators', 'Tax Savings', 'Fleet Management', 'Basics', 'Refunds & Credits', 'Compliance', 'Technology', 'Industry Specific', 'Troubleshooting', 'Tax Rates', 'E-Filing', 'Penalties', 'Vehicle Acquisition', 'Tax Planning'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy-soft)] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Form 2290 Expert Blog</h1>
          <p className="text-xl mb-6 max-w-3xl">
            Your comprehensive resource for IRS Form 2290 filing, HVUT compliance, and trucking tax strategies. 
            Stay informed with expert guides, tips, and 2026 updates.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold">20+</div>
              <div className="text-sm">Expert Guides</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm">Monthly Readers</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
              <div className="text-2xl font-bold">2026</div>
              <div className="text-sm">Updated Content</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Find What You Need</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-full bg-[var(--color-navy)]/10 text-[var(--color-navy)] hover:bg-[var(--color-navy)]/20 transition-colors font-medium"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="bg-[var(--color-card)] rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group border border-[var(--color-border)]"
            >
              <div className="bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy)] p-6 text-white">
                <div className="text-sm font-semibold mb-2 text-[var(--color-sky)]">{post.category}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:underline">{post.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-[var(--color-muted)] mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{post.readTime} read</span>
                  <span>{post.date}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.keywords.slice(0, 3).map((keyword, idx) => (
                    <span key={idx} className="text-xs bg-[var(--color-page-alt)] text-[var(--color-navy)] px-2 py-1 rounded font-medium">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy-soft)] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to File Your Form 2290?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Stop reading, start filing! E-file your Form 2290 in minutes and get your Schedule 1 instantly.
          </p>
          <Link
            href="/tools/hvut-calculator"
            className="inline-block bg-[var(--color-orange)] text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-[var(--color-orange)]/90 transition-colors shadow-lg"
          >
            Calculate Your HVUT Tax Now →
          </Link>
        </div>
      </section>
    </div>
  );
}

