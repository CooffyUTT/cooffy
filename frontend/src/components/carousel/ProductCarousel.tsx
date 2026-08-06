"use client"

import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "../menu/ProductCard";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: React.ComponentProps<typeof ProductCard>["product"][];
}

export function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-12">
      {/* Encabezado con título y botones de navegación */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{title}</h2>
          {subtitle && (
            <p className="text-xs text-on-surface-variant mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Botones de navegación (visibles desde sm en adelante) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollPrev}
            className="h-9 w-9 rounded-full border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollNext}
            className="h-9 w-9 rounded-full border-border"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Viewport del Carrusel */}
      <div className="overflow-hidden -mx-4 px-4 md:mx-0 md:px-0" ref={emblaRef}>
        <div className="flex gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}