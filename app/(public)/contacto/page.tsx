
import { getStores } from "@/lib/db/queries/catalog";
import ContactoForm from "./contacto-form";

export const metadata = {
  title: "Contacto",
  description: "Ponte en contacto con Sitio Ferretería. Envíanos tu consulta sobre stock, precios o presupuestos."
};

export default async function ContactoPage() {
  const storesList = await getStores();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <ContactoForm stores={storesList} />
    </div>
  );
}
