"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Tag,
  Home,
  SlidersHorizontal,
  X,
  ChevronLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/catalog/product-card";

type FamilyData = {
  id: string;
  name: string;
  slug: string;
};

type SubfamilyData = {
  id: string;
  familyId: string;
  name: string;
  slug: string;
};

type ArticleData = {
  id: string;
  erpCode: string;
  name: string;
  slug: string;
  brand: string | null;
  unit: string;
  mainImage: string | null;
  publicPrice: string | null;
  publicCurrency: string | null;
  b2bPrice?: string | null;
  b2bCurrency?: string | null;
};

interface ArticulosClientProps {
  initialArticles: ArticleData[];
  totalArticles: number;
  families: FamilyData[];
  subfamilies: SubfamilyData[];
  brands: string[];
  favoriteIds: string[];
  isLoggedIn: boolean;
  b2bTariffName: string | null;
  searchParams: {
    category?: string;
    min?: string;
    max?: string;
    offers?: string;
    brands?: string;
    page?: string;
    q?: string;
  };
  itemsPerPage: number;
}

export default function ArticulosClient({
  initialArticles,
  totalArticles,
  families,
  subfamilies,
  brands,
  favoriteIds,
  isLoggedIn,
  b2bTariffName,
  searchParams,
  itemsPerPage
}: ArticulosClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Acordeón de categorías (familias)
  const [expandedFamilies, setExpandedFamilies] = useState<Record<string, boolean>>({});

  // Inputs controlados para precios
  const [minInput, setMinInput] = useState(searchParams.min || "");
  const [maxInput, setMaxInput] = useState(searchParams.max || "");

  // Favoritos
  const favoritesSet = new Set(favoriteIds);

  // Sincronizar inputs de precio cuando cambian en la URL (ej. si se limpian los filtros)
  useEffect(() => {
    setMinInput(searchParams.min || "");
    setMaxInput(searchParams.max || "");
  }, [searchParams.min, searchParams.max]);

  // Auto-expandir la familia correspondiente si hay una subfamilia seleccionada
  useEffect(() => {
    if (searchParams.category) {
      const selectedSub = subfamilies.find((sf) => sf.slug === searchParams.category);
      if (selectedSub) {
        setExpandedFamilies((prev) => ({
          ...prev,
          [selectedSub.familyId]: true
        }));
      }
    }
  }, [searchParams.category, subfamilies]);

  // Actualizar los parámetros de búsqueda en la URL
  const updateQueryParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);

    // Al modificar cualquier filtro reiniciamos a la página 1
    params.set("page", "1");

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/articulos?${params.toString()}`);
    });
  };

  // Toggle de expansión de familias en el menú lateral
  const toggleFamilyExpand = (familyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedFamilies((prev) => ({
      ...prev,
      [familyId]: !prev[familyId]
    }));
  };

  // Manejador de selección de marca (multi-select)
  const handleBrandChange = (brand: string, checked: boolean) => {
    let currentBrands = searchParams.brands ? searchParams.brands.split(",") : [];
    if (checked) {
      if (!currentBrands.includes(brand)) currentBrands.push(brand);
    } else {
      currentBrands = currentBrands.filter((b) => b !== brand);
    }
    updateQueryParams({ brands: currentBrands.length > 0 ? currentBrands.join(",") : null });
  };

  // Aplicar filtro de precios (por evento submit)
  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({
      min: minInput || null,
      max: maxInput || null
    });
  };

  // Limpiar todos los filtros activos
  const handleClearAllFilters = () => {
    setMinInput("");
    setMaxInput("");
    startTransition(() => {
      router.push("/articulos");
    });
  };

  // Determinar datos de categoría seleccionada
  let activeCategoryName = "";
  if (searchParams.category) {
    const sub = subfamilies.find((sf) => sf.slug === searchParams.category);
    if (sub) {
      activeCategoryName = sub.name;
    } else {
      const fam = families.find((f) => f.slug === searchParams.category);
      if (fam) {
        activeCategoryName = fam.name;
      }
    }
  }

  // Paginación
  const currentPage = parseInt(searchParams.page || "1", 10);
  const totalPages = Math.ceil(totalArticles / itemsPerPage);

  const handlePageChange = (page: number) => {
    updateQueryParams({ page: page.toString() });
  };

  const selectedBrandsList = searchParams.brands ? searchParams.brands.split(",") : [];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-3 w-3" />
          Inicio
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Artículos</span>
      </nav>

      {/* Título Principal */}
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Catálogo General de Productos
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Explora todas nuestras categorías y encuentra los artículos indicados con tus tarifas de cliente.
        </p>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        
        {/* === SIDEBAR (MENÚ DE CATEGORÍAS Y FILTROS) === */}
        <aside className="space-y-6 lg:col-span-1">
          {/* Menú Lateral de Categorías */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
            <h2 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
              <Folder className="h-4.5 w-4.5 text-primary" />
              Categorías
            </h2>
            <div className="space-y-1.5">
              {families.map((fam) => {
                const famSubfamilies = subfamilies.filter((sf) => sf.familyId === fam.id);
                const isExpanded = !!expandedFamilies[fam.id];
                const isSelected = searchParams.category === fam.slug;

                return (
                  <div key={fam.id} className="space-y-1">
                    <div
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-primary/15 text-primary"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Link
                        href={`/articulos?category=${fam.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          updateQueryParams({ category: fam.slug });
                        }}
                        className="flex-1 text-left"
                      >
                        {fam.name}
                      </Link>
                      {famSubfamilies.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => toggleFamilyExpand(fam.id, e)}
                          className="p-1 rounded-lg hover:bg-muted-foreground/10 transition-colors ml-1"
                          aria-label={isExpanded ? "Contraer" : "Expandir"}
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Subfamilias Anidadas */}
                    {isExpanded && famSubfamilies.length > 0 && (
                      <div className="pl-4 space-y-1 border-l border-border/60 ml-3.5 mt-1">
                        {famSubfamilies.map((sub) => {
                          const isSubSelected = searchParams.category === sub.slug;
                          return (
                            <Link
                              key={sub.id}
                              href={`/articulos?category=${sub.slug}`}
                              onClick={(e) => {
                                e.preventDefault();
                                updateQueryParams({ category: sub.slug });
                              }}
                              className={`block rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                isSubSelected
                                  ? "text-primary bg-primary/5 font-semibold"
                                  : "text-muted-foreground/80 hover:text-foreground hover:bg-accent/40"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filtros Generales */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-6">
            <h2 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
              Filtros
            </h2>

            {/* Filtro: Ofertas */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Promociones</span>
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="offers"
                  checked={searchParams.offers === "true"}
                  disabled={isPending}
                  onChange={(e) => updateQueryParams({ offers: e.target.checked ? "true" : null })}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <Label htmlFor="offers" className="text-sm font-medium text-foreground cursor-pointer">
                  Solo en oferta
                </Label>
              </div>
            </div>

            {/* Filtro: Precio */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rango de Precio (€)</span>
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={minInput}
                    disabled={isPending}
                    onChange={(e) => setMinInput(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                  <span className="text-muted-foreground text-xs font-medium">al</span>
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={maxInput}
                    disabled={isPending}
                    onChange={(e) => setMaxInput(e.target.value)}
                    className="rounded-xl h-9 text-xs"
                  />
                </div>
                <Button type="submit" size="sm" className="w-full rounded-xl text-xs h-8" disabled={isPending}>
                  Aplicar precio
                </Button>
              </form>
            </div>

            {/* Filtro: Marcas */}
            {brands.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Marcas</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {brands.map((brand) => {
                    const isChecked = selectedBrandsList.includes(brand);
                    return (
                      <div key={brand} className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          id={`brand-${brand}`}
                          checked={isChecked}
                          disabled={isPending}
                          onChange={(e) => handleBrandChange(brand, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <Label htmlFor={`brand-${brand}`} className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
                          {brand}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* === CONTENIDO PRINCIPAL (PRODUCT LISTING GRID) === */}
        <main className="lg:col-span-3 space-y-6">
          {/* Active Badges Panel */}
          {(searchParams.category || searchParams.min || searchParams.max || searchParams.offers === "true" || searchParams.brands || searchParams.q) && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-2xl border border-border/50">
              <span className="text-xs font-semibold text-muted-foreground px-2">Filtros activos:</span>
              
              {searchParams.category && activeCategoryName && (
                <Badge variant="secondary" className="rounded-lg py-1 px-2.5 gap-1 font-medium bg-background border text-xs">
                  Categoría: {activeCategoryName}
                  <button onClick={() => updateQueryParams({ category: null })} className="hover:text-destructive transition-colors ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {searchParams.offers === "true" && (
                <Badge variant="secondary" className="rounded-lg py-1 px-2.5 gap-1 font-medium bg-background border text-xs">
                  Solo en oferta
                  <button onClick={() => updateQueryParams({ offers: null })} className="hover:text-destructive transition-colors ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {(searchParams.min || searchParams.max) && (
                <Badge variant="secondary" className="rounded-lg py-1 px-2.5 gap-1 font-medium bg-background border text-xs">
                  Precio: {searchParams.min || "0"}€ - {searchParams.max || "∞"}€
                  <button onClick={() => { setMinInput(""); setMaxInput(""); updateQueryParams({ min: null, max: null }); }} className="hover:text-destructive transition-colors ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {selectedBrandsList.map((brand) => (
                <Badge key={brand} variant="secondary" className="rounded-lg py-1 px-2.5 gap-1 font-medium bg-background border text-xs">
                  Marca: {brand}
                  <button onClick={() => handleBrandChange(brand, false)} className="hover:text-destructive transition-colors ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {searchParams.q && (
                <Badge variant="secondary" className="rounded-lg py-1 px-2.5 gap-1 font-medium bg-background border text-xs">
                  Búsqueda: &quot;{searchParams.q}&quot;
                  <button onClick={() => updateQueryParams({ q: null })} className="hover:text-destructive transition-colors ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="text-xs h-7 ml-auto text-destructive hover:bg-destructive/10 rounded-lg font-semibold"
              >
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Product Cards Grid */}
          {initialArticles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {initialArticles.map((article) => (
                <ProductCard
                  key={article.id}
                  article={article}
                  isLoggedIn={isLoggedIn}
                  initialIsFavorited={favoritesSet.has(article.id)}
                  b2bTariffName={b2bTariffName}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 p-16 text-center bg-card shadow-sm">
              <Tag className="h-12 w-12 text-muted-foreground/60 stroke-[1.2] mb-3" />
              <h3 className="text-lg font-medium text-foreground">Sin productos</h3>
              <p className="text-muted-foreground text-sm mt-1.5 max-w-sm">
                No hay productos disponibles que coincidan con la combinación de filtros seleccionados.
              </p>
              <Button onClick={handleClearAllFilters} className="mt-5 rounded-xl text-xs h-9">
                Restaurar catálogo
              </Button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-border/50 pt-6">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={currentPage <= 1 || isPending}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <span className="text-xs text-muted-foreground font-medium px-4">
                Pág. {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
