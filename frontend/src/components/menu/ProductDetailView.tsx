"use client"

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Loader2, AlertCircle, ShoppingCart, Check, Minus, Plus, ArrowLeft, X } from "lucide-react";
import { useProduct } from "@/hooks/useProduct";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Header from "./Header";
import { ProductCarousel } from "../carousel/ProductCarousel"; 

interface ProductDetailViewProps {
  productId: number;
}

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const { addToCart, cartTotal } = useCart();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showSummaryNotice, setShowSummaryNotice] = useState(false);

  const { data: product, isLoading, error } = useProduct(productId);
  
  // Obtenemos todos los productos para filtrar similares y venta cruzada
  const { data: allProducts } = useProducts();

  const isAvailable = product?.isAvailable ?? true;

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAdd = () => {
    if (!product || !isAvailable) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    setAdded(true);
    setShowSummaryNotice(true);

    setTimeout(() => setAdded(false), 2000);
    setTimeout(() => setShowSummaryNotice(false), 5000);
  };

  // 1. Productos Similares: Misma categoría, excluyendo el actual
  const similarProducts = (allProducts ?? [])
    .filter((p) => p.category?.id === product?.category?.id && p.id !== productId);

  // 2. Venta Cruzada (Combina con): Categorías distintas a la actual
  const crossSellProducts = (allProducts ?? [])
    .filter((p) => p.category?.id !== product?.category?.id && p.id !== productId);

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
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al menú
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="pt-20 md:pt-24">
        {/* Botón Volver y Breadcrumbs */}
        <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-4 pb-2 flex flex-col gap-3">
          <div>
            <Link href="/menu">
              <Button variant="ghost" size="sm" className="gap-2 text-on-surface-variant hover:text-primary pl-0">
                <ArrowLeft className="h-4 w-4" />
                Volver al menú
              </Button>
            </Link>
          </div>

          <nav>
            {/* 14. Reducir protagonismo del breadcrumb (text-xs) */}
            <ol className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <li>
                <Link href="/menu" className="hover:text-primary transition-colors">
                  Menú
                </Link>
              </li>
              <li><ChevronRight className="h-3 w-3" /></li>
              {product.category && (
                <>
                  <li className="truncate max-w-[150px]">{product.category.name}</li>
                  <li><ChevronRight className="h-3 w-3" /></li>
                </>
              )}
              <li className="text-on-surface font-medium truncate max-w-[200px]">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>

        {/* Contenido principal */}
        <main className="max-w-[1100px] mx-auto px-4 md:px-10 pb-28 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* 11. Columna izquierda: Imagen con sombra, borde, hover y transición suave */}
            <div className="group relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container-low border border-border/60 shadow-md hover:shadow-xl transition-all duration-300">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                  Foto próximamente
                </div>
              )}
            </div>

            {/* 13. Columna derecha: Info (Mayor espaciado entre bloques con gap-8) */}
            <div className="flex flex-col gap-8">
              {/* Bloque Nombre, Precio y Estado */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-3">
                  {product.name}
                </h1>
                
                <div className="flex items-center justify-between mt-2">
                  <p className="text-3xl font-extrabold text-primary tracking-tight">
                    ${product.price.toFixed(2)}
                  </p>

                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    {isAvailable ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        🟢 Disponible
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                        🔴 Agotado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 12. Encapsular la descripción en un bloque visual */}
              {product.description && (
                <div className="bg-surface-container-lowest/60 border border-border/60 rounded-xl p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Descripción
                  </h3>
                  <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Modificadores / Ingredientes */}
              {product.modifiers && product.modifiers.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                    Ingredientes / Disponibles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.modifiers.map((mod) => (
                      <span
                        key={mod}
                        className="text-sm bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full border border-border/40"
                      >
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de cantidad y Botón Agregar */}
              <div className="space-y-4 pt-2">
                {isAvailable && (
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                      Cantidad
                    </label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleDecreaseQuantity}
                        disabled={quantity <= 1}
                        className="h-12 w-12 rounded-xl"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-lg text-on-surface">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleIncreaseQuantity}
                        className="h-12 w-12 rounded-xl"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Botón agregar */}
                <Button
                  onClick={handleAdd}
                  disabled={!isAvailable}
                  className={`w-full h-12 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                    added 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white scale-[1.01]" 
                      : ""
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5 animate-bounce" /> Agregado al carrito
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" /> Agregar al carrito
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Carrusel 1: Venta Cruzada (Combina con) */}
          <div className="mt-16">
            <ProductCarousel
              title="Combina ideal con"
              products={crossSellProducts}
            />
          </div>

          {/* Carrusel 2: Productos Similares (También te puede gustar) */}
          <div className="mt-12">
            <ProductCarousel
              title="También te puede gustar"
              products={similarProducts}
            />
          </div>
        </main>

        {/* Aviso Único Unificado: Toast + Resumen del Carrito */}
        {showSummaryNotice && (
          <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-background border border-border shadow-2xl rounded-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg flex-shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-on-surface">
                    ✓ {quantity}x {product.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">Agregado al carrito</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSummaryNotice(false)} 
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between my-3">
              <span className="text-sm font-medium text-on-surface-variant">Subtotal acumulado</span>
              <span className="text-lg font-bold text-primary">
                ${cartTotal ? cartTotal.toFixed(2) : (product.price * quantity).toFixed(2)}
              </span>
            </div>

            <Link href="/cart" className="w-full">
              <Button className="w-full h-10 rounded-xl font-semibold gap-2 text-sm">
                <ShoppingCart className="h-4 w-4" />
                Ver carrito
              </Button>
            </Link>
          </div>
        )}

        {/* Sticky CTA (Barra Fija Inferior en Móvil) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border z-40 md:hidden shadow-lg">
          <div className="flex items-center justify-between gap-4 max-w-[1100px] mx-auto">
            <div>
              <p className="text-xs text-on-surface-variant font-medium">{product.name}</p>
              <p className="text-lg font-bold text-primary">
                ${(product.price * quantity).toFixed(2)}
              </p>
            </div>
            <Button
              onClick={handleAdd}
              disabled={!isAvailable}
              className={`flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 max-w-[200px] transition-all duration-300 ${
                added ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> ¡Agregado!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Agregar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}