import { db } from "../index";
import {
  families,
  subfamilies,
  articles,
  articlePrices,
  stores,
  faqs,
  favorites,
  articleImages
} from "../schema";
import { eq, and, or, ilike, sql, asc, isNotNull, inArray, gte, lte, lt, type SQL } from "drizzle-orm";

export async function getFamilies() {
  return db.select().from(families).orderBy(asc(families.sortOrder));
}

export async function getFamilyBySlug(slug: string) {
  const result = await db.select().from(families).where(eq(families.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getSubfamiliesByFamilyId(familyId: string) {
  return db
    .select()
    .from(subfamilies)
    .where(eq(subfamilies.familyId, familyId))
    .orderBy(asc(subfamilies.sortOrder));
}

export async function getSubfamilyBySlug(slug: string) {
  const result = await db.select().from(subfamilies).where(eq(subfamilies.slug, slug)).limit(1);
  return result[0] || null;
}

export async function getUniqueBrands() {
  const result = await db
    .selectDistinct({ brand: articles.brand })
    .from(articles)
    .where(and(eq(articles.isActive, true), isNotNull(articles.brand)))
    .orderBy(asc(articles.brand));
  return result.map((r) => r.brand).filter(Boolean) as string[];
}

export async function getArticles({
  familySlug,
  subfamilySlug,
  searchQuery,
  limit = 20,
  offset = 0,
  priceListCode,
  brands,
  minPrice,
  maxPrice,
  onlyOffers
}: {
  familySlug?: string;
  subfamilySlug?: string;
  searchQuery?: string;
  limit?: number;
  offset?: number;
  priceListCode?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  onlyOffers?: boolean;
}) {
  const publicPricesSq = db
    .select({
      articleId: articlePrices.articleId,
      price: articlePrices.price,
      currency: articlePrices.currency
    })
    .from(articlePrices)
    .where(eq(articlePrices.priceListCode, "PUBLIC"))
    .as("pub_prices");

  const b2bTariff = priceListCode && priceListCode !== "PUBLIC" ? priceListCode : "PRO_01";
  const b2bPricesSq = db
    .select({
      articleId: articlePrices.articleId,
      price: articlePrices.price,
      currency: articlePrices.currency
    })
    .from(articlePrices)
    .where(eq(articlePrices.priceListCode, b2bTariff))
    .as("b2b_prices");

  const hasB2b = priceListCode && priceListCode !== "PUBLIC";

  let query = db
    .select({
      id: articles.id,
      erpCode: articles.erpCode,
      name: articles.name,
      slug: articles.slug,
      description: articles.description,
      brand: articles.brand,
      unit: articles.unit,
      subfamilyId: articles.subfamilyId,
      mainImage: articles.mainImage,
      isActive: articles.isActive,
      publicPrice: publicPricesSq.price,
      publicCurrency: publicPricesSq.currency,
      b2bPrice: hasB2b ? b2bPricesSq.price : sql<string | null>`NULL`,
      b2bCurrency: hasB2b ? b2bPricesSq.currency : sql<string | null>`NULL`,
      hasOffer: articles.hasOffer,
      offerPercentage: articles.offerPercentage,
      offerTarget: articles.offerTarget
    })
    .from(articles)
    .leftJoin(publicPricesSq, eq(articles.id, publicPricesSq.articleId))
    .leftJoin(b2bPricesSq, eq(articles.id, b2bPricesSq.articleId))
    .$dynamic();

  // Filtrado de uniones
  if (familySlug) {
    query = query
      .innerJoin(subfamilies, eq(articles.subfamilyId, subfamilies.id))
      .innerJoin(families, eq(subfamilies.familyId, families.id));
  } else if (subfamilySlug) {
    query = query.innerJoin(subfamilies, eq(articles.subfamilyId, subfamilies.id));
  }

  const conditions: SQL[] = [eq(articles.isActive, true)];

  if (familySlug) {
    conditions.push(eq(families.slug, familySlug));
  }
  if (subfamilySlug) {
    conditions.push(eq(subfamilies.slug, subfamilySlug));
  }
  if (searchQuery) {
    const cleanSearch = `%${searchQuery.trim()}%`;
    conditions.push(
      or(
        ilike(articles.name, cleanSearch),
        ilike(articles.erpCode, cleanSearch),
        ilike(articles.description, cleanSearch),
        ilike(articles.brand, cleanSearch)
      ) as SQL
    );
  }

  // Filtros de marca, precio y ofertas
  if (brands && brands.length > 0) {
    conditions.push(inArray(articles.brand, brands));
  }

  const activePriceField = hasB2b ? b2bPricesSq.price : publicPricesSq.price;

  if (minPrice !== undefined) {
    conditions.push(gte(activePriceField, minPrice.toString()));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(activePriceField, maxPrice.toString()));
  }
  if (onlyOffers) {
    conditions.push(lt(b2bPricesSq.price, publicPricesSq.price));
  }

  return query
    .where(and(...conditions))
    .limit(limit)
    .offset(offset);
}

export async function getArticlesCount({
  familySlug,
  subfamilySlug,
  searchQuery,
  priceListCode,
  brands,
  minPrice,
  maxPrice,
  onlyOffers
}: {
  familySlug?: string;
  subfamilySlug?: string;
  searchQuery?: string;
  priceListCode?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  onlyOffers?: boolean;
}) {
  const publicPricesSq = db
    .select({
      articleId: articlePrices.articleId,
      price: articlePrices.price
    })
    .from(articlePrices)
    .where(eq(articlePrices.priceListCode, "PUBLIC"))
    .as("pub_prices");

  const b2bTariff = priceListCode && priceListCode !== "PUBLIC" ? priceListCode : "PRO_01";
  const b2bPricesSq = db
    .select({
      articleId: articlePrices.articleId,
      price: articlePrices.price
    })
    .from(articlePrices)
    .where(eq(articlePrices.priceListCode, b2bTariff))
    .as("b2b_prices");

  const hasB2b = priceListCode && priceListCode !== "PUBLIC";

  let query = db
    .select({
      count: sql<number>`count(distinct ${articles.id})`
    })
    .from(articles)
    .leftJoin(publicPricesSq, eq(articles.id, publicPricesSq.articleId))
    .leftJoin(b2bPricesSq, eq(articles.id, b2bPricesSq.articleId))
    .$dynamic();

  if (familySlug) {
    query = query
      .innerJoin(subfamilies, eq(articles.subfamilyId, subfamilies.id))
      .innerJoin(families, eq(subfamilies.familyId, families.id));
  } else if (subfamilySlug) {
    query = query.innerJoin(subfamilies, eq(articles.subfamilyId, subfamilies.id));
  }

  const conditions: SQL[] = [eq(articles.isActive, true)];

  if (familySlug) {
    conditions.push(eq(families.slug, familySlug));
  }
  if (subfamilySlug) {
    conditions.push(eq(subfamilies.slug, subfamilySlug));
  }
  if (searchQuery) {
    const cleanSearch = `%${searchQuery.trim()}%`;
    conditions.push(
      or(
        ilike(articles.name, cleanSearch),
        ilike(articles.erpCode, cleanSearch),
        ilike(articles.description, cleanSearch),
        ilike(articles.brand, cleanSearch)
      ) as SQL
    );
  }

  if (brands && brands.length > 0) {
    conditions.push(inArray(articles.brand, brands));
  }

  const activePriceField = hasB2b ? b2bPricesSq.price : publicPricesSq.price;

  if (minPrice !== undefined) {
    conditions.push(gte(activePriceField, minPrice.toString()));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(activePriceField, maxPrice.toString()));
  }
  if (onlyOffers) {
    conditions.push(lt(b2bPricesSq.price, publicPricesSq.price));
  }

  const result = await query.where(and(...conditions));
  return Number(result[0]?.count || 0);
}

export async function getArticleBySlug(slug: string, priceListCode?: string) {
  const article = await db.query.articles.findFirst({
    where: eq(articles.slug, slug)
  });

  if (!article) return null;

  const images = await db
    .select()
    .from(articleImages)
    .where(eq(articleImages.articleId, article.id))
    .orderBy(asc(articleImages.sortOrder));

  const prices = await db
    .select()
    .from(articlePrices)
    .where(eq(articlePrices.articleId, article.id));

  const publicPrice = prices.find((p) => p.priceListCode === "PUBLIC");
  const b2bPrice = priceListCode ? prices.find((p) => p.priceListCode === priceListCode) : null;

  return {
    ...article,
    images,
    publicPrice: publicPrice ? { price: publicPrice.price, currency: publicPrice.currency } : null,
    b2bPrice: b2bPrice && priceListCode !== "PUBLIC" ? { price: b2bPrice.price, currency: b2bPrice.currency } : null
  };
}

export async function getFavorites(userId: string, priceListCode?: string) {
  const publicPricesSq = db
    .select({
      articleId: articlePrices.articleId,
      price: articlePrices.price,
      currency: articlePrices.currency
    })
    .from(articlePrices)
    .where(eq(articlePrices.priceListCode, "PUBLIC"))
    .as("pub_prices");

  const hasB2b = priceListCode && priceListCode !== "PUBLIC";
  const b2bPricesSq = hasB2b
    ? db
        .select({
          articleId: articlePrices.articleId,
          price: articlePrices.price,
          currency: articlePrices.currency
        })
        .from(articlePrices)
        .where(eq(articlePrices.priceListCode, priceListCode))
        .as("b2b_prices")
    : null;

  let query = db
    .select({
      id: articles.id,
      erpCode: articles.erpCode,
      name: articles.name,
      slug: articles.slug,
      brand: articles.brand,
      unit: articles.unit,
      mainImage: articles.mainImage,
      publicPrice: publicPricesSq.price,
      publicCurrency: publicPricesSq.currency,
      b2bPrice: b2bPricesSq ? b2bPricesSq.price : sql<string | null>`NULL`,
      b2bCurrency: b2bPricesSq ? b2bPricesSq.currency : sql<string | null>`NULL`,
      hasOffer: articles.hasOffer,
      offerPercentage: articles.offerPercentage,
      offerTarget: articles.offerTarget
    })
    .from(favorites)
    .innerJoin(articles, eq(favorites.articleId, articles.id))
    .leftJoin(publicPricesSq, eq(articles.id, publicPricesSq.articleId))
    .$dynamic();

  if (b2bPricesSq) {
    query = query.leftJoin(b2bPricesSq, eq(articles.id, b2bPricesSq.articleId));
  }

  return query.where(eq(favorites.userId, userId));
}

export async function getFavoriteIds(userId: string): Promise<string[]> {
  const result = await db
    .select({ articleId: favorites.articleId })
    .from(favorites)
    .where(eq(favorites.userId, userId));
  return result.map((r) => r.articleId);
}

export async function getStores() {
  return db.select().from(stores).orderBy(asc(stores.name));
}

export async function getFaqs() {
  return db.select().from(faqs).orderBy(asc(faqs.sortOrder));
}
