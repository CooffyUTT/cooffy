"use client";

import React from "react";
import { Store, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SchoolBranch } from "@/types/school";
import { MockCompany } from "@/data/mockBranches";
import { useBranchForm } from "./branch-form/useBranchForm";
import { CompanyPicker } from "./branch-form/CompanyPicker";
import { InviteCompanySection } from "./branch-form/InviteCompanySection";
import { BranchInfoFields } from "./branch-form/BranchInfoFields";
import { BranchDetails } from "./branch-form/BranchDetails";

export type BranchDialogMode = "create" | "view" | "edit";

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: BranchDialogMode;
  branch?: SchoolBranch;
  onModeChange: (mode: BranchDialogMode) => void;
  companies: MockCompany[];
  setCompanies: React.Dispatch<React.SetStateAction<MockCompany[]>>;
  setBranches: React.Dispatch<React.SetStateAction<SchoolBranch[]>>;
}

const TITLES: Record<BranchDialogMode, string> = {
  create: "Nueva sucursal",
  view: "Detalles de la sucursal",
  edit: "Editar sucursal",
};

const DESCRIPTIONS: Record<BranchDialogMode, string> = {
  create: "Da de alta una sucursal dentro de tu escuela.",
  view: "Información completa de la sucursal seleccionada.",
  edit: "Modifica la información básica de la sucursal.",
};

export function BranchDialog({
  open,
  onOpenChange,
  mode,
  branch,
  onModeChange,
  companies,
  setCompanies,
  setBranches,
}: BranchDialogProps) {
  const company = branch
    ? companies.find((c) => c.name === branch.company)
    : undefined;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDeactivate = () => {
    if (!branch) return;
    if (
      !confirm(
        `¿Estás seguro de que deseas dar de baja la sucursal "${branch.name}"?`,
      )
    )
      return;
    const now = new Date().toISOString();
    setBranches((prev) =>
      prev.map((b) =>
        b.id === branch.id ? { ...b, active: false, updatedAt: now } : b,
      ),
    );
    toast.success("Sucursal dada de baja", {
      description: `${branch.name} ya no aparece como activa.`,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>{TITLES[mode]}</DialogTitle>
          <DialogDescription>{DESCRIPTIONS[mode]}</DialogDescription>
        </DialogHeader>

        {mode === "view" && branch ? (
          <BranchDetails
            branch={branch}
            company={company}
            onEdit={() => onModeChange("edit")}
            onDeactivate={handleDeactivate}
          />
        ) : (
          <BranchFormBody
            mode={mode}
            branch={branch}
            companies={companies}
            setCompanies={setCompanies}
            setBranches={setBranches}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface BranchFormBodyProps {
  mode: "create" | "edit";
  branch?: SchoolBranch;
  companies: MockCompany[];
  setCompanies: React.Dispatch<React.SetStateAction<MockCompany[]>>;
  setBranches: React.Dispatch<React.SetStateAction<SchoolBranch[]>>;
  onSuccess: () => void;
  onCancel: () => void;
}

function BranchFormBody({
  mode,
  branch,
  companies,
  setCompanies,
  setBranches,
  onSuccess,
  onCancel,
}: BranchFormBodyProps) {
  const form = useBranchForm({
    mode,
    initialBranch: branch,
    companies,
    setCompanies,
    setBranches,
    onSuccess,
  });

  const isEditing = mode === "edit";

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      {isEditing && branch ? (
        <div className="space-y-2">
          <Label>Compañía</Label>
          <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2 text-sm text-on-surface">
            {branch.company}
          </div>
        </div>
      ) : (
        <CompanyPicker
          value={form.companyValue}
          onChange={form.selectCompany}
          availableCompanies={form.availableCompanies}
          hasInvitableCompanies={form.notInSchoolCompanies.length > 0}
        />
      )}

      {!isEditing && form.isInviting && (
        <InviteCompanySection
          invitedCompanyId={form.invitedCompanyId}
          onChange={form.setInvitedCompanyId}
          notInSchoolCompanies={form.notInSchoolCompanies}
          invitedCompany={form.invitedCompany}
        />
      )}

      <BranchInfoFields
        name={form.name}
        onNameChange={form.setName}
        location={form.location}
        onLocationChange={form.setLocation}
      />

      <DialogFooter className="-mx-4 -mb-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={!form.canSubmit}>
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              Guardar cambios
            </>
          ) : (
            <>
              <Store className="h-4 w-4" />
              Crear sucursal
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
