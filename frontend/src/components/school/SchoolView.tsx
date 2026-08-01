"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SchoolBranch, SchoolCompany, SchoolCompanyWithMeta } from "@/types/school";
import {
  ApiBranch,
  ApiCompany,
  createSchoolBranch,
  deactivateSchoolBranch,
  getSchoolBranches,
  getSchoolCompanies,
  updateSchoolBranch,
} from "@/lib/schoolApi";
import { SchoolHeader } from "./SchoolHeader";
import { BranchPageHeader } from "./BranchPageHeader";
import { SchoolBranchTable } from "./SchoolBranchTable";
import { BranchDialog, BranchDialogMode } from "./BranchDialog";
import { CompanyHeader } from "./company/CompanyHeader";
import { CompanyTable } from "./company/CompanyTable";
import { CompanyDetailsDialog } from "./company/CompanyDetailsDialog";

function mapBranch(branch: ApiBranch): SchoolBranch {
  return {
    id: branch.id,
    name: branch.name,
    companyId: branch.company,
    companyName: branch.company_name,
    location: branch.location,
    active: branch.active,
    createdAt: branch.created_at,
    updatedAt: branch.updated_at,
  };
}

function mapCompany(company: ApiCompany): SchoolCompany {
  return {
    id: company.id,
    name: company.name,
    ownerName: company.owner_name ?? "Sin gerente asignado",
    contact: "No disponible",
    inSchool: true,
  };
}

export function SchoolView() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"branches" | "companies">("branches");
  const [branches, setBranches] = useState<SchoolBranch[]>([]);
  const [companies, setCompanies] = useState<SchoolCompany[]>([]);
  const [dialogMode, setDialogMode] = useState<BranchDialogMode>("create");
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  useEffect(() => {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      router.push("/");
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      if (!userData.groups?.includes("admin_escolar")) {
        router.push("/");
        return;
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
      Promise.all([getSchoolBranches(), getSchoolCompanies()])
        .then(([branchData, companyData]) => {
          setBranches(branchData.map(mapBranch));
          setCompanies(companyData.map(mapCompany));
        })
        .catch(() => {
          setLoadError("No se pudo cargar la información de la escuela.");
        })
        .finally(() => setIsLoading(false));
    } catch {
      router.push("/");
    }
  }, [router]);

  const companiesWithMeta: SchoolCompanyWithMeta[] = useMemo(
    () =>
      companies.map((company) => ({
        ...company,
        branchCount: branches.filter(
          (branch) => branch.companyId === company.id && branch.active,
        ).length,
      })),
    [companies, branches],
  );

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.id === selectedBranchId),
    [branches, selectedBranchId],
  );

  const selectedCompany = useMemo(
    () => companiesWithMeta.find((company) => company.id === selectedCompanyId),
    [companiesWithMeta, selectedCompanyId],
  );

  const openCreate = () => {
    setSelectedBranchId(null);
    setDialogMode("create");
    setIsBranchDialogOpen(true);
  };

  const openView = (branch: SchoolBranch) => {
    setSelectedBranchId(branch.id);
    setDialogMode("view");
    setIsBranchDialogOpen(true);
  };

  const handleBranchDialogOpenChange = (open: boolean) => {
    setIsBranchDialogOpen(open);
    if (!open) setSelectedBranchId(null);
  };

  const handleCreateBranch = async (branch: SchoolBranch) => {
    const created = await createSchoolBranch({
      name: branch.name,
      company: branch.companyId,
      location: branch.location ?? undefined,
    });
    setBranches((previous) => [mapBranch(created), ...previous]);
  };

  const handleUpdateBranch = async (branch: SchoolBranch) => {
    const updated = await updateSchoolBranch(branch.id, {
      name: branch.name,
      location: branch.location ?? undefined,
    });
    setBranches((previous) =>
      previous.map((item) => (item.id === branch.id ? mapBranch(updated) : item)),
    );
  };

  const handleDeactivateBranch = async (branchId: number) => {
    const deactivated = await deactivateSchoolBranch(branchId);
    setBranches((previous) =>
      previous.map((item) =>
        item.id === branchId ? mapBranch(deactivated) : item,
      ),
    );
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] font-['Plus_Jakarta_Sans',sans-serif]">
        <p className="text-sm text-on-surface-variant font-medium">
          Verificando permisos...
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-on-surface-variant font-medium">Cargando panel...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="space-y-3 text-center">
          <p className="text-sm text-destructive">{loadError}</p>
          <button
            type="button"
            className="text-sm font-semibold text-primary underline"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      <SchoolHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <main
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-8"
      >
        {activeTab === "branches" ? (
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
            <CompanyHeader />
            <CompanyTable
              companies={companiesWithMeta}
              onRowClick={(company) => setSelectedCompanyId(company.id)}
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

      {selectedCompany && (
        <CompanyDetailsDialog
          open
          onOpenChange={(open) => !open && setSelectedCompanyId(null)}
          company={selectedCompany}
          branches={branches}
        />
      )}
    </div>
  );
}
