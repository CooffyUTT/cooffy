"use client";

import React from 'react';
import { OctagonAlert, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KitchenHeaderProps {
  kitchenActive: boolean;
  isPending?: boolean;
  onToggleActive: () => void;
}

export function KitchenHeader({
  kitchenActive,
  isPending = false,
  onToggleActive,
}: KitchenHeaderProps) {
  return (
    <header
      className={`flex items-center justify-between px-5 py-2.5 rounded-2xl border shadow-xs shrink-0 transition-colors ${
        kitchenActive
          ? 'bg-white border-slate-200'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      <div className="flex items-center gap-4">
        <h2
          className={`text-lg font-extrabold ${kitchenActive ? 'text-[#5C3D2E]' : 'text-white'}`}
        >
          Cocina Central
        </h2>
        {!kitchenActive && (
          <span
            data-testid="kitchen-suspended-pill"
            className="inline-flex items-center gap-1 bg-red-500/20 text-red-100 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border border-red-400/40"
          >
            <OctagonAlert size={12} />
            Recepción suspendida
          </span>
        )}
      </div>

      <Button
        onClick={onToggleActive}
        disabled={isPending}
        size="sm"
        data-testid="kitchen-toggle-active"
        data-state={kitchenActive ? 'active' : 'suspended'}
        aria-pressed={!kitchenActive}
        className={`font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 disabled:opacity-60 ${
          kitchenActive
            ? 'bg-amber-500 hover:bg-amber-600 text-white'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }`}
      >
        {kitchenActive ? <Pause size={14} /> : <Play size={14} />}
        {kitchenActive ? 'Pausar Pedidos' : 'Reanudar'}
      </Button>
    </header>
  );
}
