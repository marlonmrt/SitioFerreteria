import Link from "next/link";
import { Package } from "lucide-react";

import { getAdminArticles, getAdminArticlesCount } from "@/lib/db/queries/admin";
import { AdminArticlesList } from "@/components/admin/admin-articles-list";
import { Button } from "@/components/ui/button";

interface AdminArticulosPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export const metadata = {
  title: "Gestión de Artículos | Admin",
  description: "Panel de control del catálogo de artículos."
};

export default async function AdminArticulosPage({ searchParams }: AdminArticulosPageProps) {
  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams.search || "";
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const itemsPerPage = 50;
  const offset = (currentPage - 1) * itemsPerPage;

  // Cargar artículos y el total count
  const articlesList = await getAdminArticles({
    search,
    limit: itemsPerPage,
    offset
  });

  const totalArticles = await getAdminArticlesCount(search);
  const totalPages = Math.ceil(totalArticles / itemsPerPage);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Package className="h-7 w-7 text-primary" />
          Catálogo de Artículos
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Lista completa de artículos importados desde el ERP. Puedes ocultar/desactivar artículos de la zona pública.
        </p>
      </div>

      {/* Listado Interactivo */}
      <AdminArticlesList articles={articlesList} initialSearch={search} />

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
              <Link href={`/admin/articulos?page=${currentPage - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
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
              <Link href={`/admin/articulos?page=${currentPage + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}>
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
