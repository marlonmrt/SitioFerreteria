import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
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
  infoRequests,
  stores
} from "../db/schema";
import {
  getAdminMetrics,
  getAdminInfoRequests,
  getAdminArticles,
  getAdminArticlesCount
} from "../db/queries/admin";
import {
  toggleInfoRequestStatusAction,
  toggleArticleActiveAction
} from "./admin";

describe("Admin Queries and Actions Integration", () => {
  const familyId = crypto.randomUUID();
  const subfamilyId = crypto.randomUUID();
  const articleId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const storeId = crypto.randomUUID();
  const requestId = crypto.randomUUID();

  const familySlug = "admin-fam-" + crypto.randomUUID().substring(0, 8);
  const subfamilySlug = "admin-subfam-" + crypto.randomUUID().substring(0, 8);
  const articleSlug = "admin-art-" + crypto.randomUUID().substring(0, 8);
  const erpCode = "ADMIN-ERP-" + crypto.randomUUID().substring(0, 8);

  beforeAll(async () => {
    // 1. Crear Familia de prueba
    await db.insert(families).values({
      id: familyId,
      name: "Admin Test Family",
      slug: familySlug,
      sortOrder: 99
    });

    // 2. Crear Subfamilia de prueba
    await db.insert(subfamilies).values({
      id: subfamilyId,
      familyId,
      name: "Admin Test Subfamily",
      slug: subfamilySlug,
      sortOrder: 99
    });

    // 3. Crear Artículo de prueba
    await db.insert(articles).values({
      id: articleId,
      erpCode,
      name: "Admin Test Article",
      slug: articleSlug,
      brand: "AdminBrand",
      unit: "ud",
      subfamilyId,
      isActive: true
    });

    // 4. Crear Tienda de prueba
    await db.insert(stores).values({
      id: storeId,
      name: "Admin Test Store",
      address: "456 Admin St",
      phone: "+34600000000",
      openingHours: "Mon-Sat",
      lat: 40.4167,
      lng: -3.7037
    });

    // 5. Crear Solicitud de Información de prueba
    await db.insert(infoRequests).values({
      id: requestId,
      articleId,
      name: "Inquiry Client",
      email: "admin-tester@example.com",
      phone: "+34666666666",
      message: "Consulta de prueba para administrador",
      storeId,
      status: "NEW"
    });

    // 6. Crear Usuario Administrador de prueba
    await db.insert(users).values({
      id: userId,
      email: "admin-tester-action@example.com",
      passwordHash: "dummy",
      name: "Admin Tester",
      type: "ADMIN",
      status: "ACTIVE"
    });
  });

  afterAll(async () => {
    // Limpieza
    await db.delete(infoRequests).where(eq(infoRequests.id, requestId));
    await db.delete(users).where(eq(users.id, userId));
    await db.delete(articles).where(eq(articles.id, articleId));
    await db.delete(subfamilies).where(eq(subfamilies.id, subfamilyId));
    await db.delete(families).where(eq(families.id, familyId));
    await db.delete(stores).where(eq(stores.id, storeId));
  });

  describe("Admin Queries", () => {
    it("should fetch admin dashboard metrics", async () => {
      const metrics = await getAdminMetrics();
      expect(metrics.activeArticlesCount).toBeGreaterThanOrEqual(1);
      expect(metrics.newInfoCount).toBeGreaterThanOrEqual(1);
    });

    it("should fetch admin info requests filtered by status", async () => {
      const list = await getAdminInfoRequests("NEW");
      const found = list.find((r) => r.id === requestId);
      expect(found).toBeDefined();
      expect(found!.articleName).toBe("Admin Test Article");
      expect(found!.storeName).toBe("Admin Test Store");
    });

    it("should fetch admin articles list paginated and matching search query", async () => {
      const list = await getAdminArticles({ search: "Admin Test Article" });
      const found = list.find((a) => a.id === articleId);
      expect(found).toBeDefined();
      expect(found!.familyName).toBe("Admin Test Family");
      expect(found!.subfamilyName).toBe("Admin Test Subfamily");

      const count = await getAdminArticlesCount("Admin Test Article");
      expect(count).toBe(1);
    });
  });

  describe("Admin Server Actions", () => {
    beforeEach(() => {
      // Mock session as ADMIN by default
      vi.mocked(auth).mockResolvedValue({
        user: { id: userId, name: "Admin", email: "admin-tester-action@example.com", type: "ADMIN" },
        expires: ""
      });
    });

    it("should toggle info request status from NEW to ATTENDED and back", async () => {
      // 1. Toggle to ATTENDED
      const res1 = await toggleInfoRequestStatusAction(requestId, "NEW");
      expect(res1.success).toBe(true);
      expect(res1.status).toBe("ATTENDED");

      let updated = await db.query.infoRequests.findFirst({
        where: eq(infoRequests.id, requestId)
      });
      expect(updated!.status).toBe("ATTENDED");

      // 2. Toggle to NEW
      const res2 = await toggleInfoRequestStatusAction(requestId, "ATTENDED");
      expect(res2.success).toBe(true);
      expect(res2.status).toBe("NEW");

      updated = await db.query.infoRequests.findFirst({
        where: eq(infoRequests.id, requestId)
      });
      expect(updated!.status).toBe("NEW");
    });

    it("should toggle article active status to hide/show from storefront", async () => {
      // 1. Deactivate
      const res1 = await toggleArticleActiveAction(articleId, true);
      expect(res1.success).toBe(true);
      expect(res1.isActive).toBe(false);

      let updated = await db.query.articles.findFirst({
        where: eq(articles.id, articleId)
      });
      expect(updated!.isActive).toBe(false);

      // 2. Activate
      const res2 = await toggleArticleActiveAction(articleId, false);
      expect(res2.success).toBe(true);
      expect(res2.isActive).toBe(true);

      updated = await db.query.articles.findFirst({
        where: eq(articles.id, articleId)
      });
      expect(updated!.isActive).toBe(true);
    });

    it("should reject admin actions when user is not authorized", async () => {
      // Mock session as standard B2C user
      vi.mocked(auth).mockResolvedValue({
        user: { id: userId, name: "B2c User", email: "user@example.com", type: "B2C" },
        expires: ""
      });

      const res = await toggleArticleActiveAction(articleId, true);
      expect(res.error).toBeDefined();
      expect(res.error).toContain("No autorizado");
    });
  });
});
