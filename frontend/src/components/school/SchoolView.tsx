"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SchoolBranch } from '@/types/school';
import { INITIAL_SCHOOL_BRANCHES, MOCK_COMPANIES, MockCompany } from '@/data/mockBranches';
import { SchoolHeader } from './SchoolHeader';
import { BranchHeader } from '@/components/manager/BranchHeader';
import { SchoolBranchTable } from './SchoolBranchTable';
import { AddBranchDialog } from './AddBranchDialog';

export function SchoolView() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [branches, setBranches] = useState<SchoolBranch[]>(INITIAL_SCHOOL_BRANCHES);
  const [companies, setCompanies] = useState<MockCompany[]>(MOCK_COMPANIES);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      router.push("/");
      return;
    }
    try {
      const userData = JSON.parse(userDataStr);
      if (userData.groups && userData.groups.includes("admin_escolar")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAuthorized(true);
      } else {
        router.push("/");
      }
    } catch {
      router.push("/");
    }
  }, [router]);

  const handleViewBranch = (branch: SchoolBranch) => {
    alert(`Ver detalles de "${branch.name}" próximamente...`);
  };

  const handleEditBranch = (branch: SchoolBranch) => {
    alert(`Editar "${branch.name}" próximamente...`);
  };

  const handleAddBranch = () => setIsAddDialogOpen(true);

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

      <AddBranchDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        setBranches={setBranches}
        companies={companies}
        setCompanies={setCompanies}
      />
    </div>
  );
}
