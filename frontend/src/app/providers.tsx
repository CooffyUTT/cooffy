"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/context/CartContext"; // <-- Importas tu proveedor del carrito

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Envuelves los componentes con CartProvider */}
      <CartProvider>
        {children}
      </CartProvider>
    </QueryClientProvider>
  );
}