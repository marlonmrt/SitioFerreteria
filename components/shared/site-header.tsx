"use client";

import Link from "next/link";
import {
  ChevronDown, Menu, Store, User, Heart, LogOut, LayoutDashboard,
  Phone, MapPin, Bath, Zap, Lightbulb, Wrench, Hammer, Cog, Sprout,
  Fan, Flower2, Tent, Flame, Layers,   ToolCase, Warehouse, Tv,
  CircuitBoard, CookingPot, Dumbbell, Fuel, Droplets, Shield,
  ShoppingBag
} from "lucide-react";
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

function getCategoryIcon(slug: string) {
  const key = slug.toLowerCase();
  if (key.includes("agricult")) return Sprout;
  if (key.includes("ban") || key.includes("bano")) return Bath;
  if (key.includes("camp") || key.includes("gas")) return Tent;
  if (key.includes("electric")) return Zap;
  if (key.includes("ilumin")) return Lightbulb;
  if (key.includes("inform") || key.includes("electron")) return CircuitBoard;
  if (key.includes("maquin")) return Cog;
  if (key.includes("orden")) return Layers;
  if (key.includes("muebl")) return Warehouse;
  if (key.includes("sold")) return Flame;
  if (key.includes("autom")) return Fuel;
  if (key.includes("bricolaj")) return ToolCase;
  if (key.includes("cocin")) return CookingPot;
  if (key.includes("herram") || key.includes("h-electrica")) return ShoppingBag;
  if (key.includes("imagen") || key.includes("sonido")) return Tv;
  if (key.includes("jardin")) return Flower2;
  if (key.includes("hostel")) return CookingPot;
  if (key.includes("ocio") || key.includes("deport")) return Dumbbell;
  if (key.includes("electrodom")) return Fan;
  if (key.includes("repuest")) return Wrench;
  if (key.includes("climat")) return Fan;
  if (key.includes("constru")) return Hammer;
  if (key.includes("fontan") || key.includes("agua")) return Droplets;
  if (key.includes("seguridad") || key.includes("proteccion")) return Shield;
  if (key.includes("limpie")) return Droplets;
  return Layers;
}

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

interface FamilyData {
  id: string;
  name: string;
  slug: string;
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
  families?: FamilyData[];
}

function AccessLinks() {
  return (
    <>
      {accessLinks.map((link) => (
        <NavigationMenuLink key={link.href} asChild>
          <Link
            href={link.href}
            className="block  border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/60"
          >
            <div className="text-sm font-semibold">{link.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
          </Link>
        </NavigationMenuLink>
      ))}
    </>
  );
}

export function SiteHeader({ session, menuItems, families }: SiteHeaderProps) {
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
    <header className="sticky top-0 z-50">
      {/* Top bar — info de contacto y tagline */}
      <div className="hidden sm:block bg-[#0c0c0c] text-white/70 text-[11px] border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-7">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" />
                +34 922 000 000
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Canarias
              </span>
            </div>
            <span>Todo para ferretería, reforma y bricolaje</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Fila superior: logo + nav/actions */}
          <div className="flex items-center gap-3 py-3">
            <Link href="/" className="flex items-center gap-3  px-2 py-1 transition-colors hover:bg-accent/40 shrink-0">
              <span className="flex h-10 w-10 items-center justify-center  bg-primary text-primary-foreground shadow-glow">
                <Store className="h-5 w-5" />
              </span>
              <span className="flex-col leading-tight hidden sm:flex">
                <span className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Ferretería
                </span>
                <span className="text-base font-semibold text-foreground">Sitio Catálogo</span>
              </span>
            </Link>

            {/* Buscador - visible en tablet y desktop en la misma fila */}
            <div className="flex-1 max-w-md mx-2 hidden sm:block">
              <SearchBar />
            </div>

            {/* Navegación y acciones (desktop) */}
            <div className="hidden items-center gap-2 lg:flex ml-auto">
              <NavigationMenu>
                <NavigationMenuList>
                  {parentLinks.map((link) => {
                    const subLinks = normalizedLinks.filter((child) => child.parentId === link.id);
                    if (subLinks.length > 0) {
                      return (
                        <NavigationMenuItem key={link.id}>
                          <NavigationMenuTrigger className="gap-1 ">
                            <span>{link.label}</span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="flex flex-col w-[200px] p-2 gap-1 bg-popover  border border-border/40 shadow-md">
                              <NavigationMenuLink asChild>
                                <Link
                                  href={link.href}
                                  className="block  px-3 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
                                >
                                  Ver todo
                                </Link>
                              </NavigationMenuLink>
                              <div className="h-px bg-border/40 my-1" />
                              {subLinks.map((subLink) => (
                                <NavigationMenuLink key={subLink.id} asChild>
                                  <Link
                                    href={subLink.href}
                                    className="block  px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                        <div className="flex flex-col w-[220px] p-2 gap-1 bg-popover ">
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
                                className="flex items-center gap-2  px-3 py-2 text-sm hover:bg-accent"
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
                                  className="flex items-center gap-2  px-3 py-2 text-sm hover:bg-accent"
                                >
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  Mi Cuenta B2B
                                </Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild>
                                <Link
                                  href="/mi-cuenta-empresa/favoritos"
                                  className="flex items-center gap-2  px-3 py-2 text-sm hover:bg-accent"
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
                                  className="flex items-center gap-2  px-3 py-2 text-sm hover:bg-accent"
                                >
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  Mi Cuenta
                                </Link>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild>
                                <Link
                                  href="/mi-cuenta/favoritos"
                                  className="flex items-center gap-2  px-3 py-2 text-sm hover:bg-accent"
                                >
                                  <Heart className="h-4 w-4 text-muted-foreground" />
                                  Favoritos
                                </Link>
                              </NavigationMenuLink>
                            </>
                          )}
                          <button
                            onClick={async () => {
                              await signOut({ redirect: false });
                              window.location.href = "/";
                            }}
                            className="flex w-full items-center gap-2  px-3 py-2 text-sm text-destructive hover:bg-destructive/10 text-left"
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
                <Button asChild className=" px-5">
                  <Link href="/registro">Crear cuenta</Link>
                </Button>
              )}
            </div>

            {/* Acciones mobile */}
            <div className="flex items-center gap-2 lg:hidden ml-auto">
              <Button asChild variant="secondary" size="icon" className="">
                <Link href="/tiendas" aria-label="Ver tiendas">
                  <Store className="h-4 w-4" />
                </Link>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="">
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
                    {/* Familias en mobile */}
                    {families && families.length > 0 && (
                      <div className="space-y-2">
                        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Categorías
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          {families.map((family) => {
                            const Icon = getCategoryIcon(family.slug);
                            return (
                              <Button
                                key={family.id}
                                asChild
                                variant="ghost"
                                className="justify-start  px-3 py-2 text-sm text-foreground hover:bg-accent/40"
                              >
                                <Link href={`/familias/${family.slug}`} className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-primary shrink-0" />
                                  <span className="truncate">{family.name}</span>
                                </Link>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="space-y-3">
                      {parentLinks.map((link) => {
                        const subLinks = normalizedLinks.filter((child) => child.parentId === link.id);
                        return (
                          <div key={link.id} className="space-y-1">
                            <Button
                              asChild
                              variant="ghost"
                              className="w-full justify-start  px-4 py-4 text-base font-semibold text-foreground hover:bg-accent/40"
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
                                    className="w-full justify-start  px-3 py-2 text-sm text-muted-foreground hover:bg-accent/30"
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
                          <Button asChild variant="ghost" className="w-full justify-start  px-4 py-6 text-base">
                            <Link href="/admin">
                              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                              Panel Admin
                            </Link>
                          </Button>
                        )}
                        {session.user.type === "B2B" && (
                          <>
                            <Button asChild variant="ghost" className="w-full justify-start  px-4 py-6 text-base">
                              <Link href="/mi-cuenta-empresa">
                                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                Mi Cuenta B2B
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start  px-4 py-6 text-base">
                              <Link href="/mi-cuenta-empresa/favoritos">
                                <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                                Favoritos
                              </Link>
                            </Button>
                          </>
                        )}
                        {session.user.type === "B2C" && (
                          <>
                            <Button asChild variant="ghost" className="w-full justify-start  px-4 py-6 text-base">
                              <Link href="/mi-cuenta">
                                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                Mi Cuenta
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full justify-start  px-4 py-6 text-base">
                              <Link href="/mi-cuenta/favoritos">
                                <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
                                Favoritos
                              </Link>
                            </Button>
                          </>
                        )}
                    <Button
                      onClick={async () => {
                        await signOut({ redirect: false });
                        window.location.href = "/";
                      }}
                      variant="ghost"
                      className="w-full justify-start  px-4 py-6 text-base text-destructive hover:bg-destructive/10"
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
                            className="w-full justify-start  px-4 py-6 text-left"
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

          {/* Buscador en fila inferior solo en móvil */}
          <div className="sm:hidden border-t border-border/40 py-2">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Fila de categorías - con scroll horizontal */}
      {families && families.length > 0 && (
        <div className="bg-[#0c0c0c] text-white/90 border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center overflow-x-auto gap-0 h-11 scrollbar-none">
              {families.map((family) => {
                const Icon = getCategoryIcon(family.slug);
                return (
                  <Link
                    key={family.id}
                    href={`/familias/${family.slug}`}
                    className="flex items-center gap-2 px-3.5 h-full border-r border-white/10 shrink-0 hover:bg-white/5 transition-colors text-sm font-medium"
                  >
                    <Icon className="h-4 w-4 text-[#ee9146]" />
                    <span className="whitespace-nowrap">{family.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
