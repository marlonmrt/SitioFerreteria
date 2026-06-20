"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { loginAction } from "@/lib/actions/auth";
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

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-4 py-12">
      <Card className="w-full rounded-[2rem] border-border/70 shadow-soft">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold">Acceder al catálogo</CardTitle>
          <CardDescription className="text-sm">
            Introduce tus credenciales para acceder a tu catálogo personalizado.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            {state?.error && (
              <div className="rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
                {state.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ejemplo@correo.com"
                required
                className="rounded-2xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="rounded-2xl h-11"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full rounded-2xl h-11" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando sesión...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="text-primary hover:underline font-semibold">
                Regístrate como particular
              </Link>{" "}
              o{" "}
              <Link href="/registro-empresa" className="text-primary hover:underline font-semibold">
                solicita alta B2B
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
