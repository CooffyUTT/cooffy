"use client";

import React from "react";
import { Pencil, PowerOff, Building2, MapPin, User, Calendar, Hash } from "lucide-react";
import { SchoolBranch } from "@/types/school";
import { MockCompany } from "@/data/mockBranches";
import { Button } from "@/components/ui/button";

interface BranchDetailsProps {
  branch: SchoolBranch;
  company: MockCompany | undefined;
  onEdit: () => void;
  onDeactivate: () => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function BranchDetails({
  branch,
  company,
  onEdit,
  onDeactivate,
}: BranchDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-on-surface">{branch.name}</h3>
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
              branch.active
                ? "bg-emerald-500 text-white"
                : "bg-outline-variant text-on-surface-variant"
            }`}
          >
            {branch.active ? "Activa" : "Inactiva"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          {branch.active && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDeactivate}
              className="flex items-center gap-1 text-error border-error/40 hover:bg-error/10 hover:text-error"
            >
              <PowerOff className="h-3.5 w-3.5" />
              Dar de baja
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-outline-variant/20 bg-surface-container-low p-4 text-sm">
        <Field icon={Building2} label="Compañía" value={branch.company} />
        {company && (
          <Field icon={User} label="Gerente" value={company.ownerName} />
        )}
        <Field
          icon={MapPin}
          label="Ubicación"
          value={branch.location || "Sin ubicación especificada"}
        />
        <Field icon={Hash} label="ID" value={branch.id} mono />
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/20">
          <Field
            icon={Calendar}
            label="Creada"
            value={formatDate(branch.createdAt)}
          />
          <Field
            icon={Calendar}
            label="Última modificación"
            value={formatDate(branch.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}

function Field({ icon: Icon, label, value, mono }: FieldProps) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-on-surface-variant">
          {label}
        </p>
        <p
          className={`text-on-surface ${mono ? "font-mono text-xs" : ""} break-words`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
