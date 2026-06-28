"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import { Search, Loader2, Eye, EyeOff, Edit, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toggleArticleActiveAction, toggleArticlesActiveBulkAction } from "@/lib/actions/admin";
import { deleteArticleAction } from "@/lib/actions/catalog-admin";

type FamilyData = {
  id: string;
  name: string;
};

type SubfamilyData = {
  id: string;
  familyId: string;
  name: string;
};

type AdminArticle = {
  id: string;
  erpCode: string;
  name: string;
  slug: string;
  brand: string | null;
  unit: string;
  isActive: boolean;
  isManual: boolean;
  subfamilyName: string | null;
  familyName: string | null;
  stock: number;
  offerB2C: number;
  offerB2B: number;
};

type AdminArticlesListProps = {
  articles: AdminArticle[];
  initialSearch?: string;
  families: FamilyData[];
  subfamilies: SubfamilyData[];
  brands: string[];
  initialCategory?: string;
  initialBrand?: string;
  initialOffer?: string;
};

export function AdminArticlesList({
  articles,
  initialSearch = "",
  families,
  subfamilies,
  brands,
  initialCategory = "",
  initialBrand = "",
  initialOffer = ""
}: AdminArticlesListProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedFamilyOrSubfamily, setSelectedFamilyOrSubfamily] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedOffer, setSelectedOffer] = useState(initialOffer);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeToggleId, setActiveToggleId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reiniciar selecciones al cambiar filtros
  useEffect(() => {
    setSelectedIds([]);
  }, [articles]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", "1"); // Restablecer a página 1 al filtrar

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/admin/articulos?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: search.trim() || null });
  };

  const handleToggleActive = (article: AdminArticle) => {
    setActiveToggleId(article.id);
    startTransition(async () => {
      const res = await toggleArticleActiveAction(article.id, article.isActive);
      if (res.error) {
        toast.error("Error", { description: res.error });
      } else {
        toast.success("Catálogo actualizado", {
          description: `El artículo "${article.name}" ahora está ${
            res.isActive ? "activo y visible" : "inactivo y oculto"
          }.`
        });
        router.refresh();
      }
      setActiveToggleId(null);
    });
  };

  const handleDeleteArticle = (article: AdminArticle) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente el artículo "${article.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteArticleAction(article.id);
      if (res.success) {
        toast.success("Artículo eliminado correctamente");
        router.refresh();
      } else {
        toast.error("Error", { description: res.error || "No se pudo eliminar el artículo" });
      }
    });
  };

  // Lógica de Selección
  const allVisibleSelected = articles.length > 0 && articles.every((a) => selectedIds.includes(a.id));

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkToggleActive = (targetStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleArticlesActiveBulkAction(selectedIds, targetStatus);
      if (res.error) {
        toast.error("Error", { description: res.error });
      } else {
        toast.success("Catálogo actualizado", {
          description: `Se han ${targetStatus ? "activado" : "ocultado"} ${selectedIds.length} artículos con éxito.`
        });
        setSelectedIds([]);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Actions and Filters Bar */}
      <div className="space-y-4  border border-border/60 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="flex max-w-md flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, código o marca..."
                className="pl-9  bg-background"
              />
            </div>
            <Button type="submit" className="">
              Buscar
            </Button>
          </form>

          <Button asChild className=" gap-1.5 h-10">
            <Link href="/admin/articulos/nuevo">
              <Plus className="h-4.5 w-4.5" />
              Nuevo Artículo
            </Link>
          </Button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/30">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pl-1">Filtrar por Categoría</span>
            <select
              value={selectedFamilyOrSubfamily}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedFamilyOrSubfamily(val);
                updateFilters({ category: val || null });
              }}
              className="flex h-10 w-full md:w-56  border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer font-medium"
            >
              <option value="">Todas las Categorías</option>
              {families.map((fam) => {
                const famSubs = subfamilies.filter((sub) => sub.familyId === fam.id);
                return (
                  <optgroup key={fam.id} label={fam.name}>
                    <option value={fam.id}>{fam.name} (Toda la Familia)</option>
                    {famSubs.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pl-1">Filtrar por Marca</span>
            <select
              value={selectedBrand}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBrand(val);
                updateFilters({ brand: val || null });
              }}
              className="flex h-10 w-full md:w-48  border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer font-medium"
            >
              <option value="">Todas las Marcas</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider pl-1">Estado de Oferta</span>
            <select
              value={selectedOffer}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedOffer(val);
                updateFilters({ offer: val || null });
              }}
              className="flex h-10 w-full md:w-48  border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer font-medium"
            >
              <option value="">Todas las Ofertas</option>
              <option value="only-offers">Solo en Oferta</option>
              <option value="no-offers">Sin Oferta</option>
            </select>
          </div>

          {/* Reset Filters button */}
          {(search || selectedFamilyOrSubfamily || selectedBrand || selectedOffer) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedFamilyOrSubfamily("");
                setSelectedBrand("");
                setSelectedOffer("");
                router.push("/admin/articulos");
              }}
              className="h-9 self-end text-xs text-destructive hover:bg-destructive/10  font-semibold"
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 bg-primary/5  border border-primary/20 animate-in fade-in slide-in-from-top-1">
          <span className="text-xs font-semibold text-primary">
            {selectedIds.length} artículos seleccionados
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              className=" text-xs h-9 px-4"
              disabled={isPending}
              onClick={() => handleBulkToggleActive(true)}
            >
              Activar seleccionados
            </Button>
            <Button
              size="sm"
              variant="outline"
              className=" text-xs h-9 px-4 border-destructive text-destructive hover:bg-destructive/10"
              disabled={isPending}
              onClick={() => handleBulkToggleActive(false)}
            >
              Ocultar seleccionados
            </Button>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className=" border border-border/70 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={handleToggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </TableHead>
              <TableHead>Código ERP</TableHead>
              <TableHead>Artículo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Categoría / Familia</TableHead>
              <TableHead>Estado storefront</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length > 0 ? (
              articles.map((article) => {
                const isToggling = activeToggleId === article.id && isPending;
                return (
                  <TableRow key={article.id} className="hover:bg-muted/10">
                    <TableCell className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(article.id)}
                        onChange={() => handleToggleSelect(article.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-mono font-bold text-xs">
                      {article.erpCode}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        {article.name}
                        <div className="flex items-center gap-1">
                          {article.stock > 0 && (
                            <Badge variant="outline" className="text-[10px] font-bold text-blue-600 bg-blue-50 border-blue-300/50 py-0 px-1.5 rounded-md">
                              Stock: {article.stock}
                            </Badge>
                          )}
                          {article.offerB2C > 0 && (
                            <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border-emerald-300/50 py-0 px-1.5 rounded-md">
                              B2C -{article.offerB2C}%
                            </Badge>
                          )}
                          {article.offerB2B > 0 && (
                            <Badge variant="outline" className="text-[10px] font-bold text-amber-600 bg-amber-50 border-amber-300/50 py-0 px-1.5 rounded-md">
                              B2B -{article.offerB2B}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground/60 text-xs font-normal block">
                        Medida: {article.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-semibold">
                      {article.brand || "Genérica"}
                    </TableCell>
                    <TableCell className="space-y-0.5 text-xs text-muted-foreground">
                      <div>{article.familyName || "Sin familia"}</div>
                      {article.subfamilyName && (
                        <div className="text-[10px] text-muted-foreground/75 uppercase tracking-wide">
                          {article.subfamilyName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            article.isActive ? "bg-emerald-500" : "bg-muted-foreground/50"
                          }`}
                        />
                        <span className="text-xs font-medium">
                          {article.isActive ? "Visible" : "Oculto"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap space-x-1.5">
                      <Button
                        size="sm"
                        variant={article.isActive ? "outline" : "default"}
                        disabled={isToggling}
                        className=" h-8 px-3"
                        onClick={() => handleToggleActive(article)}
                      >
                        {isToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : article.isActive ? (
                          <EyeOff className="h-4 w-4 mr-1.5" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1.5" />
                        )}
                        {article.isActive ? "Ocultar" : "Activar"}
                      </Button>

                      {article.isManual && (
                        <>
                          <Button
                            asChild
                            size="sm"
                            variant="secondary"
                            className=" h-8 px-2.5"
                            title="Editar artículo"
                          >
                            <Link href={`/admin/articulos/${article.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            className=" h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Eliminar artículo"
                            onClick={() => handleDeleteArticle(article)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No se encontraron artículos en la base de datos con los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
