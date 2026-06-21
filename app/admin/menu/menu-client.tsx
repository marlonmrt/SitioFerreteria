"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Plus, Loader2, Link2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createMenuItemAction,
  updateMenuItemAction,
  toggleMenuItemActiveAction,
  deleteMenuItemAction
} from "@/lib/actions/menu-admin";

type MenuItemData = {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
};

type FamilyData = {
  id: string;
  name: string;
  slug: string;
};

interface MenuClientProps {
  initialItems: MenuItemData[];
  families: FamilyData[];
}

export default function MenuClient({ initialItems, families }: MenuClientProps) {
  const router = useRouter();
  const [isPendingTransition, startTransition] = useTransition();

  // Modales states
  const [modal, setModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    data?: MenuItemData;
  }>({ open: false, mode: "create" });

  const [hrefValue, setHrefValue] = useState("");
  const [labelValue, setLabelValue] = useState("");

  useEffect(() => {
    if (modal.open) {
      setHrefValue(modal.mode === "edit" ? modal.data?.href || "" : "");
      setLabelValue(modal.mode === "edit" ? modal.data?.label || "" : "");
    }
  }, [modal]);

  const [activeToggleId, setActiveToggleId] = useState<string | null>(null);

  // Form action using useActionState
  const [state, formAction, isFormPending] = useActionState(
    async (prevState: unknown, formData: FormData) => {
      const mode = formData.get("mode") as string;
      const itemId = formData.get("itemId") as string;

      if (mode === "create") {
        return createMenuItemAction(prevState, formData);
      } else {
        return updateMenuItemAction(itemId, prevState, formData);
      }
    },
    null
  );

  // Close modal and show toast on action success
  useEffect(() => {
    if (state?.success) {
      toast.success(
        modal.mode === "create"
          ? "Enlace creado correctamente"
          : "Enlace actualizado correctamente"
      );
      setModal({ open: false, mode: "create" });
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, modal.mode, router]);

  // Toggle active/inactive status
  const handleToggleActive = (id: string, currentStatus: boolean, label: string) => {
    setActiveToggleId(id);
    startTransition(async () => {
      const res = await toggleMenuItemActiveAction(id, currentStatus);
      if (res.success) {
        toast.success(`Enlace "${label}" ${res.isActive ? "activado" : "desactivado"} correctamente`);
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo cambiar el estado");
      }
      setActiveToggleId(null);
    });
  };

  // Delete item
  const handleDelete = (id: string, label: string) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente el enlace "${label}"?`)) return;
    startTransition(async () => {
      const res = await deleteMenuItemAction(id);
      if (res.success) {
        toast.success("Enlace eliminado correctamente");
        router.refresh();
      } else {
        toast.error(res.error || "No se pudo eliminar el enlace");
      }
    });
  };

  // Filter possible parents (cannot be itself)
  const availableParents = initialItems.filter(
    (item) => modal.mode === "create" || item.id !== modal.data?.id
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Total de enlaces configurados: <strong className="text-foreground">{initialItems.length}</strong>
        </p>
        <Button
          onClick={() => setModal({ open: true, mode: "create" })}
          className="rounded-xl gap-1.5 h-10 shadow-sm"
        >
          <Plus className="h-4.5 w-4.5" />
          Añadir Enlace
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Etiqueta</TableHead>
              <TableHead>Enlace (href)</TableHead>
              <TableHead className="text-center">Orden</TableHead>
              <TableHead>Nivel / Padre</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialItems.length > 0 ? (
              initialItems.map((item) => {
                const parentItem = initialItems.find((p) => p.id === item.parentId);
                const isToggling = activeToggleId === item.id && isPendingTransition;

                return (
                  <TableRow key={item.id} className="hover:bg-muted/10">
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-muted-foreground/60" />
                        {item.label}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.href}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.sortOrder}
                    </TableCell>
                    <TableCell>
                      {parentItem ? (
                        <Badge variant="outline" className="rounded-lg font-normal bg-accent/40">
                          Subnivel de: {parentItem.label}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-lg font-normal">
                          Nivel Principal
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant={item.isActive ? "outline" : "default"}
                        disabled={isToggling || isPendingTransition}
                        className="rounded-lg h-8 px-3 font-medium transition-all"
                        onClick={() => handleToggleActive(item.id, item.isActive, item.label)}
                      >
                        {isToggling ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : item.isActive ? (
                          <EyeOff className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 mr-1.5" />
                        )}
                        {item.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPendingTransition}
                        className="rounded-lg h-8 px-2.5"
                        title="Editar enlace"
                        onClick={() => setModal({ open: true, mode: "edit", data: item })}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPendingTransition}
                        className="rounded-lg h-8 px-2.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar enlace"
                        onClick={() => handleDelete(item.id, item.label)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No hay enlaces de menú creados. Se usarán los enlaces por defecto.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Form */}
      <Dialog open={modal.open} onOpenChange={(open) => !isFormPending && setModal((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-6">
          <DialogHeader>
            <DialogTitle>
              {modal.mode === "create" ? "Añadir Enlace al Menú" : "Editar Enlace de Menú"}
            </DialogTitle>
            <DialogDescription>
              Introduce los detalles para el enlace de navegación.
            </DialogDescription>
          </DialogHeader>

          <form key={modal.data?.id || "new"} action={formAction} className="space-y-4 py-4">
            <input type="hidden" name="mode" value={modal.mode} />
            <input type="hidden" name="itemId" value={modal.data?.id || ""} />
            
            {/* Pages suggestions selector */}
            <div className="space-y-1.5">
              <Label htmlFor="pageSelector">Páginas sugeridas de la App</Label>
              <select
                id="pageSelector"
                disabled={isFormPending}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;

                  const selectedOption = e.target.options[e.target.selectedIndex];
                  const labelSuggestion = selectedOption.getAttribute("data-label") || "";

                  setHrefValue(val);
                  if (!labelValue) {
                    setLabelValue(labelSuggestion);
                  }

                  e.target.value = "";
                }}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">-- Selecciona una página para autorellenar el enlace --</option>
                <optgroup label="Páginas Estáticas">
                  <option value="/" data-label="Inicio">Inicio (/)</option>
                  <option value="/tiendas" data-label="Tiendas">Tiendas (/tiendas)</option>
                  <option value="/faq" data-label="FAQ">FAQ (/faq)</option>
                  <option value="/conocenos" data-label="Conócenos">Conócenos (/conocenos)</option>
                  <option value="/contacto" data-label="Contacto">Contacto (/contacto)</option>
                </optgroup>
                {families.length > 0 && (
                  <optgroup label="Categorías de Productos">
                    {families.map((fam) => (
                      <option key={fam.id} value={`/familias/${fam.slug}`} data-label={fam.name}>
                        {fam.name} (/familias/{fam.slug})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="label">Etiqueta de visualización</Label>
              <Input
                id="label"
                name="label"
                placeholder="Ej. Ofertas, Servicios, Herramientas..."
                value={labelValue}
                onChange={(e) => setLabelValue(e.target.value)}
                required
                className="rounded-xl h-10"
                disabled={isFormPending}
              />
              {state?.validationErrors?.label && (
                <p className="text-xs text-destructive">{state.validationErrors.label[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="href">Enlace destino (href)</Label>
              <Input
                id="href"
                name="href"
                placeholder="Ej. /contacto o https://..."
                value={hrefValue}
                onChange={(e) => setHrefValue(e.target.value)}
                required
                className="rounded-xl h-10 font-mono text-sm"
                disabled={isFormPending}
              />
              {state?.validationErrors?.href && (
                <p className="text-xs text-destructive">{state.validationErrors.href[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sortOrder">Orden de visualización</Label>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  placeholder="Ej. 10, 20"
                  defaultValue={modal.mode === "edit" ? modal.data?.sortOrder : "0"}
                  required
                  className="rounded-xl h-10"
                  disabled={isFormPending}
                />
                {state?.validationErrors?.sortOrder && (
                  <p className="text-xs text-destructive">{state.validationErrors.sortOrder[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="parentId">Elemento Padre (Submenú)</Label>
                <select
                  id="parentId"
                  name="parentId"
                  defaultValue={modal.mode === "edit" ? modal.data?.parentId || "" : ""}
                  disabled={isFormPending}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Ninguno (Principal)</option>
                  {availableParents.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/50 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={isFormPending}
                onClick={() => setModal({ open: false, mode: "create" })}
                className="rounded-xl h-10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isFormPending}
                className="rounded-xl h-10 gap-1.5"
              >
                {isFormPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {modal.mode === "create" ? "Añadir Enlace" : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
