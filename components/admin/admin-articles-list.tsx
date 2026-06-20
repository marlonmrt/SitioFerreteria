"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Search, Loader2, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toggleArticleActiveAction } from "@/lib/actions/admin";

type AdminArticle = {
  id: string;
  erpCode: string;
  name: string;
  slug: string;
  brand: string | null;
  unit: string;
  isActive: boolean;
  subfamilyName: string | null;
  familyName: string | null;
};

type AdminArticlesListProps = {
  articles: AdminArticle[];
  initialSearch?: string;
};

export function AdminArticlesList({ articles, initialSearch = "" }: AdminArticlesListProps) {
  const [search, setSearch] = useState(initialSearch);
  const [activeToggleId, setActiveToggleId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/admin/articulos?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push(`/admin/articulos`);
    }
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
      }
      setActiveToggleId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, código ERP o marca..."
            className="pl-9 rounded-xl"
          />
        </div>
        <Button type="submit" className="rounded-xl">
          Buscar
        </Button>
      </form>

      {/* Articles Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
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
                    <TableCell className="font-mono font-bold text-xs">
                      {article.erpCode}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate font-semibold text-foreground">
                      {article.name}
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
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant={article.isActive ? "outline" : "default"}
                        disabled={isToggling}
                        className="rounded-lg h-8 px-3"
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
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No se encontraron artículos en la base de datos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
