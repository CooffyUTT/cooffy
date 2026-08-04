"use client";

import React from 'react';
import { Wifi, WifiOff, OctagonAlert, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KitchenHeaderProps {
  isConnected: boolean;
  kitchenActive: boolean;
  isFullscreen: boolean;
  branchName?: string;
  onToggleActive: () => void;
  onToggleFullscreen: () => void;
}

export function KitchenHeader({
  isConnected,
  kitchenActive,
  isFullscreen,
  branchName,
  onToggleActive,
  onToggleFullscreen
}: KitchenHeaderProps) {
  return (
    <header className="flex items-center justify-between bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-extrabold text-[#5C3D2E]">{branchName || "Cocina"}</h2>
        
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
          isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isConnected ? 'En Línea (Realtime)' : 'Sin Conexión'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
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

        <Button 
          onClick={onToggleFullscreen} 
          variant="outline" 
          size="sm" 
          className="border-slate-200 text-slate-700 hover:bg-slate-100"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
      </div>
    </header>
  );
}