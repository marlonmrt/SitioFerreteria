"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";
import { eq, and, ne } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  families,
  subfamilies,
  articles,
  articlePrices
} from "@/lib/db/schema";
import { logger } from "@/lib/logger";

// Helper para verificar rol de administrador
async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { type?: string }).type !== "ADMIN") {
    throw new Error("No autorizado. Se requiere rol de administrador.");
  }
}

// Helper para generar slug a partir del nombre
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Schemas de Validación Zod
const familySchema = z.object({
  name: z.string().min(2, "El nombre de la familia debe tener al menos 2 caracteres"),
  image: z.string().optional().transform(v => v || null),
  sortOrder: z.string().transform(v => parseInt(v, 10) || 0)
});

const subfamilySchema = z.object({
  familyId: z.string().uuid("Familia no válida"),
  name: z.string().min(2, "El nombre de la subfamilia debe tener al menos 2 caracteres"),
  sortOrder: z.string().transform(v => parseInt(v, 10) || 0)
});

const articleSchema = z.object({
  name: z.string().min(2, "El nombre del artículo debe tener al menos 2 caracteres"),
  description: z.string().optional().transform(v => v || null),
  brand: z.string().optional().transform(v => v || null),
  unit: z.string().min(1, "La unidad es requerida"),
  subfamilyId: z.string().uuid("Subfamilia no válida"),
  mainImage: z.string().optional().transform(v => v || null),
  erpCode: z.string().optional().transform(v => v || null),
  pricePvp: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "El precio PVP debe ser un número válido mayor o igual a 0"
  }),
  pricePro: z.string().optional().refine(val => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
    message: "El precio PRO debe ser un número válido mayor o igual a 0"
  }).transform(v => v || null),
  stock: z.string().optional().default("0").transform(v => parseInt(v, 10) || 0),
  offerB2C: z.string().optional().refine(val => !val || (!isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0 && parseInt(val, 10) <= 100), {
    message: "El porcentaje B2C debe ser un entero entre 0 y 100"
  }).transform(v => v ? parseInt(v, 10) : 0),
  offerB2B: z.string().optional().refine(val => !val || (!isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 0 && parseInt(val, 10) <= 100), {
    message: "El porcentaje B2B debe ser un entero entre 0 y 100"
  }).transform(v => v ? parseInt(v, 10) : 0)
});

// === SERVER ACTIONS: FAMILIAS ===

export async function createFamilyAction(prevState: unknown, formData: FormData) {
  try {
    await verifyAdmin();
    const rawData = {
      name: formData.get("name"),
      image: formData.get("image"),
      sortOrder: formData.get("sortOrder")
    };

    const parsed = familySchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: "Datos no válidos", validationErrors: parsed.error.flatten().fieldErrors };
    }

    const slug = slugify(parsed.data.name);

    // Verificar colisión de slug
    const existing = await db.query.families.findFirst({
      where: eq(families.slug, slug)
    });
    if (existing) {
      return { error: "Ya existe una familia con ese nombre" };
    }

    await db.insert(families).values({
      id: crypto.randomUUID(),
      name: parsed.data.name,
      slug,
      image: parsed.data.image,
      sortOrder: parsed.data.sortOrder,
      isManual: true
    });

    logger.info("Family created", { slug, name: parsed.data.name });
    revalidatePath("/admin/familias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Family creation failed", { name: formData.get("name"), error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function updateFamilyAction(id: string, prevState: unknown, formData: FormData) {
  try {
    await verifyAdmin();
    const rawData = {
      name: formData.get("name"),
      image: formData.get("image"),
      sortOrder: formData.get("sortOrder")
    };

    const parsed = familySchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: "Datos no válidos", validationErrors: parsed.error.flatten().fieldErrors };
    }

    const slug = slugify(parsed.data.name);

    await db
      .update(families)
      .set({
        name: parsed.data.name,
        slug,
        image: parsed.data.image,
        sortOrder: parsed.data.sortOrder
      })
      .where(eq(families.id, id));

    logger.info("Family updated", { id, slug, name: parsed.data.name });
    revalidatePath("/admin/familias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Family update failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function deleteFamilyAction(id: string) {
  try {
    await verifyAdmin();
    const family = await db.query.families.findFirst({ where: eq(families.id, id) });
    if (!family) return { error: "Familia no encontrada" };

    await db.delete(families).where(eq(families.id, id));

    logger.info("Family deleted", { id });
    revalidatePath("/admin/familias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Family deletion failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

// === SERVER ACTIONS: SUBFAMILIAS ===

export async function createSubfamilyAction(prevState: unknown, formData: FormData) {
  try {
    await verifyAdmin();
    const rawData = {
      familyId: formData.get("familyId"),
      name: formData.get("name"),
      sortOrder: formData.get("sortOrder")
    };

    const parsed = subfamilySchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: "Datos no válidos", validationErrors: parsed.error.flatten().fieldErrors };
    }

    const slug = slugify(parsed.data.name);

    // Verificar colisión de slug
    const existing = await db.query.subfamilies.findFirst({
      where: eq(subfamilies.slug, slug)
    });
    if (existing) {
      return { error: "Ya existe una subfamilia con ese nombre" };
    }

    await db.insert(subfamilies).values({
      id: crypto.randomUUID(),
      familyId: parsed.data.familyId,
      name: parsed.data.name,
      slug,
      sortOrder: parsed.data.sortOrder,
      isManual: true
    });

    logger.info("Subfamily created", { slug, name: parsed.data.name, familyId: parsed.data.familyId });
    revalidatePath("/admin/familias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Subfamily creation failed", { name: formData.get("name"), error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function updateSubfamilyAction(id: string, prevState: unknown, formData: FormData) {
  try {
    await verifyAdmin();
    const rawData = {
      familyId: formData.get("familyId"),
      name: formData.get("name"),
      sortOrder: formData.get("sortOrder")
    };

    const parsed = subfamilySchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: "Datos no válidos", validationErrors: parsed.error.flatten().fieldErrors };
    }

    const slug = slugify(parsed.data.name);

    await db
      .update(subfamilies)
      .set({
        familyId: parsed.data.familyId,
        name: parsed.data.name,
        slug,
        sortOrder: parsed.data.sortOrder
      })
      .where(eq(subfamilies.id, id));

    logger.info("Subfamily updated", { id, slug, name: parsed.data.name, familyId: parsed.data.familyId });
    revalidatePath("/admin/familias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Subfamily update failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function deleteSubfamilyAction(id: string) {
  try {
    await verifyAdmin();
    const sub = await db.query.subfamilies.findFirst({ where: eq(subfamilies.id, id) });
    if (!sub) return { error: "Subfamilia no encontrada" };
    if (!sub.isManual) return { error: "No se pueden eliminar subfamilias sincronizadas por el ERP" };

    await db.delete(subfamilies).where(eq(subfamilies.id, id));

    logger.info("Subfamily deleted", { id });
    revalidatePath("/admin/familias");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Subfamily deletion failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

// === SERVER ACTIONS: ARTÍCULOS ===

export async function createArticleAction(prevState: unknown, formData: FormData) {
  try {
    await verifyAdmin();
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      brand: formData.get("brand"),
      unit: formData.get("unit"),
      subfamilyId: formData.get("subfamilyId"),
      mainImage: formData.get("mainImage"),
      erpCode: formData.get("erpCode"),
      pricePvp: formData.get("pricePvp"),
      pricePro: formData.get("pricePro"),
      stock: formData.get("stock"),
      offerB2C: formData.get("offerB2C"),
      offerB2B: formData.get("offerB2B")
    };

    const parsed = articleSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: "Datos no válidos", validationErrors: parsed.error.flatten().fieldErrors };
    }

    const erpCode = parsed.data.erpCode || `MAN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const slug = slugify(parsed.data.name);

    // Verificar que no choque el erpCode
    const existingErp = await db.query.articles.findFirst({
      where: eq(articles.erpCode, erpCode)
    });
    if (existingErp) {
      return { error: "Ya existe un artículo con este código ERP" };
    }

    const articleId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      // 1. Insertar Artículo
      await tx.insert(articles).values({
        id: articleId,
        erpCode,
        name: parsed.data.name,
        slug,
        description: parsed.data.description,
        brand: parsed.data.brand,
        unit: parsed.data.unit,
        subfamilyId: parsed.data.subfamilyId,
        mainImage: parsed.data.mainImage,
        isActive: true,
        isManual: true,
        lastSyncedAt: new Date(),
        stock: parsed.data.stock,
        offerB2C: parsed.data.offerB2C,
        offerB2B: parsed.data.offerB2B
      });

      // 2. Insertar precio público (PUBLIC)
      await tx.insert(articlePrices).values({
        id: crypto.randomUUID(),
        articleId,
        priceListCode: "PUBLIC",
        price: parseFloat(parsed.data.pricePvp).toFixed(2),
        currency: "EUR"
      });

      // 3. Insertar precio profesional (PRO_01) si existe
      if (parsed.data.pricePro) {
        await tx.insert(articlePrices).values({
          id: crypto.randomUUID(),
          articleId,
          priceListCode: "PRO_01",
          price: parseFloat(parsed.data.pricePro).toFixed(2),
          currency: "EUR"
        });
      }
    });

    logger.info("Manual article created", { articleId, erpCode, name: parsed.data.name, subfamilyId: parsed.data.subfamilyId });
    revalidatePath("/admin/articulos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Article creation failed", { name: formData.get("name"), error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function updateArticleAction(id: string, prevState: unknown, formData: FormData) {
  try {
    await verifyAdmin();
    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      brand: formData.get("brand"),
      unit: formData.get("unit"),
      subfamilyId: formData.get("subfamilyId"),
      mainImage: formData.get("mainImage"),
      erpCode: formData.get("erpCode"),
      pricePvp: formData.get("pricePvp"),
      pricePro: formData.get("pricePro"),
      stock: formData.get("stock"),
      offerB2C: formData.get("offerB2C"),
      offerB2B: formData.get("offerB2B")
    };

    const parsed = articleSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: "Datos no válidos", validationErrors: parsed.error.flatten().fieldErrors };
    }

    const erpCode = parsed.data.erpCode || `MAN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const slug = slugify(parsed.data.name);

    // Verificar colisión de erpCode excluyéndose a sí mismo
    const colisionErp = await db.query.articles.findFirst({
      where: and(eq(articles.erpCode, erpCode), ne(articles.id, id))
    });
    if (colisionErp) {
      return { error: "Ya existe otro artículo con este código ERP" };
    }

    await db.transaction(async (tx) => {
      // 1. Actualizar datos base del artículo
      await tx
        .update(articles)
        .set({
          erpCode,
          name: parsed.data.name,
          slug,
          description: parsed.data.description,
          brand: parsed.data.brand,
          unit: parsed.data.unit,
          subfamilyId: parsed.data.subfamilyId,
          mainImage: parsed.data.mainImage,
          stock: parsed.data.stock,
          offerB2C: parsed.data.offerB2C,
          offerB2B: parsed.data.offerB2B
        })
        .where(eq(articles.id, id));

      // 2. Actualizar o insertar precio público
      const existingPublicPrice = await tx.query.articlePrices.findFirst({
        where: and(eq(articlePrices.articleId, id), eq(articlePrices.priceListCode, "PUBLIC"))
      });
      if (existingPublicPrice) {
        await tx
          .update(articlePrices)
          .set({ price: parseFloat(parsed.data.pricePvp).toFixed(2), updatedAt: new Date() })
          .where(eq(articlePrices.id, existingPublicPrice.id));
      } else {
        await tx.insert(articlePrices).values({
          id: crypto.randomUUID(),
          articleId: id,
          priceListCode: "PUBLIC",
          price: parseFloat(parsed.data.pricePvp).toFixed(2),
          currency: "EUR"
        });
      }

      // 3. Actualizar o insertar precio profesional
      const existingProPrice = await tx.query.articlePrices.findFirst({
        where: and(eq(articlePrices.articleId, id), eq(articlePrices.priceListCode, "PRO_01"))
      });

      if (parsed.data.pricePro) {
        if (existingProPrice) {
          await tx
            .update(articlePrices)
            .set({ price: parseFloat(parsed.data.pricePro).toFixed(2), updatedAt: new Date() })
            .where(eq(articlePrices.id, existingProPrice.id));
        } else {
          await tx.insert(articlePrices).values({
            id: crypto.randomUUID(),
            articleId: id,
            priceListCode: "PRO_01",
            price: parseFloat(parsed.data.pricePro).toFixed(2),
            currency: "EUR"
          });
        }
      } else if (existingProPrice) {
        // Si se vacía el precio PRO, lo borramos de la base de datos
        await tx.delete(articlePrices).where(eq(articlePrices.id, existingProPrice.id));
      }
    });

    logger.info("Manual article updated", { id, erpCode, name: parsed.data.name, subfamilyId: parsed.data.subfamilyId });
    revalidatePath("/admin/articulos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Article update failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    await verifyAdmin();
    const article = await db.query.articles.findFirst({ where: eq(articles.id, id) });
    if (!article) return { error: "Artículo no encontrado" };
    if (!article.isManual) return { error: "No se pueden eliminar artículos sincronizados por el ERP" };

    await db.delete(articles).where(eq(articles.id, id));

    logger.info("Manual article deleted", { id });
    revalidatePath("/admin/articulos");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    logger.error("Article deletion failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}
