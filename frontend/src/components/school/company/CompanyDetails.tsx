"use client";

import React from "react";
import { Building2, User, Mail, MapPin } from "lucide-react";
import { SchoolBranch, SchoolCompany } from "@/types/school";
import { Button } from "@/components/ui/button";

interface CompanyDetailsProps {
  company: SchoolCompany;
  branches: SchoolBranch[];
  onClose: () => void;
}

export function CompanyDetails({ company, branches, onClose }: CompanyDetailsProps) {
  const companyBranches = branches.filter(b => b.company === company.name && b.active);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-on-surface">{company.name}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          Cerrar
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 text-sm">
        <Field icon={User} label="Gerente" value={company.ownerName} />
        <Field icon={Mail} label="Contacto" value={company.contact} />
        <Field icon={Building2} label="Sucursales en la escuela" value={String(companyBranches.length)} />
      </div>

      {companyBranches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-on-surface">Sucursales activas</h4>
          <ul className="space-y-1">
            {companyBranches.map(branch => (
              <li key={branch.id} className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-on-surface">{branch.name}</p>
                  <p className="text-xs text-on-surface-variant">{branch.location}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {companyBranches.length === 0 && (
        <p className="text-sm text-on-surface-variant italic">
          Esta compañía no tiene sucursales activas en la escuela.
        </p>
      )}
    </div>
  );
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function Field({ icon: Icon, label, value }: FieldProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          {label}
        </p>
        <p className="text-on-surface break-words">{value}</p>
      </div>
    </div>
  );
}
