import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";

/**
 * Obtiene los enlaces de menú activos para mostrar en el storefront.
 * Ordenados por sortOrder ascendente.
 */
export async function getActiveMenuItems() {
  return db
    .select()
    .from(menuItems)
    .where(eq(menuItems.isActive, true))
    .orderBy(asc(menuItems.sortOrder));
}

/**
 * Obtiene todos los enlaces de menú (activos e inactivos) para la administración.
 * Ordenados por sortOrder ascendente.
 */
export async function getAllMenuItems() {
  return db
    .select()
    .from(menuItems)
    .orderBy(asc(menuItems.sortOrder));
}
