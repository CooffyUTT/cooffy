"use client";

import React from 'react';
import { OctagonAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KitchenHeaderProps {
  kitchenActive: boolean;
  onToggleActive: () => void;
}

export function KitchenHeader({ kitchenActive, onToggleActive }: KitchenHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-extrabold text-[#5C3D2E]">Cocina Central</h2>
      </div>

      <Button
        onClick={onToggleActive}
        size="sm"
        className={`font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 ${
          kitchenActive ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-700 text-white'
        }`}
      >
        <OctagonAlert size={14} />
        {kitchenActive ? 'Pausar Pedidos' : 'Reanudar'}
      </Button>
    </header>
  );
}
