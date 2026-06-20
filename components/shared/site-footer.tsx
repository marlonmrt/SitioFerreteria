import Link from "next/link";
import { MapPin, Phone, Clock3, Mail } from "lucide-react";

import { Separator } from "@/components/ui/separator";

const stores = [
  {
    name: "Tienda Central",
    address: "C/ Principal 123, Santa Cruz",
    phone: "+34 922 000 000",
    hours: "L-V 08:00-19:00 | S 09:00-13:00"
  },
  {
    name: "Sucursal Sur",
    address: "Av. Comercio 45, Adeje",
    phone: "+34 922 111 111",
    hours: "L-V 08:30-18:30 | S 09:00-13:00"
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            Sitio Ferretería
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold text-balance">
            Catálogo informativo sincronizado con el ERP para clientes particulares y empresas.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Este portal muestra disponibilidad orientativa, tarifas públicas y acceso B2B validado
            manualmente por administración. No procesa compras online.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {stores.map((store) => (
              <article key={store.name} className="rounded-3xl border border-border/70 bg-background p-5 shadow-sm">
                <h3 className="text-base font-semibold">{store.name}</h3>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{store.address}</span>
                  </li>
                  <li className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{store.phone}</span>
                  </li>
                  <li className="flex gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{store.hours}</span>
                  </li>
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-background p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Contacto</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            ¿Necesitas una ficha, tarifa B2B o confirmar stock en tienda? Escríbenos o llámanos.
          </p>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <Link href="mailto:info@ferreteria.local" className="transition-colors hover:text-primary">
                info@ferreteria.local
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <Link href="tel:+34922000000" className="transition-colors hover:text-primary">
                +34 922 000 000
              </Link>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Link href="/conocenos" className="transition-colors hover:text-foreground">
              Conócenos
            </Link>
            <Link href="/tiendas" className="transition-colors hover:text-foreground">
              Tiendas
            </Link>
            <Link href="/faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
            <Link href="/contacto" className="transition-colors hover:text-foreground">
              Contacto
            </Link>
            <Link href="/" className="transition-colors hover:text-foreground">
              Aviso legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
