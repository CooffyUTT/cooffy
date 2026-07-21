"use client";

import React from "react";
import { Search, Bell, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface dark:bg-surface-dim shadow-[0px_4px_20px_rgba(30,58,90,0.05)] border-b border-outline-variant/10">
      <div className="hidden md:flex justify-between items-center px-10 h-20 w-full">
        <div className="flex items-center gap-8">
          <span className="text-3xl font-bold text-primary tracking-tight">Cooffy</span>
          <nav className="flex gap-6">
            <a className="text-primary border-b-2 border-primary py-2 font-semibold text-sm" href="#">Menú</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors py-2 font-semibold text-sm" href="#">Pedidos</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors py-2 font-semibold text-sm" href="#">Promociones</a>
          </nav>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input 
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-none"
              placeholder="Busca en el menú..."
            />
          </div>
          <div className="flex gap-4 items-center">
            <button className="relative text-on-surface-variant hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full"></span>
            </button>

            <button onClick={() => setIsCartOpen(true)} className="relative text-on-surface-variant hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              className="w-10 h-10 rounded-full bg-primary-container/20 border border-outline-variant/30 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              aria-label="Mi perfil"
            >
              <User className="h-5 w-5 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center px-4 h-16 w-full">
        <span className="text-2xl font-bold text-primary tracking-tight">Cooffy</span>
        <div className="flex gap-4">
          <button className="text-on-surface-variant"><Search className="h-5 w-5" /></button>
          <button onClick={() => setIsCartOpen(true)} className="text-on-surface-variant relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}