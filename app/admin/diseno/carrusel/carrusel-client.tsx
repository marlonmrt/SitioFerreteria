"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  gradientFrom: string;
  gradientVia: string | null;
  gradientTo: string;
  backgroundImage: string | null;
  textColor: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Props {
  initialSlides: Slide[];
}

export default function CarruselClient({ initialSlides }: Props) {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [open, setOpen] = useState(false);

  const emptyForm: Slide = {
    id: "",
    title: "",
    subtitle: "",
    ctaLabel: "",
    ctaHref: "",
    gradientFrom: "#1e3a5f",
    gradientVia: "#2a5a8a",
    gradientTo: "#3a7abd",
    backgroundImage: "",
    textColor: "#ffffff",
    sortOrder: slides.length,
    isActive: true
  };

  const [form, setForm] = useState<Slide>(emptyForm);

  function openNew() {
    setForm({ ...emptyForm, sortOrder: slides.length });
    setEditing(null);
    setOpen(true);
  }

  function openEdit(slide: Slide) {
    setForm({ ...slide });
    setEditing(slide);
    setOpen(true);
  }

  async function handleSave() {
    const url = editing ? `/api/admin/carrusel/${editing.id}` : "/api/admin/carrusel";
    const method = editing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      setOpen(false);
      router.refresh();
      const updated = await getAllSlides();
      setSlides(updated);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta diapositiva?")) return;
    await fetch(`/api/admin/carrusel/${id}`, { method: "DELETE" });
    router.refresh();
    const updated = await getAllSlides();
    setSlides(updated);
  }

  async function handleToggleActive(id: string, current: boolean) {
    await fetch(`/api/admin/carrusel/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current })
    });
    router.refresh();
    const updated = await getAllSlides();
    setSlides(updated);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {slides.length} diapositiva{slides.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={openNew} size="sm" className="">
          <Plus className="h-4 w-4 mr-1.5" />
          Nueva diapositiva
        </Button>
      </div>

      {slides.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay diapositivas. Crea la primera.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <Card
              key={slide.id}
              className={cn(
                "transition-opacity",
                !slide.isActive && "opacity-50"
              )}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex items-center gap-2 text-muted-foreground shrink-0 mt-1">
                  <GripVertical className="h-4 w-4" />
                </div>

                <div
                  className="h-20 w-36 shrink-0  flex items-center justify-center text-xs font-bold px-2 text-center leading-tight"
                  style={{
                    color: slide.textColor || "#ffffff",
                    background: `linear-gradient(135deg, ${slide.gradientFrom}, ${slide.gradientVia || slide.gradientTo}, ${slide.gradientTo})`
                  }}
                >
                  {slide.title}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {slide.title}
                    </h3>
                    {!slide.isActive && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        Inactiva
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {slide.subtitle}
                  </p>
                  {slide.ctaLabel && (
                    <p className="text-xs text-muted-foreground mt-1">
                      CTA: {slide.ctaLabel} → {slide.ctaHref}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleActive(slide.id, slide.isActive)}
                    title={slide.isActive ? "Desactivar" : "Activar"}
                  >
                    {slide.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(slide)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar diapositiva" : "Nueva diapositiva"}
            </DialogTitle>
            <DialogDescription>
              Configura el contenido y los colores de la diapositiva.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Orden</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ctaLabel">Texto del botón</Label>
                <Input
                  id="ctaLabel"
                  value={form.ctaLabel || ""}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaHref">Enlace del botón</Label>
                <Input
                  id="ctaHref"
                  value={form.ctaHref || ""}
                  onChange={(e) => setForm({ ...form, ctaHref: e.target.value || null })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="gradientFrom">Color inicio</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.gradientFrom}
                    onChange={(e) => setForm({ ...form, gradientFrom: e.target.value })}
                    className="h-9 w-9 rounded-md border border-input bg-transparent cursor-pointer"
                  />
                  <Input
                    id="gradientFrom"
                    value={form.gradientFrom}
                    onChange={(e) => setForm({ ...form, gradientFrom: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradientVia">Color medio</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.gradientVia || form.gradientTo}
                    onChange={(e) => setForm({ ...form, gradientVia: e.target.value })}
                    className="h-9 w-9 rounded-md border border-input bg-transparent cursor-pointer"
                  />
                  <Input
                    id="gradientVia"
                    value={form.gradientVia || ""}
                    onChange={(e) => setForm({ ...form, gradientVia: e.target.value || null })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradientTo">Color final</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.gradientTo}
                    onChange={(e) => setForm({ ...form, gradientTo: e.target.value })}
                    className="h-9 w-9 rounded-md border border-input bg-transparent cursor-pointer"
                  />
                  <Input
                    id="gradientTo"
                    value={form.gradientTo}
                    onChange={(e) => setForm({ ...form, gradientTo: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="textColor">Color del texto</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.textColor || "#ffffff"}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                  className="h-9 w-9 rounded-md border border-input bg-transparent cursor-pointer"
                />
                <Input
                  id="textColor"
                  value={form.textColor || ""}
                  onChange={(e) => setForm({ ...form, textColor: e.target.value || null })}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Elige un color oscuro (#1a1a1a, #333333) si la imagen de fondo es clara.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundImage">URL de imagen de fondo</Label>
              <Input
                id="backgroundImage"
                placeholder="/images/categories/construccion.jpg"
                value={form.backgroundImage || ""}
                onChange={(e) => setForm({ ...form, backgroundImage: e.target.value || null })}
              />
              <p className="text-xs text-muted-foreground">
                Si se indica una imagen, el gradiente se mostrará semitransparente sobre ella.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <Label htmlFor="isActive">Activa</Label>
            </div>

            {/* Preview */}
            <div
              className="h-24  flex items-center justify-center font-bold relative overflow-hidden"
              style={{ color: form.textColor || "#ffffff" }}
            >
              {form.backgroundImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${form.backgroundImage})` }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientVia || form.gradientTo}, ${form.gradientTo})`,
                  opacity: form.backgroundImage ? 0.75 : 1
                }}
              />
              <span className="relative z-10">
                Vista previa: {form.title || "Sin título"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Guardar cambios" : "Crear diapositiva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

async function getAllSlides(): Promise<Slide[]> {
  const res = await fetch("/api/admin/carrusel");
  if (!res.ok) return [];
  return res.json();
}