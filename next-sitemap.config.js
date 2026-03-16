/**
 * next-sitemap config (optional).
 * This project uses Next.js built-in app/sitemap.js for sitemap generation.
 * If you prefer next-sitemap package, install it and add "postbuild": "next-sitemap" to package.json.
 */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.easyucr.com',
  generateRobotsTxt: true,
  changefreq: 'monthly',
  priority: 0.7,
  sitemapSize: 5000,
};
