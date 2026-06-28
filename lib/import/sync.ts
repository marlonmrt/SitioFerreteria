import crypto from "node:crypto";
import { and, desc, eq, lt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { db } from "../db";
import {
  articles,
  articlePrices,
  families,
  subfamilies,
  importBatches
} from "../db/schema";
import type { ImportRow } from "../validators/import";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // eliminar acentos
    .replace(/\s+/g, "-") // reemplazar espacios con guiones
    .replace(/[^\w\-]+/g, "") // eliminar caracteres especiales
    .replace(/\-\-+/g, "-") // evitar guiones repetidos
    .replace(/^-+/, "") // recortar guiones al inicio
    .replace(/-+$/, ""); // recortar guiones al final
}

async function resolveUniqueSlug(
  tx: typeof db,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  const existing = await tx.query.articles.findFirst({
    where: excludeId
      ? and(eq(articles.slug, baseSlug), ne(articles.id, excludeId))
      : eq(articles.slug, baseSlug)
  });
  if (!existing) return baseSlug;

  let counter = 1;
  while (true) {
    const candidate = `${baseSlug}-${counter}`;
    const conflict = await tx.query.articles.findFirst({
      where: excludeId
        ? and(eq(articles.slug, candidate), ne(articles.id, excludeId))
        : eq(articles.slug, candidate)
    });
    if (!conflict) return candidate;
    counter++;
  }
}

export async function syncImport(
  rows: ImportRow[],
  fileName: string,
  fileType: "CSV" | "XLSX",
  batchId: string = crypto.randomUUID()
): Promise<{
  batchId: string;
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
}> {
  const startedAt = new Date();

  logger.info("ERP sync started", { batchId, fileName, fileType, totalRows: rows.length });

  // Registrar el lote en la base de datos en estado PENDING
  await db.insert(importBatches).values({
    id: batchId,
    fileName,
    type: fileType,
    startedAt,
    status: "PENDING",
    totalRows: rows.length,
    successRows: 0,
    errorRows: 0,
    errorLog: "[]"
  });

  try {
    const BATCH_SIZE = 100;
    let successCount = 0;
    let errorCount = 0;
    const errors: { row: number; reason: string }[] = [];

    // Procesar las filas en lotes
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batchRows = rows.slice(i, i + BATCH_SIZE);

      try {
        await db.transaction(async (tx) => {
          // 1. Resolver familias e insertarlas si no existen
          const uniqueFamilies = Array.from(
            new Set(batchRows.map((r) => r.family.trim()))
          );
          const familyMap: Record<string, string> = {};

          for (const familyName of uniqueFamilies) {
            const slug = slugify(familyName);
            const existing = await tx.query.families.findFirst({
              where: eq(families.slug, slug)
            });

            if (existing) {
              familyMap[familyName] = existing.id;
            } else {
              const newId = crypto.randomUUID();
              await tx.insert(families).values({
                id: newId,
                name: familyName,
                slug,
                sortOrder: 0
              });
              familyMap[familyName] = newId;
            }
          }

          // 2. Resolver subfamilias e insertarlas si no existen
          const uniqueSubfamilies = Array.from(
            new Set(batchRows.map((r) => `${r.family.trim()}|||${r.subfamily.trim()}`))
          );
          const subfamilyMap: Record<string, string> = {};

          for (const key of uniqueSubfamilies) {
            const [familyName, subfamilyName] = key.split("|||");
            const familyId = familyMap[familyName];
            const slug = slugify(subfamilyName);

            const existing = await tx.query.subfamilies.findFirst({
              where: eq(subfamilies.slug, slug)
            });

            if (existing) {
              subfamilyMap[key] = existing.id;
            } else {
              const newId = crypto.randomUUID();
              await tx.insert(subfamilies).values({
                id: newId,
                familyId,
                name: subfamilyName,
                slug,
                sortOrder: 0
              });
              subfamilyMap[key] = newId;
            }
          }

          // 3. Upsert de artículos y sus precios
          for (const row of batchRows) {
            const subfamilyKey = `${row.family.trim()}|||${row.subfamily.trim()}`;
            const subfamilyId = subfamilyMap[subfamilyKey];
            const baseSlug = slugify(row.name);

            // Verificar si el artículo por erpCode existe
            const existingArticle = await tx.query.articles.findFirst({
              where: eq(articles.erpCode, row.erpCode)
            });

            let articleId: string;

            if (existingArticle) {
              articleId = existingArticle.id;
              // Mantener el slug existente si el nombre no cambió, para evitar colisiones
              const slug = existingArticle.name === row.name
                ? existingArticle.slug
                : await resolveUniqueSlug(tx, baseSlug, articleId);
              await tx
                .update(articles)
                .set({
                  name: row.name,
                  slug,
                  description: row.description,
                  brand: row.brand,
                  unit: row.unit,
                  subfamilyId,
                  mainImage: row.mainImage,
                  stock: row.stock,
                  offerB2C: row.offerB2C,
                  offerB2B: row.offerB2B,
                  isActive: true,
                  lastSyncedAt: new Date()
                })
                .where(eq(articles.id, articleId));
            } else {
              articleId = crypto.randomUUID();
              const slug = await resolveUniqueSlug(tx, baseSlug);
              await tx.insert(articles).values({
                id: articleId,
                erpCode: row.erpCode,
                name: row.name,
                slug,
                description: row.description,
                brand: row.brand,
                unit: row.unit,
                subfamilyId,
                mainImage: row.mainImage,
                stock: row.stock,
                offerB2C: row.offerB2C,
                offerB2B: row.offerB2B,
                isActive: true,
                lastSyncedAt: new Date()
              });
            }

            // Upsert de precios del artículo
            for (const [priceListCode, price] of Object.entries(row.prices)) {
              const existingPrice = await tx.query.articlePrices.findFirst({
                where: and(
                  eq(articlePrices.articleId, articleId),
                  eq(articlePrices.priceListCode, priceListCode)
                )
              });

              if (existingPrice) {
                await tx
                  .update(articlePrices)
                  .set({
                    price: price.toFixed(2),
                    updatedAt: new Date()
                  })
                  .where(eq(articlePrices.id, existingPrice.id));
              } else {
                await tx.insert(articlePrices).values({
                  id: crypto.randomUUID(),
                  articleId,
                  priceListCode,
                  price: price.toFixed(2),
                  currency: "EUR",
                  updatedAt: new Date()
                });
              }
            }
          }
        });

        successCount += batchRows.length;
        logger.info("ERP sync batch processed successfully", { batchId, count: batchRows.length, progress: `${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}` });
      } catch (txError) {
        const errorMsg = txError instanceof Error ? txError.message : String(txError);
        const errorDetail = txError instanceof Error && 'detail' in txError
          ? (txError as Record<string, unknown>).detail : undefined;
        const errorCode = txError instanceof Error && 'code' in txError
          ? (txError as Record<string, unknown>).code : undefined;
        logger.error("ERP sync batch processing failed", { batchId, startRow: i + 1, error: errorMsg, detail: errorDetail, code: errorCode });
        errorCount += batchRows.length;
        errors.push({
          row: i + 1,
          reason: `Error procesando lote de filas ${i + 1}-${Math.min(
            i + BATCH_SIZE,
            rows.length
          )}: ${errorMsg}${errorDetail ? ` | Detalle: ${errorDetail}` : ''}${errorCode ? ` | Código: ${errorCode}` : ''}`
        });
      }
    }

    // 4. Control de descatalogados
    logger.info("ERP sync checking deactivations", { batchId });
    // Si un artículo activo no ha aparecido en las últimas N=3 importaciones completadas con éxito
    const pastBatches = await db.query.importBatches.findMany({
      where: eq(importBatches.status, "SUCCESS"),
      orderBy: [desc(importBatches.startedAt)],
      limit: 2 // Obtenemos las 2 anteriores. Esta será la 3ª.
    });

    if (pastBatches.length >= 2) {
      // Fecha de inicio de la 3ª importación exitosa consecutiva (índice 1 en el array)
      const thresholdDate = pastBatches[1].startedAt;

      // Desactivar artículos cuyo lastSyncedAt sea anterior al inicio de la 3ª importación consecutiva y que no sean manuales
      await db
        .update(articles)
        .set({ isActive: false })
        .where(
          and(
            eq(articles.isActive, true),
            eq(articles.isManual, false),
            lt(articles.lastSyncedAt, thresholdDate)
          )
        );
    }

    // Actualizar el estado final del lote
    const finalStatus = errorCount === 0 ? "SUCCESS" : "ERROR";
    logger.info("ERP sync finished", { batchId, success: finalStatus === "SUCCESS", successCount, errorCount });
    await db
      .update(importBatches)
      .set({
        finishedAt: new Date(),
        status: finalStatus,
        successRows: successCount,
        errorRows: errorCount,
        errorLog: JSON.stringify(errors)
      })
      .where(eq(importBatches.id, batchId));

    if (finalStatus === "SUCCESS") {
      try {
        revalidatePath("/");
        revalidatePath("/buscar");
        revalidatePath("/familias/[slug]", "page");
        revalidatePath("/articulos/[slug]", "page");
        revalidatePath("/admin");
        revalidatePath("/admin/articulos");
      } catch (cacheError) {
        logger.error("Error revalidando rutas tras importación exitosa", { batchId, error: cacheError instanceof Error ? cacheError.message : String(cacheError) });
      }
    }

    return {
      batchId,
      success: finalStatus === "SUCCESS",
      totalRows: rows.length,
      successRows: successCount,
      errorRows: errorCount
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error fatal en el proceso de sincronización";
    logger.error("ERP sync failed catastrophically", { batchId, error: errorMsg });
    // Si hay un error catastrófico general
    await db
      .update(importBatches)
      .set({
        finishedAt: new Date(),
        status: "ERROR",
        errorRows: rows.length,
        errorLog: JSON.stringify([
          { row: 0, reason: errorMsg }
        ])
      })
      .where(eq(importBatches.id, batchId));

    return {
      batchId,
      success: false,
      totalRows: rows.length,
      successRows: 0,
      errorRows: rows.length
    };
  }
}
