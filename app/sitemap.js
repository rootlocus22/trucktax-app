import { complianceGuides } from "@/lib/guides";

const baseUrl = "https://quicktrucktax.com";

export default function sitemap() {
  const now = new Date().toISOString();

  const coreRoutes = [
    { path: "", priority: 1.0 },
    { path: "/insights", priority: 0.9 },
    { path: "/tools", priority: 0.8 },
    { path: "/tools/hvut-calculator", priority: 0.8 },
  ].map(({ path, priority }) => ({
    url: `${baseUrl}${path || "/"}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));

  const guideRoutes = complianceGuides.map((guide) => ({
    url: `${baseUrl}/insights/${guide.slug}`,
    lastModified: new Date(guide.updatedAt).toISOString(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...coreRoutes, ...guideRoutes];
}
