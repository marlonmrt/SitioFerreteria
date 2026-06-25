"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Slide {
  gradient: string;
  title: string;
  subtitle: string;
  cta?: { label: string; href: string };
  backgroundImage?: string;
}

interface HeroCarouselProps {
  slides: Slide[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  useEffect(() => {
    const interval = setInterval(goNext, 6000);
    return () => clearInterval(interval);
  }, [goNext]);

  if (slides.length === 0) return null;

  return (
    <section className="relative overflow-hidden  border border-border/70 bg-card shadow-soft">
      <div className="relative h-[400px] w-full sm:h-[480px] lg:h-[520px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              index === current ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            {/* Imagen de fondo (si existe) */}
            {slide.backgroundImage && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.backgroundImage})` }}
              />
            )}

            {/* Gradiente superpuesto: semitransparente si hay imagen, opaco si no */}
            <div
              className={cn(
                "absolute inset-0",
                slide.gradient,
                slide.backgroundImage && "opacity-60"
              )}
            />

            {/* Grid decorativo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_40%)]" />

            {/* Contenido */}
            <div className="absolute inset-0 flex items-center">
              <div className="px-6 sm:px-10 lg:px-14 max-w-2xl">
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
                  {slide.title}
                </h1>
                <p className="mt-4 text-base leading-7 text-white/80 sm:text-lg max-w-xl">
                  {slide.subtitle}
                </p>
                {slide.cta && (
                  <Button
                    asChild
                    size="lg"
                    className="mt-6  px-6 bg-white text-foreground hover:bg-white/90"
                  >
                    <Link href={slide.cta.href}>{slide.cta.label}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Flechas */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors z-10"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 transition-colors z-10"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === current
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Ir a slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
