"use client"; // Usamos hooks (useState) y el contexto del carrito, por eso es un componente de cliente

import React, { useState } from "react";
import { ArrowRight, ShoppingCart } from "lucide-react";
import { CartProvider, useCart } from "@/context/CartContext";
import { CATEGORIES, PRODUCTS } from "@/lib/menu-data";

// Componentes modulares del menú
import Header from "@/components/home/Header";
import ProductCard from "@/components/home/ProductCard";
import CartSheet from "@/components/home/CartSheet";

/**
 * ==========================================
 * COMPONENTE: MenuContent
 * ==========================================
 * Contiene el layout visual de la pantalla de menú:
 * encabezado, banner de ofertas, categorías y cuadrícula de productos.
 * Sigue el mismo patrón que LoginView/RegisterView.
 */
function MenuContent() {
  const [selectedCategory, setSelectedCategory] = useState("coffee");
  const { setIsCartOpen, totalItems } = useCart();

  return (
    <div className="bg-background text-on-background min-h-screen font-sans antialiased">
      <Header />

      <main className="pt-20 md:pt-28 pb-24 md:pb-12 px-4 md:px-10 max-w-[1200px] mx-auto">

        {/* Sección Promocional */}
        <section className="mb-8 overflow-hidden">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-on-surface">Ofertas del día</h2>
            <button className="text-primary font-semibold text-sm flex items-center gap-1 hover:underline">
              Ver todo <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
            <div className="min-w-[280px] md:min-w-[400px] h-48 rounded-xl overflow-hidden relative snap-start group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-on-secondary-fixed/80 to-transparent z-10"></div>
              <img
                className="absolute inset-0 w-full h-full object-cover"
                alt="Promoción Latte de la mañana"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC03BvnbCNQfT046N_TQ1gdWcgR0O4M4BuFUMpyziCj-rMW-xF7VqmFTHX_1ku5AUrPmKqAOTql-U9tW4xkqgY0r1rQGZJ2xW9irbNUF0x9ssarPipunJjcQ7jMGJzdr47ovGU4m485ljuyPT4z24qGjrOH7Kd8kJikQPzdIN-bv0hrsTVfA_coHEM1mAV425UtgFNjZLNKnj_lbZvMi1-o5KfhSBVQ_zp8m0PW7Mgw3aSFBxipNavZ0RwznkhJeZOQv-tf8-7Uh7U"
              />
              <div className="absolute inset-0 z-20 p-6 flex flex-col justify-center">
                <span className="bg-primary-container text-on-primary-container text-[10px] uppercase font-bold px-2 py-1 rounded w-fit mb-2">
                  Exclusivo para miembros
                </span>
                <h3 className="text-white font-bold text-xl mb-1">Latte de la mañana</h3>
                <p className="text-white/80 text-sm mb-4">50% de descuento antes de las 9:00 AM</p>
                <button className="bg-primary text-white px-4 py-2 rounded-lg w-fit text-sm font-semibold">
                  Reclamar ahora
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="mb-8">
          <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {cat.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* Cuadrícula de productos */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRODUCTS.filter(
              (p) => p.category === selectedCategory || selectedCategory === "coffee"
            ).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      {/* Carrito lateral (se abre desde el header o el botón flotante) */}
      <CartSheet />

      {/* Botón flotante del carrito, solo visible en móvil */}
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

/**
 * ==========================================
 * COMPONENTE PRINCIPAL: MenuView
 * ==========================================
 * Envuelve todo con el CartProvider para que el carrito
 * (contexto compartido) funcione en toda la pantalla de menú.
 */
export function MenuView() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}
