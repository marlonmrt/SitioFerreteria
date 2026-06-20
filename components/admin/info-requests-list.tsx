"use client";

import { useState, useTransition } from "react";
import { Calendar, Eye, CheckCircle2, ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toggleInfoRequestStatusAction } from "@/lib/actions/admin";

type InfoRequest = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  createdAt: Date;
  status: "NEW" | "ATTENDED";
  articleName: string | null;
  articleErpCode: string | null;
  storeName: string | null;
};

type InfoRequestsListProps = {
  requests: InfoRequest[];
};

export function InfoRequestsList({ requests }: InfoRequestsListProps) {
  const [selected, setSelected] = useState<InfoRequest | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleStatus = (req: InfoRequest) => {
    startTransition(async () => {
      const res = await toggleInfoRequestStatusAction(req.id, req.status);
      if (res.error) {
        toast.error("Error", { description: res.error });
      } else {
        toast.success("Solicitud actualizada", {
          description: `Se ha marcado la consulta de ${req.name} como ${
            res.status === "ATTENDED" ? "Atendida" : "Nueva"
          }.`
        });
        if (selected?.id === req.id) {
          setSelected({ ...selected, status: res.status as "NEW" | "ATTENDED" });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tabla de Consultas */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Artículo Interés</TableHead>
              <TableHead>Tienda</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/10">
                  <TableCell className="font-medium whitespace-nowrap">
                    {req.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {req.name}
                  </TableCell>
                  <TableCell className="space-y-0.5 text-xs">
                    <div className="text-muted-foreground">{req.email}</div>
                    {req.phone && <div className="text-muted-foreground">{req.phone}</div>}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {req.articleName ? (
                      <span title={`${req.articleName} (${req.articleErpCode})`}>
                        {req.articleName}{" "}
                        <span className="text-xs font-mono text-muted-foreground">
                          ({req.articleErpCode})
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">General</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {req.storeName || "Ninguna"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={req.status === "NEW" ? "default" : "secondary"}>
                      {req.status === "NEW" ? "Nueva" : "Atendida"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg h-8"
                      onClick={() => setSelected(req)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalles
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      className="rounded-lg h-8 text-primary hover:text-primary hover:bg-primary/5"
                      onClick={() => handleToggleStatus(req)}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowLeftRight className="h-4 w-4 mr-1" />
                      )}
                      Atender
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No hay solicitudes de información que coincidan con esta selección.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Dialog para Detalle */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-md rounded-[2rem] p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center justify-between">
                <span>Consulta de {selected.name}</span>
                <Badge variant={selected.status === "NEW" ? "default" : "secondary"}>
                  {selected.status === "NEW" ? "Nueva" : "Atendida"}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                Recibida el {selected.createdAt.toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <Separator className="my-2" />

            <div className="space-y-4 text-sm">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-muted/20 rounded-xl">
                <div>
                  <span className="text-muted-foreground block font-medium">Correo electrónico</span>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline block font-semibold mt-0.5">
                    {selected.email}
                  </a>
                </div>
                {selected.phone && (
                  <div>
                    <span className="text-muted-foreground block font-medium">Teléfono</span>
                    <a href={`tel:${selected.phone}`} className="text-foreground hover:underline block font-semibold mt-0.5">
                      {selected.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Artículo / Tienda vinculada */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Artículo de Interés</span>
                  {selected.articleName ? (
                    <span className="font-semibold block mt-0.5">
                      {selected.articleName} ({selected.articleErpCode})
                    </span>
                  ) : (
                    <span className="italic block mt-0.5 text-muted-foreground">General (Sin artículo)</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Tienda de recogida</span>
                  <span className="font-semibold block mt-0.5">
                    {selected.storeName || "Ninguna"}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Message block */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Mensaje del Cliente
                </span>
                <div className="p-3.5 border border-border bg-card rounded-2xl whitespace-pre-line leading-relaxed text-foreground/90">
                  {selected.message}
                </div>
              </div>

              {/* Action in details */}
              <Button
                type="button"
                disabled={isPending}
                className="w-full rounded-xl py-5"
                onClick={() => handleToggleStatus(selected)}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : selected.status === "NEW" ? (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                )}
                {selected.status === "NEW" ? "Marcar como Atendida" : "Marcar como Nueva"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
