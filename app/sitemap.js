import { complianceGuides } from "@/lib/guides";
import { blogPosts } from "./blog/blogData";

const baseUrl = "https://www.quicktrucktax.com";

/**
 * Sitemap configuration for QuickTruckTax
 * Generates sitemap.xml for all pages, blogs, and guides
 * Updated: 2025-11-18
 */
export default function sitemap() {
  const now = new Date().toISOString();

  // Core website pages
  const coreRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" },
    { path: "/insights", priority: 0.9, changeFrequency: "weekly" },
    { path: "/tools", priority: 0.8, changeFrequency: "weekly" },
    { path: "/tools/hvut-calculator", priority: 0.8, changeFrequency: "monthly" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path || "/"}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Compliance guides from /insights
  const guideRoutes = complianceGuides.map((guide) => ({
    url: `${baseUrl}/insights/${guide.slug}`,
    lastModified: new Date(guide.updatedAt).toISOString(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Blog posts - high priority for SEO
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.dateISO).toISOString(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...coreRoutes, ...guideRoutes, ...blogRoutes];
}
