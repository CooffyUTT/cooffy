"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BaseCard, CardMedia, CardFooter } from "../layout/BaseCard";

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    description?: string;
    tag?: string;
    image?: string | null;
  };
}

export default function ProductCard({ product }: ProductProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link href={`/menu/${product.id}`} className="block">
      <BaseCard className="cursor-pointer h-full">
        <CardMedia
          src={product.image ?? undefined}
          alt={product.name}
          fallbackText="Foto próximamente"
        />

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-semibold text-on-surface text-base">{product.name}</h4>
              <span className="font-bold text-primary whitespace-nowrap">
                ${product.price.toFixed(2)}
              </span>
            </div>
            {product.description && (
              <p className="text-xs text-on-surface-variant line-clamp-2">{product.description}</p>
            )}
          </div>

          <CardFooter className="pt-3">
            {product.tag ? (
              <span className="text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wide">
                {product.tag}
              </span>
            ) : (
              <span />
            )}
            <button
              onClick={handleAdd}
              aria-label={`Agregar ${product.name} al carrito`}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                added
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50"
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
          </CardFooter>
        </div>
      </BaseCard>
    </Link>
  );
}