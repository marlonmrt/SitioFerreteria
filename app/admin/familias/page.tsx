import { asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { families, subfamilies } from "@/lib/db/schema";
import FamiliasClient from "./familias-client";

export const revalidate = 0;

export default async function AdminFamiliasPage() {
  const familiesList = await db.query.families.findMany({
    orderBy: [asc(families.sortOrder)]
  });

  const subfamiliesList = await db.query.subfamilies.findMany({
    orderBy: [asc(subfamilies.sortOrder)]
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Categorías y Familias
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona las Familias y Subfamilias del catálogo. Los registros creados a mano son editables y no se sobrescriben con la importación ERP.
          </p>
        </div>

        <FamiliasClient initialFamilies={familiesList} initialSubfamilies={subfamiliesList} />
      </div>
    </div>
  );
}
