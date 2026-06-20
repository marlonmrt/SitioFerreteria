
import { getStores } from "@/lib/db/queries/catalog";
import TiendasClient from "./tiendas-client";

export const metadata = {
  title: "Nuestras Tiendas",
  description: "Encuentra tu tienda física de Sitio Ferretería más cercana. Direcciones, teléfonos, horarios de apertura y mapa de ubicación."
};

export default async function TiendasPage() {
  const storesList = await getStores();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <TiendasClient initialStores={storesList} />
    </div>
  );
}
