"use client";

import React from "react";
import { CartProvider } from "@/context/CartContext";
import CartSheet from "@/components/menu/CartSheet";

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="w-full bg-background text-on-background min-h-screen font-sans antialiased">
        {children}
        <CartSheet />
      </div>
    </CartProvider>
  );
}
