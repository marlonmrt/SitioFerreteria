import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { authConfig } from "./auth.config";



export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        const user = await db.query.users.findFirst({
          where: eq(users.email, email)
        });

        if (!user) return null;

        // Validar contraseña
        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) return null;

        // Validar estado según el tipo de usuario
        if (user.type === "B2B" && user.status === "PENDING") {
          throw new Error("Su cuenta de empresa está pendiente de aprobación.");
        }
        if (user.status === "REJECTED") {
          throw new Error("Su solicitud de registro ha sido rechazada.");
        }
        if (user.status !== "ACTIVE") {
          throw new Error("Esta cuenta no está activa.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          status: user.status,
          companyId: user.companyId
        };
      }
    })
  ],

});
