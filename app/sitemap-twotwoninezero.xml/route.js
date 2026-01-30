import { getPseoRoutes } from "@/lib/pseo/data";

const baseUrl = "https://www.quicktrucktax.com";

export async function GET() {
    const routes = getPseoRoutes();
    const now = new Date().toISOString();

    // Build sitemap URLs
    const urls = routes.map(route => ({
        url: `${baseUrl}${route.url}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // Add homepage and other important pages
    const staticPages = [
        { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${baseUrl}/resources/2290-tax-directory`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ];

    const allUrls = [...staticPages, ...urls];

    // Generate XML manually with proper escaping
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    const xmlFooter = `</urlset>`;

    const urlBlocks = allUrls.map(item => {
        return `
  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastModified}</lastmod>
    <changefreq>${item.changeFrequency}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
    }).join('');

    const xml = `${xmlHeader}${urlBlocks}
${xmlFooter}`;

    return new Response(xml, {
        status: 200,
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
        },
    });
}
