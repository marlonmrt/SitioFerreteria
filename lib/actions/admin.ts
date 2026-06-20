"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { infoRequests, articles } from "@/lib/db/schema";

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

    revalidatePath("/admin/solicitudes");
    revalidatePath("/admin");
    return { success: true, status: nextStatus };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al actualizar la solicitud";
    console.error("Error toggleInfoRequestStatusAction:", error);
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

    revalidatePath("/admin/articulos");
    revalidatePath("/");
    revalidatePath("/familias");
    revalidatePath("/buscar");
    return { success: true, isActive: nextStatus };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al actualizar el artículo";
    console.error("Error toggleArticleActiveAction:", error);
    return { error: errorMsg };
  }
}
