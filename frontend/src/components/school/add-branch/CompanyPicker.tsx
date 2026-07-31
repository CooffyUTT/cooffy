"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MockCompany } from "@/data/mockBranches";
import { INVITE_VALUE } from "./useAddBranchForm";

interface CompanyPickerProps {
  value: string;
  onChange: (value: string) => void;
  availableCompanies: MockCompany[];
  hasInvitableCompanies: boolean;
}

export function CompanyPicker({
  value,
  onChange,
  availableCompanies,
  hasInvitableCompanies,
}: CompanyPickerProps) {
  const selectedCompany = availableCompanies.find((c) => c.id === value);
  const displayValue =
    value === INVITE_VALUE
      ? "Invitar otra compañía…"
      : selectedCompany?.name;

  return (
    <div className="space-y-2">
      <Label htmlFor="company-select">Compañía</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="company-select" className="w-full">
          <SelectValue placeholder="Selecciona una compañía">
            {displayValue}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableCompanies.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
          {hasInvitableCompanies && (
            <SelectItem value={INVITE_VALUE}>
              Invitar otra compañía…
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
