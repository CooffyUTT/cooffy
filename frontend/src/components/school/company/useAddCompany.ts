"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchoolCompany } from "@/types/school";

interface UseAddCompanyProps {
  companies: SchoolCompany[];
  onLinkCompany: (companyId: number) => Promise<void>;
  onSuccess: () => void;
}

export function useAddCompany({
  companies,
  onLinkCompany,
  onSuccess,
}: UseAddCompanyProps) {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const selectedCompany =
    companyId != null ? companies.find((c) => c.id === companyId) : undefined;

  const canSubmit = companyId != null;

  const reset = () => {
    setCompanyId(null);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || companyId == null) return;

    if (!selectedCompany) return;

    setIsSubmitting(true);
    try {
      await onLinkCompany(companyId);
      toast.success("Compañía vinculada", {
        description: `${selectedCompany.name} agregada a la escuela.`,
      });
      reset();
      onSuccess();
    } catch {
      toast.error("No se pudo vincular la compañía", {
        description: "La compañía puede haber sido vinculada previamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    companyId,
    setCompanyId,
    selectedCompany,
    canSubmit,
    isSubmitting,
    handleSubmit,
    reset,
  };
}
