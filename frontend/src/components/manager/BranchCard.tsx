"use client";

import React from "react";
import { Users, Clock, Trash2, Pencil, ChevronRight } from "lucide-react";
import { Branch } from "@/types/manager";
import { formatCurrency } from "@/utils/formatters";
// 1. Importamos los componentes del Layout Base
import { BaseCard, CardMedia, CardFooter } from "../layout/BaseCard";

interface BranchCardProps {
  branch: Branch;
  onDelete: (id: string, name: string) => void;
  onManage?: (id: string) => void;
}

export function BranchCard({ branch, onDelete, onManage }: BranchCardProps) {
  // Badge de Estado flotante
  const statusBadge = (
    <span
      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
        branch.status === "open"
          ? "bg-emerald-500 text-white"
          : "bg-error text-white"
      }`}
    >
      {branch.status === "open" ? "Abierto" : "Cerrado"}
    </span>
  );

  return (
    // 2. Encapsulamos con BaseCard usando la animación
    <BaseCard animate>
      {/* 3. Reutilizamos CardMedia para la imagen y el badge */}
      <CardMedia
        src={branch.imageUrl}
        alt={branch.name}
        badge={statusBadge}
        fallbackText="Sin foto disponible"
      />

      {/* Cuerpo principal de la tarjeta */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            <h4 className="font-semibold text-on-surface leading-snug">{branch.name}</h4>
            <span className="font-bold text-primary whitespace-nowrap text-sm">
              {formatCurrency(branch.dailySales)}
            </span>
          </div>

          <p className="text-xs text-on-surface-variant line-clamp-1 mb-3">
            {branch.address}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant/80 pt-1 border-t border-outline-variant/10 mb-4">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>{branch.employeesCount} emp.</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{branch.schedule}</span>
            </div>
          </div>
        </div>

        {/* 4. Reutilizamos el Footer unificado */}
        <CardFooter className="pt-3">
          <button
            onClick={() => onDelete(branch.id, branch.name)}
            className="text-xs font-semibold text-error hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </button>

          <div className="flex items-center gap-2">
            <button
              aria-label={`Modificar ${branch.name}`}
              className="p-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onManage?.(branch.id)}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
            >
              Gestionar <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardFooter>
      </div>
    </BaseCard>
  );
}