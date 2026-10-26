import type { MetadataRoute } from "next";
import { siteConfig, mainNav, legalNav } from "@/data/site-config";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [...mainNav, ...legalNav].map((n) => ({
    url: `${siteConfig.url}${n.href === "/" ? "" : n.href}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: n.href === "/" ? 1 : n.href.startsWith("/mentions") || n.href.startsWith("/confid") ? 0.2 : 0.8,
  }));
  const productPages = products.map((p) => ({
    url: `${siteConfig.url}/produits/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...pages, ...productPages];
}
