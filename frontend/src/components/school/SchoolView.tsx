"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SchoolBranch, SchoolCompanyWithMeta } from '@/types/school';
import { INITIAL_SCHOOL_BRANCHES, MOCK_COMPANIES } from '@/data/mockBranches';
import { SchoolHeader } from './SchoolHeader';
import { BranchPageHeader } from './BranchPageHeader';
import { SchoolBranchTable } from './SchoolBranchTable';
import { BranchDialog, BranchDialogMode } from './BranchDialog';
import { CompanyHeader } from './company/CompanyHeader';
import { CompanyTable } from './company/CompanyTable';
import { AddCompanyDialog } from './company/AddCompanyDialog';
import { CompanyDetailsDialog } from './company/CompanyDetailsDialog';

export function SchoolView() {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<'branches' | 'companies'>('branches');
  const [branches, setBranches] = useState<SchoolBranch[]>(INITIAL_SCHOOL_BRANCHES);
  const [companies, setCompanies] = useState(MOCK_COMPANIES);

  const [dialogMode, setDialogMode] = useState<BranchDialogMode>('create');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);

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

  const inSchoolCompanies = useMemo(
    () => companies.filter((c) => c.inSchool),
    [companies],
  );

  const companiesWithMeta: SchoolCompanyWithMeta[] = useMemo(
    () =>
      inSchoolCompanies.map((c) => ({
        ...c,
        branchCount: branches.filter(
          (b) => b.companyId === c.id && b.active,
        ).length,
      })),
    [inSchoolCompanies, branches],
  );

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedBranchId),
    [branches, selectedBranchId],
  );

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId),
    [companies, selectedCompanyId],
  );

  const openCreate = () => {
    setSelectedBranchId(null);
    setDialogMode('create');
    setIsBranchDialogOpen(true);
  };

  const openView = (branch: SchoolBranch) => {
    setSelectedBranchId(branch.id);
    setDialogMode('view');
    setIsBranchDialogOpen(true);
  };

  const handleBranchDialogOpenChange = (open: boolean) => {
    setIsBranchDialogOpen(open);
    if (!open) {
      setSelectedBranchId(null);
    }
  };

  const openAddCompany = () => {
    setIsAddCompanyDialogOpen(true);
  };

  const openCompanyDetails = (company: SchoolCompanyWithMeta) => {
    setSelectedCompanyId(company.id);
  };

  const handleCompanyDetailsClose = () => {
    setSelectedCompanyId(null);
  };

  const handleCreateBranch = (branch: SchoolBranch) => {
    setBranches((prev) => [branch, ...prev]);
  };

  const handleUpdateBranch = (branch: SchoolBranch) => {
    setBranches((prev) => prev.map((b) => (b.id === branch.id ? branch : b)));
  };

  const handleDeactivateBranch = (branchId: number) => {
    const now = new Date().toISOString();
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branchId ? { ...b, active: false, updatedAt: now } : b,
      ),
    );
  };

  const handleLinkCompany = (companyId: number) => {
    setCompanies((prev) =>
      prev.map((c) => (c.id === companyId ? { ...c, inSchool: true } : c)),
    );
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
      <SchoolHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8">
        {activeTab === 'branches' ? (
          <>
            <BranchPageHeader onAddBranch={openCreate} />
            <SchoolBranchTable
              branches={branches}
              companies={companies}
              onView={openView}
            />
          </>
        ) : (
          <>
            <CompanyHeader onAddCompany={openAddCompany} />
            <CompanyTable
              companies={companiesWithMeta}
              onRowClick={openCompanyDetails}
            />
          </>
        )}
      </main>

      <BranchDialog
        open={isBranchDialogOpen}
        onOpenChange={handleBranchDialogOpenChange}
        mode={dialogMode}
        branch={selectedBranch}
        onModeChange={setDialogMode}
        companies={companies}
        onCreate={handleCreateBranch}
        onUpdate={handleUpdateBranch}
        onDeactivate={handleDeactivateBranch}
      />

      <AddCompanyDialog
        open={isAddCompanyDialogOpen}
        onOpenChange={setIsAddCompanyDialogOpen}
        companies={companies}
        onLinkCompany={handleLinkCompany}
      />

      {selectedCompany && (
        <CompanyDetailsDialog
          open={!!selectedCompany}
          onOpenChange={(open) => !open && handleCompanyDetailsClose()}
          company={companiesWithMeta.find((c) => c.id === selectedCompany.id)!}
          branches={branches}
        />
      )}
    </div>
  );
}
