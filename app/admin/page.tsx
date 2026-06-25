import Link from "next/link";
import {
  Package,
  Building,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAdminMetrics, getAdminInfoRequests } from "@/lib/db/queries/admin";

export const metadata = {
  title: "Admin Dashboard | Sitio Ferretería",
  description: "Resumen métrico de la tienda y estado del catálogo."
};

export default async function AdminDashboardPage() {
  const { activeArticlesCount, pendingB2bCount, newInfoCount, lastImport } =
    await getAdminMetrics();

  // Obtener las últimas 5 consultas de clientes en estado NEW
  const lastInquiries = (await getAdminInfoRequests("NEW")).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumen métrico general del catálogo y de las operaciones de clientes.
        </p>
      </div>

      {/* Grid de Tarjetas de Métricas */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Artículos Activos */}
        <Card className=" border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Artículos Activos
            </span>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeArticlesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Disponibles en la zona pública del catálogo.
            </p>
          </CardContent>
        </Card>

        {/* Solicitudes B2B */}
        <Card className={` border-border/70 shadow-sm ${pendingB2bCount > 0 ? "border-amber-300 bg-amber-500/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Solicitudes B2B Pendientes
            </span>
            <Building className={`h-5 w-5 ${pendingB2bCount > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingB2bCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingB2bCount > 0
                ? "Requieren revisión de CIF y activación de tarifa."
                : "No hay solicitudes pendientes de validación."}
            </p>
            {pendingB2bCount > 0 && (
              <Button asChild size="sm" variant="link" className="p-0 h-auto mt-2 text-xs font-semibold text-amber-600">
                <Link href="/admin/empresas" className="flex items-center gap-1">
                  Revisar cola de aprobación <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Consultas Nuevas */}
        <Card className={` border-border/70 shadow-sm ${newInfoCount > 0 ? "border-primary/30 bg-primary/5" : ""}`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Consultas Nuevas
            </span>
            <Mail className={`h-5 w-5 ${newInfoCount > 0 ? "text-primary" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{newInfoCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {newInfoCount > 0
                ? "Mensajes de clientes solicitando presupuestos."
                : "Todas las consultas han sido atendidas."}
            </p>
            {newInfoCount > 0 && (
              <Button asChild size="sm" variant="link" className="p-0 h-auto mt-2 text-xs font-semibold text-primary">
                <Link href="/admin/solicitudes" className="flex items-center gap-1">
                  Ver solicitudes <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Última Sincronización ERP */}
        <Card className=" border-border/70 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Última Sincronización ERP</CardTitle>
            <CardDescription>Detalles del lote de importación más reciente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastImport ? (
              <div className="space-y-4">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {lastImport.status === "SUCCESS" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : lastImport.status === "PENDING" ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-semibold text-sm">
                      {lastImport.status === "SUCCESS"
                        ? "Importación Exitosa"
                        : lastImport.status === "PENDING"
                          ? "Sincronizando..."
                          : "Error en Importación"}
                    </span>
                  </div>
                  <Badge
                    variant={lastImport.status === "SUCCESS" ? "secondary" : "outline"}
                    className={lastImport.status === "SUCCESS" ? "" : "text-destructive border-destructive/35 bg-destructive/5"}
                  >
                    {lastImport.type}
                  </Badge>
                </div>

                <Separator />

                {/* Info Block */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block font-medium">Nombre de archivo</span>
                    <span className="font-mono mt-0.5 block">{lastImport.fileName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Fecha de inicio</span>
                    <span className="mt-0.5 block">{lastImport.startedAt.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Filas procesadas</span>
                    <span className="mt-0.5 block font-bold text-foreground">
                      {lastImport.totalRows}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Correctas / Con error</span>
                    <span className="mt-0.5 block font-bold text-foreground">
                      <span className="text-emerald-600">{lastImport.successRows}</span> /{" "}
                      <span className={lastImport.errorRows > 0 ? "text-red-500" : "text-muted-foreground"}>
                        {lastImport.errorRows}
                      </span>
                    </span>
                  </div>
                </div>

                {lastImport.status === "ERROR" && (
                  <div className=" border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div>
                      Se detectaron fallos de parseo o integridad en el archivo. Revise los registros de error en el panel de importaciones.
                    </div>
                  </div>
                )}

                <Button asChild variant="outline" className="w-full ">
                  <Link href="/admin/importaciones">Historial completo</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground text-sm">
                <Clock className="h-8 w-8 text-muted-foreground/60 mb-2 stroke-[1.2]" />
                No se registra ninguna sincronización previa en el sistema.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultas Pendientes de Clientes */}
        <Card className=" border-border/70 shadow-sm flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Últimas Consultas de Clientes</CardTitle>
            <CardDescription>Fichas de información pendientes de respuesta.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            {lastInquiries.length > 0 ? (
              <div className="space-y-3.5 flex-1">
                {lastInquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="flex flex-col gap-1.5 p-3.5 border border-border/50 bg-muted/5  text-xs hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        {inquiry.name}
                      </span>
                      <span className="text-muted-foreground text-[10px] flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {inquiry.createdAt.toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-muted-foreground line-clamp-1">{inquiry.message}</p>

                    {inquiry.articleName && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-primary">
                        <Package className="h-3 w-3" />
                        <span className="font-medium line-clamp-1">
                          {inquiry.articleName} ({inquiry.articleErpCode})
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                <Button asChild variant="outline" className="w-full  mt-auto">
                  <Link href="/admin/solicitudes">Gestionar consultas</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground text-sm flex-grow">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2 stroke-[1.2]" />
                No hay nuevas solicitudes de información de clientes pendientes.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
