import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  UploadCloud,
  Mail,
  Package,
  ArrowLeft,
  ShieldAlert,
  LayoutGrid,
  Menu
} from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/importaciones", label: "Importaciones ERP", icon: UploadCloud },
  { href: "/admin/empresas", label: "Aprobaciones B2B", icon: Building },
  { href: "/admin/solicitudes", label: "Consultas Clientes", icon: Mail },
  { href: "/admin/articulos", label: "Artículos", icon: Package },
  { href: "/admin/familias", label: "Categorías/Familias", icon: LayoutGrid },
  { href: "/admin/menu", label: "Menú de Navegación", icon: Menu }
];

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user as { id?: string; type?: string } | undefined;

  // Verificación adicional de rol en el layout para mayor robustez
  if (!user || user.type !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 border-r border-border/60 bg-card p-6 lg:block shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="flex items-center gap-2 mb-8 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldAlert className="h-4.5 w-4.5" />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-none">
                Panel
              </span>
              <span className="text-sm font-bold text-foreground mt-0.5">Administración</span>
            </div>
          </div>

          {/* Menú de enlaces */}
          <nav className="space-y-1.5 flex-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Botón Salir a Tienda */}
          <div className="border-t border-border/50 pt-4">
            <Button asChild variant="outline" className="w-full rounded-xl justify-start px-3.5 text-xs">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la tienda
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation Bar (Mobile Header) */}
        <header className="lg:hidden border-b border-border/60 bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold text-foreground">Admin</span>
          </div>

          <div className="flex gap-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
            <Link
              href="/"
              title="Volver a la tienda"
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
