import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

vi.mock("@/auth", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  auth: vi.fn(),
  handlers: {}
}));

import { db } from "../db";
import { users, companies } from "../db/schema";
import { registerB2cAction, registerB2bAction, approveB2bAction } from "./auth";

describe("Auth Server Actions Integration", () => {
  const testB2cEmail = "test-b2c-actions@example.com";
  const testB2bEmail = "test-b2b-actions@example.com";
  const testAdminEmail = "test-admin-actions@example.com";
  const testCIF = "A88888888";

  beforeAll(async () => {
    // Limpieza previa
    await db.delete(users).where(eq(users.email, testB2cEmail));
    await db.delete(users).where(eq(users.email, testAdminEmail));

    const b2bUser = await db.query.users.findFirst({
      where: eq(users.email, testB2bEmail)
    });
    if (b2bUser) {
      await db.delete(users).where(eq(users.id, b2bUser.id));
      if (b2bUser.companyId) {
        await db.delete(companies).where(eq(companies.id, b2bUser.companyId));
      }
    }
    await db.delete(companies).where(eq(companies.taxId, testCIF));
  });

  afterAll(async () => {
    // Limpieza posterior
    await db.delete(users).where(eq(users.email, testB2cEmail));
    await db.delete(users).where(eq(users.email, testAdminEmail));
    const b2bUser = await db.query.users.findFirst({
      where: eq(users.email, testB2bEmail)
    });
    if (b2bUser) {
      await db.delete(users).where(eq(users.id, b2bUser.id));
      if (b2bUser.companyId) {
        await db.delete(companies).where(eq(companies.id, b2bUser.companyId));
      }
    }
    await db.delete(companies).where(eq(companies.taxId, testCIF));
  });

  it("should successfully register a B2C user as ACTIVE", async () => {
    const formData = new FormData();
    formData.append("name", "Test B2C User");
    formData.append("email", testB2cEmail);
    formData.append("password", "password123");

    // registerB2cAction intentará llamar a signIn de NextAuth, que fallará en entorno de test de consola,
    // pero el registro de base de datos se debe completar con éxito antes de eso.
    try {
      await registerB2cAction(null, formData);
    } catch {
      // Ignorar fallos de redirección/NextAuth
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, testB2cEmail)
    });
    expect(dbUser).toBeDefined();
    expect(dbUser!.name).toBe("Test B2C User");
    expect(dbUser!.type).toBe("B2C");
    expect(dbUser!.status).toBe("ACTIVE");
  });

  it("should successfully submit B2B request as PENDING", async () => {
    const formData = new FormData();
    formData.append("name", "Test B2B Agent");
    formData.append("email", testB2bEmail);
    formData.append("password", "password123");
    formData.append("legalName", "Test B2B Corp");
    formData.append("taxId", testCIF);
    formData.append("contactPhone", "+34666666666");

    const result = await registerB2bAction(null, formData);
    expect(result.success).toBe(true);

    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, testB2bEmail)
    });
    expect(dbUser).toBeDefined();
    expect(dbUser!.type).toBe("B2B");
    expect(dbUser!.status).toBe("PENDING");
    expect(dbUser!.companyId).not.toBeNull();

    const dbCompany = await db.query.companies.findFirst({
      where: eq(companies.id, dbUser!.companyId!)
    });
    expect(dbCompany).toBeDefined();
    expect(dbCompany!.legalName).toBe("Test B2B Corp");
    expect(dbCompany!.priceListCode).toBe("PENDING");
    expect(dbCompany!.approvedAt).toBeNull();
  });

  it("should successfully approve B2B request and set ACTIVE", async () => {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, testB2bEmail)
    });
    expect(dbUser).toBeDefined();

    const adminId = crypto.randomUUID();
    // Insertar usuario admin para cumplir con la clave foránea
    await db.insert(users).values({
      id: adminId,
      name: "Test Admin",
      email: testAdminEmail,
      passwordHash: "dummy",
      type: "ADMIN",
      status: "ACTIVE"
    });

    const uniqueTariff = "PRO_" + crypto.randomUUID().substring(0, 8);
    const result = await approveB2bAction(dbUser!.id, uniqueTariff, adminId);
    expect(result.success).toBe(true);

    const updatedUser = await db.query.users.findFirst({
      where: eq(users.email, testB2bEmail)
    });
    expect(updatedUser!.status).toBe("ACTIVE");

    const updatedCompany = await db.query.companies.findFirst({
      where: eq(companies.id, updatedUser!.companyId!)
    });
    expect(updatedCompany!.priceListCode).toBe(uniqueTariff);
    expect(updatedCompany!.approvedAt).not.toBeNull();
    expect(updatedCompany!.approvedByUserId).toBe(adminId);
  });
});
