import { complianceGuides } from "@/lib/guides";
import { blogPosts } from "./blog/blogData";
import usStates from '@/data/us-states.json';
import { getPseoRoutes } from "@/lib/pseo/data";
import { errorCodes } from "@/lib/error-codes";
import { UCR_STATE_SLUGS, UCR_FLEET_SIZES, UCR_OPERATOR_TYPES } from "@/lib/ucr-seo-data";

const baseUrl = "https://www.quicktrucktax.com";

/**
 * Sitemap configuration for QuickTruckTax
 * Generates sitemap.xml for all pages, blogs, and guides
 * Updated: 2026-01-03 (SEO Expansion)
 */
export default function sitemap() {
  const now = new Date().toISOString();

  // Core & Service Hub pages
  const coreRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/services/form-2290-filing", priority: 1.0, changeFrequency: "weekly" },
    { path: "/services/vin-correction", priority: 1.0, changeFrequency: "weekly" },
    { path: "/services/suspended-vehicle", priority: 0.9, changeFrequency: "weekly" },
    { path: "/services/agricultural-logging", priority: 0.9, changeFrequency: "weekly" },
    { path: "/services/mcs-150-update", priority: 0.9, changeFrequency: "weekly" },
    { path: "/services/ucr-registration", priority: 0.9, changeFrequency: "weekly" },
    { path: "/services/form-8849-refund", priority: 0.8, changeFrequency: "weekly" },
    { path: "/services/ifta-irp", priority: 0.8, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" },
    { path: "/insights", priority: 0.9, changeFrequency: "weekly" },
    { path: "/tools", priority: 0.8, changeFrequency: "weekly" },
    { path: "/tools/hvut-calculator", priority: 0.8, changeFrequency: "monthly" },
    { path: "/tools/ucr-calculator", priority: 0.9, changeFrequency: "monthly" },
    { path: "/tools/ifta-calculator", priority: 0.8, changeFrequency: "monthly" },
    { path: "/ucr/file", priority: 0.95, changeFrequency: "weekly" },
    { path: "/ucr/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/terms", priority: 0.7, changeFrequency: "monthly" },
    { path: "/refund-policy", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.7, changeFrequency: "monthly" },
    { path: "/error-codes", priority: 0.8, changeFrequency: "weekly" },
    { path: "/comparisons", priority: 0.8, changeFrequency: "weekly" },
    { path: "/comparisons/vs-express-truck-tax", priority: 0.8, changeFrequency: "monthly" },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path || "/"}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Programmatic State Pages (/insights/state/[state])
  const stateRoutes = usStates.map((state) => ({
    url: `${baseUrl}/insights/state/${state.name.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Compilance guides from /insights
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

  // Error Code Pages
  const errorRoutes = errorCodes.map((error) => ({
    url: `${baseUrl}/error-codes/${error.code}`,
    lastModified: now, // Should probably track update time in data, but now is fine for MVP
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // pSEO Routes (Dynamic Variable Strategy)
  const pseoRoutes = getPseoRoutes().map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // UCR programmatic SEO: state pages (ucr-filing/texas, etc.)
  const ucrStateRoutes = UCR_STATE_SLUGS.map((stateSlug) => ({
    url: `${baseUrl}/ucr-filing/${stateSlug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // UCR fleet-size pages (ucr-fee/for/1-truck, 2-trucks, ...)
  const ucrFleetRoutes = UCR_FLEET_SIZES.map((n) => ({
    url: `${baseUrl}/ucr-fee/for/${n === 1 ? "1-truck" : `${n}-trucks`}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // UCR operator-type pages (ucr-for/brokers, etc.)
  const ucrOperatorRoutes = UCR_OPERATOR_TYPES.map((t) => ({
    url: `${baseUrl}/ucr-for/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [
    ...coreRoutes,
    ...stateRoutes,
    ...ucrStateRoutes,
    ...ucrFleetRoutes,
    ...ucrOperatorRoutes,
    ...guideRoutes,
    ...blogRoutes,
    ...errorRoutes,
    ...pseoRoutes,
  ];
}
