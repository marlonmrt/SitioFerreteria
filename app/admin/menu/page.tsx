import { getAllMenuItems } from "@/lib/db/queries/menu";
import { db } from "@/lib/db";
import MenuClient from "./menu-client";

export const metadata = {
  title: "Gestión de Menú"
};

export default async function AdminMenuPage() {
  const items = await getAllMenuItems();
  const families = await db.query.families.findMany({
    orderBy: (f, { asc }) => [asc(f.name)]
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Menú de Navegación
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configura los enlaces dinámicos que se muestran en la cabecera principal del sitio web.
        </p>
      </div>

      <MenuClient initialItems={items} families={families} />
    </div>
  );
}
