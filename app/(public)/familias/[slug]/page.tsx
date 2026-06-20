import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Grid2X2, Home, FolderKanban } from "lucide-react";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/catalog/product-card";
import {
  getFamilyBySlug,
  getSubfamiliesByFamilyId,
  getArticles,
  getArticlesCount,
  getFavoriteIds
} from "@/lib/db/queries/catalog";
import { getCompanyPriceListCode } from "@/lib/db/queries/company";

interface FamilyPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ subfamily?: string; page?: string }>;
}

export async function generateMetadata({ params }: FamilyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const family = await getFamilyBySlug(slug);

  if (!family) {
    return {
      title: "Familia no encontrada"
    };
  }

  return {
    title: `${family.name} | Catálogo de Ferretería`,
    description: `Explora nuestra variedad de productos de ${family.name}. Consulte disponibilidad y solicite presupuesto.`
  };
}

export default async function FamilyPage({ params, searchParams }: FamilyPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  const family = await getFamilyBySlug(slug);
  if (!family) {
    notFound();
  }

  const session = await auth();
  const user = session?.user as { id?: string; type?: string; status?: string; companyId?: string | null } | undefined;
  const isLoggedIn = !!user;
  const userId = user?.id;

  // Resolver tarifa B2B
  let priceListCode = "PUBLIC";
  if (user?.type === "B2B" && user.status === "ACTIVE" && user.companyId) {
    priceListCode = await getCompanyPriceListCode(user.companyId);
  }

  // Cargar favoritos del usuario si está logueado
  const favoriteIds = userId ? new Set(await getFavoriteIds(userId)) : new Set<string>();

  // Filtro de subfamilia y paginación
  const activeSubfamilySlug = resolvedSearchParams.subfamily || undefined;
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);
  const itemsPerPage = 12;
  const offset = (currentPage - 1) * itemsPerPage;

  // Cargar subfamilias y artículos
  const subfamiliesList = await getSubfamiliesByFamilyId(family.id);
  const articlesList = await getArticles({
    familySlug: slug,
    subfamilySlug: activeSubfamilySlug,
    limit: itemsPerPage,
    offset,
    priceListCode
  });

  const totalArticles = await getArticlesCount({
    familySlug: slug,
    subfamilySlug: activeSubfamilySlug
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
        <span className="text-foreground font-medium">{family.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {family.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Mostrando {articlesList.length} de {totalArticles} artículos.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        {/* Sidebar Filtros (Subfamilias) */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <FolderKanban className="h-4 w-4 text-primary" />
              Subfamilias
            </h2>
            <div className="flex flex-col gap-1">
              <Link
                href={`/familias/${slug}`}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  !activeSubfamilySlug
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <span>Todas</span>
                <Grid2X2 className="h-3.5 w-3.5" />
              </Link>

              {subfamiliesList.map((sub) => {
                const isActive = activeSubfamilySlug === sub.slug;
                return (
                  <Link
                    key={sub.id}
                    href={`/familias/${slug}?subfamily=${sub.slug}`}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <span className="line-clamp-1">{sub.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Listado de Artículos */}
        <main className="space-y-8">
          {articlesList.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card shadow-sm">
              <FolderKanban className="h-10 w-10 text-muted-foreground/60 stroke-[1.2] mb-3" />
              <h3 className="text-lg font-medium text-foreground">No hay artículos</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                No se encontraron artículos en esta familia o subfamilia actualmente.
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
                  <Link href={`/familias/${slug}?page=${currentPage - 1}${activeSubfamilySlug ? `&subfamily=${activeSubfamilySlug}` : ""}`}>
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
                  <Link href={`/familias/${slug}?page=${currentPage + 1}${activeSubfamilySlug ? `&subfamily=${activeSubfamilySlug}` : ""}`}>
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
    </div>
  );
}
