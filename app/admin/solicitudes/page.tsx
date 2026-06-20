import Link from "next/link";
import { Mail } from "lucide-react";

import { getAdminInfoRequests } from "@/lib/db/queries/admin";
import { InfoRequestsList } from "@/components/admin/info-requests-list";

interface SolicitudesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export const metadata = {
  title: "Consultas de Clientes | Admin",
  description: "Bandeja de entrada para solicitudes de presupuestos e información."
};

export default async function SolicitudesPage({ searchParams }: SolicitudesPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeStatus = resolvedSearchParams.status as "NEW" | "ATTENDED" | undefined;

  // Cargar solicitudes basadas en filtros
  const requests = await getAdminInfoRequests(activeStatus);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <Mail className="h-7 w-7 text-primary" />
          Consultas de Clientes
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Lista de consultas y solicitudes de presupuestos recibidas de la zona de storefront.
        </p>
      </div>

      {/* Tabs Filtros */}
      <div className="flex border-b border-border/60">
        <Link
          href="/admin/solicitudes"
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            !activeStatus
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Todas
        </Link>
        <Link
          href="/admin/solicitudes?status=NEW"
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeStatus === "NEW"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Nuevas
        </Link>
        <Link
          href="/admin/solicitudes?status=ATTENDED"
          className={`px-6 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeStatus === "ATTENDED"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Atendidas
        </Link>
      </div>

      {/* Listado Principal */}
      <InfoRequestsList requests={requests} />
    </div>
  );
}
