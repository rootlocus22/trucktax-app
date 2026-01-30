'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Download, RefreshCw, ExternalLink, AlertTriangle, CheckCircle, Info, ChevronLeft, ChevronRight, Zap, Wrench, Loader2 } from 'lucide-react';
import { analyzePage, getStatusEmoji, aggregateStats } from '@/lib/seo/analyzer';

const ITEMS_PER_PAGE = 25;

export default function SEOAdminPage() {
    const [pages, setPages] = useState([]);
    const [counts, setCounts] = useState({});
    const [pseoSummary, setPseoSummary] = useState({});
    const [pseoStats, setPseoStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [regenerating, setRegenerating] = useState({});
    const [fixing, setFixing] = useState({});

    useEffect(() => {
        fetchData();
        fetchPseoStatus();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch('/api/seo-data');
            const data = await res.json();
            setPages(data.pages);
            setCounts(data.counts);
            setPseoSummary(data.pseoSummary);

            const aggregated = aggregateStats(data.pages);
            setStats(aggregated);
        } catch (err) {
            console.error('Failed to fetch SEO data:', err);
        }
        setLoading(false);
    }

    async function fetchPseoStatus() {
        try {
            const res = await fetch('/api/pseo/fix?action=batch-status');
            const data = await res.json();
            setPseoStats(data);
        } catch (err) {
            console.error('Failed to fetch pSEO status:', err);
        }
    }

    const filteredPages = useMemo(() => {
        return pages.filter(p => {
            if (filter !== 'all' && p.type !== filter) return false;
            if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.url?.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });
    }, [pages, filter, search]);

    const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);
    const paginatedPages = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPages.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredPages, currentPage]);

    // Reset to page 1 when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, search]);

    async function handleRegenerate(page) {
        const slug = page.url.replace(/^\//, '');
        setRegenerating(prev => ({ ...prev, [slug]: true }));

        try {
            const analysis = analyzePage(page);
            const res = await fetch('/api/pseo/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    type: page.pseoType || page.type,
                    context: {},
                    fixIssues: analysis.issues
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Regenerated: ${slug}`);
                fetchData();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }

        setRegenerating(prev => ({ ...prev, [slug]: false }));
    }

    async function handleAutoFix(page) {
        const slug = page.url.replace(/^\//, '');
        setFixing(prev => ({ ...prev, [slug]: true }));

        try {
            const res = await fetch('/api/pseo/fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug,
                    fixes: { autoFixTitle: true, autoFixDescription: true }
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Fixed: ${JSON.stringify(data.applied)}`);
                fetchData();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }

        setFixing(prev => ({ ...prev, [slug]: false }));
    }

    const exportCSV = () => {
        const headers = ['URL', 'Title', 'Type', 'Score', 'Title Length', 'Desc Length', 'Issues'];
        const rows = filteredPages.map(p => {
            const analysis = analyzePage(p);
            return [
                p.url,
                `"${p.title?.replace(/"/g, '""') || ''}"`,
                p.type,
                analysis.score,
                analysis.titleLength,
                analysis.descriptionLength,
                `"${analysis.issues.map(i => i.message).join('; ')}"`
            ];
        });

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seo-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-600">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Loading SEO data...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-[var(--color-midnight)] text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h1 className="text-3xl font-bold">SEO Admin Dashboard</h1>
                    <p className="text-white/70 mt-2">Monitor, fix, and regenerate content for search engines</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard label="Total Pages" value={stats.total} />
                        <StatCard label="Avg Score" value={stats.avgScore} suffix="/100" color={stats.avgScore >= 80 ? 'green' : stats.avgScore >= 60 ? 'yellow' : 'red'} />
                        <StatCard label="Passing" value={stats.passing} icon="🟢" />
                        <StatCard label="Warnings" value={stats.warning} icon="🟡" />
                        <StatCard label="Failing" value={stats.failing} icon="🔴" />
                    </div>
                )}

                {/* pSEO Live Stats from Firestore */}
                {pseoStats && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-orange-500" />
                            pSEO Pages in Firestore (Live)
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <ContentCount label="Total Generated" count={pseoStats.total} highlight />
                            <ContentCount label="Long Titles" count={pseoStats.issues?.longTitle || 0} warn />
                            <ContentCount label="Long Descriptions" count={pseoStats.issues?.longDescription || 0} warn />
                            <ContentCount label="Missing Content" count={pseoStats.issues?.missingContent || 0} warn />
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {Object.entries(pseoStats.byType || {}).map(([type, count]) => (
                                <span key={type} className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium">
                                    {type}: {count}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content Distribution */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-bold mb-4">Content Distribution</h2>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <ContentCount label="Core Pages" count={counts.core} />
                        <ContentCount label="Blog Posts" count={counts.blog} />
                        <ContentCount label="Guides" count={counts.guide} />
                        <ContentCount label="Error Codes" count={counts.error} />
                        <ContentCount label="pSEO Total" count={counts.pseoTotal} highlight />
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search pages..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="core">Core</option>
                            <option value="service">Service</option>
                            <option value="blog">Blog</option>
                            <option value="guide">Guide</option>
                            <option value="pseo">pSEO</option>
                            <option value="tool">Tool</option>
                            <option value="error-code">Error Codes</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => { fetchData(); fetchPseoStatus(); }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Content Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Type</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Desc</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Issues</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedPages.map((page, i) => {
                                    const analysis = analyzePage(page);
                                    const slug = page.url.replace(/^\//, '');
                                    const isRegenerating = regenerating[slug];
                                    const isFixing = fixing[slug];
                                    const isPseo = page.type === 'pseo';

                                    return (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-center">{getStatusEmoji(analysis.status)}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-600">
                                                    {page.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs">
                                                <div className="font-medium text-slate-800 truncate text-sm">{page.title}</div>
                                                <a
                                                    href={`https://www.quicktrucktax.com${page.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    {page.url.slice(0, 40)}...
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`font-bold ${analysis.score >= 90 ? 'text-green-600' : analysis.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                    {analysis.score}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={analysis.titleLength > 60 ? 'text-orange-600 font-medium' : 'text-slate-600'}>
                                                    {analysis.titleLength}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={analysis.descriptionLength > 160 ? 'text-orange-600 font-medium' : analysis.descriptionLength < 120 ? 'text-yellow-600' : 'text-slate-600'}>
                                                    {analysis.descriptionLength}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {analysis.issues.length > 0 ? (
                                                    <div className="flex items-center gap-1">
                                                        {analysis.issues.filter(i => i.type === 'error').length > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-red-600">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                {analysis.issues.filter(i => i.type === 'error').length}
                                                            </span>
                                                        )}
                                                        {analysis.issues.filter(i => i.type === 'warning').length > 0 && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
                                                                <Info className="w-3 h-3" />
                                                                {analysis.issues.filter(i => i.type === 'warning').length}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    {/* Only pSEO pages can be regenerated/fixed (stored in Firestore) */}
                                                    {isPseo && (
                                                        <>
                                                            <button
                                                                onClick={() => handleRegenerate(page)}
                                                                disabled={isRegenerating}
                                                                className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 disabled:opacity-50 text-xs font-medium flex items-center gap-1"
                                                                title="Regenerate with AI"
                                                            >
                                                                {isRegenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                                                                Regen
                                                            </button>
                                                            {analysis.issues.length > 0 && (
                                                                <button
                                                                    onClick={() => handleAutoFix(page)}
                                                                    disabled={isFixing}
                                                                    className="px-2 py-1 rounded bg-orange-100 hover:bg-orange-200 text-orange-700 disabled:opacity-50 text-xs font-medium flex items-center gap-1"
                                                                    title="Auto-fix SEO issues"
                                                                >
                                                                    {isFixing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
                                                                    Fix
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    {/* Show dash for non-pSEO pages */}
                                                    {!isPseo && (
                                                        <span className="text-xs text-slate-400" title="Static content - edit in code">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <div className="text-sm text-slate-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredPages.length)} of {filteredPages.length}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, suffix = '', icon, color }) {
    const colorClass = color === 'green' ? 'text-green-600' : color === 'yellow' ? 'text-yellow-600' : color === 'red' ? 'text-red-600' : 'text-slate-800';
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="text-sm text-slate-500">{label}</div>
            <div className={`text-2xl font-bold mt-1 ${colorClass}`}>
                {icon && <span className="mr-1">{icon}</span>}
                {value}{suffix}
            </div>
        </div>
    );
}

function ContentCount({ label, count, highlight, warn }) {
    return (
        <div className={`rounded-lg p-4 text-center ${highlight ? 'bg-blue-50 border border-blue-200' : warn ? 'bg-orange-50 border border-orange-200' : 'bg-slate-50'}`}>
            <div className={`text-2xl font-bold ${highlight ? 'text-blue-600' : warn ? 'text-orange-600' : 'text-slate-800'}`}>{count}</div>
            <div className="text-xs text-slate-500 mt-1">{label}</div>
        </div>
    );
}
