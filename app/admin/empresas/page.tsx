import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPendingB2bRequests } from "@/lib/db/queries";
import { CompanyApprovalList } from "@/components/admin/company-approval-list";

export const revalidate = 0;

export default async function AdminCompaniesPage() {
  const session = await auth();

  if (
    !session?.user ||
    (session.user as { type?: string }).type !== "ADMIN"
  ) {
    redirect("/login");
  }

  const pendingRequests = await getPendingB2bRequests();

  // Mapear solicitudes a objetos planos compatibles con el componente de cliente
  const mappedRequests = pendingRequests.map((request) => ({
    id: request.id,
    name: request.name,
    email: request.email,
    createdAt: request.createdAt,
    company: request.company
      ? {
          id: request.company.id,
          legalName: request.company.legalName,
          taxId: request.company.taxId,
          contactPhone: request.company.contactPhone
        }
      : null
  }));

  const adminId = (session.user as { id?: string }).id as string;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Aprobación de Empresas B2B
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Revisa las solicitudes de registro comercial pendientes de verificación e impón su tarifa comercial correspondiente.
          </p>
        </div>

        <CompanyApprovalList initialRequests={mappedRequests} adminId={adminId} />
      </div>
    </div>
  );
}
