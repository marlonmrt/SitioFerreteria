import { getImportBatches } from "@/lib/db/queries";
import { ImportPanel } from "@/components/admin/import-panel";
import { importBatches } from "@/lib/db/schema";

export const revalidate = 0;

export default async function AdminImportPage() {
  const initialBatches = await getImportBatches(50);

  // Mapear los datos de base de datos a los tipos requeridos por el componente
  const mappedBatches = initialBatches.map((batch: typeof importBatches.$inferSelect) => ({
    id: batch.id,
    fileName: batch.fileName,
    type: batch.type,
    startedAt: batch.startedAt,
    finishedAt: batch.finishedAt,
    status: batch.status,
    totalRows: batch.totalRows,
    successRows: batch.successRows,
    errorRows: batch.errorRows,
    errorLog: batch.errorLog
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Sincronización de Catálogo (ERP)
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sube ficheros CSV o Excel para sincronizar artículos, familias, subfamilias y precios.
          </p>
        </div>

        <ImportPanel initialBatches={mappedBatches} />
      </div>
    </div>
  );
}
