import { getPseoRoutes } from "@/lib/pseo/data";

const baseUrl = "https://www.quicktrucktax.com";

export async function GET() {
    const routes = getPseoRoutes();
    const now = new Date().toISOString();

    // XML Header
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // XML Footer
    const xmlFooter = `</urlset>`;

    // Generate URL blocks
    const urlBlocks = routes.map(route => {
        return `
  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const xml = `${xmlHeader}${urlBlocks}
${xmlFooter}`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
