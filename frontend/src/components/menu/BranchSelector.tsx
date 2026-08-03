"use client";

import React from "react";
import { MapPin, Clock, Store } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface Branch {
  id: number;
  name: string;
  location: string | null;
  schedule: string | null;
  company_name: string;
}

interface BranchSelectorProps {
  branches: Branch[];
  isLoading?: boolean;
}

export function BranchSelector({ branches, isLoading }: BranchSelectorProps) {
  const { branchId, setBranchId } = useCart();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5"
          >
            <div className="h-5 bg-surface-container-highest rounded w-3/4 mb-3" />
            <div className="h-4 bg-surface-container-highest rounded w-1/2 mb-2" />
            <div className="h-4 bg-surface-container-highest rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-12 w-12 text-on-surface-variant/40 mx-auto mb-3" />
        <p className="text-on-surface font-medium">No hay sucursales disponibles</p>
        <p className="text-sm text-on-surface-variant mt-1">
          Contacta a tu administrador para más información.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-on-surface">
          Selecciona tu sucursal
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Elige dónde recogerás tu pedido
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => setBranchId(branch.id)}
            className={`text-left rounded-2xl border-2 p-5 transition-all ${
              branchId === branch.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-on-surface">{branch.name}</h3>
              {branchId === branch.id && (
                <span className="shrink-0 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                  ✓
                </span>
              )}
            </div>

            <p className="text-xs text-primary font-medium mb-2">
              {branch.company_name}
            </p>

            {branch.location && (
              <div className="flex items-center gap-1.5 text-sm text-on-surface-variant mb-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{branch.location}</span>
              </div>
            )}

            {branch.schedule && (
              <div className="flex items-center gap-1.5 text-sm text-on-surface-variant">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{branch.schedule}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {branchId !== null && (
        <div className="mt-6 flex justify-end">
          <Button size="lg">
            Ver menú
          </Button>
        </div>
      )}
    </div>
  );
}
