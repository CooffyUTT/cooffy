"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SchoolBranch } from '@/types/school';
import { INITIAL_SCHOOL_BRANCHES, MOCK_COMPANIES, MockCompany } from '@/data/mockBranches';
import { SchoolHeader } from './SchoolHeader';
import { BranchHeader } from '@/components/manager/BranchHeader';
import { SchoolBranchTable } from './SchoolBranchTable';
import { BranchDialog, BranchDialogMode } from './BranchDialog';

export function SchoolView() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [branches, setBranches] = useState<SchoolBranch[]>(INITIAL_SCHOOL_BRANCHES);
  const [companies, setCompanies] = useState<MockCompany[]>(MOCK_COMPANIES);

  const [dialogMode, setDialogMode] = useState<BranchDialogMode>('create');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const activeBranches = useMemo(
    () => branches.filter((b) => b.active),
    [branches],
  );

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedBranchId),
    [branches, selectedBranchId],
  );

  const openCreate = () => {
    setSelectedBranchId(null);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const openView = (branch: SchoolBranch) => {
    setSelectedBranchId(branch.id);
    setDialogMode('view');
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedBranchId(null);
    }
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
        <BranchHeader onAddBranch={openCreate} />

        <SchoolBranchTable
          branches={activeBranches}
          onView={openView}
        />
      </main>

      <BranchDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        mode={dialogMode}
        branch={selectedBranch}
        onModeChange={setDialogMode}
        companies={companies}
        setCompanies={setCompanies}
        setBranches={setBranches}
      />
    </div>
  );
}
