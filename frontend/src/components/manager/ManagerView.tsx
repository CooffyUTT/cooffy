"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 👈 Importamos useRouter
import { Branch } from '@/types/manager';
import { INITIAL_BRANCHES } from '@/data/mockBranches';
import { ManagerNavbar } from './ManagerNavbar';
import { BranchHeader } from './BranchHeader';
import { BranchCard } from './BranchCard';

export function ManagerView() {
  const router = useRouter();
  
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window === "undefined") return false; // Prevención para SSR en Next.js

    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) return false;

    try {
      const userData = JSON.parse(userDataStr);
      return Boolean(userData.groups && userData.groups.includes("gerente"));
    } catch {
      return false;
    }
  });

  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeTab, setActiveTab] = useState<'branches' | 'users' | 'dashboard'>('branches');

  // 👈 useEffect para proteger la ruta
  useEffect(() => {
    if (!isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, router]);

  const handleDeleteBranch = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la sucursal "${name}"?`)) {
      setBranches(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleAddBranch = () => {
    alert("Modal de agregar sucursal próximamente...");
  };

  // 👈 Pantalla de carga mientras verificamos los permisos
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-on-surface-variant font-medium">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // 👇 Renderizado normal de la vista del Gerente
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