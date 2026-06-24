"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ShieldAlert,
  LayoutDashboard,
  UploadCloud,
  Building,
  Mail,
  Package,
  LayoutGrid,
  Menu,
  ImageIcon,
  Palette,
  ChevronDown,
  type LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const adminLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/importaciones", label: "Importaciones ERP", icon: UploadCloud },
  { href: "/admin/empresas", label: "Aprobaciones B2B", icon: Building },
  { href: "/admin/solicitudes", label: "Consultas Clientes", icon: Mail },
  { href: "/admin/articulos", label: "Artículos", icon: Package },
  { href: "/admin/familias", label: "Categorías/Familias", icon: LayoutGrid }
];

const disenoSubLinks: NavLink[] = [
  { href: "/admin/menu", label: "Gestión de Menú", icon: Menu },
  { href: "/admin/diseno/carrusel", label: "Carrusel Principal", icon: ImageIcon }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const isInDiseno = pathname.startsWith("/admin/menu") || pathname.startsWith("/admin/diseno");
  const [disenoOpen, setDisenoOpen] = useState(isInDiseno);

  return (
    <>
      {/* Sidebar (Desktop) */}
      <aside className="hidden w-64 border-r border-border/60 bg-card p-6 lg:block shrink-0">
        <div className="flex flex-col h-full">
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

          <nav className="space-y-1.5 flex-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", pathname === link.href ? "text-primary" : "text-muted-foreground")} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Diseño collapsible */}
            <div>
              <button
                type="button"
                onClick={() => setDisenoOpen(!disenoOpen)}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Palette className="h-4.5 w-4.5 text-muted-foreground" />
                <span className="flex-1 text-left">Diseño</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    disenoOpen && "rotate-180"
                  )}
                />
              </button>
              {disenoOpen && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-border/60 pl-3">
                  {disenoSubLinks.map((sub) => {
                    const SubIcon = sub.icon;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
                          pathname === sub.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <SubIcon className={cn("h-4 w-4", pathname === sub.href ? "text-primary" : "text-muted-foreground")} />
                        <span>{sub.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

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

      {/* Navigation Bar (Mobile) */}
      <header className="lg:hidden border-b border-border/60 bg-card px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldAlert className="h-4 w-4" />
          </span>
          <span className="text-sm font-bold text-foreground">Admin</span>
        </div>

        <div className="flex gap-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
          {disenoSubLinks.map((sub) => {
            const SubIcon = sub.icon;
            return (
              <Link
                key={sub.href}
                href={sub.href}
                title={sub.label}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  pathname === sub.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <SubIcon className="h-4 w-4" />
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
    </>
  );
}