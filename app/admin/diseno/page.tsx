import Link from "next/link";
import { Palette, Menu, ImageIcon, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Diseño"
};

const sections = [
  {
    href: "/admin/menu",
    icon: Menu,
    title: "Gestión de Menú",
    description: "Configura los enlaces del menú de navegación principal del sitio."
  },
  {
    href: "/admin/diseno/carrusel",
    icon: ImageIcon,
    title: "Carrusel Principal",
    description: "Administra las diapositivas del carrusel de la página de inicio."
  }
];

export default function DisenoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center  bg-primary/10 text-primary">
          <Palette className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Diseño</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personaliza la apariencia y la navegación del sitio web.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Button
              key={s.href}
              asChild
              variant="outline"
              className="justify-start h-auto p-5 "
            >
              <Link href={s.href}>
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center  bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="text-left">
                    <div className="font-semibold text-foreground">{s.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{s.description}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1.5 ml-auto" />
                </div>
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}