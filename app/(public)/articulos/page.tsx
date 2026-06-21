import { Metadata } from "next";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { subfamilies } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import {
  getFamilies,
  getFamilyBySlug,
  getSubfamilyBySlug,
  getArticles,
  getArticlesCount,
  getUniqueBrands,
  getFavoriteIds
} from "@/lib/db/queries/catalog";
import { getCompanyPriceListCode } from "@/lib/db/queries/company";
import ArticulosClient from "./articulos-client";

interface ArticulosPageProps {
  searchParams: Promise<{
    category?: string;
    min?: string;
    max?: string;
    offers?: string;
    brands?: string;
    page?: string;
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ArticulosPageProps): Promise<Metadata> {
  const params = await searchParams;
  let title = "Catálogo de Artículos | Sitio Ferretería";
  let description = "Explora nuestro catálogo completo de artículos de ferretería y construcción con precios y disponibilidad.";

  if (params.category) {
    const subfam = await getSubfamilyBySlug(params.category);
    if (subfam) {
      title = `${subfam.name} | Catálogo de Ferretería`;
      description = `Explora nuestra sección de ${subfam.name} con precios especiales.`;
    } else {
      const fam = await getFamilyBySlug(params.category);
      if (fam) {
        title = `${fam.name} | Catálogo de Ferretería`;
        description = `Explora nuestra sección de ${fam.name} con precios especiales.`;
      }
    }
  }

  return {
    title,
    description
  };
}

export default async function ArticulosPage({ searchParams }: ArticulosPageProps) {
  const resolvedParams = await searchParams;

  const category = resolvedParams.category || "";
  const min = resolvedParams.min ? parseFloat(resolvedParams.min) : undefined;
  const max = resolvedParams.max ? parseFloat(resolvedParams.max) : undefined;
  const onlyOffers = resolvedParams.offers === "true";
  const selectedBrands = resolvedParams.brands ? resolvedParams.brands.split(",") : [];
  const currentPage = parseInt(resolvedParams.page || "1", 10);
  const searchQuery = resolvedParams.q || "";

  const itemsPerPage = 12;
  const offset = (currentPage - 1) * itemsPerPage;

  // 1. Resolver sesión de usuario y tarifa activa
  const session = await auth();
  const user = session?.user as { id?: string; type?: string; status?: string; companyId?: string | null } | undefined;
  const isLoggedIn = !!user;
  const userId = user?.id;

  let priceListCode = "PUBLIC";
  if (user?.type === "B2B" && user.status === "ACTIVE" && user.companyId) {
    priceListCode = await getCompanyPriceListCode(user.companyId);
  }

  // 2. Determinar si category es familia o subfamilia
  let familySlug: string | undefined;
  let subfamilySlug: string | undefined;

  if (category) {
    const subfam = await getSubfamilyBySlug(category);
    if (subfam) {
      subfamilySlug = category;
    } else {
      const fam = await getFamilyBySlug(category);
      if (fam) {
        familySlug = category;
      }
    }
  }

  // 3. Consultas de base de datos
  const articlesList = await getArticles({
    familySlug,
    subfamilySlug,
    searchQuery,
    limit: itemsPerPage,
    offset,
    priceListCode,
    brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    minPrice: min,
    maxPrice: max,
    onlyOffers
  });

  const totalArticles = await getArticlesCount({
    familySlug,
    subfamilySlug,
    searchQuery,
    priceListCode,
    brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    minPrice: min,
    maxPrice: max,
    onlyOffers
  });

  const familiesList = await getFamilies();
  const subfamiliesList = await db
    .select()
    .from(subfamilies)
    .orderBy(asc(subfamilies.sortOrder));

  const uniqueBrands = await getUniqueBrands();
  const favoriteIds = userId ? Array.from(await getFavoriteIds(userId)) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ArticulosClient
        initialArticles={articlesList}
        totalArticles={totalArticles}
        families={familiesList}
        subfamilies={subfamiliesList}
        brands={uniqueBrands}
        favoriteIds={favoriteIds}
        isLoggedIn={isLoggedIn}
        b2bTariffName={priceListCode !== "PUBLIC" ? priceListCode : null}
        searchParams={resolvedParams}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
