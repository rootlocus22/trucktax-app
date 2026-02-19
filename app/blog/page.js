'use client';

import Link from 'next/link';
import { blogPosts } from './blogData';
import { useState, useMemo } from 'react';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories from all blog posts
  const categories = useMemo(() => {
    const uniqueCategories = new Set(blogPosts.map(post => post.category));
    return ['All', ...Array.from(uniqueCategories).sort()];
  }, []);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      // If there's a search query, search globally (ignore category filter)
      if (searchQuery) {
        return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.keywords?.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      // If no search query, apply category filter
      return selectedCategory === 'All' || post.category === selectedCategory;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--color-page)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy-soft)] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Form 2290 Expert Blog</h1>
          <p className="text-lg md:text-xl mb-4 max-w-3xl">
            Your comprehensive resource for IRS Form 2290 filing, HVUT compliance, and trucking tax strategies.
            Stay informed with expert guides, tips, and 2026 updates.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-xl font-bold">{blogPosts.length}+</div>
              <div className="text-xs">Expert Guides</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-xl font-bold">50K+</div>
              <div className="text-xs">Monthly Readers</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-xl font-bold">2026</div>
              <div className="text-xs">Updated Content</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-xl font-bold">{categories.length - 1}</div>
              <div className="text-xs">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent outline-none transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Mobile Category Dropdown - Shows below search on mobile */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:hidden mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <label htmlFor="mobile-category" className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            id="mobile-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent outline-none transition-all bg-white text-[var(--color-navy)] font-medium"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category} {category === 'All' ? `(${blogPosts.length})` : `(${blogPosts.filter(p => p.category === category).length})`}
              </option>
            ))}
          </select>
          <div className="text-sm text-[var(--color-muted)] mt-3">
            <span className="font-bold text-[var(--color-navy)]">{filteredPosts.length}</span> of {blogPosts.length} articles
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-5 lg:sticky lg:top-4">
              <h3 className="text-lg font-bold mb-3">Categories</h3>

              {/* Results Counter */}
              <div className="text-sm text-[var(--color-muted)] mb-4 pb-3 border-b border-gray-200">
                <span className="font-bold text-[var(--color-navy)]">{filteredPosts.length}</span> of {blogPosts.length} articles
              </div>

              {/* Category List */}
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === category
                      ? 'bg-[var(--color-navy)] text-white shadow-md'
                      : 'bg-gray-50 text-[var(--color-navy)] hover:bg-gray-100'
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content - Blog Grid */}
          <div className="flex-1 min-w-0">
            {filteredPosts.length > 0 ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="bg-[var(--color-card)] rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group border border-[var(--color-border)] flex flex-col"
                  >
                    <div className="bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy)] p-4 text-white">
                      <div className="text-xs font-semibold mb-1.5 text-[var(--color-sky)]">{post.category}</div>
                      <h3 className="text-base font-bold group-hover:underline line-clamp-2">{post.title}</h3>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-[var(--color-muted)] mb-3 text-sm line-clamp-3 flex-1">{post.excerpt}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                        <span>{post.readTime}</span>
                        <span>{post.date}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {post.keywords?.slice(0, 2).map((keyword, idx) => (
                          <span key={idx} className="text-xs bg-[var(--color-page-alt)] text-[var(--color-navy)] px-2 py-0.5 rounded font-medium truncate">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2 text-[var(--color-text)]">No Articles Found</h3>
                <p className="text-[var(--color-muted)] mb-6">
                  No articles match your current filters. Try adjusting your search or category selection.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="bg-[var(--color-navy)] !text-white px-6 py-3 rounded-lg font-bold hover:bg-[var(--color-navy)]/90 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[var(--color-midnight)] to-[var(--color-navy-soft)] text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to File Your Form 2290?</h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
            Stop reading, start filing! E-file your Form 2290 in minutes and get your Schedule 1 instantly.
          </p>
          <Link
            href="/tools/hvut-calculator"
            className="inline-block bg-[var(--color-orange)] text-white px-8 py-3 rounded-lg font-bold hover:bg-[var(--color-orange)]/90 transition-colors shadow-lg"
          >
            Calculate Your HVUT Tax Now →
          </Link>
        </div>
      </section>
    </div>
  );
}
