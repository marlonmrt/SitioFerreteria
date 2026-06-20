"use client";

import { useState } from "react";
import Image from "next/image";
import { Tag } from "lucide-react";

type GalleryImage = {
  id: string;
  url: string;
  sortOrder: number;
};

type ProductGalleryProps = {
  mainImage: string | null;
  images: GalleryImage[];
  name: string;
};

export function ProductGallery({ mainImage, images, name }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(
    mainImage || (images.length > 0 ? images[0].url : null)
  );

  // Combinar imagen principal con imágenes adicionales si es necesario
  // En la base de datos, la imagen principal a veces ya está en articleImages o no.
  // Nos aseguramos de tener un listado único de urls.
  const allUrls = Array.from(
    new Set([
      ...(mainImage ? [mainImage] : []),
      ...images.map((img) => img.url)
    ])
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Imagen Grande Activa */}
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm flex items-center justify-center">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-all duration-300"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/30 to-muted/80 text-muted-foreground">
            <Tag className="h-16 w-16 stroke-[1.2]" />
          </div>
        )}
      </div>

      {/* Miniaturas de Selección */}
      {allUrls.length > 1 && (
        <div className="flex flex-wrap gap-2.5">
          {allUrls.map((url, idx) => {
            const isActive = activeImage === url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(url)}
                className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-primary shadow-sm scale-102"
                    : "border-border/60 hover:border-muted-foreground/50"
                }`}
              >
                <Image
                  src={url}
                  alt={`${name} thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
