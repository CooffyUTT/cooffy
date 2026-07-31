"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchoolCompany } from "@/types/school";

interface CompanyPickerProps {
  value: string;
  onChange: (value: string) => void;
  availableCompanies: SchoolCompany[];
}

export function CompanyPicker({
  value,
  onChange,
  availableCompanies,
}: CompanyPickerProps) {
  const selectedCompany = availableCompanies.find((c) => c.id === value);
  const displayValue = selectedCompany?.name;

  return (
    <div className="space-y-2">
      <Label htmlFor="company-select">Compañía</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
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
        </SelectContent>
      </Select>
    </div>
  );
}
