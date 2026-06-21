import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { db } from "../db";
import { articles, articlePrices, subfamilies, importBatches } from "../db/schema";
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

  it("should not deactivate manual articles during deactivation control", async () => {
    // 1. Obtener la subfamilia creada en el test anterior
    const subfam = await db.query.subfamilies.findFirst({
      where: eq(subfamilies.name, "Subfamilia Test")
    });
    expect(subfam).toBeDefined();
    const subfamilyId = subfam!.id;

    const autoArticleId = crypto.randomUUID();
    const manualArticleId = crypto.randomUUID();

    // 2. Crear un artículo automático y uno manual con lastSyncedAt viejo (hace 4 horas)
    const oldDate = new Date(Date.now() - 4 * 3600 * 1000);
    await db.insert(articles).values([
      {
        id: autoArticleId,
        erpCode: "TEST-ART-AUTO",
        name: "Artículo Auto Viejo",
        slug: "articulo-auto-viejo",
        unit: "ud",
        subfamilyId,
        isActive: true,
        isManual: false,
        lastSyncedAt: oldDate
      },
      {
        id: manualArticleId,
        erpCode: "TEST-ART-MAN",
        name: "Artículo Manual Viejo",
        slug: "articulo-manual-viejo",
        unit: "ud",
        subfamilyId,
        isActive: true,
        isManual: true,
        lastSyncedAt: oldDate
      }
    ]);

    // 3. Crear 2 lotes de importación exitosos en el pasado (hace 2 horas y 1 hora)
    const batch1Id = crypto.randomUUID();
    const batch2Id = crypto.randomUUID();
    await db.insert(importBatches).values([
      {
        id: batch1Id,
        fileName: "past-import-1.csv",
        type: "CSV",
        startedAt: new Date(Date.now() - 2 * 3600 * 1000),
        finishedAt: new Date(Date.now() - 2 * 3600 * 1000),
        status: "SUCCESS",
        totalRows: 1,
        successRows: 1,
        errorRows: 0,
        errorLog: "[]"
      },
      {
        id: batch2Id,
        fileName: "past-import-2.csv",
        type: "CSV",
        startedAt: new Date(Date.now() - 1 * 3600 * 1000),
        finishedAt: new Date(Date.now() - 1 * 3600 * 1000),
        status: "SUCCESS",
        totalRows: 1,
        successRows: 1,
        errorRows: 0,
        errorLog: "[]"
      }
    ]);

    // 4. Ejecutar syncImport (esta será la 3ª importación exitosa, superando el umbral de 2 exitosas previas)
    const result = await syncImport(testRows, "test-import-deact.csv", "CSV");
    expect(result.success).toBe(true);

    // 5. Verificar que el artículo automático se desactivó, pero el manual sigue activo
    const dbAutoArticle = await db.query.articles.findFirst({
      where: eq(articles.id, autoArticleId)
    });
    expect(dbAutoArticle).toBeDefined();
    expect(dbAutoArticle!.isActive).toBe(false); // Desactivado por descatalogado

    const dbManualArticle = await db.query.articles.findFirst({
      where: eq(articles.id, manualArticleId)
    });
    expect(dbManualArticle).toBeDefined();
    expect(dbManualArticle!.isActive).toBe(true); // Sigue activo porque isManual = true

    // 6. Limpieza
    await db.delete(articles).where(eq(articles.id, autoArticleId));
    await db.delete(articles).where(eq(articles.id, manualArticleId));
    await db.delete(importBatches).where(eq(importBatches.id, batch1Id));
    await db.delete(importBatches).where(eq(importBatches.id, batch2Id));
    await db.delete(importBatches).where(eq(importBatches.id, result.batchId));
  });
});
