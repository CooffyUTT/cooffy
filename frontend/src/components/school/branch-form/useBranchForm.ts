"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchoolBranch } from "@/types/school";
import { MockCompany } from "@/data/mockBranches";

export const INVITE_VALUE = "__invite__";

export type BranchFormMode = "create" | "edit";

interface UseBranchFormProps {
  mode: BranchFormMode;
  initialBranch?: SchoolBranch;
  companies: MockCompany[];
  setCompanies: React.Dispatch<React.SetStateAction<MockCompany[]>>;
  setBranches: React.Dispatch<React.SetStateAction<SchoolBranch[]>>;
  onSuccess: () => void;
}

export function useBranchForm({
  mode,
  initialBranch,
  companies,
  setCompanies,
  setBranches,
  onSuccess,
}: UseBranchFormProps) {
  const [companyValue, setCompanyValue] = useState<string>(() => {
    if (mode !== "edit" || !initialBranch) return "";
    return companies.find((c) => c.name === initialBranch.company)?.id ?? "";
  });
  const [invitedCompanyId, setInvitedCompanyId] = useState<string>("");
  const [name, setName] = useState(initialBranch?.name ?? "");
  const [location, setLocation] = useState(initialBranch?.location ?? "");

  const availableCompanies = companies.filter((c) => c.inSchool);
  const notInSchoolCompanies = companies.filter((c) => !c.inSchool);
  const invitedCompany = companies.find((c) => c.id === invitedCompanyId);

  const isInviting = companyValue === INVITE_VALUE;
  const canSubmit =
    name.trim().length > 0 &&
    ((!isInviting && companyValue.length > 0) ||
      (isInviting && invitedCompanyId.length > 0));

  const selectCompany = (value: string) => {
    setCompanyValue(value);
    if (value !== INVITE_VALUE) {
      setInvitedCompanyId("");
    }
  };

  const reset = () => {
    setCompanyValue("");
    setInvitedCompanyId("");
    setName("");
    setLocation("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    let chosenCompany: MockCompany | undefined;

    if (mode === "edit" && initialBranch) {
      chosenCompany = companies.find((c) => c.name === initialBranch.company);
      if (!chosenCompany) return;
    } else if (isInviting) {
      chosenCompany = notInSchoolCompanies.find((c) => c.id === invitedCompanyId);
      if (!chosenCompany) return;
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === chosenCompany!.id ? { ...c, inSchool: true } : c,
        ),
      );
    } else {
      chosenCompany = companies.find((c) => c.id === companyValue);
      if (!chosenCompany) return;
    }

    const now = new Date().toISOString();

    if (mode === "edit" && initialBranch) {
      const updated: SchoolBranch = {
        ...initialBranch,
        name: name.trim(),
        location: location.trim(),
        company: chosenCompany.name,
        updatedAt: now,
      };
      setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success("Sucursal actualizada", {
        description: `${updated.name} actualizada.`,
      });
    } else {
      const newBranch: SchoolBranch = {
        id: crypto.randomUUID(),
        name: name.trim(),
        company: chosenCompany.name,
        location: location.trim(),
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      setBranches((prev) => [newBranch, ...prev]);

      if (isInviting) {
        toast.success("Sucursal creada e invitación enviada", {
          description: `${newBranch.name} agregada a ${chosenCompany.name}. Invitación enviada a ${chosenCompany.ownerName} (mock).`,
        });
      } else {
        toast.success("Sucursal creada", {
          description: `${newBranch.name} agregada a ${chosenCompany.name}.`,
        });
      }
    }

    reset();
    onSuccess();
  };

  return {
    companyValue,
    invitedCompanyId,
    name,
    location,
    availableCompanies,
    notInSchoolCompanies,
    invitedCompany,
    isInviting,
    canSubmit,
    selectCompany,
    setInvitedCompanyId,
    setName,
    setLocation,
    handleSubmit,
    reset,
  };
}
