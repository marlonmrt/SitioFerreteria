"use server";

import { revalidatePath } from "next/cache";
import { eq, inArray } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { infoRequests, articles } from "@/lib/db/schema";
import { logger } from "@/lib/logger";

async function verifyAdmin() {
  const session = await auth();
  const user = session?.user as { id?: string; type?: string } | undefined;
  if (!user || user.type !== "ADMIN") {
    throw new Error("No autorizado. Se requiere rol de administrador.");
  }
}

export async function toggleInfoRequestStatusAction(
  requestId: string,
  currentStatus: "NEW" | "ATTENDED"
) {
  try {
    await verifyAdmin();

    const nextStatus = currentStatus === "NEW" ? "ATTENDED" : "NEW";

    await db
      .update(infoRequests)
      .set({ status: nextStatus })
      .where(eq(infoRequests.id, requestId));

    logger.info("Info request status toggled", { requestId, status: nextStatus });
    revalidatePath("/admin/solicitudes");
    revalidatePath("/admin");
    return { success: true, status: nextStatus };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al actualizar la solicitud";
    logger.error("Info request status toggle failed", { requestId, error: errorMsg });
    return { error: errorMsg };
  }
}

export async function toggleArticleActiveAction(articleId: string, currentStatus: boolean) {
  try {
    await verifyAdmin();

    const nextStatus = !currentStatus;

    await db
      .update(articles)
      .set({ isActive: nextStatus })
      .where(eq(articles.id, articleId));

    logger.info("Article active status toggled", { articleId, isActive: nextStatus });
    revalidatePath("/admin/articulos");
    revalidatePath("/");
    revalidatePath("/familias");
    revalidatePath("/buscar");
    return { success: true, isActive: nextStatus };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al actualizar el artículo";
    logger.error("Article active status toggle failed", { articleId, error: errorMsg });
    return { error: errorMsg };
  }
}

export async function toggleArticlesActiveBulkAction(articleIds: string[], targetStatus: boolean) {
  try {
    await verifyAdmin();

    if (!articleIds || articleIds.length === 0) {
      return { error: "No se proporcionaron IDs de artículos" };
    }

    await db
      .update(articles)
      .set({ isActive: targetStatus })
      .where(inArray(articles.id, articleIds));

    logger.info("Articles active status bulk toggled", { count: articleIds.length, isActive: targetStatus });
    revalidatePath("/admin/articulos");
    revalidatePath("/");
    revalidatePath("/familias");
    revalidatePath("/buscar");
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al actualizar los artículos";
    logger.error("Articles active status bulk toggle failed", { count: articleIds.length, error: errorMsg });
    return { error: errorMsg };
  }
}
