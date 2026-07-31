"use client";

import React, { useMemo } from "react";
import { Building2, User, MapPin, Store } from "lucide-react";
import { DataTable, Column } from "@/components/layout/DataTable";
import { SchoolBranch, SchoolCompany } from "@/types/school";

interface SchoolBranchTableProps {
  branches: SchoolBranch[];
  companies: SchoolCompany[];
  onView: (branch: SchoolBranch) => void;
}

interface CompanyGroup {
  company: SchoolCompany | null;
  branches: SchoolBranch[];
}

const COLUMNS: Column<SchoolBranch>[] = [
  {
    header: "Nombre",
    render: (b) => b.name,
    cellClassName: "font-semibold text-on-surface",
  },
  {
    header: "Ubicación",
    render: (b) =>
      b.location ? (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          {b.location}
        </span>
      ) : (
        <span className="text-on-surface-variant italic">Sin ubicación</span>
      ),
  },
];

export function SchoolBranchTable({
  branches,
  companies,
  onView,
}: SchoolBranchTableProps) {
  const groups = useMemo<CompanyGroup[]>(() => {
    const byCompany = new Map<string, SchoolBranch[]>();
    for (const branch of branches) {
      const list = byCompany.get(branch.company) ?? [];
      list.push(branch);
      byCompany.set(branch.company, list);
    }
    return Array.from(byCompany.entries())
      .map(([name, groupBranches]) => ({
        company: companies.find((c) => c.name === name) ?? null,
        branches: groupBranches,
      }))
      .sort((a, b) => {
        const aName = a.company?.name ?? a.branches[0]?.company ?? "";
        const bName = b.company?.name ?? b.branches[0]?.company ?? "";
        return aName.localeCompare(bName);
      });
  }, [branches, companies]);

  if (groups.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-outline-variant/20 p-10 text-center">
        <Store className="h-8 w-8 text-on-surface-variant mx-auto mb-2" />
        <p className="text-sm text-on-surface-variant font-medium">
          Aún no hay sucursales registradas en la escuela.
        </p>
        <p className="text-xs text-on-surface-variant mt-1">
          Usa el botón &ldquo;Agregar sucursal&rdquo; para crear la primera.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.company?.id ?? group.branches[0]?.company}
          className="space-y-3"
        >
          <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-on-surface truncate">
                  {group.company?.name ?? "Compañía sin asignar"}
                </h2>
                {group.company?.ownerName && (
                  <p className="text-xs text-on-surface-variant inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Gerente: {group.company.ownerName}
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">
              {group.branches.length === 1
                ? "1 sucursal"
                : `${group.branches.length} sucursales`}
            </span>
          </header>

          <DataTable
            data={group.branches}
            columns={COLUMNS}
            keyExtractor={(b) => b.id}
            onRowClick={onView}
          />
        </section>
      ))}
    </div>
  );
}
