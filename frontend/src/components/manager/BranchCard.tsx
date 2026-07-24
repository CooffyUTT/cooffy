"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Users, Clock, DollarSign, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Branch } from '@/types/manager';
import { formatCurrency } from '@/utils/formatters';

interface BranchCardProps {
  branch: Branch;
  onDelete: (id: string, name: string) => void;
}

export function BranchCard({ branch, onDelete }: BranchCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-6 group"
    >
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="relative w-full sm:w-36 h-32 rounded-2xl overflow-hidden shrink-0 bg-stone-100 border border-stone-100">
          <Image 
            src={branch.imageUrl} 
            alt={branch.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-2xs">
            {branch.status === 'open' ? 'Abierto' : 'Cerrado'}
          </span>
        </div>

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
              <span>Venta del día: <strong className="text-emerald-700 font-extrabold">{formatCurrency(branch.dailySales)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-stone-100">
        <button 
          onClick={() => onDelete(branch.id, branch.name)}
          className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 size={14} />
          Eliminar
        </button>

        <div className="flex items-center gap-3">
          <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 cursor-pointer">
            <Pencil size={14} />
            Modificar
          </button>
          <Button size="sm" className="bg-[#6F4E37] hover:bg-[#5C3D2E] text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1">
            Gestionar <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}