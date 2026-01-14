import { blogPosts } from '@/app/blog/blogData';
import { complianceGuides } from '@/lib/guides';
import { getPseoRoutes } from '@/lib/pseo/data';
import { errorCodes } from '@/lib/error-codes';

/**
 * GET /api/seo-data
 * Returns aggregated SEO data for all content pages
 */
export async function GET() {
    const baseUrl = 'https://www.quicktrucktax.com';

    // Core/Service pages with metadata
    const corePages = [
        { url: '/', title: 'QuickTruckTax - Form 2290 E-Filing & HVUT Compliance', description: 'E-file Form 2290 online and get your stamped Schedule 1 in minutes. HVUT compliance made simple for truckers.', type: 'core', keywords: ['form 2290', 'hvut', 'trucking tax'] },
        { url: '/services/form-2290-filing', title: 'Form 2290 E-Filing Service', description: 'Fast and secure Form 2290 e-filing with instant Schedule 1.', type: 'service', keywords: ['e-file form 2290', 'file 2290 online', 'hvut filing'] },
        { url: '/services/vin-correction', title: 'VIN Correction Service', description: 'Fix VIN errors on your Form 2290 quickly and easily.', type: 'service', keywords: ['vin correction', 'form 2290 vin fix'] },
        { url: '/services/suspended-vehicle', title: 'Suspended Vehicle Filing', description: 'File for suspended vehicle status if under 5,000 miles.', type: 'service', keywords: ['suspended vehicle', 'form 2290 suspension'] },
        { url: '/services/agricultural-logging', title: 'Agricultural & Logging Vehicles', description: 'Special HVUT rules for agricultural and logging vehicles.', type: 'service', keywords: ['agricultural vehicle', 'logging truck tax'] },
        { url: '/services/mcs-150-update', title: 'MCS-150 Biennial Update', description: 'Keep your DOT number active with timely MCS-150 updates.', type: 'service', keywords: ['mcs-150', 'biennial update', 'dot number'] },
        { url: '/services/ucr-registration', title: 'UCR Registration', description: 'Unified Carrier Registration made simple.', type: 'service', keywords: ['ucr registration', 'unified carrier'] },
        { url: '/services/form-8849-refund', title: 'Form 8849 Refund Claims', description: 'Claim refunds for sold, destroyed, or low-mileage vehicles.', type: 'service', keywords: ['form 8849', 'hvut refund'] },
        { url: '/services/ifta-irp', title: 'IFTA & IRP Services', description: 'Fuel tax and apportioned plate compliance.', type: 'service', keywords: ['ifta filing', 'irp registration'] },
        { url: '/pricing', title: 'Pricing - QuickTruckTax', description: 'Transparent pricing for Form 2290 e-filing and compliance services.', type: 'core', keywords: ['pricing', 'form 2290 cost'] },
        { url: '/tools/hvut-calculator', title: 'HVUT Calculator', description: 'Calculate your Heavy Vehicle Use Tax instantly.', type: 'tool', keywords: ['hvut calculator', 'form 2290 tax calculator'] },
        { url: '/tools/ifta-calculator', title: 'IFTA Calculator', description: 'Calculate your IFTA fuel tax by state.', type: 'tool', keywords: ['ifta calculator', 'fuel tax calculator'] },
        { url: '/comparisons/vs-express-truck-tax', title: 'QuickTruckTax vs ExpressTruckTax', description: 'Compare features and pricing with ExpressTruckTax.', type: 'comparison', keywords: ['expresstrucktax alternative', 'form 2290 comparison'] },
    ];

    // Blog posts
    const blogPages = blogPosts.map(post => ({
        url: `/blog/${post.id}`,
        title: post.title,
        description: post.excerpt,
        keywords: post.keywords || [],
        type: 'blog',
        category: post.category,
        date: post.dateISO,
    }));

    // Compliance guides from insights
    const guidePages = complianceGuides.map(guide => ({
        url: `/insights/${guide.slug}`,
        title: guide.title,
        description: guide.description,
        keywords: guide.keywords || [],
        type: 'guide',
        category: guide.category,
        updatedAt: guide.updatedAt,
    }));

    // Error code pages
    const errorPages = (errorCodes || []).map(error => ({
        url: `/error-codes/${error.code}`,
        title: `IRS Error Code ${error.code} - ${error.title || 'Fix Guide'}`,
        description: error.description || `How to fix IRS rejection code ${error.code} on Form 2290.`,
        keywords: [`error ${error.code}`, 'irs rejection', 'form 2290 error'],
        type: 'error-code',
    }));

    // pSEO routes (summarized by pattern type)
    const pseoRoutes = getPseoRoutes();
    const pseoSummary = {
        deadline: pseoRoutes.filter(r => r.type === 'deadline').length,
        calculator: pseoRoutes.filter(r => r.type === 'calculator').length,
        vin: pseoRoutes.filter(r => r.type === 'vin').length,
        'state-deadline': pseoRoutes.filter(r => r.type === 'state-deadline').length,
        'state-calculator': pseoRoutes.filter(r => r.type === 'state-calculator').length,
        'state-type': pseoRoutes.filter(r => r.type === 'state-type').length,
    };

    // Sample pSEO pages for the table (first few of each type)
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

    // Combine all pages
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
            return `Filing Form 2290 in ${capitalize(route.params.month)} ${route.params.year}`;
        case 'calculator':
            return `2290 Tax for ${route.params.weight} lb ${route.params.type.replace(/-/g, ' ')}`;
        case 'vin':
            return `${capitalize(route.params.make)} VIN Decoding Guide`;
        case 'state-deadline':
            return `Filing Form 2290 in ${route.params.state}`;
        default:
            return route.url;
    }
}

function generatePseoDescription(route) {
    switch (route.type) {
        case 'deadline':
            return `Complete guide to filing Form 2290 for vehicles first used in ${capitalize(route.params.month)} ${route.params.year}.`;
        case 'calculator':
            return `Calculate the HVUT tax for a ${route.params.weight} lb ${route.params.type.replace(/-/g, ' ')}.`;
        case 'vin':
            return `Decode your ${capitalize(route.params.make)} truck VIN for Form 2290 filing.`;
        case 'state-deadline':
            return `Step-by-step guide to filing Form 2290 if you're based in ${route.params.state}.`;
        default:
            return '';
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
