"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchoolBranch } from "@/types/school";
import { MockCompany } from "@/data/mockBranches";

export const INVITE_VALUE = "__invite__";

interface UseAddBranchFormProps {
  companies: MockCompany[];
  setCompanies: React.Dispatch<React.SetStateAction<MockCompany[]>>;
  setBranches: React.Dispatch<React.SetStateAction<SchoolBranch[]>>;
}

export function useAddBranchForm({
  companies,
  setCompanies,
  setBranches,
}: UseAddBranchFormProps) {
  const [companyValue, setCompanyValue] = useState<string>("");
  const [invitedCompanyId, setInvitedCompanyId] = useState<string>("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

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

    if (isInviting) {
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

    const newBranch: SchoolBranch = {
      id: crypto.randomUUID(),
      name: name.trim(),
      company: chosenCompany.name,
      location: location.trim(),
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

    reset();
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
