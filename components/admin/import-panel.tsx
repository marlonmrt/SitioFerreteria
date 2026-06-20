"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  UploadCloud,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileSpreadsheet,
  FileCode,
  Calendar,
  Check,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import { refreshBatchesAction, checkBatchStatusAction } from "@/app/admin/importaciones/actions";

// Tipado del historial de importaciones
interface ImportBatch {
  id: string;
  fileName: string;
  type: "CSV" | "XLSX";
  startedAt: Date;
  finishedAt: Date | null;
  status: "PENDING" | "SUCCESS" | "ERROR";
  totalRows: number;
  successRows: number;
  errorRows: number;
  errorLog: string;
}

interface ImportPanelProps {
  initialBatches: ImportBatch[];
}

export function ImportPanel({ initialBatches }: ImportPanelProps) {
  const [batches, setBatches] = useState<ImportBatch[]>(initialBatches);
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"CSV" | "XLSX">("CSV");
  const [uploading, setUploading] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refrescar lista de lotes desde la base de datos
  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const freshBatches = await refreshBatchesAction();
        // Convertir string de fechas a objetos Date reales si es necesario
        const mapped = (freshBatches as unknown as ImportBatch[]).map((b) => ({
          ...b,
          startedAt: new Date(b.startedAt),
          finishedAt: b.finishedAt ? new Date(b.finishedAt) : null
        }));
        setBatches(mapped);
      } catch {
        toast.error("No se pudo refrescar el historial");
      }
    });
  };

  // Efecto para sondear el estado de la importación activa en segundo plano
  useEffect(() => {
    if (!activeBatchId) return;

    const interval = setInterval(async () => {
      try {
        const status = await checkBatchStatusAction(activeBatchId);
        if (status) {
          if (status.status !== "PENDING") {
            clearInterval(interval);
            setActiveBatchId(null);
            handleRefresh();

            if (status.status === "SUCCESS") {
              toast.success("Sincronización completada con éxito");
            } else {
              toast.error("La sincronización finalizó con errores");
            }
          }
        }
      } catch (err) {
        console.error("Error sondeando estado:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeBatchId]);

  // Manejar el envío del archivo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning("Por favor, selecciona un archivo");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", fileType);

    try {
      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fallo en la subida del archivo");
      }

      toast.info("Archivo subido. Procesando en segundo plano...");
      setActiveBatchId(data.batchId);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      handleRefresh();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Error al subir el archivo";
      toast.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      // Autodetectar el tipo por la extensión
      if (selected.name.endsWith(".xlsx")) {
        setFileType("XLSX");
      } else {
        setFileType("CSV");
      }
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
      {/* Columna Izquierda: Panel de Subida */}
      <Card className="rounded-[2rem] border-border/75 bg-card shadow-soft h-fit">
        <CardHeader>
          <CardTitle className="text-xl">Importar catálogo</CardTitle>
          <CardDescription>
            Sube el archivo exportado por el ERP. El catálogo local se sincronizará automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Zona Dropzone */}
            <div
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                file
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/80 bg-background/50 hover:bg-accent/40"
              }`}
            >
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={uploading}
                ref={fileInputRef}
                aria-label="Seleccionar archivo del ERP"
              />
              <UploadCloud className="h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">
                {file ? file.name : "Selecciona o arrastra tu archivo"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Soporta CSV (.csv) y Excel (.xlsx)</p>
            </div>

            {/* Selector de tipo */}
            {file && (
              <div className="flex gap-2 rounded-2xl bg-muted p-1">
                <Button
                  type="button"
                  variant={fileType === "CSV" ? "default" : "ghost"}
                  onClick={() => setFileType("CSV")}
                  className="flex-1 rounded-xl h-9 text-xs"
                >
                  <FileCode className="mr-1.5 h-3.5 w-3.5" /> CSV
                </Button>
                <Button
                  type="button"
                  variant={fileType === "XLSX" ? "default" : "ghost"}
                  onClick={() => setFileType("XLSX")}
                  className="flex-1 rounded-xl h-9 text-xs"
                >
                  <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> Excel
                </Button>
              </div>
            )}

            {/* Botón de envío o indicador de carga */}
            <Button
              type="submit"
              className="w-full rounded-2xl h-11"
              disabled={uploading || !file || activeBatchId !== null}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo archivo...
                </>
              ) : activeBatchId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sincronizando...
                </>
              ) : (
                "Iniciar Importación"
              )}
            </Button>

            {/* Alerta de procesamiento activo */}
            {activeBatchId && (
              <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 p-4 text-amber-500 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>Una sincronización está corriendo en segundo plano. Espera a que finalice.</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Columna Derecha: Historial de Lotes */}
      <Card className="rounded-[2rem] border-border/75 bg-card shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Historial de sincronización</CardTitle>
            <CardDescription>Registro auditado de las importaciones procesadas.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-9 w-9"
            onClick={handleRefresh}
            disabled={isPending}
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Archivo / Tipo</TableHead>
                  <TableHead className="text-center">Filas</TableHead>
                  <TableHead className="text-center">Éxito</TableHead>
                  <TableHead className="text-center">Fallas</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Detalle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No se han realizado importaciones todavía.
                    </TableCell>
                  </TableRow>
                ) : (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {batch.startedAt.toLocaleString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold truncate max-w-[180px]">
                            {batch.fileName}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">
                            {batch.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {batch.totalRows}
                      </TableCell>
                      <TableCell className="text-center text-emerald-500 font-semibold">
                        {batch.successRows}
                      </TableCell>
                      <TableCell className="text-center text-destructive font-semibold">
                        {batch.errorRows}
                      </TableCell>
                      <TableCell className="text-center">
                        {batch.status === "PENDING" && (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-lg">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Procesando
                          </Badge>
                        )}
                        {batch.status === "SUCCESS" && (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg">
                            <Check className="mr-1 h-3 w-3" /> Completado
                          </Badge>
                        )}
                        {batch.status === "ERROR" && (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Error
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {batch.status === "ERROR" ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="rounded-xl text-xs hover:bg-destructive/5 hover:text-destructive">
                                Ver Log
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl rounded-3xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-destructive">
                                  <XCircle className="h-5 w-5" /> Log de errores de importación
                                </DialogTitle>
                                <DialogDescription>
                                  Detalles de las filas que fallaron durante el procesamiento del archivo: {batch.fileName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 max-h-[300px] overflow-y-auto rounded-2xl bg-muted p-4 font-mono text-xs text-muted-foreground space-y-2">
                                {(() => {
                                  try {
                                    const logs = JSON.parse(batch.errorLog);
                                    if (!Array.isArray(logs) || logs.length === 0) {
                                      return <p>No se encontraron detalles de errores.</p>;
                                    }
                                    return logs.map((log: { row: number; reason: string }, idx: number) => (
                                      <div key={idx} className="border-b border-border/60 pb-2 last:border-0 last:pb-0">
                                        <span className="font-semibold text-foreground">Fila {log.row}:</span> {log.reason}
                                      </div>
                                    ));
                                  } catch {
                                    return <p>{batch.errorLog}</p>;
                                  }
                                })()}
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
