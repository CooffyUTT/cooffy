"use client";

import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    tag: string;
    image?: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/20 shadow-[0px_4px_20px_rgba(30,58,90,0.05)] hover:shadow-md transition-shadow">
      {/* Espacio para la foto del platillo */}
      <div className="relative h-36 bg-surface-container-low border-b border-dashed border-outline-variant/40 flex items-center justify-center">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <span className="text-[11px] text-on-surface-variant/50">Foto próximamente</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h4 className="font-semibold text-on-surface">{product.name}</h4>
          <span className="font-semibold text-primary whitespace-nowrap">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{product.description}</p>

        <div className="flex justify-between items-center">
          <span className="text-[11px] font-medium text-on-surface-variant/70 uppercase tracking-wide">
            {product.tag}
          </span>
          <button
            onClick={handleAdd}
            aria-label={`Agregar ${product.name} al carrito`}
            className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
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
    </div>
  );
}
