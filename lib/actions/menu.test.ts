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
import { menuItems } from "../db/schema";
import { getActiveMenuItems, getAllMenuItems } from "../db/queries/menu";
import {
  createMenuItemAction,
  updateMenuItemAction,
  toggleMenuItemActiveAction,
  deleteMenuItemAction
} from "./menu-admin";

describe("Menu Queries and Actions Integration", () => {
  const userId = crypto.randomUUID();
  const menuId1 = crypto.randomUUID();
  const menuId2 = crypto.randomUUID();

  beforeAll(async () => {
    // Limpiar residuos previos de pruebas si los hubiera
    await db.delete(menuItems).where(eq(menuItems.label, "Test Link 1"));
    await db.delete(menuItems).where(eq(menuItems.label, "Test Link 2"));
  });

  afterAll(async () => {
    // Limpieza de los registros creados durante el test
    await db.delete(menuItems).where(eq(menuItems.id, menuId1));
    await db.delete(menuItems).where(eq(menuItems.id, menuId2));
  });

  describe("Menu Queries", () => {
    beforeAll(async () => {
      // Insertar enlaces de prueba directamente en BD
      await db.insert(menuItems).values([
        {
          id: menuId1,
          label: "Test Link 1",
          href: "/test-1",
          sortOrder: 10,
          isActive: true
        },
        {
          id: menuId2,
          label: "Test Link 2",
          href: "/test-2",
          sortOrder: 20,
          isActive: false // Inactivo
        }
      ]);
    });

    it("should fetch active menu items only, sorted by sortOrder", async () => {
      const activeItems = await getActiveMenuItems();
      
      const test1 = activeItems.find((i) => i.id === menuId1);
      const test2 = activeItems.find((i) => i.id === menuId2);

      expect(test1).toBeDefined();
      expect(test1!.label).toBe("Test Link 1");
      expect(test2).toBeUndefined(); // Inactive item should not be fetched
    });

    it("should fetch all menu items (active and inactive), sorted by sortOrder", async () => {
      const allItems = await getAllMenuItems();
      
      const test1 = allItems.find((i) => i.id === menuId1);
      const test2 = allItems.find((i) => i.id === menuId2);

      expect(test1).toBeDefined();
      expect(test2).toBeDefined();
      expect(test2!.label).toBe("Test Link 2");
      expect(test2!.isActive).toBe(false);
    });
  });

  describe("Menu Server Actions", () => {
    beforeEach(() => {
      // Mock session as ADMIN by default
      vi.mocked(auth).mockResolvedValue({
        user: { id: userId, name: "Admin", email: "admin-menu-test@example.com", type: "ADMIN" },
        expires: ""
      });
    });

    it("should create a new menu item successfully", async () => {
      const formData = new FormData();
      formData.append("label", "New Dynamic Link");
      formData.append("href", "/dynamic-path");
      formData.append("sortOrder", "15");
      formData.append("parentId", "");

      const res = await createMenuItemAction(null, formData);
      expect(res.success).toBe(true);

      const dbItem = await db.query.menuItems.findFirst({
        where: eq(menuItems.label, "New Dynamic Link")
      });
      expect(dbItem).toBeDefined();
      expect(dbItem!.href).toBe("/dynamic-path");
      expect(dbItem!.sortOrder).toBe(15);
      expect(dbItem!.isActive).toBe(true);

      // Clean up
      await db.delete(menuItems).where(eq(menuItems.id, dbItem!.id));
    });

    it("should reject creation with invalid data (Zod validation failure)", async () => {
      const formData = new FormData();
      formData.append("label", "A"); // Too short
      formData.append("href", "");
      formData.append("sortOrder", "invalid-number");

      const res = await createMenuItemAction(null, formData);
      expect(res.error).toBe("Datos no válidos");
      expect(res.validationErrors).toBeDefined();
      expect(res.validationErrors!.label).toBeDefined();
      expect(res.validationErrors!.href).toBeDefined();
    });

    it("should reject creation if not authorized", async () => {
      // Mock standard user session
      vi.mocked(auth).mockResolvedValue({
        user: { id: userId, name: "User", email: "user@example.com", type: "B2C" },
        expires: ""
      });

      const formData = new FormData();
      formData.append("label", "Dynamic Link unauthorized");
      formData.append("href", "/unauth");

      const res = await createMenuItemAction(null, formData);
      expect(res.error).toContain("No autorizado");
    });

    it("should update an existing menu item and block self-parent cycle", async () => {
      // Update item 1 properties
      const formData = new FormData();
      formData.append("label", "Test Link 1 (Updated)");
      formData.append("href", "/test-1-updated");
      formData.append("sortOrder", "12");
      formData.append("parentId", "");

      const res = await updateMenuItemAction(menuId1, null, formData);
      expect(res.success).toBe(true);

      const updated = await db.query.menuItems.findFirst({
        where: eq(menuItems.id, menuId1)
      });
      expect(updated!.label).toBe("Test Link 1 (Updated)");
      expect(updated!.href).toBe("/test-1-updated");
      expect(updated!.sortOrder).toBe(12);

      // Attempting to set parentId to itself
      const selfParentFormData = new FormData();
      selfParentFormData.append("label", "Test Link 1 (Updated)");
      selfParentFormData.append("href", "/test-1-updated");
      selfParentFormData.append("sortOrder", "12");
      selfParentFormData.append("parentId", menuId1); // Self parent

      const errorRes = await updateMenuItemAction(menuId1, null, selfParentFormData);
      expect(errorRes.error).toContain("no puede ser su propio padre");
    });

    it("should toggle menu item active state", async () => {
      // Test Link 2 starts as inactive (false). Toggle active (true).
      const res1 = await toggleMenuItemActiveAction(menuId2, false);
      expect(res1.success).toBe(true);
      expect(res1.isActive).toBe(true);

      let updated = await db.query.menuItems.findFirst({
        where: eq(menuItems.id, menuId2)
      });
      expect(updated!.isActive).toBe(true);

      // Toggle back to inactive (false).
      const res2 = await toggleMenuItemActiveAction(menuId2, true);
      expect(res2.success).toBe(true);
      expect(res2.isActive).toBe(false);

      updated = await db.query.menuItems.findFirst({
        where: eq(menuItems.id, menuId2)
      });
      expect(updated!.isActive).toBe(false);
    });

    it("should delete a menu item", async () => {
      const tempId = crypto.randomUUID();
      await db.insert(menuItems).values({
        id: tempId,
        label: "Temp Link",
        href: "/temp",
        sortOrder: 99
      });

      const res = await deleteMenuItemAction(tempId);
      expect(res.success).toBe(true);

      const found = await db.query.menuItems.findFirst({
        where: eq(menuItems.id, tempId)
      });
      expect(found).toBeUndefined();
    });
  });
});
