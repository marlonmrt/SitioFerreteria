"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { logger } from "@/lib/logger";

// Helper to verify admin permissions
async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { type?: string }).type !== "ADMIN") {
    throw new Error("No autorizado. Se requiere rol de administrador.");
  }
}

// Zod validation schema
const menuItemSchema = z.object({
  label: z.string().min(2, "La etiqueta debe tener al menos 2 caracteres"),
  href: z.string().min(1, "El enlace es requerido"),
  sortOrder: z.string().transform((v) => parseInt(v, 10) || 0),
  parentId: z.string().optional().transform((v) => v || null)
});

export async function createMenuItemAction(prevState: unknown, formData: FormData) {
  try {
    await verifyAdmin();

    const rawData = {
      label: formData.get("label"),
      href: formData.get("href"),
      sortOrder: formData.get("sortOrder"),
      parentId: formData.get("parentId")
    };

    const parsed = menuItemSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: "Datos no válidos", validationErrors: parsed.error.flatten().fieldErrors };
    }

    await db.insert(menuItems).values({
      id: crypto.randomUUID(),
      label: parsed.data.label,
      href: parsed.data.href,
      parentId: parsed.data.parentId,
      sortOrder: parsed.data.sortOrder,
      isActive: true
    });

    logger.info("Menu item created", { label: parsed.data.label, href: parsed.data.href });
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error) {
    logger.error("Menu item creation failed", { label: formData.get("label"), error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function updateMenuItemAction(id: string, prevState: unknown, formData: FormData) {
  try {
    await verifyAdmin();

    const rawData = {
      label: formData.get("label"),
      href: formData.get("href"),
      sortOrder: formData.get("sortOrder"),
      parentId: formData.get("parentId")
    };

    const parsed = menuItemSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: "Datos no válidos", validationErrors: parsed.error.flatten().fieldErrors };
    }

    // Evitar que un elemento sea su propio padre
    if (parsed.data.parentId === id) {
      return { error: "Un elemento de menú no puede ser su propio padre." };
    }

    await db
      .update(menuItems)
      .set({
        label: parsed.data.label,
        href: parsed.data.href,
        parentId: parsed.data.parentId,
        sortOrder: parsed.data.sortOrder
      })
      .where(eq(menuItems.id, id));

    logger.info("Menu item updated", { id, label: parsed.data.label, href: parsed.data.href });
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error) {
    logger.error("Menu item update failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function toggleMenuItemActiveAction(id: string, currentStatus: boolean) {
  try {
    await verifyAdmin();

    const newStatus = !currentStatus;
    await db
      .update(menuItems)
      .set({ isActive: newStatus })
      .where(eq(menuItems.id, id));

    logger.info("Menu item status toggled", { id, isActive: newStatus });
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return { success: true, isActive: newStatus };
  } catch (error) {
    logger.error("Menu item status toggle failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}

export async function deleteMenuItemAction(id: string) {
  try {
    await verifyAdmin();

    await db.delete(menuItems).where(eq(menuItems.id, id));

    logger.info("Menu item deleted", { id });
    revalidatePath("/");
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error) {
    logger.error("Menu item deletion failed", { id, error: error instanceof Error ? error.message : String(error) });
    return { error: error instanceof Error ? error.message : "Error interno del servidor" };
  }
}
