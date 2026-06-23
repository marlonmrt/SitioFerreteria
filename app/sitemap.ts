import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { families, articles } from "@/lib/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ferreteria.local";

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/conocenos`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/tiendas`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/contacto`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 }
  ];

  let familyUrls: MetadataRoute.Sitemap = [];
  let articleUrls: MetadataRoute.Sitemap = [];

  try {
    const familiesDb = await db.select({ slug: families.slug }).from(families);
    familyUrls = familiesDb.map((f) => ({
      url: `${baseUrl}/familias/${f.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));

    const articlesDb = await db
      .select({ slug: articles.slug })
      .from(articles)
      .where(eq(articles.isActive, true));

    articleUrls = articlesDb.map((a) => ({
      url: `${baseUrl}/articulos/${a.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6
    }));
  } catch {
    // DB no disponible durante el build (Vercel). Se genera con URLs estáticas.
  }

  return [...staticUrls, ...familyUrls, ...articleUrls];
}
