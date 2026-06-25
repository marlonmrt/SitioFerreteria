"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitInfoRequestAction } from "@/lib/actions/catalog";

type StoreData = {
  id: string;
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  lat: number;
  lng: number;
};

interface ContactoFormProps {
  stores: StoreData[];
}

export default function ContactoForm({ stores }: ContactoFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  
  const [state, formAction, isPending] = useActionState(
    submitInfoRequestAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Consulta enviada correctamente. Nos pondremos en contacto pronto.");
      formRef.current?.reset();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const validationErrors = state?.validationErrors || {};

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <Badge className="rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.2em]">
          Atención al Cliente
        </Badge>
        <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary shrink-0" />
          Formulario de Contacto
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground text-sm sm:text-base">
          ¿Tienes dudas sobre disponibilidad, quieres pedir un presupuesto o registrar tu empresa B2B? Escríbenos y te responderemos en menos de 24 horas.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        {/* Info sidebar */}
        <div className="space-y-6">
          <Card className=" border-border/70 bg-card p-6 shadow-sm">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg font-semibold">Atención Directa</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Correo electrónico</p>
                  <a href="mailto:info@ferreteria.local" className="hover:underline">
                    info@ferreteria.local
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Teléfono</p>
                  <a href="tel:+34922000000" className="hover:underline">
                    +34 922 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Dirección Central</p>
                  <span>C/ Principal 123, Santa Cruz de Tenerife</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form panel */}
        <Card className=" border-border/70 bg-card p-6 sm:p-8 shadow-sm">
          <form ref={formRef} action={formAction} className="space-y-5">
            {/* Grid for Name and Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Tu nombre"
                  required
                  disabled={isPending}
                />
                {validationErrors.name && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.name[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  required
                  disabled={isPending}
                />
                {validationErrors.email && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.email[0]}</p>
                )}
              </div>
            </div>

            {/* Phone and Store Selection */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="600 000 000"
                  disabled={isPending}
                />
                {validationErrors.phone && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.phone[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeId">Tienda de interés</Label>
                <select
                  id="storeId"
                  name="storeId"
                  defaultValue=""
                  disabled={isPending}
                  className="flex h-10 w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Ninguna (Consulta General)</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
                {validationErrors.storeId && (
                  <p className="text-xs text-destructive mt-1">{validationErrors.storeId[0]}</p>
                )}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <textarea
                id="message"
                name="message"
                placeholder="Escribe tu consulta detalladamente aquí..."
                required
                disabled={isPending}
                rows={5}
                className="flex w-full  border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
              />
              {validationErrors.message && (
                <p className="text-xs text-destructive mt-1">{validationErrors.message[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto  px-6 gap-2"
              >
                <Send className="h-4 w-4" />
                {isPending ? "Enviando..." : "Enviar mensaje"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
