"use client";

import React, { useMemo } from "react";
import { Building2, User, MapPin, Store, PowerOff } from "lucide-react";
import { DataTable, Column } from "@/components/layout/DataTable";
import { SchoolBranch, SchoolCompany } from "@/types/school";

interface SchoolBranchTableProps {
  branches: SchoolBranch[];
  companies: SchoolCompany[];
  onView: (branch: SchoolBranch) => void;
}

interface CompanyGroup {
  companyId: number | null;
  companyName: string;
  ownerName: string | null;
  branches: SchoolBranch[];
}

const ACTIVE_COLUMNS: Column<SchoolBranch>[] = [
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

const INACTIVE_COLUMNS: Column<SchoolBranch>[] = [
  {
    header: "Nombre",
    render: (b) => (
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-outline-variant/40 px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
          <PowerOff className="h-3 w-3" />
          Inactiva
        </span>
        <span className="font-semibold text-on-surface">{b.name}</span>
      </span>
    ),
  },
  {
    header: "Compañía",
    render: (b) => b.companyName,
  },
  {
    header: "Ubicación",
    render: (b) =>
      b.location ? (
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
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
  const { activeGroups, inactive } = useMemo(() => {
    const activeBranches = branches.filter((b) => b.active);
    const inactiveBranches = branches.filter((b) => !b.active);

    const byCompany = new Map<number, SchoolBranch[]>();
    for (const branch of activeBranches) {
      const list = byCompany.get(branch.companyId) ?? [];
      list.push(branch);
      byCompany.set(branch.companyId, list);
    }

    const groups: CompanyGroup[] = Array.from(byCompany.entries())
      .map(([companyId, groupBranches]) => {
        const company = companies.find((c) => c.id === companyId) ?? null;
        return {
          companyId,
          companyName: company?.name ?? groupBranches[0]?.companyName ?? "Compañía sin asignar",
          ownerName: company?.ownerName ?? null,
          branches: groupBranches,
        };
      })
      .sort((a, b) => a.companyName.localeCompare(b.companyName));

    return { activeGroups: groups, inactive: inactiveBranches };
  }, [branches, companies]);

  if (activeGroups.length === 0 && inactive.length === 0) {
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
      {activeGroups.length > 0 ? (
        activeGroups.map((group) => (
          <section
            key={group.companyId}
            className="space-y-3"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building2 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-on-surface truncate">
                    {group.companyName}
                  </h2>
                  {group.ownerName && (
                    <p className="text-xs text-on-surface-variant inline-flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Gerente: {group.ownerName}
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
              columns={ACTIVE_COLUMNS}
              keyExtractor={(b) => b.id}
              onRowClick={onView}
            />
          </section>
        ))
      ) : (
        <div className="bg-surface rounded-2xl border border-outline-variant/20 p-8 text-center">
          <p className="text-sm text-on-surface-variant font-medium">
            No hay sucursales activas en este momento.
          </p>
        </div>
      )}

      {inactive.length > 0 && (
        <section className="space-y-3 opacity-80">
          <header className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-low/60 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-outline-variant/40 text-on-surface-variant">
                <PowerOff className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-on-surface truncate">
                  Sucursales inactivas
                </h2>
                <p className="text-xs text-on-surface-variant">
                  Sucursales que fueron dadas de baja.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant">
              {inactive.length === 1
                ? "1 sucursal"
                : `${inactive.length} sucursales`}
            </span>
          </header>

          <DataTable
            data={inactive}
            columns={INACTIVE_COLUMNS}
            keyExtractor={(b) => b.id}
            onRowClick={onView}
          />
        </section>
      )}
    </div>
  );
}
