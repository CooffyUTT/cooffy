"use client";

import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { CartProvider, useCart } from "@/context/CartContext";
import { CATEGORIES, PRODUCTS } from "@/lib/menu-data";

import Header from "@/components/home/Header";
import ProductCard from "@/components/home/ProductCard";
import CartSheet from "@/components/home/CartSheet";

function MenuContent() {
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const { setIsCartOpen, totalItems } = useCart();

  const visibleProducts = PRODUCTS.filter(
    (p) => selectedCategory === "todos" || p.category === selectedCategory
  );

  const today = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="bg-background text-on-background min-h-screen font-sans antialiased">
      <Header />

      <main className="pt-20 md:pt-28 pb-24 md:pb-12 px-4 md:px-10 max-w-[1100px] mx-auto">

        <section className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Menú de hoy</h1>
          <p className="text-sm text-on-surface-variant capitalize mt-1">{today}</p>
        </section>

        {/* Pestañas de categoría */}
        <section className="mb-6 border-b border-outline-variant/40">
          <div className="flex overflow-x-auto gap-6 hide-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    isActive
                      ? "text-primary border-primary"
                      : "text-on-surface-variant border-transparent hover:text-on-surface"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </section>

        {visibleProducts.length === 0 ? (
          <p className="text-on-surface-variant text-sm text-center py-12">
            No hay platillos en esta categoría todavía.
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
