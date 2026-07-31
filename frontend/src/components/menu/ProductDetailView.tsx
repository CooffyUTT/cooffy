"use client"

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Loader2, AlertCircle, ShoppingCart, Check } from "lucide-react";
import { useProduct } from "@/hooks/useProduct";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Header from "./Header";
import ProductCard from "./ProductCard";

interface ProductDetailViewProps {
  productId: number;
}

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const { data: product, isLoading, error } = useProduct(productId);
  const { data: allProducts } = useProducts(
    undefined,
    undefined,
    product?.category?.id
  );

  const handleAdd = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Productos de la misma categoría (excluye el actual, toma max 3)
  const relatedProducts = (allProducts ?? [])
    .filter((p) => p.id !== productId)
    .slice(0, 3);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 pt-20">
          <AlertCircle className="h-12 w-12 text-error" />
          <p className="text-on-surface font-medium text-lg">No se pudo cargar el producto</p>
          <Link href="/menu">
            <Button variant="outline">Volver al menú</Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="pt-20 md:pt-28">
        {/* Breadcrumbs */}
        <nav className="max-w-[1100px] mx-auto px-4 md:px-10 pt-6 pb-2">
        <ol className="flex items-center gap-1.5 text-sm text-on-surface-variant">
          <li>
            <Link href="/menu" className="hover:text-primary transition-colors">
              Menú
            </Link>
          </li>
          <li><ChevronRight className="h-3.5 w-3.5" /></li>
          {product.category && (
            <>
              <li className="truncate max-w-[150px]">{product.category.name}</li>
              <li><ChevronRight className="h-3.5 w-3.5" /></li>
            </>
          )}
          <li className="text-on-surface font-medium truncate max-w-[200px]">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-[1100px] mx-auto px-4 md:px-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          {/* Columna izquierda: Imagen */}
          <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container-low">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                Foto próximamente
              </div>
            )}
          </div>

          {/* Columna derecha: Info */}
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
            </div>

            {product.description && (
              <p className="text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Modificadores / Ingredientes */}
            {product.modifiers && product.modifiers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
                  Disponibles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.modifiers.map((mod) => (
                    <span
                      key={mod}
                      className="text-sm bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Botón agregar */}
            <Button
              onClick={handleAdd}
              className="w-full h-12 rounded-xl font-semibold text-base flex items-center justify-center gap-2"
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" /> Agregado al carrito
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" /> Agregar al carrito
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-on-surface mb-5">También te puede gustar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      </div>
    </>
  );
}
