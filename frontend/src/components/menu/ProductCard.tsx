"use client";

import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    description: string;
    tag: string;
    image: string;
  };
}

export default function ProductCard({ product }: ProductProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita clicks accidentales en toda la tarjeta
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Card className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/15 shadow-[0px_4px_20px_rgba(30,58,90,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-md group cursor-pointer">
      <div className="h-48 overflow-hidden relative">
        <Image 
            className="group-hover:scale-105 transition-transform duration-500 object-cover" 
            alt={product.name} 
            src={product.image} 
            fill // Hace que la imagen llene el contenedor relativo 'h-48'
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={product.id <= 3} // Carga con prioridad alta los primeros productos en pantalla
        />
      </div>
      <CardContent className="p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-lg text-on-surface tracking-tight">{product.name}</h4>
            <span className="font-semibold text-primary">${product.price.toFixed(2)}</span>
          </div>
          <p className="text-on-surface-variant text-xs line-clamp-2 mb-4 h-8">{product.description}</p>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded">
            {product.tag}
          </span>
          <Button
            onClick={handleAdd}
            size="icon"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              added ? "bg-green-600 hover:bg-green-600 text-white" : "bg-primary text-white hover:bg-primary-container"
            }`}
          >
            {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}