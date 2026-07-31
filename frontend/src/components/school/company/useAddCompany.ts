"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchoolCompany } from "@/types/school";

interface UseAddCompanyProps {
  companies: SchoolCompany[];
  setCompanies: React.Dispatch<React.SetStateAction<SchoolCompany[]>>;
  onSuccess: () => void;
}

export function useAddCompany({
  companies,
  setCompanies,
  onSuccess,
}: UseAddCompanyProps) {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const selectedCompany =
    companyId != null ? companies.find((c) => c.id === companyId) : undefined;

  const canSubmit = companyId != null;

  const reset = () => {
    setCompanyId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || companyId == null) return;

    if (!selectedCompany) return;

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, inSchool: true } : c,
      ),
    );

    toast.success("Compañía vinculada", {
      description: `${selectedCompany.name} agregada a la escuela.`,
    });

    reset();
    onSuccess();
  };

  return {
    companyId,
    setCompanyId,
    selectedCompany,
    canSubmit,
    handleSubmit,
    reset,
  };
}
