"use client";

import React from 'react';
import { UtensilsCrossed, LayoutDashboard, BookOpen, History, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function KitchenSidebar() {
  return (
    <aside className="w-56 bg-[#5C3D2E] text-white flex flex-col justify-between p-4 shrink-0 shadow-lg">
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <h1 className="text-lg font-bold tracking-tight text-white text-center">Cooffy</h1>
        </div>

        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-amber-500/20 text-amber-200 font-semibold rounded-xl text-xs border border-amber-500/30">
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:bg-white/10 text-xs rounded-xl">
            <BookOpen size={16} /> Menú
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:bg-white/10 text-xs rounded-xl">
            <History size={16} /> Historial
          </button>
        </nav>
      </div>

      <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 text-xs rounded-xl">
        <LogOut size={16} className="mr-2" /> Cerrar sesión
      </Button>
    </aside>
  );
}