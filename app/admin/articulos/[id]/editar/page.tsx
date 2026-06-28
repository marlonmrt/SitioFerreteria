import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { families, subfamilies, articles, articlePrices } from "@/lib/db/schema";
import ArticuloForm from "../../articulo-form";

interface EditarArticuloPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function EditarArticuloPage({ params }: EditarArticuloPageProps) {
  const { id } = await params;

  // Obtener el artículo por id
  const article = await db.query.articles.findFirst({
    where: eq(articles.id, id)
  });

  if (!article) {
    notFound();
  }

  // Obtener los precios asociados en base de datos
  const prices = await db
    .select()
    .from(articlePrices)
    .where(eq(articlePrices.articleId, id));

  const publicPrice = prices.find((p) => p.priceListCode === "PUBLIC")?.price || null;
  const pricePro = prices.find((p) => p.priceListCode === "PRO_01")?.price || null;

  // Obtener familias y subfamilias
  const familiesList = await db.query.families.findMany({
    orderBy: [asc(families.sortOrder)]
  });

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

  const mappedArticle = {
    id: article.id,
    erpCode: article.erpCode,
    name: article.name,
    description: article.description,
    brand: article.brand,
    unit: article.unit,
    subfamilyId: article.subfamilyId,
    mainImage: article.mainImage,
    publicPrice,
    pricePro,
    stock: article.stock,
    offerB2C: article.offerB2C,
    offerB2B: article.offerB2B
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <ArticuloForm
        families={familiesList}
        subfamilies={subfamiliesList}
        existingBrands={existingBrands}
        initialData={mappedArticle}
      />
    </div>
  );
}
