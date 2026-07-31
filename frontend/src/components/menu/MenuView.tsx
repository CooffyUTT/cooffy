"use client";

import React, { useState } from "react";
import { ShoppingCart, AlertCircle, ArrowDownWideNarrow } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useDebounce } from "@/hooks/useDebounce";

import Header from "@/components/menu/Header";
import ProductCard from "@/components/menu/ProductCard";

const ORDER_OPTIONS = [
  { value: "name", label: "Nombre" },
  { value: "-name", label: "Nombre (Z-A)" },
  { value: "price", label: "Precio" },
  { value: "-price", label: "Precio (mayor)" },
] as const;

export function MenuView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ordering, setOrdering] = useState<string>("name");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { setIsCartOpen, totalItems } = useCart();

  const debouncedSearch = useDebounce(searchTerm, 300);
  const { data: categories } = useCategories();

  const { data: products, isLoading, error } = useProducts(
    debouncedSearch || undefined,
    ordering,
    selectedCategory ?? undefined
  );

  const today = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <>
      <Header searchValue={searchTerm} onSearchChange={setSearchTerm} />

      <main className="pt-20 md:pt-28 pb-24 md:pb-12 px-4 md:px-10 max-w-[1100px] mx-auto">
      <section className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Menú de hoy</h1>
          <p className="text-sm text-on-surface-variant capitalize mt-1">{today}</p>
        </div>

        <div className="flex items-center gap-2">
          <ArrowDownWideNarrow className="h-4 w-4 text-on-surface-variant" />
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="text-sm bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {ORDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        </section>

        {/* Tabs de categoría */}
        {categories && categories.length > 0 && (
          <section className="mb-6 border-b border-outline-variant/40">
            <div className="flex overflow-x-auto gap-6 hide-scrollbar">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  selectedCategory === null
                    ? "text-primary border-primary"
                    : "text-on-surface-variant border-transparent hover:text-on-surface"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    selectedCategory === cat.id
                      ? "text-primary border-primary"
                      : "text-on-surface-variant border-transparent hover:text-on-surface"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </section>
        )}

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
      ) : products && products.length === 0 ? (
        <p className="text-on-surface-variant text-sm text-center py-12">
          {debouncedSearch
            ? `No se encontraron resultados para "${debouncedSearch}"`
            : "No hay productos disponibles."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Botón flotante del carrito (móvil) */}
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
    </main>
    </>
  );
}
