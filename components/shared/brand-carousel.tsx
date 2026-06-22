"use client";

import { useEffect, useState, type ElementType } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight,
  Wrench, Cog, Zap, Bath, Flower2, Fan, Hammer, Shield,
  Tent, Droplets, Lightbulb, Sprout, Fuel, CookingPot,
  Warehouse, Dumbbell, CircuitBoard, Tv, Flame, ToolCase,
  ShoppingBag, Layers, Home, Drill, Paintbrush
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface BrandCarouselProps {
  brands: string[];
}

const brandIconPool: ElementType[] = [
  Wrench, Cog, Zap, Bath, Flower2, Fan, Hammer, Shield,
  Tent, Droplets, Lightbulb, Sprout, Fuel, CookingPot,
  Warehouse, Dumbbell, CircuitBoard, Tv, Flame, ToolCase,
  ShoppingBag, Layers, Home, Drill, Paintbrush
];

function getBrandIcon(name: string, index: number): ElementType {
  const key = name.toLowerCase();
  if (key.includes("icer")) return Cog;
  if (key.includes("air") || key.includes("vent")) return Fan;
  if (key.includes("benotti") || key.includes("ban") || key.includes("bath")) return Bath;
  if (key.includes("donna") || key.includes("garden") || key.includes("jardin")) return Flower2;
  if (key.includes("fargo") || key.includes("tool")) return ToolCase;
  if (key.includes("sowell")) return Shield;
  if (key.includes("takuma")) return Cog;
  if (key.includes("larry") || key.includes("house")) return Home;
  if (key.includes("pamacon")) return Wrench;
  if (key.includes("momi")) return ShoppingBag;
  if (key.includes("athansport") || key.includes("sport") || key.includes("auto")) return Fuel;
  if (key.includes("volten")) return Zap;
  if (key.includes("nodofix") || key.includes("fix")) return Hammer;
  if (key.includes("electr")) return Zap;
  if (key.includes("ilumin") || key.includes("led")) return Lightbulb;
  if (key.includes("maquin") || key.includes("machine")) return Cog;
  if (key.includes("agricult") || key.includes("campo")) return Sprout;
  if (key.includes("camp") || key.includes("gas")) return Tent;
  if (key.includes("fontan") || key.includes("agua")) return Droplets;
  if (key.includes("cocin") || key.includes("cook")) return CookingPot;
  if (key.includes("muebl")) return Warehouse;
  if (key.includes("jardin")) return Flower2;
  if (key.includes("hostel") || key.includes("bar")) return CookingPot;
  if (key.includes("deport") || key.includes("ocio")) return Dumbbell;
  if (key.includes("electrodom") || key.includes("hogar")) return Home;
  if (key.includes("inform") || key.includes("electron")) return CircuitBoard;
  if (key.includes("sold") || key.includes("solder")) return Flame;
  return brandIconPool[index % brandIconPool.length];
}

const brandGradients = [
  "from-blue-600 to-blue-800",
  "from-emerald-600 to-teal-800",
  "from-orange-600 to-red-700",
  "from-purple-600 to-violet-800",
  "from-rose-600 to-pink-800",
  "from-cyan-600 to-sky-800",
  "from-amber-600 to-yellow-800",
  "from-lime-600 to-green-800",
  "from-indigo-600 to-blue-900",
  "from-red-600 to-rose-800",
  "from-teal-600 to-emerald-800",
  "from-fuchsia-600 to-purple-800"
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
            const Icon = getBrandIcon(brand, index);
            const gradient = brandGradients[index % brandGradients.length];
            return (
              <Link
                key={brand}
                href={`/buscar?q=${encodeURIComponent(brand)}`}
                className="snap-start shrink-0"
              >
                <div
                  className={`flex flex-col items-center justify-center gap-3 h-28 w-40 rounded-2xl bg-gradient-to-br ${gradient} shadow-sm transition-transform hover:scale-105 hover:shadow-md`}
                >
                  <Icon className="h-8 w-8 text-white/90" strokeWidth={1.5} />
                  <span className="text-white font-bold text-sm tracking-wide px-3 text-center leading-tight">
                    {brand}
                  </span>
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
