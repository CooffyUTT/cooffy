"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BranchHeaderProps {
  onAddBranch: () => void;
}

export function BranchHeader({ onAddBranch }: BranchHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#5C3D2E]">Sucursales</h1>
        <p className="text-xs text-stone-500 mt-1">Administra y supervisa los planteles asignados a tu cuenta.</p>
      </div>

      <Button 
        onClick={onAddBranch}
        className="bg-[#FF8C00] hover:bg-[#e07b00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
      >
        <Plus size={18} />
        Agregar Sucursal
      </Button>
    </div>
  );
}