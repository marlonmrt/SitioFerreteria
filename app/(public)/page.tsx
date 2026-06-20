import Link from "next/link";
import {
  ArrowRight,
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFamilies, getStores } from "@/lib/db/queries/catalog";

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
      {/* Hero Section */}
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-soft">
        <div className="grid gap-10 p-6 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em]">
              Catálogo informativo
            </Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Ferretería conectada al ERP, B2C y profesionales.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Consulta artículos, familias, tarifas públicas y acceso profesional validado sin
              carrito ni checkout. El catálogo se actualiza desde los ficheros exportados por el ERP.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-2xl px-6">
                <Link href="/registro">
                  Crear cuenta particular <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-2xl px-6">
                <Link href="/registro-empresa">Solicitar alta B2B</Link>
              </Button>
            </div>
          </div>

          <div className="relative rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_28%),linear-gradient(145deg,_rgba(229,112,31,0.98),_rgba(163,66,21,0.94))] p-6 text-white shadow-glow flex flex-col justify-center min-h-[300px]">
            <div className="absolute inset-0 bg-hero-grid bg-[length:18px_18px] opacity-20" />
            <div className="relative space-y-5">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <h3 className="text-lg font-semibold mb-2">Presupuestos y Disponibilidad</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  ¿Necesitas materiales para una obra o reforma? Utiliza el botón &quot;Solicitar información&quot; en cualquier ficha de artículo para pedir un presupuesto personalizado directamente a tu tienda más cercana.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <Store className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Aviso de Stock</p>
                    <p className="text-xs text-white/80 mt-0.5">
                      Catálogo exclusivamente orientativo. Consulte disponibilidad real en tienda antes de desplazarse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
