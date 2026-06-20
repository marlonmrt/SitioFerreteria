import Link from "next/link";
import { ChevronRight, Home, Search } from "lucide-react";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/product-card";
import { getArticles, getArticlesCount, getFavoriteIds } from "@/lib/db/queries/catalog";
import { getCompanyPriceListCode } from "@/lib/db/queries/company";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  return {
    title: `Buscar "${query}" | Catálogo de Ferretería`,
    description: `Resultados de la búsqueda para "${query}". Encuentra disponibilidad, precios y tarifas.`
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const itemsPerPage = 12;
  const offset = (currentPage - 1) * itemsPerPage;

  const session = await auth();
  const user = session?.user as { id?: string; type?: string; status?: string; companyId?: string | null } | undefined;
  const isLoggedIn = !!user;
  const userId = user?.id;

  // Resolver tarifa B2B
  let priceListCode = "PUBLIC";
  if (user?.type === "B2B" && user.status === "ACTIVE" && user.companyId) {
    priceListCode = await getCompanyPriceListCode(user.companyId);
  }

  // Cargar favoritos
  const favoriteIds = userId ? new Set(await getFavoriteIds(userId)) : new Set<string>();

  // Consultar artículos coincidentes
  const articlesList = await getArticles({
    searchQuery: query,
    limit: itemsPerPage,
    offset,
    priceListCode
  });

  const totalArticles = await getArticlesCount({
    searchQuery: query
  });

  const totalPages = Math.ceil(totalArticles / itemsPerPage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-3 w-3" />
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Búsqueda</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <Search className="h-7 w-7 text-primary" />
            Resultados para &quot;{query}&quot;
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Se encontraron {totalArticles} coincidencias en el catálogo.
          </p>
        </div>
      </div>

      {/* Grid de Artículos */}
      <main className="space-y-8">
        {articlesList.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {articlesList.map((article) => (
              <ProductCard
                key={article.id}
                article={article}
                isLoggedIn={isLoggedIn}
                initialIsFavorited={favoriteIds.has(article.id)}
                b2bTariffName={priceListCode !== "PUBLIC" ? priceListCode : null}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 p-16 text-center bg-card shadow-sm">
            <Search className="h-12 w-12 text-muted-foreground/60 stroke-[1.2] mb-3" />
            <h3 className="text-lg font-medium text-foreground">Sin resultados</h3>
            <p className="text-muted-foreground text-sm mt-1.5 max-w-sm">
              No hemos encontrado artículos que coincidan con tu búsqueda. Prueba con términos más generales.
            </p>
          </div>
        )}

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
                <Link href={`/buscar?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}>
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
                <Link href={`/buscar?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}>
                  Siguiente
                </Link>
              ) : (
                <span>Siguiente</span>
              )}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
