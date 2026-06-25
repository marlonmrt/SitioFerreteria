"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Check, X, Building2, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { approveB2bAction, rejectB2bAction } from "@/lib/actions/auth";

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  company: {
    id: string;
    legalName: string;
    taxId: string;
    contactPhone: string;
  } | null;
}

interface CompanyApprovalListProps {
  initialRequests: PendingRequest[];
  adminId: string;
}

export function CompanyApprovalList({ initialRequests, adminId }: CompanyApprovalListProps) {
  const [requests, setRequests] = useState<PendingRequest[]>(initialRequests);
  const [tariffs, setTariffs] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTariffChange = (userId: string, value: string) => {
    setTariffs((prev) => ({ ...prev, [userId]: value }));
  };

  const handleApprove = (userId: string) => {
    const tariff = tariffs[userId] || "PRO_01";
    setProcessingId(userId);

    startTransition(async () => {
      try {
        const result = await approveB2bAction(userId, tariff, adminId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Empresa aprobada con éxito");
          setRequests((prev) => prev.filter((r) => r.id !== userId));
        }
      } catch {
        toast.error("Ocurrió un error al aprobar la empresa");
      } finally {
        setProcessingId(null);
      }
    });
  };

  const handleReject = (userId: string) => {
    setProcessingId(userId);

    startTransition(async () => {
      try {
        const result = await rejectB2bAction(userId);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Solicitud rechazada");
          setRequests((prev) => prev.filter((r) => r.id !== userId));
        }
      } catch {
        toast.error("Ocurrió un error al rechazar la solicitud");
      } finally {
        setProcessingId(null);
      }
    });
  };

  if (requests.length === 0) {
    return (
      <Card className=" border-border/70 bg-card p-12 text-center shadow-soft">
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">Todo al día</h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            No hay solicitudes pendientes de registro B2B en este momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className=" border-border/70 bg-card shadow-soft">
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-t-[2rem]">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Contacto</TableHead>
                <TableHead>Empresa / CIF</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Asignar Tarifa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="flex items-start gap-2.5">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{request.name}</span>
                        <span className="text-xs text-muted-foreground">{request.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.company ? (
                      <div className="flex items-start gap-2.5">
                        <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{request.company.legalName}</span>
                          <span className="text-xs font-mono text-muted-foreground uppercase">
                            {request.company.taxId}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium">Sin empresa</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {request.company ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {request.company.contactPhone}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue="PRO_01"
                      onValueChange={(val) => handleTariffChange(request.id, val)}
                      disabled={processingId === request.id}
                    >
                      <SelectTrigger className="w-[140px] ">
                        <SelectValue placeholder="Tarifa" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem value="PRO_01">PRO_01 (General)</SelectItem>
                        <SelectItem value="PRO_02">PRO_02 (Gran Cuenta)</SelectItem>
                        <SelectItem value="PRO_03">PRO_03 (Especial)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleApprove(request.id)}
                        disabled={processingId === request.id}
                        className=" text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600"
                        title="Aprobar"
                      >
                        {processingId === request.id && isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        <span className="ml-1.5 hidden sm:inline">Aprobar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReject(request.id)}
                        disabled={processingId === request.id}
                        className=" text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Rechazar"
                      >
                        <X className="h-4 w-4" />
                        <span className="ml-1.5 hidden sm:inline">Rechazar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
