import Link from "next/link";
import {
  BadgeCheck,
  Factory,
  ShieldCheck,
  Store,
  Bath,
  Layers,
  Wind,
  Hammer,
  Home as HomeIcon,
  Wrench,
  Clock,
  Phone,
  MapPin
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HeroCarousel from "@/components/shared/hero-carousel";
import { getFamilies, getStores } from "@/lib/db/queries/catalog";

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

function getFamilyIcon(slug: string) {
  switch (slug) {
    case "banos":
      return Bath;
    case "ceramicas":
      return Layers;
    case "climatizacion":
      return Wind;
    case "construccion":
      return Hammer;
    case "hogar-electrodomesticos":
      return HomeIcon;
    case "sellado-fijacion":
      return Wrench;
    default:
      return Layers;
  }
}

const gradientClasses = [
  "from-blue-500 to-indigo-600",
  "from-emerald-400 to-teal-600",
  "from-orange-400 to-red-600",
  "from-pink-500 to-rose-600",
  "from-purple-500 to-violet-600",
  "from-amber-400 to-orange-600"
];

export default async function HomePage() {
  const familiesList = await getFamilies();
  const storesList = await getStores();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Grid de Familias */}
      <section className="mt-16">
        <div className="flex flex-col items-center text-center mb-10">
          <Badge variant="secondary" className="rounded-full px-3 py-1">Nuestros Productos</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Explora por Familias</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base">
            Selecciona una de las familias principales del catálogo para ver todas las subfamilias y artículos disponibles.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {familiesList.map((family, index) => {
            const IconComponent = getFamilyIcon(family.slug);
            const gradient = gradientClasses[index % gradientClasses.length];

            return (
              <Link
                href={`/familias/${family.slug}`}
                key={family.id}
                className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-soft"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {family.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Ver artículos →</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

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
    </div>
  );
}
