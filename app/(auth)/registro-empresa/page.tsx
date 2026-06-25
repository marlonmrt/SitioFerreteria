"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

import { registerB2bAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterCompanyPage() {
  const [state, formAction, isPending] = useActionState(registerB2bAction, null);

  if (state?.success) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-12">
        <Card className="w-full  border-border/70 shadow-soft text-center p-6">
          <CardHeader className="flex flex-col items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4" />
            <CardTitle className="text-3xl font-bold">Solicitud recibida</CardTitle>
            <CardDescription className="text-sm mt-2">
              Tu solicitud de registro B2B ha sido guardada con éxito.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nuestro equipo de administración revisará el CIF y los datos de tu empresa. Te contactaremos cuando hayamos verificado y aprobado tu cuenta para que puedas acceder a tus tarifas especiales.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild className="w-full  h-11">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-lg items-center px-4 py-12">
      <Card className="w-full  border-border/70 shadow-soft">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Solicitud Alta B2B</CardTitle>
          <CardDescription className="text-sm">
            Registra tu empresa para obtener tarifas comerciales de distribuidor y condiciones especiales.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-5">
            {state?.error && (
              <div className=" bg-destructive/10 p-4 text-sm font-medium text-destructive">
                {state.error}
              </div>
            )}

            <div className="border-b border-border/50 pb-2">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Datos de Contacto</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Persona de contacto</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Carlos Pérez"
                  required
                  className=" h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico corporativo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="carlos@empresa.com"
                  required
                  className=" h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña de acceso</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className=" h-11"
              />
            </div>

            <div className="border-b border-border/50 pb-2 pt-2">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Datos de la Empresa</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalName">Razón social de la empresa</Label>
              <Input
                id="legalName"
                name="legalName"
                type="text"
                placeholder="Construcciones Atlántico S.L."
                required
                className=" h-11"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxId">CIF / NIF</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  type="text"
                  placeholder="B12345678"
                  required
                  className=" h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Teléfono de contacto</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  placeholder="+34 922 000 000"
                  required
                  className=" h-11"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full  h-11" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando solicitud...
                </>
              ) : (
                "Enviar Solicitud de Registro"
              )}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              ¿Ya eres cliente profesional?{" "}
              <Link href="/login" className="text-primary hover:underline font-semibold">
                Inicia sesión aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
