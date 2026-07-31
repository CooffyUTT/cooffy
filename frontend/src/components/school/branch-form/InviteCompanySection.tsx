"use client";

import { Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MockCompany } from "@/data/mockBranches";

interface InviteCompanySectionProps {
  invitedCompanyId: string;
  onChange: (value: string) => void;
  notInSchoolCompanies: MockCompany[];
  invitedCompany: MockCompany | undefined;
}

export function InviteCompanySection({
  invitedCompanyId,
  onChange,
  notInSchoolCompanies,
  invitedCompany,
}: InviteCompanySectionProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="invite-company-select">Compañía a invitar</Label>
        <Select value={invitedCompanyId} onValueChange={onChange}>
          <SelectTrigger id="invite-company-select" className="w-full">
            <SelectValue placeholder="Selecciona una compañía">
              {invitedCompany?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {notInSchoolCompanies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {invitedCompany && (
        <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-on-surface">
          <Mail className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p>
            Se enviará una invitación a{" "}
            <span className="font-semibold">{invitedCompany.name}</span>{" "}
            (gerente:{" "}
            <span className="font-semibold">{invitedCompany.ownerName}</span>)
            para que opere en tu escuela.
          </p>
        </div>
      )}
    </div>
  );
}
