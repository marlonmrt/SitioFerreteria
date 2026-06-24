import { getAllCarouselSlides } from "@/lib/db/queries/catalog";
import CarruselClient from "./carrusel-client";

export const metadata = {
  title: "Carrusel Principal"
};

export default async function CarruselPage() {
  let slides: Awaited<ReturnType<typeof getAllCarouselSlides>> = [];
  try {
    slides = await getAllCarouselSlides();
  } catch {
    // Tabla aún no existe (migración no aplicada en este entorno)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Carrusel Principal
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra las diapositivas del carrusel que se muestra en la página de inicio.
        </p>
      </div>

      <CarruselClient initialSlides={slides} />
    </div>
  );
}