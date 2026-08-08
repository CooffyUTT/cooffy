"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Search, Bell, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Input } from "@/components/ui/input";
import { HeaderBase } from "../layout/HeaderBase";

interface ClientHeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

const NAV_LINKS = [
  { href: "/menu", label: "Menú" },
  { href: "/orders", label: "Pedidos" },
  { href: "/promotions", label: "Promociones" },
];

export default function ClientHeader({ searchValue = "", onSearchChange, showSearch = true }: ClientHeaderProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();

  return (
    <HeaderBase
      // Slot 1: Navegación del cliente
      navigation={
        <>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <a
                key={link.href}
                href={link.href}
                className={`py-2 font-semibold text-sm transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </>
      }
      // Slot 2: Acciones derecha (Buscador, Carrito, Perfil)
      actions={
        <>
          {showSearch && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary shadow-none"
                placeholder="Busca en el menú..."
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}

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

            <button className="w-10 h-10 rounded-full bg-primary-container/20 border border-outline-variant/30 flex items-center justify-center cursor-pointer">
              <User className="h-5 w-5 text-primary" />
            </button>
          </div>
        </>
      }
      // Slot 3: Móvil
      mobileActions={
        <>
          {showSearch && (
            <button className="text-on-surface-variant"><Search className="h-5 w-5" /></button>
          )}
          <button onClick={() => setIsCartOpen(true)} className="text-on-surface-variant relative">
            <ShoppingCart className="h-5 w-5" />
          </button>
        </>
      }
    />
  );
}