"use client";

import React, { useState } from 'react';
import { Branch } from '@/types/manager';
import { INITIAL_BRANCHES } from '@/data/mockBranches';
import { ManagerNavbar } from './ManagerNavbar';
import { BranchHeader } from './BranchHeader';
import { BranchCard } from './BranchCard';

export function ManagerView() {
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'dashboard'>('branches');

  const handleDeleteBranch = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la sucursal "${name}"?`)) {
      setBranches(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleAddBranch = () => {
    alert("Modal de agregar sucursal próximamente...");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      <ManagerNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <BranchHeader onAddBranch={handleAddBranch} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {branches.map((branch) => (
            <BranchCard 
              key={branch.id} 
              branch={branch} 
              onDelete={handleDeleteBranch} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}