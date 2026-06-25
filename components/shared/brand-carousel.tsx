"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface BrandCarouselProps {
  brands: string[];
}

function BrandImage({ logo, brand }: { logo: string; brand: string }) {
  const [ext, setExt] = useState<string | null>("svg");
  if (!ext) return null;
  return (
    <img
      src={`/images/brands/${logo}.${ext}`}
      alt={brand}
      className="h-12 w-auto max-w-[120px] object-contain relative"
      loading="lazy"
      onError={() => setExt(ext === "svg" ? "jpg" : null)}
    />
  );
}

function brandSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function brandLogoPath(name: string): string {
  const map: Record<string, string> = {
    aicer: "aicer",
    airmec: "airmec",
    aquapro: "aquapro",
    athansport: "athansport",
    benotti: "benotti",
    "donna-garden": "donna-garden",
    "fargo-tools": "fargo-tools",
    homelab: "homelab",
    larryhouse: "larryhouse",
    nodofix: "nodofix",
    nordbath: "nordbath",
    pamacon: "pamacon",
    sowell: "sowell",
    volten: "volten"
  };
  return map[brandSlug(name)] || brandSlug(name);
}

const brandAccents = [
  { border: "border-zinc-800" }
];

export default function BrandCarousel({ brands }: BrandCarouselProps) {
  const [scrollPos, setScrollPos] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!container) return;
    const update = () => {
      setMaxScroll(container.scrollWidth - container.clientWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, brands]);

  const scroll = (direction: "left" | "right") => {
    if (!container) return;
    const amount = container.clientWidth * 0.5;
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    if (!container) return;
    const handleScroll = () => setScrollPos(container.scrollLeft);
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [container]);

  if (brands.length === 0) return null;

  return (
    <section>
      <div className="flex flex-col items-center text-center mb-8">
        <Badge variant="secondary" className="rounded-full px-3 py-1">Marcas</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Nuestras Marcas</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm sm:text-base">
          Trabajamos con las mejores marcas del sector.
        </p>
      </div>

      <div className="relative">
        {scrollPos > 10 && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 border border-border shadow-sm backdrop-blur-sm hover:bg-accent transition-colors"
            aria-label="Anterior marcas"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div
          ref={setContainer}
          className="flex gap-4 overflow-x-auto scrollbar-none py-2 px-0.5 snap-x"
        >
          {brands.map((brand, index) => {
            const logo = brandLogoPath(brand);
            const accent = brandAccents[index % brandAccents.length];
            return (
              <Link
                key={brand}
                href={`/buscar?q=${encodeURIComponent(brand)}`}
                className="snap-start shrink-0"
              >
                <div
                  className={`flex flex-col items-center justify-center gap-2 h-28 w-40  border ${accent.border} bg-transparent transition-transform hover:scale-105 overflow-hidden`}
                >
                  <BrandImage logo={logo} brand={brand} />
                </div>
              </Link>
            );
          })}
        </div>

        {scrollPos < maxScroll - 10 && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 border border-border shadow-sm backdrop-blur-sm hover:bg-accent transition-colors"
            aria-label="Siguiente marcas"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </section>
  );
}
