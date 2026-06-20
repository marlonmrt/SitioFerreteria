import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { articles, families } from "@/lib/db/schema";
import { ilike, or, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ articles: [], families: [] });
  }

  const cleanQuery = `%${query.trim()}%`;

  try {
    // Buscar familias
    const matchedFamilies = await db
      .select({
        id: families.id,
        name: families.name,
        slug: families.slug
      })
      .from(families)
      .where(ilike(families.name, cleanQuery))
      .limit(3);

    // Buscar artículos activos
    const matchedArticles = await db
      .select({
        id: articles.id,
        name: articles.name,
        slug: articles.slug,
        erpCode: articles.erpCode,
        mainImage: articles.mainImage
      })
      .from(articles)
      .where(
        and(
          eq(articles.isActive, true),
          or(
            ilike(articles.name, cleanQuery),
            ilike(articles.erpCode, cleanQuery)
          )
        )
      )
      .limit(5);

    return NextResponse.json({
      articles: matchedArticles,
      families: matchedFamilies
    });
  } catch (error) {
    console.error("Error in autocomplete search API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
