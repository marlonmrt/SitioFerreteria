import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Shield } from "lucide-react";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { InfoRequestForm } from "@/components/catalog/info-request-form";
import { getArticleBySlug, getStores } from "@/lib/db/queries/catalog";
import { getCompanyPriceListCode } from "@/lib/db/queries/company";
import { db } from "@/lib/db";
import { subfamilies } from "@/lib/db/schema";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artículo no encontrado"
    };
  }

  return {
    title: `${article.name} | Catálogo de Ferretería`,
    description: article.description || `Ficha técnica de ${article.name}. Consulte disponibilidad y solicite presupuesto.`
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const session = await auth();
  const user = session?.user as { id?: string; type?: string; status?: string; companyId?: string | null } | undefined;
  const isLoggedIn = !!user;

  // Resolver tarifa B2B
  let priceListCode = "PUBLIC";
  if (user?.type === "B2B" && user.status === "ACTIVE" && user.companyId) {
    priceListCode = await getCompanyPriceListCode(user.companyId);
  }

  // Volver a consultar precios específicos para la vista detallada
  const detailedArticle = await getArticleBySlug(slug, priceListCode);
  if (!detailedArticle) {
    notFound();
  }

  // Cargar tiendas físicas
  const storesList = await getStores();

  // Resolver subfamilia y familia para breadcrumbs
  const subfamily = article.subfamilyId
    ? await db.query.subfamilies.findFirst({
        where: eq(subfamilies.id, article.subfamilyId),
        with: { family: true }
      })
    : null;

  const family = subfamily?.family;

  const hasDiscount =
    detailedArticle.b2bPrice &&
    detailedArticle.publicPrice &&
    parseFloat(detailedArticle.b2bPrice.price) < parseFloat(detailedArticle.publicPrice.price);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="h-3 w-3" />
          Inicio
        </Link>
        {family && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/familias/${family.slug}`} className="hover:text-foreground transition-colors">
              {family.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium line-clamp-1">{article.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galería de Imágenes (Columna Izquierda) */}
        <div>
          <ProductGallery
            mainImage={article.mainImage}
            images={detailedArticle.images}
            name={article.name}
          />
        </div>

        {/* Detalles del Producto (Columna Derecha) */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-lg font-mono text-xs uppercase tracking-wider">
                Ref: {article.erpCode}
              </Badge>
              {article.brand && (
                <Badge variant="outline" className="rounded-lg font-medium text-xs">
                  {article.brand}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {article.name}
            </h1>
          </div>

          <Separator className="my-6" />

          {/* Bloque de Precios */}
          <div className="rounded-2xl border border-border/60 bg-muted/15 p-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Precio del catálogo
              </span>
              <div className="flex items-baseline gap-2">
                {hasDiscount ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-extrabold text-primary">
                        {parseFloat(detailedArticle.b2bPrice!.price).toFixed(2)} €
                      </span>
                      <Badge variant="outline" className="text-xs uppercase font-bold tracking-wider py-0.5 px-1.5 border-primary/30 text-primary bg-primary/5">
                        Tarifa Profesional ({priceListCode})
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground/80">
                      PVP de venta al público: <span className="line-through">{parseFloat(detailedArticle.publicPrice!.price).toFixed(2)} €</span>
                    </p>
                  </div>
                ) : (
                  <span className="text-3xl font-extrabold text-foreground">
                    {detailedArticle.publicPrice
                      ? `${parseFloat(detailedArticle.publicPrice.price).toFixed(2)} €`
                      : "Consultar en tienda"}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">/ {article.unit}</span>
              </div>
              <p className="text-xs text-muted-foreground/80 mt-1">
                * Todos los precios son orientativos y están sujetos a confirmación de stock.
              </p>
            </div>
          </div>

          {/* Aviso B2B si no está logueado */}
          {!isLoggedIn && (
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5">
              <Shield className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                ¿Eres profesional o empresa?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  Inicia sesión
                </Link>{" "}
                o{" "}
                <Link href="/registro-empresa" className="text-primary font-semibold hover:underline">
                  solicita una cuenta B2B
                </Link>{" "}
                para acceder a tus tarifas especiales y descuentos asignados.
              </div>
            </div>
          )}

          {/* Formulario / CTA */}
          <div className="mt-8 space-y-4">
            <InfoRequestForm
              articleId={article.id}
              articleName={article.name}
              articleErpCode={article.erpCode}
              stores={storesList}
              session={session}
            />
            <p className="text-xs text-center text-muted-foreground">
              Las consultas son gratuitas y sin compromiso de compra.
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas de Detalle (Tabs) */}
      <section className="mt-12">
        <Tabs defaultValue="descripcion" className="w-full">
          <TabsList className="w-full justify-start border-b border-border/60 bg-transparent p-0 rounded-none h-auto">
            <TabsTrigger
              value="descripcion"
              className="border-b-2 border-transparent px-6 py-3 rounded-none bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium"
            >
              Descripción
            </TabsTrigger>
            <TabsTrigger
              value="tecnica"
              className="border-b-2 border-transparent px-6 py-3 rounded-none bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium"
            >
              Ficha Técnica
            </TabsTrigger>
          </TabsList>
          <TabsContent value="descripcion" className="pt-6 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {article.description ? (
              <p className="whitespace-pre-line">{article.description}</p>
            ) : (
              <p className="italic">No hay descripción disponible para este artículo.</p>
            )}
          </TabsContent>
          <TabsContent value="tecnica" className="pt-6">
            <div className="max-w-md rounded-2xl border border-border bg-card overflow-hidden text-sm">
              <div className="grid grid-cols-2 p-3 border-b border-border bg-muted/10">
                <span className="font-medium text-muted-foreground">Código ERP</span>
                <span className="font-mono font-semibold">{article.erpCode}</span>
              </div>
              <div className="grid grid-cols-2 p-3 border-b border-border">
                <span className="font-medium text-muted-foreground">Marca</span>
                <span>{article.brand || "Genérica"}</span>
              </div>
              <div className="grid grid-cols-2 p-3 border-b border-border bg-muted/10">
                <span className="font-medium text-muted-foreground">Unidad de medida</span>
                <span>{article.unit}</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="font-medium text-muted-foreground">Familia / Categoría</span>
                <span>{family?.name || "Sin categorizar"}</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
