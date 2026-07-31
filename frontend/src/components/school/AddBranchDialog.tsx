"use client";

import React from "react";
import { Store } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SchoolBranch } from "@/types/school";
import { MockCompany } from "@/data/mockBranches";
import { useAddBranchForm } from "./add-branch/useAddBranchForm";
import { CompanyPicker } from "./add-branch/CompanyPicker";
import { InviteCompanySection } from "./add-branch/InviteCompanySection";
import { BranchInfoFields } from "./add-branch/BranchInfoFields";

interface AddBranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: MockCompany[];
  setCompanies: React.Dispatch<React.SetStateAction<MockCompany[]>>;
  setBranches: React.Dispatch<React.SetStateAction<SchoolBranch[]>>;
}

export function AddBranchDialog({
  open,
  onOpenChange,
  companies,
  setCompanies,
  setBranches,
}: AddBranchDialogProps) {
  const form = useAddBranchForm({ companies, setCompanies, setBranches });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>Nueva sucursal</DialogTitle>
          <DialogDescription>
            Da de alta una sucursal dentro de tu escuela.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <CompanyPicker
            value={form.companyValue}
            onChange={form.selectCompany}
            availableCompanies={form.availableCompanies}
            hasInvitableCompanies={form.notInSchoolCompanies.length > 0}
          />

          {form.isInviting && (
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
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!form.canSubmit}>
              <Store className="h-4 w-4" />
              Crear sucursal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
