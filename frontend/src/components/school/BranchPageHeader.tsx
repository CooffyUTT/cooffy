"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BranchPageHeaderProps {
  onAddBranch: () => void;
}

export function BranchPageHeader({ onAddBranch }: BranchPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface">Sucursales</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Lista de sucursales registradas en la escuela, agrupadas por compañía.
        </p>
      </div>

      <Button
        onClick={onAddBranch}
        className="font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
      >
        <Plus size={18} />
        Agregar sucursal
      </Button>
    </div>
  );
}
