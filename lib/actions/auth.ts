"use server";

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users, companies } from "@/lib/db/schema";
import { signIn } from "@/auth";
import { logger } from "@/lib/logger";

// Acción para registrar clientes particulares (B2C)
export async function registerB2cAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!name || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    // Verificar si el email ya existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.trim().toLowerCase())
    });

    if (existingUser) {
      return { error: "El correo electrónico ya está registrado" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      type: "B2C",
      status: "ACTIVE"
    });

    // Iniciar sesión automáticamente
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false
    });

    logger.info("B2C User registered successfully", { email: email.trim().toLowerCase(), userId });
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al registrar la cuenta";
    logger.error("B2C registration failed", { email, error: errorMsg });
    return { error: errorMsg };
  }
}

// Acción para solicitar registro de empresa (B2B)
export async function registerB2bAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string | null;
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const legalName = formData.get("legalName") as string | null;
  const taxId = formData.get("taxId") as string | null;
  const contactPhone = formData.get("contactPhone") as string | null;

  if (!name || !email || !password || !legalName || !taxId || !contactPhone) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    // Verificar si el email ya existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.trim().toLowerCase())
    });

    if (existingUser) {
      return { error: "El correo electrónico ya está registrado" };
    }

    // Verificar si el CIF/NIF ya existe
    const existingCompany = await db.query.companies.findFirst({
      where: eq(companies.taxId, taxId.trim().toUpperCase())
    });

    if (existingCompany) {
      return { error: "El CIF de la empresa ya está registrado" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const companyId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    await db.transaction(async (tx) => {
      // Crear la empresa en estado PENDING (con una tarifa inicial PENDING que se actualizará al aprobar)
      await tx.insert(companies).values({
        id: companyId,
        legalName: legalName.trim(),
        taxId: taxId.trim().toUpperCase(),
        contactPhone: contactPhone.trim(),
        priceListCode: "PENDING"
      });

      // Crear el usuario asociado en estado PENDING
      await tx.insert(users).values({
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        type: "B2B",
        status: "PENDING",
        companyId
      });
    });

    logger.info("B2B Company registration requested successfully", { email: email.trim().toLowerCase(), userId, companyId, legalName, taxId });
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al procesar la solicitud de registro";
    logger.error("B2B registration failed", { email, error: errorMsg });
    return { error: errorMsg };
  }
}

// Acción para aprobar una empresa B2B
export async function approveB2bAction(
  userId: string,
  priceListCode: string,
  adminId: string
) {
  if (!userId || !priceListCode || !adminId) {
    return { error: "Faltan parámetros requeridos para la aprobación" };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!user) {
      return { error: "El usuario no existe" };
    }

    const companyId = user.companyId;
    if (!companyId) {
      return { error: "El usuario no está asociado a una empresa" };
    }

    await db.transaction(async (tx) => {
      // Aprobar el usuario cambiando su estado a ACTIVE
      await tx
        .update(users)
        .set({ status: "ACTIVE" })
        .where(eq(users.id, userId));

      // Aprobar la empresa asignándole la tarifa y registrando la aprobación
      await tx
        .update(companies)
        .set({
          priceListCode: priceListCode.trim(),
          approvedAt: new Date(),
          approvedByUserId: adminId
        })
        .where(eq(companies.id, companyId));
    });

    logger.info("B2B account approved by admin", { userId, priceListCode, adminId, companyId });
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al aprobar la cuenta comercial";
    logger.error("B2B account approval failed", { userId, priceListCode, adminId, error: errorMsg });
    return { error: errorMsg };
  }
}

// Acción para rechazar una empresa B2B
export async function rejectB2bAction(userId: string) {
  if (!userId) {
    return { error: "Falta el ID del usuario" };
  }

  try {
    await db
      .update(users)
      .set({ status: "REJECTED" })
      .where(eq(users.id, userId));

    logger.info("B2B account rejected", { userId });
    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Error al rechazar la solicitud";
    logger.error("B2B account rejection failed", { userId, error: errorMsg });
    return { error: errorMsg };
  }
}

// Acción para iniciar sesión (Login)
export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirectTo: "/"
    });
    return { success: true };
  } catch (error) {
    // Es CRÍTICO relanzar los errores de redirección de Next.js
    if (
      error instanceof Error &&
      (error.message === "NEXT_REDIRECT" ||
        (error as { digest?: string }).digest === "NEXT_REDIRECT")
    ) {
      logger.info("User login successful", { email: email.trim().toLowerCase() });
      throw error;
    }

    logger.warn("User login failed", { email: email?.trim().toLowerCase(), error: error instanceof Error ? error.message : String(error) });
    
    // Extraer mensaje del proveedor de credenciales si existe
    if (error instanceof Error) {
      // Capturar los errores personalizados lanzados en authorize()
      if (error.message.includes("pendiente de aprobación")) {
        return { error: "Su cuenta de empresa está pendiente de aprobación." };
      }
      if (error.message.includes("rechazada")) {
        return { error: "Su solicitud de registro ha sido rechazada." };
      }
      if (error.message.includes("inactiva")) {
        return { error: "Esta cuenta no está activa." };
      }
    }

    return { error: "Credenciales incorrectas o cuenta no autorizada" };
  }
}
