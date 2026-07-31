"use client";

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyHeaderProps {
  onAddCompany: () => void;
}

export function CompanyHeader({ onAddCompany }: CompanyHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-on-surface">Compañías</h1>
        <p className="text-xs text-on-surface-variant mt-1">Compañías vinculadas a tu escuela.</p>
      </div>

      <Button
        onClick={onAddCompany}
        className="font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
      >
        <Plus size={18} />
        Agregar compañía
      </Button>
    </div>
  );
}
