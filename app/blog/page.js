'use client';

import Link from 'next/link';
import Image from 'next/image';
import { blogPosts } from './blogData';
import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, ChevronLeft, ChevronRight, Hash } from 'lucide-react';

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Extract unique categories from all blog posts
  const categories = useMemo(() => {
    const uniqueCategories = new Set(blogPosts.map(post => post.category));
    return ['All', ...Array.from(uniqueCategories).sort()];
  }, []);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords?.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      // Sort by dateISO descending (latest first)
      if (!a.dateISO) return 1;
      if (!b.dateISO) return -1;
      return new Date(b.dateISO) - new Date(a.dateISO);
    });
  }, [selectedCategory, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Full Width Background */}
      <section className="relative overflow-hidden bg-[var(--color-midnight)] text-white border-b border-white/10">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,var(--color-sky),transparent)]"></div>
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" fillOpacity="0.1" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[var(--color-sky)] mb-6 pulse-indicator">
              <span className="w-2 h-2 rounded-full bg-[var(--color-sky)]"></span>
              2026 Compliance Updates
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
              Insights for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-sky)] to-white">Trucking Industry</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Your comprehensive resource for IRS Form 2290 filing, UCR registration, HVUT compliance, and trucking tax strategies.
              Stay ahead with expert guides and real-time regulatory updates.
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 glass-card">
                <div className="p-2 bg-[var(--color-sky)]/20 rounded-lg">
                  <Clock className="w-5 h-5 text-[var(--color-sky)]" />
                </div>
                <div>
                  <div className="text-xl font-bold leading-none">{blogPosts.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Articles</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 glass-card">
                <div className="p-2 bg-[var(--color-orange)]/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-[var(--color-orange)]" />
                </div>
                <div>
                  <div className="text-xl font-bold leading-none">2026</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Updated</div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 glass-card">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Filter className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-xl font-bold leading-none">{categories.length - 1}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Topics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar - Sticky on Desktop */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, topics or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-navy)] focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            {/* Category Filter Desktop */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 max-w-4xl scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedCategory === category
                    ? 'bg-[var(--color-navy)] text-white border-[var(--color-navy)] shadow-md translate-y-[-1px]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Mobile Select */}
            <div className="w-full md:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-black text-[var(--color-midnight)] tracking-tight uppercase flex items-center gap-3">
                <span className="w-8 h-1 bg-[var(--color-sky)] rounded-full"></span>
                Latest Articles
              </h2>
              <div className="text-xs font-bold text-slate-400">
                Showing {paginatedPosts.length} of {filteredPosts.length}
              </div>
            </div>

            {paginatedPosts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.id}`}
                      className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden"
                    >
                      {/* Featured Image */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-200">
                        <Image
                          src={post.image || '/blog/blog-banner.webp'}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-[var(--color-midnight)] text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[var(--color-midnight)] mb-3 group-hover:text-[var(--color-sky)] transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h3>

                        <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">
                          {post.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-auto">
                          {post.keywords?.slice(0, 2).map((keyword, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100 font-bold uppercase tracking-tighter">
                              <Hash className="w-2 h-2" />
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Truncated Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first, last, current, and pages near current
                          return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => {
                          const elements = [];
                          // Add ellipsis if gap exists
                          if (index > 0 && page - array[index - 1] > 1) {
                            elements.push(<span key={`ellipsis-${page}`} className="text-slate-400 px-1">...</span>);
                          }
                          elements.push(
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[40px] h-[40px] rounded-xl font-bold text-sm transition-all ${currentPage === page
                                ? 'bg-[var(--color-navy)] text-white shadow-lg'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                                }`}
                            >
                              {page}
                            </button>
                          );
                          return elements;
                        })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Articles Found</h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">
                  We couldn't find any articles matching your current filters or search query.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-8 py-3 bg-[var(--color-navy)] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[var(--color-midnight)] transition-all shadow-lg"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Quick Links */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="space-y-8 lg:sticky lg:top-24">

              {/* Category Nav - Desktop Sidebar */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                  Knowledge Hub
                </h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${selectedCategory === category
                        ? 'bg-slate-50 text-[var(--color-navy)] font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      <span className="text-sm">{category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${selectedCategory === category
                        ? 'bg-[var(--color-midnight)] text-white'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                        }`}>
                        {category === 'All' ? blogPosts.length : blogPosts.filter(p => p.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter / CTA */}
              <div className="bg-[var(--color-midnight)] rounded-2xl p-6 shadow-xl border border-white/5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-sky)]/20 rounded-full blur-3xl"></div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">Stay Compliant</h3>
                <p className="text-slate-300 text-sm mb-6 relative z-10 leading-relaxed">
                  Join 15,000+ truckers receiving monthly 2026 tax deadline reminders and industry news.
                </p>
                <form className="space-y-3 relative z-10">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm outline-none focus:border-[var(--color-sky)] transition-all"
                  />
                  <button className="w-full py-3 bg-[var(--color-sky)] text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20">
                    Subscribe
                  </button>
                </form>
              </div>

            </div>
          </aside>
        </div>
      </main>

      {/* Global CTA */}
      <section className="bg-[var(--color-midnight)] py-16 border-t border-white/5 relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Ready for <span className="text-white border-b-2 border-[var(--color-sky)]">2026 Filing?</span></h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto font-medium">
            Join the most trusted platform for heavy vehicle tax filing. Accurate, fast, and IRS-authorized.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="https://www.expresstrucktax.com"
              target="_blank"
              className="w-full sm:w-auto px-8 py-3.5 bg-[var(--color-orange)] !text-white rounded-xl font-medium uppercase tracking-widest text-xs hover:bg-[var(--color-orange)]/90 transition-all shadow-xl shadow-orange-500/20"
            >
              Start Your 2290 Now
            </Link>
            <Link
              href="/tools"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 !text-white rounded-xl font-medium uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
            >
              Explore Free Tools
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
