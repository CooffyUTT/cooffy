"use client";

import React from 'react';
import { Store, UserCircle2 } from 'lucide-react';

interface ManagerNavbarProps {
  activeTab: 'branches' | 'users' | 'dashboard';
  setActiveTab: (tab: 'branches' | 'users' | 'dashboard') => void;
  userName?: string;
}

export function ManagerNavbar({ activeTab, setActiveTab, userName = 'Juan' }: ManagerNavbarProps) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50 px-6 py-4 shadow-2xs">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#6F4E37]/10 rounded-xl">
            <Store className="text-[#6F4E37]" size={26} />
          </div>
          <span className="text-2xl font-black text-[#6F4E37] tracking-tight">Cooffy</span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {(['branches', 'users', 'dashboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-bold transition-colors pb-1 border-b-2 capitalize ${
                activeTab === tab
                  ? 'text-[#6F4E37] border-[#6F4E37]'
                  : 'text-stone-500 border-transparent hover:text-stone-800'
              }`}
            >
              {tab === 'branches' ? 'Sucursales' : tab === 'users' ? 'Usuarios' : 'Dashboard'}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 bg-[#191C20] text-white px-4 py-2 rounded-full shadow-sm text-xs font-semibold">
          <UserCircle2 size={18} className="text-amber-400" />
          <span>Hola de nuevo, {userName}</span>
        </div>
      </div>
    </header>
  );
}