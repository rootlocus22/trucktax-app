/**
 * SEO Analyzer Utilities
 * Analyzes page metadata for SEO health scoring
 */

// SEO thresholds based on Google guidelines
const THRESHOLDS = {
    titleMin: 30,
    titleMax: 60,
    descriptionMin: 120,
    descriptionMax: 160,
    keywordCount: 3,
};

/**
 * Analyze a page's SEO health
 * @param {Object} page - Page object with title, description, keywords, url
 * @returns {Object} SEO analysis with scores and issues
 */
export function analyzePage(page) {
    const issues = [];
    let score = 100;

    // Title analysis
    const titleLength = (page.title || '').length;
    let titleScore = 100;

    if (!page.title) {
        issues.push({ type: 'error', field: 'title', message: 'Missing title' });
        titleScore = 0;
    } else if (titleLength < THRESHOLDS.titleMin) {
        issues.push({ type: 'warning', field: 'title', message: `Title too short (${titleLength} chars, min ${THRESHOLDS.titleMin})` });
        titleScore = 70;
    } else if (titleLength > THRESHOLDS.titleMax) {
        issues.push({ type: 'warning', field: 'title', message: `Title too long (${titleLength} chars, max ${THRESHOLDS.titleMax})` });
        titleScore = 80;
    }

    // Description analysis
    const descLength = (page.description || '').length;
    let descScore = 100;

    if (!page.description) {
        issues.push({ type: 'error', field: 'description', message: 'Missing meta description' });
        descScore = 0;
    } else if (descLength < THRESHOLDS.descriptionMin) {
        issues.push({ type: 'warning', field: 'description', message: `Description too short (${descLength} chars, min ${THRESHOLDS.descriptionMin})` });
        descScore = 70;
    } else if (descLength > THRESHOLDS.descriptionMax) {
        issues.push({ type: 'warning', field: 'description', message: `Description too long (${descLength} chars, max ${THRESHOLDS.descriptionMax})` });
        descScore = 80;
    }

    // Keywords analysis
    const keywords = page.keywords || [];
    let keywordScore = 100;

    if (keywords.length === 0) {
        issues.push({ type: 'warning', field: 'keywords', message: 'No keywords defined' });
        keywordScore = 60;
    } else if (keywords.length < THRESHOLDS.keywordCount) {
        issues.push({ type: 'info', field: 'keywords', message: `Only ${keywords.length} keywords (recommend ${THRESHOLDS.keywordCount}+)` });
        keywordScore = 80;
    }

    // Canonical URL check
    let canonicalScore = 100;
    if (!page.canonical && !page.url) {
        issues.push({ type: 'error', field: 'canonical', message: 'No canonical URL' });
        canonicalScore = 0;
    }

    // Calculate overall score
    score = Math.round(
        (titleScore * 0.3) +
        (descScore * 0.3) +
        (keywordScore * 0.2) +
        (canonicalScore * 0.2)
    );

    return {
        score,
        titleLength,
        titleScore,
        descriptionLength: descLength,
        descriptionScore: descScore,
        keywordCount: keywords.length,
        keywordScore,
        canonicalScore,
        issues,
        status: score >= 90 ? 'pass' : score >= 70 ? 'warn' : 'fail'
    };
}

/**
 * Get status emoji based on score
 */
export function getStatusEmoji(status) {
    switch (status) {
        case 'pass': return '🟢';
        case 'warn': return '🟡';
        case 'fail': return '🔴';
        default: return '⚪';
    }
}

/**
 * Aggregate SEO stats across all pages
 */
export function aggregateStats(pages) {
    const analyzed = pages.map(p => ({ ...p, analysis: analyzePage(p) }));

    const passing = analyzed.filter(p => p.analysis.status === 'pass').length;
    const warning = analyzed.filter(p => p.analysis.status === 'warn').length;
    const failing = analyzed.filter(p => p.analysis.status === 'fail').length;

    const avgScore = Math.round(
        analyzed.reduce((sum, p) => sum + p.analysis.score, 0) / analyzed.length
    );

    // Get top issues
    const allIssues = analyzed.flatMap(p =>
        p.analysis.issues.map(issue => ({ ...issue, page: p.title, url: p.url }))
    );

    const issuesByType = {
        error: allIssues.filter(i => i.type === 'error').length,
        warning: allIssues.filter(i => i.type === 'warning').length,
        info: allIssues.filter(i => i.type === 'info').length,
    };

    return {
        total: pages.length,
        passing,
        warning,
        failing,
        avgScore,
        issuesByType,
        analyzed
    };
}
