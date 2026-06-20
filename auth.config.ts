import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/registro"
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isAccountRoute =
        nextUrl.pathname.startsWith("/mi-cuenta") ||
        nextUrl.pathname.startsWith("/mi-cuenta-empresa");

      if (isAdminRoute) {
        // Redirigir si no es admin
        if (!isLoggedIn) return false;
        return (auth.user as { type?: string }).type === "ADMIN";
      }

      if (isAccountRoute) {
        if (!isLoggedIn) return false;
        return true;
      }

      return true;
    }
  },
  providers: [] // Configurado en auth.ts para no romper la compatibilidad con Edge en el middleware
} satisfies NextAuthConfig;
