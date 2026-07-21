"use client";

import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    tag: string;
  };
}

/**
 * Fila de un platillo dentro del menú.
 *
 * En vez de una tarjeta con imagen (que necesitaría fotos reales que
 * todavía no existen), se muestra como una fila de menú impreso:
 * nombre, descripción y precio, con un botón pequeño para agregar
 * al carrito. Sin íconos ni imágenes de relleno.
 */
export default function ProductCard({ product }: ProductProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h4 className="font-semibold text-on-surface">{product.name}</h4>
          <span className="text-[11px] font-medium text-on-surface-variant/70 uppercase tracking-wide">
            {product.tag}
          </span>
        </div>
        <p className="text-sm text-on-surface-variant mt-0.5 pr-4">{product.description}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="font-semibold text-on-surface">${product.price.toFixed(2)}</span>
        <button
          onClick={handleAdd}
          aria-label={`Agregar ${product.name} al carrito`}
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded border transition-colors ${
            added
              ? "border-green-600 text-green-700 bg-green-50"
              : "border-primary text-primary hover:bg-primary hover:text-white"
          }`}
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" /> Agregado
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Agregar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
