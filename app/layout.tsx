import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";

import { auth } from "@/auth";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { Toaster } from "@/components/ui/sonner";
import { getActiveMenuItems } from "@/lib/db/queries/menu";
import { getFamilies } from "@/lib/db/queries/catalog";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: {
    default: "Sitio Ferretería",
    template: "%s | Sitio Ferretería"
  },
  description: "Catálogo informativo sincronizado con el ERP para clientes B2C y B2B."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  const menuItems = await getActiveMenuItems();
  const familiesList = await getFamilies();

  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} min-h-screen font-sans`}>
        <div className="flex min-h-screen flex-col">
          <SiteHeader session={session} menuItems={menuItems} families={familiesList} />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
