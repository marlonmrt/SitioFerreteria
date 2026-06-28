import { db } from "../index";
import {
  articles,
  users,
  infoRequests,
  importBatches,
  subfamilies,
  families,
  stores
} from "../schema";
import { eq, and, or, ilike, sql, desc, asc, type SQL } from "drizzle-orm";

export async function getAdminMetrics() {
  // 1. Total artículos activos
  const activeArticlesResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.isActive, true));
  const activeArticlesCount = Number(activeArticlesResult[0]?.count || 0);

  // 2. Total solicitudes B2B pendientes
  const pendingB2bResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(and(eq(users.type, "B2B"), eq(users.status, "PENDING")));
  const pendingB2bCount = Number(pendingB2bResult[0]?.count || 0);

  // 3. Total solicitudes de info nuevas
  const newInfoResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(infoRequests)
    .where(eq(infoRequests.status, "NEW"));
  const newInfoCount = Number(newInfoResult[0]?.count || 0);

  // 4. Última importación
  const lastImport = await db.query.importBatches.findFirst({
    orderBy: [desc(importBatches.startedAt)]
  });

  return {
    activeArticlesCount,
    pendingB2bCount,
    newInfoCount,
    lastImport: lastImport || null
  };
}

export async function getAdminInfoRequests(status?: "NEW" | "ATTENDED") {
  const conditions: SQL[] = [];
  if (status) {
    conditions.push(eq(infoRequests.status, status));
  }

  const query = db
    .select({
      id: infoRequests.id,
      name: infoRequests.name,
      email: infoRequests.email,
      phone: infoRequests.phone,
      message: infoRequests.message,
      createdAt: infoRequests.createdAt,
      status: infoRequests.status,
      articleName: articles.name,
      articleErpCode: articles.erpCode,
      storeName: stores.name
    })
    .from(infoRequests)
    .leftJoin(articles, eq(infoRequests.articleId, articles.id))
    .leftJoin(stores, eq(infoRequests.storeId, stores.id))
    .$dynamic();

  const finalConditions = conditions.length > 0 ? and(...conditions) : undefined;

  return query
    .where(finalConditions)
    .orderBy(desc(infoRequests.createdAt));
}

export async function getAdminArticles({
  search,
  limit = 50,
  offset = 0,
  category,
  brand,
  offer
}: {
  search?: string;
  limit?: number;
  offset?: number;
  category?: string;
  brand?: string;
  offer?: string;
}) {
  const conditions: SQL[] = [];

  if (search) {
    const cleanSearch = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(articles.name, cleanSearch),
        ilike(articles.erpCode, cleanSearch),
        ilike(articles.brand, cleanSearch)
      ) as SQL
    );
  }

  if (category) {
    conditions.push(
      or(
        eq(articles.subfamilyId, category),
        eq(subfamilies.familyId, category)
      ) as SQL
    );
  }

  if (brand) {
    conditions.push(eq(articles.brand, brand));
  }

  if (offer) {
    if (offer === "only-offers") {
      conditions.push(sql`${articles.offerB2C} > 0`);
    } else if (offer === "no-offers") {
      conditions.push(sql`${articles.offerB2C} = 0`);
    }
  }

  const finalConditions = conditions.length > 0 ? and(...conditions) : undefined;

  // Query con joins para sacar familia y subfamilia
  return db
    .select({
      id: articles.id,
      erpCode: articles.erpCode,
      name: articles.name,
      slug: articles.slug,
      brand: articles.brand,
      unit: articles.unit,
      isActive: articles.isActive,
      isManual: articles.isManual,
      subfamilyName: subfamilies.name,
      familyName: families.name,
      stock: articles.stock,
      offerB2C: articles.offerB2C,
      offerB2B: articles.offerB2B
    })
    .from(articles)
    .leftJoin(subfamilies, eq(articles.subfamilyId, subfamilies.id))
    .leftJoin(families, eq(subfamilies.familyId, families.id))
    .where(finalConditions)
    .limit(limit)
    .offset(offset)
    .orderBy(asc(articles.erpCode));
}

export async function getAdminArticlesCount(
  optionsOrSearch?: string | {
    search?: string;
    category?: string;
    brand?: string;
    offer?: string;
  }
) {
  let search: string | undefined;
  let category: string | undefined;
  let brand: string | undefined;
  let offer: string | undefined;

  if (typeof optionsOrSearch === "string") {
    search = optionsOrSearch;
  } else if (optionsOrSearch && typeof optionsOrSearch === "object") {
    search = optionsOrSearch.search;
    category = optionsOrSearch.category;
    brand = optionsOrSearch.brand;
    offer = optionsOrSearch.offer;
  }

  const conditions: SQL[] = [];

  if (search) {
    const cleanSearch = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(articles.name, cleanSearch),
        ilike(articles.erpCode, cleanSearch),
        ilike(articles.brand, cleanSearch)
      ) as SQL
    );
  }

  if (category) {
    conditions.push(
      or(
        eq(articles.subfamilyId, category),
        eq(subfamilies.familyId, category)
      ) as SQL
    );
  }

  if (brand) {
    conditions.push(eq(articles.brand, brand));
  }

  if (offer) {
    if (offer === "only-offers") {
      conditions.push(sql`${articles.offerB2C} > 0`);
    } else if (offer === "no-offers") {
      conditions.push(sql`${articles.offerB2C} = 0`);
    }
  }

  const finalConditions = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .leftJoin(subfamilies, eq(articles.subfamilyId, subfamilies.id))
    .where(finalConditions);

  return Number(result[0]?.count || 0);
}
