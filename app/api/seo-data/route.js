import { blogPosts } from '@/app/blog/blogData';
import { complianceGuides } from '@/lib/guides';
import { getPseoRoutes } from '@/lib/pseo/data';
import { errorCodes } from '@/lib/error-codes';

/**
 * GET /api/seo-data
 * Returns aggregated SEO data for all content pages (UCR-only)
 */
export async function GET() {
    const baseUrl = 'https://www.easyucr.com';

    const corePages = [
        { url: '/', title: 'easyucr.com - UCR Filing & Compliance', description: 'File UCR online in under 10 minutes. $79 service fee, pay only after confirmation.', type: 'core', keywords: ['ucr filing', 'ucr registration', 'trucking compliance'] },
        { url: '/services/ucr-registration', title: 'UCR Registration', description: 'Unified Carrier Registration made simple.', type: 'service', keywords: ['ucr registration', 'unified carrier'] },
        { url: '/pricing', title: 'Pricing - easyucr.com', description: 'Transparent UCR filing pricing. $79 flat service fee.', type: 'core', keywords: ['pricing', 'ucr cost'] },
        { url: '/tools/ucr-calculator', title: 'UCR Fee Calculator', description: 'Calculate your UCR fee by fleet size.', type: 'tool', keywords: ['ucr calculator', 'ucr fee'] },
    ];

    const blogPages = blogPosts.map(post => ({
        url: `/blog/${post.id}`,
        title: post.title,
        description: post.excerpt,
        keywords: post.keywords || [],
        type: 'blog',
        category: post.category,
        date: post.dateISO,
    }));

    const guidePages = complianceGuides.map(guide => ({
        url: `/insights/${guide.slug}`,
        title: guide.title,
        description: guide.description,
        keywords: guide.keywords || [],
        type: 'guide',
        category: guide.category,
        updatedAt: guide.updatedAt,
    }));

    const errorPages = (errorCodes || []).map(error => ({
        url: `/error-codes/${error.code}`,
        title: `Error Code ${error.code} - ${error.title || 'Fix Guide'}`,
        description: error.description || `How to fix error ${error.code} on UCR filing.`,
        keywords: [`error ${error.code}`, 'ucr rejection', 'ucr error'],
        type: 'error-code',
    }));

    const pseoRoutes = getPseoRoutes();
    const pseoSummary = {
        deadline: pseoRoutes.filter(r => r.type === 'deadline').length,
        calculator: pseoRoutes.filter(r => r.type === 'calculator').length,
        vin: pseoRoutes.filter(r => r.type === 'vin').length,
        'state-deadline': pseoRoutes.filter(r => r.type === 'state-deadline').length,
        'state-calculator': pseoRoutes.filter(r => r.type === 'state-calculator').length,
        'state-type': pseoRoutes.filter(r => r.type === 'state-type').length,
    };

    const pseoSample = [];
    const pseoTypes = ['deadline', 'calculator', 'vin', 'state-deadline'];
    pseoTypes.forEach(type => {
        const ofType = pseoRoutes.filter(r => r.type === type).slice(0, 3);
        ofType.forEach(r => {
            pseoSample.push({
                url: r.url,
                title: generatePseoTitle(r),
                description: generatePseoDescription(r),
                keywords: [],
                type: 'pseo',
                pseoType: r.type,
            });
        });
    });

    const allPages = [
        ...corePages,
        ...blogPages,
        ...guidePages,
        ...errorPages,
        ...pseoSample,
    ];

    return Response.json({
        pages: allPages,
        counts: {
            core: corePages.length,
            blog: blogPages.length,
            guide: guidePages.length,
            error: errorPages.length,
            pseoTotal: pseoRoutes.length,
        },
        pseoSummary,
    });
}

function generatePseoTitle(route) {
    switch (route.type) {
        case 'deadline':
            return `UCR Filing in ${capitalize(route.params?.month || '')} ${route.params?.year || ''}`;
        case 'calculator':
            return `UCR Fee for ${route.params?.weight || ''} lb ${(route.params?.type || '').replace(/-/g, ' ')}`;
        case 'vin':
            return `${capitalize(route.params?.make || '')} VIN Decoding Guide`;
        case 'state-deadline':
            return `UCR Filing in ${route.params?.state || ''}`;
        default:
            return route.url;
    }
}

function generatePseoDescription(route) {
    switch (route.type) {
        case 'deadline':
            return `UCR filing guide for ${capitalize(route.params?.month || '')} ${route.params?.year || ''}.`;
        case 'calculator':
            return `UCR fee for ${route.params?.weight || ''} lb ${(route.params?.type || '').replace(/-/g, ' ')}.`;
        case 'vin':
            return `Decode your ${capitalize(route.params?.make || '')} truck VIN for UCR filing.`;
        case 'state-deadline':
            return `UCR filing guide if you're based in ${route.params?.state || ''}.`;
        default:
            return '';
    }
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
