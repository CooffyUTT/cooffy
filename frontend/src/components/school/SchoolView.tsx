"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SchoolBranch } from '@/types/school';
import { INITIAL_SCHOOL_BRANCHES } from '@/data/mockBranches';
import { SchoolHeader } from './SchoolHeader';
import { BranchHeader } from '@/components/manager/BranchHeader';
import { SchoolBranchTable } from './SchoolBranchTable';

export function SchoolView() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window === "undefined") return false;

    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) return false;

    try {
      const userData = JSON.parse(userDataStr);
      return Boolean(userData.groups && userData.groups.includes("admin_escolar"));
    } catch {
      return false;
    }
  });

  const [branches, setBranches] = useState<SchoolBranch[]>(INITIAL_SCHOOL_BRANCHES);

  useEffect(() => {
    if (!isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, router]);

  const handleViewBranch = (branch: SchoolBranch) => {
    alert(`Ver detalles de "${branch.name}" próximamente...`);
  };

  const handleEditBranch = (branch: SchoolBranch) => {
    alert(`Editar "${branch.name}" próximamente...`);
  };

  const handleAddBranch = () => {
    alert("Modal de agregar sucursal próximamente...");
  };

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

  return (
    <div className="min-h-screen bg-background font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      <SchoolHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        <BranchHeader onAddBranch={handleAddBranch} />

        <SchoolBranchTable
          branches={branches}
          onView={handleViewBranch}
          onEdit={handleEditBranch}
        />
      </main>
    </div>
  );
}
