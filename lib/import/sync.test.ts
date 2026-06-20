import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { articles, articlePrices } from "../db/schema";
import { syncImport } from "./sync";
import type { ImportRow } from "../validators/import";

describe("Import Sync Integration", () => {
  const testRows: ImportRow[] = [
    {
      erpCode: "TEST-ART-001",
      name: "Artículo de Prueba",
      description: "Descripción de prueba",
      brand: "TestBrand",
      unit: "ud",
      family: "Familia Test",
      subfamily: "Subfamilia Test",
      mainImage: "/test.jpg",
      prices: {
        PUBLIC: 100.0,
        PRO_01: 85.0
      }
    }
  ];

  beforeAll(async () => {
    // Limpiar residuos previos de pruebas
    const article = await db.query.articles.findFirst({
      where: eq(articles.erpCode, "TEST-ART-001")
    });
    if (article) {
      await db.delete(articlePrices).where(eq(articlePrices.articleId, article.id));
      await db.delete(articles).where(eq(articles.id, article.id));
    }
  });

  afterAll(async () => {
    // Limpieza final
    const article = await db.query.articles.findFirst({
      where: eq(articles.erpCode, "TEST-ART-001")
    });
    if (article) {
      await db.delete(articlePrices).where(eq(articlePrices.articleId, article.id));
      await db.delete(articles).where(eq(articles.id, article.id));
    }
  });

  it("should sync and insert records successfully in DB", async () => {
    const result = await syncImport(testRows, "test-import.csv", "CSV");

    expect(result.success).toBe(true);
    expect(result.totalRows).toBe(1);
    expect(result.successRows).toBe(1);
    expect(result.errorRows).toBe(0);

    // Verificar en DB
    const dbArticle = await db.query.articles.findFirst({
      where: eq(articles.erpCode, "TEST-ART-001")
    });

    expect(dbArticle).toBeDefined();
    expect(dbArticle!.name).toBe("Artículo de Prueba");
    expect(dbArticle!.isActive).toBe(true);

    const dbPrices = await db.query.articlePrices.findMany({
      where: eq(articlePrices.articleId, dbArticle!.id)
    });

    expect(dbPrices).toHaveLength(2);
    const publicPrice = dbPrices.find((p) => p.priceListCode === "PUBLIC");
    const proPrice = dbPrices.find((p) => p.priceListCode === "PRO_01");

    expect(publicPrice).toBeDefined();
    expect(publicPrice!.price).toBe("100.00");
    expect(proPrice).toBeDefined();
    expect(proPrice!.price).toBe("85.00");
  });
});
