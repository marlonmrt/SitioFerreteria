import Link from "next/link";
import {
  BadgeCheck,
  Factory,
  ShieldCheck,
  Store,
  Bath,
  Layers,
  Hammer,
  Wrench,
  Clock,
  Phone,
  MapPin,
  ArrowRight,
  Sprout,
  Zap,
  Lightbulb,
  Cog,
  Flower2,
  Tent,
  Flame,
  ToolCase,
  CookingPot,
  Fan,
  Tv,
  CircuitBoard,
  Dumbbell,
  Fuel,
  Droplets,
  Shield,
  ShoppingBag,
  Warehouse
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import HeroCarousel from "@/components/shared/hero-carousel";
import BrandCarousel from "@/components/shared/brand-carousel";
import { ProductCard } from "@/components/catalog/product-card";
import { getFamilies, getStores, getUniqueBrands, getArticles } from "@/lib/db/queries/catalog";
import { getFavoriteIds } from "@/lib/db/queries/catalog";
import { auth } from "@/auth";

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

const heroSlides = [
  {
    gradient: "bg-gradient-to-br from-[#1e3a5f] via-[#2a5a8a] to-[#3a7abd]",
    title: "Ferretería conectada al ERP",
    subtitle: "Consulta artículos, familias, tarifas públicas y acceso profesional validado sin carrito ni checkout. El catálogo se actualiza desde los ficheros exportados por el ERP.",
    cta: { label: "Crear cuenta particular", href: "/registro" }
  },
  {
    gradient: "bg-gradient-to-br from-[#5c2d0a] via-[#8b4513] to-[#c07030]",
    title: "Tarifas especiales para profesionales",
    subtitle: "Solicita tu alta B2B y accede a precios exclusivos con tu tarifa personalizada. Aprobación manual por nuestro equipo comercial.",
    cta: { label: "Solicitar alta B2B", href: "/registro-empresa" }
  },
  {
    gradient: "bg-gradient-to-br from-[#0d3b2e] via-[#1a6b4a] to-[#28a06b]",
    title: "Materiales para obra y reforma",
    subtitle: "Explora nuestro catálogo completo de materiales de construcción, fontanería, electricidad y más. Solicita información y presupuesto sin compromiso.",
    cta: { label: "Ver catálogo", href: "/articulos" }
  }
];

const highlights = [
  {
    icon: Factory,
    title: "Origen ERP",
    description: "Los artículos se sincronizan desde exportaciones CSV/XLSX del sistema de gestión."
  },
  {
    icon: ShieldCheck,
    title: "Acceso B2B",
    description: "Las empresas ven su tarifa aprobada manualmente y su referencia interna."
  },
  {
    icon: BadgeCheck,
    title: "Catálogo público",
    description: "Cualquier visitante puede consultar familias, fichas y precio orientativo."
  }
];

const categoryImages: Record<string, string> = {
  banos: "/images/categories/banos.jpg",
  ceramicas: "/images/categories/ceramicas.jpg",
  climatizacion: "/images/categories/climatizacion.jpg",
  construccion: "/images/categories/construccion.jpg",
  "hogar-electrodomesticos": "/images/categories/hogar.jpg",
  "sellado-fijacion": "/images/categories/sellado.jpg",
};

const categoryGradients = [
  "from-blue-600 to-indigo-700",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-red-600",
  "from-pink-500 to-rose-700",
  "from-purple-500 to-violet-700",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-lime-500 to-green-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-indigo-600",
  "from-teal-500 to-emerald-600",
  "from-red-500 to-rose-600",
  "from-violet-500 to-purple-600",
  "from-yellow-500 to-amber-600",
  "from-fuchsia-500 to-pink-700",
  "from-green-500 to-emerald-700"
];

export default async function HomePage() {
  const familiesList = await getFamilies();
  const storesList = await getStores();
  const brands = await getUniqueBrands();
  const session = await auth();
  const user = session?.user as { id?: string; type?: string } | undefined;
  const userId = user?.id;

  const featuredArticles = await getArticles({ limit: 8 });
  const favoriteIds = userId ? new Set(await getFavoriteIds(userId)) : new Set<string>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Rectángulos de Categorías - versión visual */}
      <section className="mt-20">
        <div className="flex flex-col items-center text-center mb-10">
          <Badge variant="secondary" className="rounded-full px-3 py-1">Categorías</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Compra por Categorías</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base">
            Explora nuestras familias de productos y encuentra todo lo que necesitas.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {familiesList.slice(0, 12).map((family, index) => {
            const Icon = getCategoryIcon(family.slug);
            const gradient = categoryGradients[index % categoryGradients.length];
            const bgImage = categoryImages[family.slug];
            return (
              <Link
                href={`/familias/${family.slug}`}
                key={family.id}
                className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                {bgImage ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                  />
                ) : null}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-85 group-hover:opacity-90 transition-opacity`} />
                <div className="relative p-6 flex flex-col min-h-[160px] justify-end">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{family.name}</h3>
                  <p className="text-sm text-white/70 mt-1 flex items-center gap-1">
                    Explorar
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {familiesList.length > 12 && (
          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="rounded-2xl">
              <Link href="/articulos">
                Ver todas las categorías
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* Productos Destacados */}
      {featuredArticles.length > 0 && (
        <section className="mt-20">
          <div className="flex flex-col items-center text-center mb-10">
            <Badge variant="secondary" className="rounded-full px-3 py-1">Catálogo</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Productos Destacados</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base">
              Una selección de artículos disponibles en nuestro catálogo.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredArticles.map((article) => (
              <ProductCard
                key={article.id}
                article={article}
                isLoggedIn={!!userId}
                initialIsFavorited={favoriteIds.has(article.id)}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild className="rounded-2xl px-8">
              <Link href="/articulos">
                Ver catálogo completo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      {/* Nuestras Marcas - Carrusel */}
      {brands.length > 0 && (
        <section className="mt-20">
          <BrandCarousel brands={brands} />
        </section>
      )}

      {/* Grid de Tiendas */}
      <section className="mt-20">
        <div className="flex flex-col items-center text-center mb-10">
          <Badge variant="secondary" className="rounded-full px-3 py-1">Red de Tiendas</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Nuestras Tiendas Físicas</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base">
            Ven a visitarnos. Encuentra asesoramiento técnico y consulta la disponibilidad física de los materiales.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {storesList.map((store) => (
            <Card key={store.id} className="rounded-3xl border-border/70 shadow-sm overflow-hidden bg-card">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  {store.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{store.address}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                  <a href={`tel:${store.phone}`} className="text-foreground hover:underline">
                    {store.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="h-4.5 w-4.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground whitespace-pre-line">{store.openingHours}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Características del Sistema */}
      <section className="mt-20 border-t border-border/60 pt-16 grid gap-6 lg:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="rounded-3xl border-border/70 shadow-sm bg-card">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="text-base leading-7 mt-1">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      {/* CTA Newsletter / Profesional */}
      <section className="mt-20 rounded-3xl bg-[#0c0c0c] border border-white/10 p-8 sm:p-12 shadow-soft">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <Badge variant="secondary" className="rounded-full px-3 py-1 bg-white/10 text-white hover:bg-white/15 border-0">
              Profesionales
            </Badge>
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              ¿Eres profesional del sector?
            </h2>
            <p className="mt-3 text-white/70 text-sm sm:text-base leading-7">
                Solicita tu cuenta B2B y accede a tarifas especiales, precios personalizados y
                atención preferente. Nuestro equipo comercial validará tu solicitud.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button asChild size="lg" className="rounded-2xl px-8 bg-primary hover:bg-primary/90 text-white">
              <Link href="/registro-empresa">
                Solicitar alta B2B
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl px-8 border-white/20 text-white hover:bg-white/10 hover:text-white">
              <Link href="/contacto">
                Contactar
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
