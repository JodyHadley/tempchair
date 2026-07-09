import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

/** Public marketing + browse URLs for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/welcome", changeFrequency: "monthly", priority: 0.9 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
    { path: "/jobs", changeFrequency: "daily", priority: 0.9 },
    { path: "/workers", changeFrequency: "daily", priority: 0.8 },
    { path: "/clinics", changeFrequency: "weekly", priority: 0.8 },
    { path: "/claim", changeFrequency: "monthly", priority: 0.85 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
    { path: "/sign-up", changeFrequency: "monthly", priority: 0.7 },
    { path: "/sign-in", changeFrequency: "yearly", priority: 0.4 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? siteConfig.url : `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
