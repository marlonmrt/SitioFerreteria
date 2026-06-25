"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { Folder, FolderPlus, Edit, Trash2, Plus, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createFamilyAction,
  updateFamilyAction,
  deleteFamilyAction,
  createSubfamilyAction,
  updateSubfamilyAction,
  deleteSubfamilyAction
} from "@/lib/actions/catalog-admin";

type FamilyData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
  isManual: boolean;
};

type SubfamilyData = {
  id: string;
  familyId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isManual: boolean;
};

interface FamiliasClientProps {
  initialFamilies: FamilyData[];
  initialSubfamilies: SubfamilyData[];
}

export default function FamiliasClient({ initialFamilies, initialSubfamilies }: FamiliasClientProps) {
  const [, startTransition] = useTransition();

  // Modales states
  const [familyModal, setFamilyModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    data?: FamilyData;
  }>({ open: false, mode: "create" });

  const [subfamilyModal, setSubfamilyModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    familyId?: string;
    data?: SubfamilyData;
  }>({ open: false, mode: "create" });

  // Acciones de Formulario usando useActionState (React 19)
  const [famState, famFormAction, isFamPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      if (familyModal.mode === "create") {
        return createFamilyAction(prevState, formData);
      } else {
        return updateFamilyAction(familyModal.data!.id, prevState, formData);
      }
    },
    null
  );

  const [subState, subFormAction, isSubPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      if (subfamilyModal.mode === "create") {
        return createSubfamilyAction(prevState, formData);
      } else {
        return updateSubfamilyAction(subfamilyModal.data!.id, prevState, formData);
      }
    },
    null
  );

  // Manejo de cierres y toasts en base al estado de la acción
  useEffect(() => {
    if (famState?.success) {
      toast.success(
        familyModal.mode === "create"
          ? "Familia creada correctamente"
          : "Familia actualizada correctamente"
      );
      setFamilyModal({ open: false, mode: "create" });
    } else if (famState?.error) {
      toast.error(famState.error);
    }
  }, [famState, familyModal.mode]);

  useEffect(() => {
    if (subState?.success) {
      toast.success(
        subfamilyModal.mode === "create"
          ? "Subfamilia creada correctamente"
          : "Subfamilia actualizada correctamente"
      );
      setSubfamilyModal({ open: false, mode: "create" });
    } else if (subState?.error) {
      toast.error(subState.error);
    }
  }, [subState, subfamilyModal.mode]);

  const handleDeleteFamily = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta familia? También se eliminarán sus subfamilias y artículos asociados.")) return;
    startTransition(async () => {
      const res = await deleteFamilyAction(id);
      if (res.success) {
        toast.success("Familia eliminada correctamente");
      } else {
        toast.error(res.error || "No se pudo eliminar");
      }
    });
  };

  const handleDeleteSubfamily = (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta subfamilia? Se eliminarán los artículos asociados.")) return;
    startTransition(async () => {
      const res = await deleteSubfamilyAction(id);
      if (res.success) {
        toast.success("Subfamilia eliminada correctamente");
      } else {
        toast.error(res.error || "No se pudo eliminar");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Botones de acción principales */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setFamilyModal({ open: true, mode: "create" })}
          className=" gap-2"
        >
          <FolderPlus className="h-4.5 w-4.5" />
          Nueva Familia
        </Button>
      </div>

      {/* Grid de familias */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initialFamilies.map((family) => {
          const associatedSubs = initialSubfamilies.filter((sub) => sub.familyId === family.id);
          return (
            <Card
              key={family.id}
              className=" border-border/70 bg-card shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="bg-muted/15 border-b border-border/50 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Folder className="h-5 w-5 text-primary shrink-0" />
                      {family.name}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">Ord: {family.sortOrder}</div>
                  </div>
                  <Badge variant={family.isManual ? "default" : "outline"}>
                    {family.isManual ? "Manual" : "ERP"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Subfamilias ({associatedSubs.length})
                  </h4>

                  {associatedSubs.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic py-1">Sin subcategorías.</p>
                  ) : (
                    <ul className="space-y-2">
                      {associatedSubs.map((sub) => (
                        <li
                          key={sub.id}
                          className="flex items-center justify-between gap-2 text-sm bg-muted/20 p-2.5  border border-border/40"
                        >
                          <span className="font-medium text-foreground">{sub.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {sub.isManual && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Editar Subfamilia"
                                  className="h-7 w-7  text-muted-foreground hover:text-foreground"
                                  onClick={() =>
                                    setSubfamilyModal({
                                      open: true,
                                      mode: "edit",
                                      data: sub,
                                      familyId: family.id
                                    })
                                  }
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  title="Eliminar Subfamilia"
                                  className="h-7 w-7  text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteSubfamily(sub.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            {!sub.isManual && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                ERP
                              </Badge>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="border-t border-border/50 mt-6 pt-4 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className=" text-xs gap-1"
                    onClick={() =>
                      setSubfamilyModal({
                        open: true,
                        mode: "create",
                        familyId: family.id
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Subfamilia
                  </Button>

                  <div className="flex gap-1.5">
                    <Button
                      size="icon"
                      variant="secondary"
                      title="Editar Familia"
                      className="h-8 w-8 "
                      onClick={() =>
                        setFamilyModal({
                          open: true,
                          mode: "edit",
                          data: family
                        })
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      title="Eliminar Familia"
                      className="h-8 w-8  text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteFamily(family.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ================= MODAL: FAMILIA ================= */}
      <Dialog
        open={familyModal.open}
        onOpenChange={(open) => !open && setFamilyModal({ open: false, mode: "create" })}
      >
        <DialogContent className=" max-w-md">
          <DialogHeader>
            <DialogTitle>
              {familyModal.mode === "create" ? "Nueva Familia" : "Editar Familia"}
            </DialogTitle>
            <DialogDescription>
              Introduce los detalles para la familia. Se creará con la marca manual.
            </DialogDescription>
          </DialogHeader>
          <form action={famFormAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de Familia</Label>
              <Input
                id="name"
                name="name"
                defaultValue={familyModal.data?.name || ""}
                placeholder="Ej. Herramientas Manuales"
                required
                disabled={isFamPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Imagen URL (opcional)</Label>
              <Input
                id="image"
                name="image"
                defaultValue={familyModal.data?.image || ""}
                placeholder="/images/families/custom.jpg"
                disabled={isFamPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Orden de visualización</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                defaultValue={familyModal.data?.sortOrder || "0"}
                placeholder="0"
                disabled={isFamPending}
              />
            </div>
            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                className=""
                onClick={() => setFamilyModal({ open: false, mode: "create" })}
                disabled={isFamPending}
              >
                Cancelar
              </Button>
              <Button type="submit" className="" disabled={isFamPending}>
                {isFamPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL: SUBFAMILIA ================= */}
      <Dialog
        open={subfamilyModal.open}
        onOpenChange={(open) => !open && setSubfamilyModal({ open: false, mode: "create" })}
      >
        <DialogContent className=" max-w-md">
          <DialogHeader>
            <DialogTitle>
              {subfamilyModal.mode === "create" ? "Nueva Subfamilia" : "Editar Subfamilia"}
            </DialogTitle>
            <DialogDescription>
              Introduce los datos para la subcategoría.
            </DialogDescription>
          </DialogHeader>
          <form action={subFormAction} className="space-y-4">
            <input type="hidden" name="familyId" value={subfamilyModal.familyId || ""} />
            <div className="space-y-2">
              <Label htmlFor="subname">Nombre de Subfamilia</Label>
              <Input
                id="subname"
                name="name"
                defaultValue={subfamilyModal.data?.name || ""}
                placeholder="Ej. Destornilladores"
                required
                disabled={isSubPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subsortOrder">Orden de visualización</Label>
              <Input
                id="subsortOrder"
                name="sortOrder"
                type="number"
                defaultValue={subfamilyModal.data?.sortOrder || "0"}
                placeholder="0"
                disabled={isSubPending}
              />
            </div>
            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                className=""
                onClick={() => setSubfamilyModal({ open: false, mode: "create" })}
                disabled={isSubPending}
              >
                Cancelar
              </Button>
              <Button type="submit" className="" disabled={isSubPending}>
                {isSubPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
