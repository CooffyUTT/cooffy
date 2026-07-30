"use client";

import React, { useState } from "react";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { CartProvider, useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";

import Header from "@/components/menu/Header";
import ProductCard from "@/components/menu/ProductCard";
import CartSheet from "@/components/menu/CartSheet";

function MenuContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const { setIsCartOpen, totalItems } = useCart();

  const { data: apiProducts, isLoading, error } = useProducts();

  const visibleProducts = (apiProducts ?? []).filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const today = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="bg-background text-on-background min-h-screen font-sans antialiased">
      <Header searchValue={searchTerm} onSearchChange={setSearchTerm} />

      <main className="pt-20 md:pt-28 pb-24 md:pb-12 px-4 md:px-10 max-w-[1100px] mx-auto">

        <section className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Menú de hoy</h1>
          <p className="text-sm text-on-surface-variant capitalize mt-1">{today}</p>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-outline-variant/20 bg-surface-container-low overflow-hidden">
                <div className="h-40 bg-surface-container-highest" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-surface-container-highest rounded w-3/4" />
                  <div className="h-3 bg-surface-container-highest rounded w-1/2" />
                  <div className="h-3 bg-surface-container-highest rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-error mb-3" />
            <p className="text-on-surface font-medium">Error al cargar el menú</p>
            <p className="text-sm text-on-surface-variant mt-1">
              {error instanceof Error ? error.message : "No se pudo conectar con el servidor"}
            </p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="text-on-surface-variant text-sm text-center py-12">
            No hay productos disponibles.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <CartSheet />

      <button
        onClick={() => setIsCartOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-xl flex items-center justify-center z-40 active:scale-90 transition-transform"
        aria-label="Abrir carrito"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute top-3 right-3 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
    </div>
  );
}

export function MenuView() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}
