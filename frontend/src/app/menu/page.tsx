"use client";

import React, { useState } from "react";
import { Coffee, Croissant, Cookie, Utensils, ArrowRight, ShoppingCart } from "lucide-react";
import { CartProvider, useCart } from "@/context/CartContext";

// Componentes modulares
import Header from "@/components/home/Header";
import ProductCard from "@/components/home/ProductCard";
import CartSheet from "@/components/home/CartSheet";

// Datos estáticos de ejemplo
const CATEGORIES = [
  { id: "coffee", name: "Coffee", icon: Coffee },
  { id: "breakfast", name: "Breakfast", icon: Croissant },
  { id: "snacks", name: "Snacks", icon: Cookie },
  { id: "lunch", name: "Lunch", icon: Utensils },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Caramel Macchiato",
    price: 4.50,
    description: "Rich espresso with creamy milk and a signature caramel drizzle.",
    category: "coffee",
    tag: "Vegan Opt.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAz8JmSFAQJ4gECn2fi0GPQBXugfeF5xL8LDAeKCm1jbNOxCEo218CcraepK28dQmJSlez8g9EDHeP9XT4LpjmxbKep1jyMmIV5hG9mCMGp7a0MLySxy6szDAn32V-qZAdbTr7ZjW3h2IZNhAMHdINB7UlMYugJ27faQtjxrnS-fBD8-F9ax-apaSiHCYjD5XUwGvMlWoefZ3J3VG4Hv6hpnEz73mxfd9xF6_ZJ1Pp3iL8NFCtcsVPC6p1pq-XlsKsxq-WeXOOXn0s"
  },
  {
    id: 2,
    name: "Classic Cortado",
    price: 3.75,
    description: "Equal parts espresso and warm steamed milk for a perfect balance.",
    category: "coffee",
    tag: "Signature",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBy4QtO7MpYEJmGHVtlIBBav4B11eKe3gefa9VthkfhtqpP86oFkRlVAAhJN6uwzM0l5C6MJ2VaIQjrSkm1Aqy4lVpNxmPrZPsxyny604U8BfkpY75wWsezVSzIE0NgP80lPhv5uNBeFY-ruLBdgUcTkMJ820zHwmm49jLYejb1Ok1HizOSQXCBHY4hyXX1q7I1urxL6Gc495l1EwuNV0tlkiwOH0j-wVt2Y0Gr_LfYzruSWKo4sjExx0NFQNpZsKlJi6Qu9RDQ8cc"
  },
  {
    id: 3,
    name: "Avocado Smash",
    price: 8.20,
    description: "Sourdough toast topped with fresh avocado, chili flakes, and poached egg.",
    category: "breakfast",
    tag: "Bestseller",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYnS9yu9-7BMZ8QRVpJWGvDA990GfiIP3Oqd1yoiOuWul-yasgmbzucbmQBUut2m4dmjimDZ66QVtIWOgm-tRQORjSCF6vaM9jFbUUKeDYMj4HQgCKO35ezGXW-rVtwlmBQDt9Yw912AQuF29HMo4OxtYReSfOc-kh89Bh0rNbSKlW-HYRAsXnaWohrDPsiL7kEkx1ftmYzqJkRhvkKNCvWNwGKl285M6pIu0DRYqKfiICIvV4bFEhMVvj8aeRZCZYu_vPLGx52qk"
  },
];

function DashboardContent() {
  const [selectedCategory, setSelectedCategory] = useState("coffee");
  const { setIsCartOpen, totalItems } = useCart();

  return (
    <div className="bg-background text-on-background min-h-screen font-sans antialiased">
      <Header />

      <main className="pt-20 md:pt-28 pb-24 md:pb-12 px-4 md:px-10 max-w-[1200px] mx-auto">
        
        {/* Sección Promocional */}
        <section className="mb-8 overflow-hidden">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-on-surface">Hot Deals</h2>
            <button className="text-primary font-semibold text-sm flex items-center gap-1 hover:underline">
              See All <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
            <div className="min-w-[280px] md:min-w-[400px] h-48 rounded-xl overflow-hidden relative snap-start group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-r from-on-secondary-fixed/80 to-transparent z-10"></div>
              <img 
                className="absolute inset-0 w-full h-full object-cover" 
                alt="Morning Latte Promo" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC03BvnbCNQfT046N_TQ1gdWcgR0O4M4BuFUMpyziCj-rMW-xF7VqmFTHX_1ku5AUrPmKqAOTql-U9tW4xkqgY0r1rQGZJ2xW9irbNUF0x9ssarPipunJjcQ7jMGJzdr47ovGU4m485ljuyPT4z24qGjrOH7Kd8kJikQPzdIN-bv0hrsTVfA_coHEM1mAV425UtgFNjZLNKnj_lbZvMi1-o5KfhSBVQ_zp8m0PW7Mgw3aSFBxipNavZ0RwznkhJeZOQv-tf8-7Uh7U"
              />
              <div className="absolute inset-0 z-20 p-6 flex flex-col justify-center">
                <span className="bg-primary-container text-on-primary-container text-[10px] uppercase font-bold px-2 py-1 rounded w-fit mb-2">Member Exclusive</span>
                <h3 className="text-white font-bold text-xl mb-1">Morning Latte</h3>
                <p className="text-white/80 text-sm mb-4">50% Off before 9:00 AM</p>
                <button className="bg-primary text-white px-4 py-2 rounded-lg w-fit text-sm font-semibold">Claim Now</button>
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
            {PRODUCTS.filter(p => p.category === selectedCategory || selectedCategory === "coffee").map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>

      {/* Carrito Lateral global */}
      <CartSheet />

      {/* FAB Flotante Móvil */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-primary text-white rounded-full shadow-xl flex items-center justify-center z-40 active:scale-90 transition-transform"
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

// Orquestador que inyecta el Contexto a los componentes de la vista
export default function DashboardPage() {
  return (
    <CartProvider>
      <DashboardContent />
    </CartProvider>
  );
}