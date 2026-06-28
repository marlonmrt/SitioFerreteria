"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { createArticleAction, updateArticleAction } from "@/lib/actions/catalog-admin";

type FamilyData = {
  id: string;
  name: string;
};

type SubfamilyData = {
  id: string;
  familyId: string;
  name: string;
};

type ArticleInitialData = {
  id: string;
  erpCode: string;
  name: string;
  description: string | null;
  brand: string | null;
  unit: string;
  subfamilyId: string;
  mainImage: string | null;
  publicPrice: string | null;
  pricePro?: string | null;
  stock?: number;
  offerB2C?: number;
  offerB2B?: number;
};

interface ArticuloFormProps {
  families: FamilyData[];
  subfamilies: SubfamilyData[];
  existingBrands: string[];
  initialData?: ArticleInitialData;
}

export default function ArticuloForm({
  families,
  subfamilies,
  existingBrands,
  initialData
}: ArticuloFormProps) {
  const router = useRouter();


  const isEdit = !!initialData;

  // Encontrar la familia inicial del artículo si estamos editando
  const initialSubfamily = isEdit
    ? subfamilies.find((s) => s.id === initialData.subfamilyId)
    : null;
  const initialFamilyId = initialSubfamily ? initialSubfamily.familyId : "";

  const [selectedFamilyId, setSelectedFamilyId] = useState(initialFamilyId);
  const [filteredSubfamilies, setFilteredSubfamilies] = useState<SubfamilyData[]>([]);

  // Filtrar subfamilias según la familia elegida
  useEffect(() => {
    if (selectedFamilyId) {
      setFilteredSubfamilies(subfamilies.filter((s) => s.familyId === selectedFamilyId));
    } else {
      setFilteredSubfamilies([]);
    }
  }, [selectedFamilyId, subfamilies]);

  // Server Action con useActionState (React 19)
  const [state, formAction, isPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      if (!isEdit) {
        return createArticleAction(prevState, formData);
      } else {
        return updateArticleAction(initialData.id, prevState, formData);
      }
    },
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(
        isEdit ? "Artículo actualizado correctamente" : "Artículo creado correctamente"
      );
      router.push("/admin/articulos");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, isEdit, router]);

  const validationErrors = state?.validationErrors || {};

  return (
    <div className="space-y-6">
      {/* Botón de volver */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" className=" h-10 px-4">
          <Link href="/admin/articulos" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Artículos
          </Link>
        </Button>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? "Editar Artículo" : "Crear Artículo Manual"}
          </h1>
          <Badge className="rounded-full px-2.5 py-0.5 text-[10px]">
            {isEdit ? "Manual ID: " + initialData.erpCode : "Nuevo"}
          </Badge>
        </div>
      </div>

      <Card className=" border-border/70 bg-card p-6 sm:p-8 shadow-sm">
        <form action={formAction} className="space-y-6">
          {/* Nombre y ERP */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Artículo</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialData?.name || ""}
                placeholder="Ej. Taladro Percutor Professional"
                required
                disabled={isPending}
              />
              {validationErrors.name && (
                <p className="text-xs text-destructive mt-1">{validationErrors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="erpCode">
                Código ERP <span className="text-xs text-muted-foreground">(Opcional, autogenerado si vacío)</span>
              </Label>
              <Input
                id="erpCode"
                name="erpCode"
                defaultValue={initialData?.erpCode || ""}
                placeholder="Ej. MAN-TALADRO-01"
                disabled={isPending}
              />
              {validationErrors.erpCode && (
                <p className="text-xs text-destructive mt-1">{validationErrors.erpCode[0]}</p>
              )}
            </div>
          </div>

          {/* Marca, Unidad e Imagen */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input
                id="brand"
                name="brand"
                defaultValue={initialData?.brand || ""}
                placeholder="Ej. Makita"
                list="brands-list"
                disabled={isPending}
              />
              <datalist id="brands-list">
                {existingBrands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              {validationErrors.brand && (
                <p className="text-xs text-destructive mt-1">{validationErrors.brand[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidad de Medida</Label>
              <select
                id="unit"
                name="unit"
                defaultValue={initialData?.unit || "ud"}
                disabled={isPending}
                className="flex h-10 w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ud">ud (Unidad)</option>
                <option value="m2">m² (Metro cuadrado)</option>
                <option value="saco">saco (Saco)</option>
                <option value="cartucho">cartucho (Cartucho)</option>
                <option value="pack">pack (Pack)</option>
                <option value="kg">kg (Kilogramo)</option>
              </select>
              {validationErrors.unit && (
                <p className="text-xs text-destructive mt-1">{validationErrors.unit[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainImage">Imagen URL (opcional)</Label>
              <Input
                id="mainImage"
                name="mainImage"
                defaultValue={initialData?.mainImage || ""}
                placeholder="/images/articles/taladro.jpg"
                disabled={isPending}
              />
              {validationErrors.mainImage && (
                <p className="text-xs text-destructive mt-1">{validationErrors.mainImage[0]}</p>
              )}
            </div>
          </div>

          {/* Categorización: Familia y Subfamilia */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="familyId">Familia</Label>
              <select
                id="familyId"
                value={selectedFamilyId}
                onChange={(e) => setSelectedFamilyId(e.target.value)}
                disabled={isPending}
                className="flex h-10 w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>Selecciona una Familia</option>
                {families.map((fam) => (
                  <option key={fam.id} value={fam.id}>
                    {fam.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subfamilyId">Subfamilia</Label>
              <select
                id="subfamilyId"
                name="subfamilyId"
                defaultValue={initialData?.subfamilyId || ""}
                disabled={isPending || !selectedFamilyId}
                className="flex h-10 w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="" disabled>Selecciona una Subfamilia</option>
                {filteredSubfamilies.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {validationErrors.subfamilyId && (
                <p className="text-xs text-destructive mt-1">{validationErrors.subfamilyId[0]}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción Detallada</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ""}
              placeholder="Especificaciones técnicas, potencia, medidas..."
              disabled={isPending}
              rows={4}
              className="flex w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
            />
            {validationErrors.description && (
              <p className="text-xs text-destructive mt-1">{validationErrors.description[0]}</p>
            )}
          </div>

          {/* Tarifas de Precios */}
          <div className="grid gap-4 sm:grid-cols-2 border-t border-border/50 pt-5">
            <div className="space-y-2">
              <Label htmlFor="pricePvp">Precio Público PVP (€)</Label>
              <Input
                id="pricePvp"
                name="pricePvp"
                type="number"
                step="0.01"
                defaultValue={initialData?.publicPrice || ""}
                placeholder="0.00"
                required
                disabled={isPending}
              />
              {validationErrors.pricePvp && (
                <p className="text-xs text-destructive mt-1">{validationErrors.pricePvp[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePro">
                Precio Profesional PRO_01 (€) <span className="text-xs text-muted-foreground">(Opcional)</span>
              </Label>
              <Input
                id="pricePro"
                name="pricePro"
                type="number"
                step="0.01"
                defaultValue={initialData?.pricePro || ""}
                placeholder="0.00"
                disabled={isPending}
              />
              {validationErrors.pricePro && (
                <p className="text-xs text-destructive mt-1">{validationErrors.pricePro[0]}</p>
              )}
            </div>
          </div>

          {/* Stock */}
          <div className="border-t border-border/50 pt-5 space-y-4">
            <h3 className="text-lg font-bold text-foreground">Stock y Ofertas</h3>
            <div className="grid gap-4 sm:grid-cols-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Disponible</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={initialData?.stock ?? 0}
                  placeholder="0"
                />
                {validationErrors.stock && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.stock[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerB2C">Oferta B2C (% descuento)</Label>
                <Input
                  id="offerB2C"
                  name="offerB2C"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={initialData?.offerB2C ?? 0}
                  placeholder="0"
                />
                {validationErrors.offerB2C && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.offerB2C[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerB2B">Oferta B2B (% descuento)</Label>
                <Input
                  id="offerB2B"
                  name="offerB2B"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={initialData?.offerB2B ?? 0}
                  placeholder="0"
                />
                {validationErrors.offerB2B && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.offerB2B[0]}</p>
                )}
              </div>
            </div>
          </div>
 
          {/* Botones de Envío */}
          <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
            <Button
              asChild
              type="button"
              variant="outline"
              className=" h-11 px-6"
            >
              <Link href="/admin/articulos">Cancelar</Link>
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className=" h-11 px-6 gap-2"
            >
              {isPending ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  {isEdit ? "Guardar Cambios" : "Crear Artículo"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
