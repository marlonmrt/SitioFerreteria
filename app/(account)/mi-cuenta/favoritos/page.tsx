import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { ProductCard } from "@/components/catalog/product-card";
import { getFavorites, getFavoriteIds } from "@/lib/db/queries/catalog";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Mis Favoritos | Sitio Ferretería",
  description: "Artículos guardados en sus favoritos."
};

export default async function B2cFavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const favoritesList = await getFavorites(userId, "PUBLIC");
  const favoriteIds = new Set(await getFavoriteIds(userId));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl flex items-center gap-3">
            <Heart className="h-7 w-7 text-red-500 fill-red-500" />
            Mis Favoritos
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Particular (B2C) — Accede rápido a tus productos de interés.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al catálogo
          </Link>
        </Button>
      </div>

      {favoritesList.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {favoritesList.map((article) => (
            <ProductCard
              key={article.id}
              article={article}
              isLoggedIn={true}
              initialIsFavorited={favoriteIds.has(article.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 p-16 text-center bg-card shadow-sm">
          <Heart className="h-12 w-12 text-muted-foreground/60 stroke-[1.2] mb-3" />
          <h3 className="text-lg font-medium text-foreground">Tu lista está vacía</h3>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-sm">
            No tienes ningún artículo guardado en favoritos. Explora el catálogo y haz clic en el corazón para guardarlos.
          </p>
        </div>
      )}
    </div>
  );
}
