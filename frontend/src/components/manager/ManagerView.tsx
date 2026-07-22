"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Clock, 
  DollarSign, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  UserCircle2,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- ESTRUCTURA DE DATOS PARA LAS SUCURSALES ---
interface Branch {
  id: string;
  name: string;
  address: string;
  employeesCount: number;
  schedule: string;
  dailySales: number;
  status: 'open' | 'closed';
  imageUrl: string;
}

const INITIAL_BRANCHES: Branch[] = [
  {
    id: '1',
    name: 'Cafetería Refugio',
    address: 'Parque Industrial, 22390 Tijuana, B.C.',
    employeesCount: 15,
    schedule: '09:00 - 19:00',
    dailySales: 9999,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '2',
    name: 'Cafetería Otay',
    address: 'Quintas Campestre, 22253 Tijuana, B.C.',
    employeesCount: 8,
    schedule: '09:00 - 16:00',
    dailySales: 999,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600'
  }
];

export function ManagerView() {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'dashboard'>('branches');

  const handleDeleteBranch = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la sucursal "${name}"?`)) {
      setBranches(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      
      {/* --- NAVBAR SUPERIOR --- */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Cooffy */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#6F4E37]/10 rounded-xl">
              <Store className="text-[#6F4E37]" size={26} />
            </div>
            <span className="text-2xl font-black text-[#6F4E37] tracking-tight">Cooffy</span>
          </div>

          {/* Menú de Navegación Central */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('branches')}
              className={`text-sm font-bold transition-colors pb-1 border-b-2 ${
                activeTab === 'branches' 
                  ? 'text-[#6F4E37] border-[#6F4E37]' 
                  : 'text-stone-500 border-transparent hover:text-stone-800'
              }`}
            >
              Sucursales
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`text-sm font-bold transition-colors pb-1 border-b-2 ${
                activeTab === 'users' 
                  ? 'text-[#6F4E37] border-[#6F4E37]' 
                  : 'text-stone-500 border-transparent hover:text-stone-800'
              }`}
            >
              Usuarios
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm font-bold transition-colors pb-1 border-b-2 ${
                activeTab === 'dashboard' 
                  ? 'text-[#6F4E37] border-[#6F4E37]' 
                  : 'text-stone-500 border-transparent hover:text-stone-800'
              }`}
            >
              Dashboard
            </button>
          </nav>

          {/* Badge del Usuario / Perfil */}
          <div className="flex items-center gap-2 bg-[#191C20] text-white px-4 py-2 rounded-full shadow-sm text-xs font-semibold">
            <UserCircle2 size={18} className="text-amber-400" />
            <span>Hola de nuevo, Juan</span>
          </div>

        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Encabezado de la Sección + Botón Agregar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#5C3D2E]">Sucursales</h1>
            <p className="text-xs text-stone-500 mt-1">Administra y supervisa los planteles asignados a tu cuenta.</p>
          </div>

          <Button 
            className="bg-[#FF8C00] hover:bg-[#e07b00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Plus size={18} />
            Agregar Sucursal
          </Button>
        </div>

        {/* LISTADO / GRID DE SUCURSALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {branches.map((branch) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6 group"
            >
              {/* Contenido Principal de la Tarjeta */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                
                {/* Fotografía de la Sucursal */}
                <div className="relative w-full sm:w-36 h-32 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-100">
                  <Image 
                    src={branch.imageUrl} 
                    alt={branch.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
                    Abierto
                  </span>
                </div>

                {/* Información de la Sucursal */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-extrabold text-[#5C3D2E] leading-snug">{branch.name}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-medium">{branch.address}</p>

                  <div className="pt-2 space-y-1 text-xs font-semibold text-stone-700">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[#6F4E37]" />
                      <span>Empleados: <strong className="text-stone-900">{branch.employeesCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#6F4E37]" />
                      <span>Horario: <strong className="text-stone-900">{branch.schedule}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-emerald-600" />
                      <span>Venta del día: <strong className="text-emerald-700 font-extrabold">${branch.dailySales.toLocaleString('es-MX')} MXN</strong></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Botones de Acción Infiores (Respetando el Mockup) */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <button 
                  onClick={() => handleDeleteBranch(branch.id, branch.name)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>

                <div className="flex items-center gap-3">
                  <button 
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil size={14} />
                    Modificar
                  </button>

                  <Button 
                    size="sm"
                    className="bg-[#6F4E37] hover:bg-[#5C3D2E] text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1"
                  >
                    Gestionar
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
}