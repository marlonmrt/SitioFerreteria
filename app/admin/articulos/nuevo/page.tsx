import { asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { families, subfamilies, articles } from "@/lib/db/schema";
import ArticuloForm from "../articulo-form";

export const revalidate = 0;

export default async function NuevoArticuloPage() {
  // Obtener familias ordenadas
  const familiesList = await db.query.families.findMany({
    orderBy: [asc(families.sortOrder)]
  });

  // Obtener subfamilias ordenadas
  const subfamiliesList = await db.query.subfamilies.findMany({
    orderBy: [asc(subfamilies.sortOrder)]
  });

  // Obtener listado de marcas existentes para autocomplete
  const rawBrands = await db
    .select({ brand: articles.brand })
    .from(articles);
  
  const existingBrands = Array.from(
    new Set(rawBrands.map((r) => r.brand).filter((b): b is string => !!b))
  ).sort();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <ArticuloForm
        families={familiesList}
        subfamilies={subfamiliesList}
        existingBrands={existingBrands}
      />
    </div>
  );
}
