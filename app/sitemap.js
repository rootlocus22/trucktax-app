import { complianceGuides } from "@/lib/guides";
import { blogPosts } from "./blog/blogData";
import usStates from '@/data/us-states.json';
import { UCR_STATE_SLUGS, UCR_FLEET_SIZES, UCR_OPERATOR_TYPES } from "@/lib/ucr-seo-data";
import { UCR_STATES } from "@/lib/states";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.easyucr.com";

/**
 * Sitemap configuration for easyucr.com
 * Generates sitemap.xml for all pages, blogs, and guides
 * Updated: 2026-01-03 (SEO Expansion)
 */
export default function sitemap() {
  const now = new Date().toISOString();

  // Core & Service Hub pages (UCR only)
  const coreRoutes = [
    { path: "", priority: 1.0, changeFrequency: "daily" },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly" },
    { path: "/learn", priority: 0.9, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.9, changeFrequency: "weekly" },
    { path: "/states", priority: 0.9, changeFrequency: "weekly" },
    { path: "/services/ucr-registration", priority: 0.9, changeFrequency: "weekly" },
    { path: "/blog", priority: 0.9, changeFrequency: "daily" },
    { path: "/insights", priority: 0.9, changeFrequency: "weekly" },
    { path: "/tools", priority: 0.8, changeFrequency: "weekly" },
    { path: "/tools/ucr-calculator", priority: 0.9, changeFrequency: "monthly" },
    { path: "/ucr/file", priority: 0.95, changeFrequency: "weekly" },
    { path: "/ucr/guides", priority: 0.9, changeFrequency: "weekly" },
    { path: "/ucr/pricing", priority: 0.9, changeFrequency: "weekly" },
    { path: "/ucr/dispatcher", priority: 0.85, changeFrequency: "weekly" },
    { path: "/terms", priority: 0.7, changeFrequency: "monthly" },
    { path: "/refund-policy", priority: 0.7, changeFrequency: "monthly" },
    { path: "/privacy-policy", priority: 0.7, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.85, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.85, changeFrequency: "weekly" },
    { path: "/features", priority: 0.75, changeFrequency: "monthly" },
    { path: "/services", priority: 0.85, changeFrequency: "weekly" },
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

  // SEO Learn hub pages
  const learnRoutes = [
    '/learn/what-is-ucr', '/learn/ucr-fees-2026', '/learn/ucr-deadline-2026',
    '/learn/ucr-vs-dot-number', '/learn/ucr-for-owner-operators', '/learn/ucr-for-brokers',
    '/learn/ucr-for-freight-forwarders', '/learn/do-i-need-ucr', '/learn/late-ucr-filing',
    '/learn/non-ucr-states',
  ].map((path) => ({ url: `${baseUrl}${path}`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 }));

  // SEO Compare pages
  const compareRoutes = [
    '/compare/easyucr-vs-jj-keller', '/compare/easyucr-vs-foley',
    '/compare/cheapest-ucr-filing-service', '/compare/ucr-filing-no-upfront-fee',
  ].map((path) => ({ url: `${baseUrl}${path}`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 }));

  // SEO States pages (app/states/[state])
  const statesRoutes = UCR_STATES.map((s) => ({
    url: `${baseUrl}/states/${s.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    ...coreRoutes,
    ...learnRoutes,
    ...compareRoutes,
    ...statesRoutes,
    ...stateRoutes,
    ...ucrStateRoutes,
    ...ucrFleetRoutes,
    ...ucrOperatorRoutes,
    ...guideRoutes,
    ...blogRoutes,
  ];
}
