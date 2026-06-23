import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    newUser: "/registro"
  },
  session: { strategy: "jwt" },
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
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.type = (user as { type?: string }).type;
        token.status = (user as { status?: string }).status;
        token.companyId = (user as { companyId?: string | null }).companyId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as {
          id?: string;
          type?: string;
          status?: string;
          companyId?: string | null;
        };
        sUser.id = token.id as string;
        sUser.type = token.type as string;
        sUser.status = token.status as string;
        sUser.companyId = token.companyId as string | null;
      }
      return session;
    }
  },
  providers: [] // Configurado en auth.ts para no romper la compatibilidad con Edge en el middleware
} satisfies NextAuthConfig;
