import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, History, Target, ShieldCheck, HeartHandshake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Conócenos",
  description: "Descubre la historia, misión, visión y valores de nuestra ferretería. Más de 40 años al servicio de profesionales y particulares."
};

const values = [
  {
    icon: ShieldCheck,
    title: "Garantía de Calidad",
    description: "Trabajamos solo con marcas líderes del mercado para asegurar la durabilidad y rendimiento óptimo en cada uno de tus proyectos."
  },
  {
    icon: HeartHandshake,
    title: "Asesoramiento Experto",
    description: "Nuestro equipo técnico cuenta con décadas de experiencia para guiarte en la elección exacta del material y herramientas necesarias."
  },
  {
    icon: Target,
    title: "Sincronización Avanzada",
    description: "Sistemas informáticos de última generación conectados en tiempo real a nuestro ERP para ofrecer tarifas actualizadas y catálogos precisos."
  }
];

export default function ConocenosPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      {/* Hero section */}
      <section className="relative overflow-hidden  border border-border/70 bg-card p-8 sm:p-12 md:p-16 shadow-soft mb-12">
        <div className="absolute inset-0 bg-hero-grid bg-[length:18px_18px] opacity-10" />
        <div className="relative max-w-3xl">
          <Badge className="rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em]">
            Nuestra Trayectoria
          </Badge>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Líderes en distribución de material de ferretería y construcción.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Desde 1985, combinamos el trato cercano del comercio de proximidad con la eficiencia logística y tecnológica de un almacén moderno conectado al ERP.
          </p>
        </div>
      </section>

      {/* History and Mission grid */}
      <div className="grid gap-8 lg:grid-cols-2 mb-16">
        <Card className=" border-border/70 bg-card shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <CardHeader className="p-0">
            <div className="mb-6 flex h-12 w-12 items-center justify-center  bg-primary/10 text-primary">
              <History className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-semibold">Nuestra Historia</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4 flex-1">
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Fundada en Santa Cruz de Tenerife, Sitio Ferretería nació con el propósito de cubrir la creciente demanda de materiales para la construcción y reformas locales. Con los años, expandimos nuestras operaciones abriendo la sucursal del Sur en Adeje y digitalizando nuestro catálogo directamente desde el ERP. Hoy en día, servimos tanto a particulares que buscan mejorar su hogar como a grandes constructoras que necesitan suministros fiables.
            </p>
          </CardContent>
        </Card>

        <Card className=" border-border/70 bg-card shadow-sm p-6 sm:p-8 flex flex-col justify-between">
          <CardHeader className="p-0">
            <div className="mb-6 flex h-12 w-12 items-center justify-center  bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-semibold">Misión y Visión</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-4 flex-1">
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Nuestra misión es facilitar el acceso rápido a información de stock, tarifas competitivas y características técnicas de cada producto de nuestro catálogo. Nos esforzamos por ser el socio de confianza para cada profesional de la construcción y fontanería, garantizando que tengan el material adecuado en el momento justo. Aspiramos a seguir modernizando la experiencia del sector de la ferretería tradicional.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Values section */}
      <section className="mb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Lo que nos define
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Nuestros Valores Fundacionales</h2>
          <p className="mt-3 text-muted-foreground">
            Bajo estos tres pilares construimos relaciones sólidas y duraderas con nuestros clientes B2C y profesionales B2B.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((val) => {
            const Icon = val.icon;
            return (
              <Card key={val.title} className=" border-border/70 bg-card shadow-sm transition-all hover:shadow-soft">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center  bg-primary/5 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold">{val.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{val.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA section */}
      <section className="rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_35%),linear-gradient(135deg,_rgba(229,112,31,0.95),_rgba(163,66,21,0.95))] p-8 sm:p-12 md:p-16 text-white text-center relative overflow-hidden shadow-glow">
        <div className="absolute inset-0 bg-hero-grid bg-[length:18px_18px] opacity-10" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">¿Listo para optimizar tus compras?</h2>
          <p className="mt-4 text-white/90 text-sm sm:text-base leading-relaxed">
            Regístrate hoy mismo como particular o solicita tu cuenta de empresa para acceder a tus tarifas personalizadas directamente desde el ERP.
          </p>
          <div className="mt-8 flex flex-col gap-3 justify-center sm:flex-row">
            <Button asChild size="lg" variant="secondary" className=" px-6 bg-white text-primary hover:bg-white/90">
              <Link href="/registro">
                Cuenta Particular <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" className=" px-6 border border-white/25 bg-transparent hover:bg-white/10 text-white">
              <Link href="/registro-empresa">Solicitar Alta B2B</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
