"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchoolBranch, SchoolCompany } from "@/types/school";

export type BranchFormMode = "create" | "edit";

interface UseBranchFormProps {
  mode: BranchFormMode;
  initialBranch?: SchoolBranch;
  companies: SchoolCompany[];
  setBranches: React.Dispatch<React.SetStateAction<SchoolBranch[]>>;
  onSuccess: () => void;
}

export function useBranchForm({
  mode,
  initialBranch,
  companies,
  setBranches,
  onSuccess,
}: UseBranchFormProps) {
  const [companyValue, setCompanyValue] = useState<string>(() => {
    if (mode !== "edit" || !initialBranch) return "";
    return companies.find((c) => c.name === initialBranch.company)?.id ?? "";
  });
  const [name, setName] = useState(initialBranch?.name ?? "");
  const [location, setLocation] = useState(initialBranch?.location ?? "");

  const availableCompanies = companies.filter((c) => c.inSchool);

  const canSubmit = name.trim().length > 0 && companyValue.length > 0;

  const reset = () => {
    setCompanyValue("");
    setName("");
    setLocation("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const chosenCompany = companies.find((c) => c.id === companyValue);
    if (!chosenCompany) return;

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

      toast.success("Sucursal creada", {
        description: `${newBranch.name} agregada a ${chosenCompany.name}.`,
      });
    }

    reset();
    onSuccess();
  };

  return {
    companyValue,
    setCompanyValue,
    name,
    location,
    availableCompanies,
    canSubmit,
    setName,
    setLocation,
    handleSubmit,
    reset,
  };
}
