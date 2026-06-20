"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, Phone, User, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { submitInfoRequestAction } from "@/lib/actions/catalog";

type StoreItem = {
  id: string;
  name: string;
};

type InfoRequestFormProps = {
  articleId: string;
  articleName: string;
  articleErpCode: string;
  stores: StoreItem[];
  session?: {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      type?: string;
    };
  } | null;
};

export function InfoRequestForm({
  articleId,
  articleName,
  articleErpCode,
  stores,
  session
}: InfoRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const defaultMessage = `Hola, me gustaría solicitar información y presupuesto sobre el artículo "${articleName}" (Referencia: ${articleErpCode}). Quedo a la espera de sus comentarios.`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.append("articleId", articleId);

    startTransition(async () => {
      const res = await submitInfoRequestAction(null, formData);

      if (res.error) {
        if (res.validationErrors) {
          setErrors(res.validationErrors);
        } else {
          toast.error("Error", { description: res.error });
        }
      } else {
        toast.success("Solicitud enviada", {
          description: "Hemos recibido su consulta. Nos pondremos en contacto con usted a la brevedad."
        });
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full rounded-2xl py-6 font-semibold shadow-glow">
          Solicitar información / presupuesto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-[2rem] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Solicitud de Información</DialogTitle>
          <DialogDescription className="text-sm mt-1">
            Envíe una consulta para el artículo <strong className="text-foreground">{articleName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-2" />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nombre de contacto
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <Input
                id="name"
                name="name"
                required
                defaultValue={session?.user?.name || ""}
                placeholder="Ej. Juan Pérez"
                className="pl-9 rounded-xl"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name[0]}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Correo electrónico
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={session?.user?.email || ""}
                placeholder="Ej. juan@correo.com"
                className="pl-9 rounded-xl"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email[0]}</p>}
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Teléfono (opcional)
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Phone className="h-4 w-4" />
              </span>
              <Input
                id="phone"
                name="phone"
                placeholder="Ej. +34 600 000 000"
                className="pl-9 rounded-xl"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500">{errors.phone[0]}</p>}
          </div>

          {/* Tienda Física Preferida */}
          <div className="space-y-1.5">
            <Label htmlFor="storeId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tienda física de recogida/consulta
            </Label>
            <Select name="storeId">
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Seleccione una tienda cercana..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id} className="rounded-lg">
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.storeId && <p className="text-xs text-red-500">{errors.storeId[0]}</p>}
          </div>

          {/* Mensaje */}
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Mensaje / Comentarios
            </Label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                defaultValue={defaultMessage}
                placeholder="Escriba su consulta aquí..."
                className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            {errors.message && <p className="text-xs text-red-500">{errors.message[0]}</p>}
          </div>

          {/* Botón de Envío */}
          <Button type="submit" disabled={isPending} className="w-full rounded-xl py-5 mt-2">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando consulta...
              </>
            ) : (
              "Enviar solicitud"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
