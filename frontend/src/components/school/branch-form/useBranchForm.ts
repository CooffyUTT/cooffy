"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchoolBranch, SchoolCompany } from "@/types/school";

export type BranchFormMode = "create" | "edit";

interface UseBranchFormProps {
  mode: BranchFormMode;
  initialBranch?: SchoolBranch;
  companies: SchoolCompany[];
  onCreate: (branch: SchoolBranch) => Promise<void>;
  onUpdate: (branch: SchoolBranch) => Promise<void>;
  onSuccess: () => void;
}

export function useBranchForm({
  mode,
  initialBranch,
  companies,
  onCreate,
  onUpdate,
  onSuccess,
}: UseBranchFormProps) {
  const [companyValue, setCompanyValue] = useState<number | null>(() => {
    if (mode !== "edit" || !initialBranch) return null;
    return initialBranch.companyId;
  });
  const [name, setName] = useState(initialBranch?.name ?? "");
  const [location, setLocation] = useState(initialBranch?.location ?? "");

  const availableCompanies = companies.filter((c) => c.inSchool);

  const canSubmit =
    name.trim().length > 0 && companyValue != null;

  const reset = () => {
    setCompanyValue(null);
    setName("");
    setLocation("");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || companyValue == null) return;

    const chosenCompany = companies.find((c) => c.id === companyValue);
    if (!chosenCompany) return;

    const now = new Date().toISOString();
    const trimmedLocation = location.trim();

    setIsSubmitting(true);
    try {
      if (mode === "edit" && initialBranch) {
        const updated: SchoolBranch = {
          ...initialBranch,
          name: name.trim(),
          location: trimmedLocation.length > 0 ? trimmedLocation : null,
          companyId: chosenCompany.id,
          companyName: chosenCompany.name,
          updatedAt: now,
        };
        await onUpdate(updated);
        toast.success("Sucursal actualizada", {
          description: `${updated.name} actualizada.`,
        });
      } else {
        const newBranch: SchoolBranch = {
          id: 0,
          name: name.trim(),
          companyId: chosenCompany.id,
          companyName: chosenCompany.name,
          location: trimmedLocation.length > 0 ? trimmedLocation : null,
          active: true,
          createdAt: now,
          updatedAt: now,
        };
        await onCreate(newBranch);
        toast.success("Sucursal creada", {
          description: `${newBranch.name} agregada a ${chosenCompany.name}.`,
        });
      }

      reset();
      onSuccess();
    } catch {
      toast.error("No se pudo guardar la sucursal", {
        description: "Revisa los datos e inténtalo nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    companyValue,
    setCompanyValue,
    name,
    location,
    availableCompanies,
    canSubmit,
    isSubmitting,
    setName,
    setLocation,
    handleSubmit,
    reset,
  };
}
