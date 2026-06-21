"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { favorites, infoRequests } from "@/lib/db/schema";
import { logger } from "@/lib/logger";

export async function toggleFavoriteAction(articleId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Debe iniciar sesión para guardar favoritos" };
  }

  const userId = session.user.id;

  try {
    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.articleId, articleId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.articleId, articleId)));
      
      logger.info("Favorite status toggled", { userId, articleId, isFavorited: false });
      revalidatePath("/mi-cuenta/favoritos");
      revalidatePath("/mi-cuenta-empresa/favoritos");
      return { success: true, isFavorited: false };
    } else {
      await db.insert(favorites).values({
        userId,
        articleId
      });

      logger.info("Favorite status toggled", { userId, articleId, isFavorited: true });
      revalidatePath("/mi-cuenta/favoritos");
      revalidatePath("/mi-cuenta-empresa/favoritos");
      return { success: true, isFavorited: true };
    }
  } catch (error) {
    logger.error("Favorite status toggle failed", { userId, articleId, error: error instanceof Error ? error.message : String(error) });
    return { error: "No se pudo actualizar el favorito" };
  }
}

const infoRequestSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico no válido"),
  phone: z.string().optional().transform(v => v || null),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres"),
  storeId: z.string().uuid("Tienda no válida").optional().nullable().transform(v => v || null),
  articleId: z.string().uuid().optional().nullable().transform(v => v || null)
});

export async function submitInfoRequestAction(prevState: unknown, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id || null;

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    storeId: formData.get("storeId"),
    articleId: formData.get("articleId")
  };

  const parsed = infoRequestSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      error: "Datos no válidos",
      validationErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    await db.insert(infoRequests).values({
      userId,
      articleId: parsed.data.articleId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      storeId: parsed.data.storeId,
      status: "NEW"
    });

    logger.info("Info request submitted successfully", { name: parsed.data.name, email: parsed.data.email, articleId: parsed.data.articleId });
    return { success: true };
  } catch (error) {
    logger.error("Info request submission failed", { email: String(rawData.email), error: error instanceof Error ? error.message : String(error) });
    return { error: "Ocurrió un error al enviar su solicitud. Inténtelo más tarde." };
  }
}
