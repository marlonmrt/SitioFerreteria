"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { toggleFavoriteAction } from "@/lib/actions/catalog";

type ProductCardProps = {
  article: {
    id: string;
    erpCode: string;
    name: string;
    slug: string;
    brand: string | null;
    unit: string;
    mainImage: string | null;
    publicPrice: string | null;
    publicCurrency: string | null;
    b2bPrice?: string | null;
    b2bCurrency?: string | null;
    hasOffer?: boolean;
    offerPercentage?: number;
    offerTarget?: string;
  };
  isLoggedIn: boolean;
  initialIsFavorited: boolean;
  b2bTariffName?: string | null;
};

export function ProductCard({
  article,
  isLoggedIn,
  initialIsFavorited,
  b2bTariffName
}: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();
  const [imgSrc, setImgSrc] = useState(article.mainImage || "/images/placeholder.jpg");

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Inicie sesión", {
        description: "Debe iniciar sesión para guardar favoritos."
      });
      return;
    }

    startTransition(async () => {
      const res = await toggleFavoriteAction(article.id);
      if (res.error) {
        toast.error("Error", { description: res.error });
      } else {
        setIsFavorited(res.isFavorited || false);
        if (res.isFavorited) {
          toast.success("Añadido a favoritos", {
            description: `${article.name} se ha guardado en sus favoritos.`
          });
        } else {
          toast.info("Eliminado de favoritos", {
            description: `${article.name} se ha quitado de sus favoritos.`
          });
        }
      }
    });
  };

  const isB2bUser = !!b2bTariffName && b2bTariffName !== "PUBLIC";

  // Determinar si hay una oferta explícita activa para el destinatario correspondiente
  const isOfferActive =
    !!article.hasOffer &&
    ((article.offerTarget === "B2C" && !isB2bUser) ||
      (article.offerTarget === "B2B" && isB2bUser));

  const offerDiscount = isOfferActive ? article.offerPercentage || 0 : 0;

  // Precios base antes de la oferta
  const basePublicPrice = article.publicPrice ? parseFloat(article.publicPrice) : 0;
  const baseB2bPrice = article.b2bPrice ? parseFloat(article.b2bPrice) : 0;

  // Precios con oferta aplicada
  const finalPublicPrice = isOfferActive && article.offerTarget === "B2C"
    ? basePublicPrice * (1 - offerDiscount / 100)
    : basePublicPrice;

  const finalB2bPrice = isOfferActive && article.offerTarget === "B2B"
    ? baseB2bPrice * (1 - offerDiscount / 100)
    : baseB2bPrice;

  const hasDiscount = isB2bUser
    ? (baseB2bPrice > 0 && basePublicPrice > 0 && (baseB2bPrice < basePublicPrice || isOfferActive))
    : isOfferActive;

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      {/* Imagen del Artículo */}
      <Link href={`/articulos/${article.slug}`} className="relative aspect-square block w-full overflow-hidden bg-muted/40 border-b border-border/50">
        <Image
          src={imgSrc}
          alt={article.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgSrc("/images/placeholder.jpg")}
          priority={false}
        />

        {/* Botón Favoritos (Esquina Superior Derecha) */}
        {isLoggedIn && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFavoriteToggle}
            disabled={isPending}
            className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-background/80 border border-border/50 backdrop-blur-sm shadow-sm transition-transform hover:scale-105 focus-visible:ring-primary"
            aria-label={isFavorited ? "Quitar de favoritos" : "Guardar en favoritos"}
          >
            {isPending ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin text-muted-foreground" />
            ) : (
              <Heart
                className={`h-4.5 w-4.5 transition-colors ${
                  isFavorited
                    ? "fill-red-500 stroke-red-500"
                    : "text-muted-foreground group-hover/btn:text-foreground"
                }`}
              />
            )}
          </Button>
        )}

        {/* Oferta Badge */}
        {isOfferActive && (
          <Badge className="absolute left-3 top-3 z-10 rounded-lg bg-emerald-500 text-white font-bold text-xs tracking-wide px-2.5 py-1.5 shadow-sm uppercase border-0">
            Oferta -{offerDiscount}%
          </Badge>
        )}

        {/* Marca Badge */}
        {article.brand && (
          <Badge
            variant="secondary"
            className="absolute left-3 bottom-3 rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm text-xs font-medium"
          >
            {article.brand}
          </Badge>
        )}
      </Link>

      {/* Información del Artículo */}
      <CardHeader className="p-4 pb-0 flex flex-col gap-1.5">
        <span className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
          Ref: {article.erpCode}
        </span>
        <CardContent className="p-0">
          <Link href={`/articulos/${article.slug}`}>
            <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors text-base">
              {article.name}
            </h3>
          </Link>
        </CardContent>
      </CardHeader>

      {/* Precios y Footer */}
      <CardFooter className="mt-auto p-4 pt-3 flex flex-col items-start gap-3 border-t border-border/30 bg-muted/10">
        <div className="w-full flex flex-wrap items-baseline gap-2">
          {/* Si tiene descuento / Tarifa B2B u Oferta activa */}
          {hasDiscount ? (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-primary">
                  {(isB2bUser ? finalB2bPrice : finalPublicPrice).toFixed(2)} {article.b2bCurrency || article.publicCurrency || "EUR"}
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1 border-primary/30 text-primary bg-primary/5">
                  {isOfferActive ? `Oferta -${offerDiscount}%` : `Tarifa ${b2bTariffName || "B2B"}`}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground/80 line-through">
                Antes: {(isB2bUser && isOfferActive ? baseB2bPrice : basePublicPrice).toFixed(2)} {article.publicCurrency || "EUR"}
              </span>
            </div>
          ) : (
            // Precio Público General
            <span className="text-xl font-bold text-foreground">
              {article.publicPrice
                ? `${finalPublicPrice.toFixed(2)} ${article.publicCurrency || "EUR"}`
                : "Consultar precio"}
            </span>
          )}
          <span className="text-xs text-muted-foreground/70">/ {article.unit}</span>
        </div>

        <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs font-medium">
          <Link href={`/articulos/${article.slug}`}>Ver ficha técnica</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
