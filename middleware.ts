import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/admin/:path*",
    "/mi-cuenta/:path*",
    "/mi-cuenta-empresa/:path*"
  ]
};
