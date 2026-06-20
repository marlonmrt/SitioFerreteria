import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

vi.mock("@/auth", () => ({
  auth: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

import { auth } from "@/auth";
import { db } from "../db";
import {
  users,
  articles,
  subfamilies,
  families,
  articlePrices,
  favorites,
  infoRequests,
  stores
} from "../db/schema";
import { getArticles, getArticleBySlug, getFavorites, getFavoriteIds } from "../db/queries/catalog";
import { toggleFavoriteAction, submitInfoRequestAction } from "./catalog";

describe("Catalog Queries and Actions Integration", () => {
  const familyId = crypto.randomUUID();
  const subfamilyId = crypto.randomUUID();
  const articleId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const storeId = crypto.randomUUID();

  const familySlug = "test-fam-" + crypto.randomUUID().substring(0, 8);
  const subfamilySlug = "test-subfam-" + crypto.randomUUID().substring(0, 8);
  const articleSlug = "test-art-" + crypto.randomUUID().substring(0, 8);
  const erpCode = "TEST-ERP-" + crypto.randomUUID().substring(0, 8);

  beforeAll(async () => {
    // 1. Crear Familia de prueba
    await db.insert(families).values({
      id: familyId,
      name: "Test Family",
      slug: familySlug,
      sortOrder: 99
    });

    // 2. Crear Subfamilia de prueba
    await db.insert(subfamilies).values({
      id: subfamilyId,
      familyId,
      name: "Test Subfamily",
      slug: subfamilySlug,
      sortOrder: 99
    });

    // 3. Crear Artículo de prueba
    await db.insert(articles).values({
      id: articleId,
      erpCode,
      name: "Test Article Name",
      slug: articleSlug,
      brand: "TestBrand",
      unit: "ud",
      subfamilyId,
      isActive: true
    });

    // 4. Crear Precios de prueba (PUBLIC y una tarifa especial)
    await db.insert(articlePrices).values([
      {
        articleId,
        priceListCode: "PUBLIC",
        price: "100.00",
        currency: "EUR"
      },
      {
        articleId,
        priceListCode: "PRO_TEST",
        price: "85.00",
        currency: "EUR"
      }
    ]);

    // 5. Crear Usuario de prueba
    await db.insert(users).values({
      id: userId,
      email: "catalog-tester@example.com",
      passwordHash: "dummy",
      name: "Catalog Tester",
      type: "B2C",
      status: "ACTIVE"
    });

    // 6. Crear Tienda de prueba
    await db.insert(stores).values({
      id: storeId,
      name: "Test Store",
      address: "123 Test St",
      phone: "+34600000000",
      openingHours: "Mon-Fri",
      lat: 40.4167,
      lng: -3.7037
    });
  });

  afterAll(async () => {
    // Limpieza en orden inverso
    await db.delete(infoRequests).where(eq(infoRequests.email, "catalog-tester@example.com"));
    await db.delete(favorites).where(eq(favorites.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
    await db.delete(articlePrices).where(eq(articlePrices.articleId, articleId));
    await db.delete(articles).where(eq(articles.id, articleId));
    await db.delete(subfamilies).where(eq(subfamilies.id, subfamilyId));
    await db.delete(families).where(eq(families.id, familyId));
    await db.delete(stores).where(eq(stores.id, storeId));
  });

  describe("Catalog Queries", () => {
    it("should resolve public price for B2C/anonymous query", async () => {
      const results = await getArticles({
        familySlug,
        priceListCode: "PUBLIC"
      });

      const testArt = results.find((a) => a.id === articleId);
      expect(testArt).toBeDefined();
      expect(testArt!.publicPrice).toBe("100.00");
      expect((testArt as { b2bPrice?: string | null }).b2bPrice).toBeNull();
    });

    it("should resolve B2B price in query when priceListCode is supplied", async () => {
      const results = await getArticles({
        familySlug,
        priceListCode: "PRO_TEST"
      });

      const testArt = results.find((a) => a.id === articleId);
      expect(testArt).toBeDefined();
      expect(testArt!.publicPrice).toBe("100.00");
      expect((testArt as { b2bPrice?: string }).b2bPrice).toBe("85.00");
    });

    it("should fetch single article by slug including images and specific price", async () => {
      const details = await getArticleBySlug(articleSlug, "PRO_TEST");
      expect(details).not.toBeNull();
      expect(details!.name).toBe("Test Article Name");
      expect(details!.publicPrice!.price).toBe("100.00");
      expect(details!.b2bPrice!.price).toBe("85.00");
    });
  });

  describe("Catalog Server Actions", () => {
    it("should toggle favorite status for a logged in user", async () => {
      // Mock session
      vi.mocked(auth).mockResolvedValue({
        user: { id: userId, name: "Tester", email: "catalog-tester@example.com", type: "B2C" },
        expires: ""
      });

      // 1. Toggle ON
      const addRes = await toggleFavoriteAction(articleId);
      expect(addRes.success).toBe(true);
      expect(addRes.isFavorited).toBe(true);

      const favIds = await getFavoriteIds(userId);
      expect(favIds).toContain(articleId);

      const favList = await getFavorites(userId, "PUBLIC");
      expect(favList.length).toBe(1);
      expect(favList[0].id).toBe(articleId);

      // 2. Toggle OFF
      const removeRes = await toggleFavoriteAction(articleId);
      expect(removeRes.success).toBe(true);
      expect(removeRes.isFavorited).toBe(false);

      const favIdsAfter = await getFavoriteIds(userId);
      expect(favIdsAfter).not.toContain(articleId);
    });

    it("should reject toggle favorite when user is anonymous", async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const res = await toggleFavoriteAction(articleId);
      expect(res.error).toBeDefined();
    });

    it("should successfully register an info request", async () => {
      const formData = new FormData();
      formData.append("name", "Catalog Tester");
      formData.append("email", "catalog-tester@example.com");
      formData.append("phone", "+34 600 000 000");
      formData.append("message", "Quiero consultar precios de construcción.");
      formData.append("storeId", storeId);
      formData.append("articleId", articleId);

      const res = await submitInfoRequestAction(null, formData);
      expect(res.success).toBe(true);

      const created = await db.query.infoRequests.findFirst({
        where: eq(infoRequests.email, "catalog-tester@example.com")
      });
      expect(created).toBeDefined();
      expect(created!.message).toBe("Quiero consultar precios de construcción.");
      expect(created!.articleId).toBe(articleId);
      expect(created!.storeId).toBe(storeId);
    });
  });
});
