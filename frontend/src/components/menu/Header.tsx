"use client";

import React from "react";
import Link from "next/link";
import { Search, Bell, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { HeaderBase } from "../layout/HeaderBase";

interface ClientHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function ClientHeader({ searchValue = "", onSearchChange }: ClientHeaderProps) {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <div className="w-full">
      <HeaderBase
        // Slot 1: Navegación del cliente
        navigation={
          <>
            <Link
              className="text-primary border-b-2 border-primary py-2 font-semibold text-sm w-full md:w-auto block md:inline-block"
              href="/menu"
            >
              Menú
            </Link>
            <Link
              className="text-on-surface-variant hover:text-primary transition-colors py-2 font-semibold text-sm w-full md:w-auto block md:inline-block"
              href="/menu/orders"
            >
              Mis pedidos
            </Link>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors py-2 font-semibold text-sm w-full md:w-auto block md:inline-block"
              href="/promotions"
            >
              Promociones
            </a>
          </>
        }
        // Slot 2: Acciones derecha (Escritorio)
        actions={
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-none"
                placeholder="Busca en el menú..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>

            <div className="flex gap-3 sm:gap-4 items-center">
              <button aria-label="Notificaciones" className="relative text-on-surface-variant hover:text-primary transition-colors p-1">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full"></span>
              </button>

              <button aria-label="Carrito de compras" onClick={() => setIsCartOpen(true)} className="relative text-on-surface-variant hover:text-primary transition-colors p-1">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              <button aria-label="Perfil de usuario" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-container/20 border border-outline-variant/30 flex items-center justify-center cursor-pointer hover:bg-primary-container/30 transition-colors">
                <User className="h-5 w-5 text-primary" />
              </button>
            </div>
          </div>
        }
        // Slot 3: Móvil (Iconos rápidos en la barra superior)
        mobileActions={
          <div className="flex items-center gap-3 md:hidden">
            <button aria-label="Notificaciones" className="text-on-surface-variant relative p-1">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
            </button>
            
            <button aria-label="Carrito de compras" onClick={() => setIsCartOpen(true)} className="text-on-surface-variant relative p-1">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        }
      />

      {/* Buscador secundario para móviles */}
      <div className="block md:hidden px-4 py-2 border-b border-outline-variant/20 bg-surface dark:bg-surface-dim">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <Input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-none"
            placeholder="Busca en el menú..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}