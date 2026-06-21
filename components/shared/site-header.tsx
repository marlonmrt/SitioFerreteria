"use client";

import Link from "next/link";
import { ChevronDown, Menu, Store, User, Heart, LogOut, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SearchBar } from "@/components/catalog/search-bar";

const accessLinks = [
  {
    href: "/login",
    title: "Soy particular",
    description: "Accede a favoritos, alertas y solicitudes."
  },
  {
    href: "/registro-empresa",
    title: "Soy empresa",
    description: "Solicita alta B2B y condiciones especiales."
  }
];

const mainLinks = [
  { href: "/", label: "Inicio" },
  { href: "/tiendas", label: "Tiendas" },
  { href: "/faq", label: "FAQ" }
];

interface MenuItemData {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface SiteHeaderProps {
  session?: {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      type?: string;
      status?: string;
      companyId?: string | null;
    };
  } | null;
  menuItems?: MenuItemData[];
}

function AccessLinks() {
  return (
    <>
      {accessLinks.map((link) => (
        <NavigationMenuLink key={link.href} asChild>
          <Link
            href={link.href}
            className="block rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/60"
          >
            <div className="text-sm font-semibold">{link.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
          </Link>
        </NavigationMenuLink>
      ))}
    </>
  );
}

export function SiteHeader({ session, menuItems }: SiteHeaderProps) {
  const normalizedLinks = (menuItems && menuItems.length > 0)
    ? menuItems
    : mainLinks.map((l) => ({
        id: l.href,
        label: l.label,
        href: l.href,
        parentId: null,
        sortOrder: 0,
        isActive: true
      }));

  const parentLinks = normalizedLinks.filter((link) => !link.parentId);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-2xl px-2 py-1 transition-colors hover:bg-accent/40">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Store className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Ferretería
            </span>
            <span className="text-base font-semibold text-foreground">Sitio Catálogo</span>
          </span>
        </Link>

        {/* Buscador inteligente en desktop */}
        <div className="hidden flex-1 max-w-md lg:block mx-4">
          <SearchBar />
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {parentLinks.map((link) => {
                const subLinks = normalizedLinks.filter((child) => child.parentId === link.id);
                if (subLinks.length > 0) {
                  return (
                    <NavigationMenuItem key={link.id}>
                      <NavigationMenuTrigger className="gap-1 rounded-xl">
                        <span>{link.label}</span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="flex flex-col w-[200px] p-2 gap-1 bg-popover rounded-xl border border-border/40 shadow-md">
                          <NavigationMenuLink asChild>
                            <Link
                              href={link.href}
                              className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
                            >
                              Ver todo
                            </Link>
                          </NavigationMenuLink>
                          <div className="h-px bg-border/40 my-1" />
                          {subLinks.map((subLink) => (
                            <NavigationMenuLink key={subLink.id} asChild>
                              <Link
                                href={subLink.href}
                                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              >
                                {subLink.label}
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                }

                return (
                  <NavigationMenuItem key={link.id}>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                      <Link href={link.href}>{link.label}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}

              {session?.user ? (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span className="font-medium text-primary">Hola, {session.user.name}</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="flex flex-col w-[220px] p-2 gap-1 bg-popover rounded-xl">
                      <span className="px-3 py-1.5 text-xs text-muted-foreground border-b border-border mb-1">
                        {session.user.type === "ADMIN"
                          ? "Administrador"
                          : session.user.type === "B2B"
                            ? "Profesional B2B"
                            : "Particular B2C"}
                      </span>
                      {session.user.type === "ADMIN" && (
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                          >
                            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                            Panel Admin
                          </Link>
                        </NavigationMenuLink>
                      )}
                      {session.user.type === "B2B" && (
                        <>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/mi-cuenta-empresa"
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              Mi Cuenta B2B
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/mi-cuenta-empresa/favoritos"
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            >
                              <Heart className="h-4 w-4 text-muted-foreground" />
                              Favoritos
                            </Link>
                          </NavigationMenuLink>
                        </>
                      )}
                      {session.user.type === "B2C" && (
                        <>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/mi-cuenta"
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            >
                              <User className="h-4 w-4 text-muted-foreground" />
                              Mi Cuenta
                            </Link>
                          </NavigationMenuLink>
                          <NavigationMenuLink asChild>
                            <Link
                              href="/mi-cuenta/favoritos"
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
                            >
                              <Heart className="h-4 w-4 text-muted-foreground" />
                              Favoritos
                            </Link>
                          </NavigationMenuLink>
                        </>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <span>Acceder</span>
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[340px] gap-2 p-3 md:w-[420px] md:grid-cols-2">
                      <AccessLinks />
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {!session?.user && (
            <Button asChild className="rounded-2xl px-5">
              <Link href="/registro">Crear cuenta</Link>
            </Button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <Button asChild variant="secondary" size="icon" className="rounded-2xl">
            <Link href="/tiendas" aria-label="Ver tiendas">
              <Store className="h-4 w-4" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-2xl">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetHeader className="text-left">
                <SheetTitle>Sitio Ferretería</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Buscador en mobile */}
                <div>
                  <SearchBar />
                </div>
                <div className="space-y-3">
                  {parentLinks.map((link) => {
                    const subLinks = normalizedLinks.filter((child) => child.parentId === link.id);
                    return (
                      <div key={link.id} className="space-y-1">
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full justify-start rounded-2xl px-4 py-4 text-base font-semibold text-foreground hover:bg-accent/40"
                        >
                          <Link href={link.href}>{link.label}</Link>
                        </Button>
                        {subLinks.length > 0 && (
                          <div className="pl-6 space-y-1 border-l border-border/60 ml-4">
                            {subLinks.map((subLink) => (
                              <Button
                                key={subLink.id}
                                asChild
                                variant="ghost"
                                className="w-full justify-start rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent/30"
                              >
                                <Link href={subLink.href}>{subLink.label}</Link>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {session?.user ? (
                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Hola, {session.user.name}
                    </p>
                    {session.user.type === "ADMIN" && (
                      <Button asChild variant="ghost" className="w-full justify-start rounded-2xl px-4 py-6 text-base">
                        <Link href="/admin">
                          <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                          Panel Admin
                        </Link>
                      </Button>
                    )}
                    {session.user.type === "B2B" && (
                      <>
                        <Button asChild variant="ghost" className="w-full justify-start rounded-2xl px-4 py-6 text-base">
                          <Link href="/mi-cuenta-empresa">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            Mi Cuenta B2B
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start rounded-2xl px-4 py-6 text-base">
                          <Link href="/mi-cuenta-empresa/favoritos">
                            <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                            Favoritos
                          </Link>
                        </Button>
                      </>
                    )}
                    {session.user.type === "B2C" && (
                      <>
                        <Button asChild variant="ghost" className="w-full justify-start rounded-2xl px-4 py-6 text-base">
                          <Link href="/mi-cuenta">
                            <User className="mr-2 h-4 w-4 text-muted-foreground" />
                            Mi Cuenta
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full justify-start rounded-2xl px-4 py-6 text-base">
                          <Link href="/mi-cuenta/favoritos">
                            <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                            Favoritos
                          </Link>
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      variant="ghost"
                      className="w-full justify-start rounded-2xl px-4 py-6 text-base text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4 text-destructive" />
                      Cerrar sesión
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {accessLinks.map((link) => (
                      <Button
                        key={link.href}
                        asChild
                        variant="secondary"
                        className="w-full justify-start rounded-2xl px-4 py-6 text-left"
                      >
                        <Link href={link.href}>
                          <span className="flex flex-col items-start gap-1">
                            <span className="font-semibold">{link.title}</span>
                            <span className="text-sm text-muted-foreground">{link.description}</span>
                          </span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
