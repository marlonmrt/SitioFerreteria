import Link from "next/link";
import { Package } from "lucide-react";

import { getAdminArticles, getAdminArticlesCount } from "@/lib/db/queries/admin";
import { getFamilies, getUniqueBrands } from "@/lib/db/queries/catalog";
import { db } from "@/lib/db";
import { subfamilies } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { AdminArticlesList } from "@/components/admin/admin-articles-list";
import { Button } from "@/components/ui/button";

interface AdminArticulosPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    category?: string;
    brand?: string;
    offer?: string;
  }>;
}

export const metadata = {
  title: "Gestión de Artículos | Admin",
  description: "Panel de control del catálogo de artículos."
};

export default async function AdminArticulosPage({ searchParams }: AdminArticulosPageProps) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search || "";
  const category = resolvedSearchParams.category || "";
  const brand = resolvedSearchParams.brand || "";
  const offer = resolvedSearchParams.offer || "";
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const itemsPerPage = 50;
  const offset = (currentPage - 1) * itemsPerPage;

  // Cargar artículos y el total count con filtros
  const articlesList = await getAdminArticles({
    search,
    limit: itemsPerPage,
    offset,
    category,
    brand,
    offer
  });

  const totalArticles = await getAdminArticlesCount({
    search,
    category,
    brand,
    offer
  });

  const totalPages = Math.ceil(totalArticles / itemsPerPage);

  // Listados para filtros dropdown
  const familiesList = await getFamilies();
  const subfamiliesList = await db
    .select()
    .from(subfamilies)
    .orderBy(asc(subfamilies.sortOrder));
  const uniqueBrands = await getUniqueBrands();

  // Construir params para persistir en paginación
  const filterParamsString = [
    search ? `search=${encodeURIComponent(search)}` : "",
    category ? `category=${encodeURIComponent(category)}` : "",
    brand ? `brand=${encodeURIComponent(brand)}` : "",
    offer ? `offer=${encodeURIComponent(offer)}` : ""
  ]
    .filter(Boolean)
    .join("&");

  const buildPageHref = (page: number) => {
    return `/admin/articulos?page=${page}${filterParamsString ? `&${filterParamsString}` : ""}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Package className="h-7 w-7 text-primary" />
          Catálogo de Artículos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Lista completa de artículos importados desde el ERP. Puedes ocultar/desactivar artículos de la zona pública o gestionar ofertas.
        </p>
      </div>

      {/* Listado Interactivo */}
      <AdminArticlesList
        articles={articlesList}
        initialSearch={search}
        families={familiesList}
        subfamilies={subfamiliesList}
        brands={uniqueBrands}
        initialCategory={category}
        initialBrand={brand}
        initialOffer={offer}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border/50 pt-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={currentPage <= 1}
          >
            {currentPage > 1 ? (
              <Link href={buildPageHref(currentPage - 1)}>
                Anterior
              </Link>
            ) : (
              <span>Anterior</span>
            )}
          </Button>

          <span className="text-xs text-muted-foreground font-medium px-4">
            Pág. {currentPage} de {totalPages}
          </span>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl"
            disabled={currentPage >= totalPages}
          >
            {currentPage < totalPages ? (
              <Link href={buildPageHref(currentPage + 1)}>
                Siguiente
              </Link>
            ) : (
              <span>Siguiente</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
