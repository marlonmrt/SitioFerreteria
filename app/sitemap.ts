import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { families, articles } from "@/lib/db/schema";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ferreteria.local";

  // Fetch all families
  const familiesDb = await db.select({ slug: families.slug }).from(families);
  const familyUrls = familiesDb.map((f) => ({
    url: `${baseUrl}/familias/${f.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  // Fetch all active articles
  const articlesDb = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(eq(articles.isActive, true));

  const articleUrls = articlesDb.map((a) => ({
    url: `${baseUrl}/articulos/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6
  }));

  // Static pages
  const staticUrls = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/conocenos`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/tiendas`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 }
  ];

  return [...staticUrls, ...familyUrls, ...articleUrls];
}
