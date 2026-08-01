"use client";

import React from "react";
import { DataTable, Column } from "@/components/layout/DataTable";
import { SchoolCompanyWithMeta } from "@/types/school";

interface CompanyTableProps {
  companies: SchoolCompanyWithMeta[];
  onRowClick: (company: SchoolCompanyWithMeta) => void;
}

const COLUMNS: Column<SchoolCompanyWithMeta>[] = [
  {
    header: "Nombre",
    render: (c) => c.name,
    cellClassName: "font-semibold text-on-surface",
  },
  {
    header: "Gerente",
    render: (c) => c.ownerName,
  },
  {
    header: "Contacto",
    render: (c) => c.contact,
  },
  {
    header: "Sucursales",
    render: (c) => c.branchCount,
    headerClassName: "text-right",
    cellClassName: "text-right",
  },
];

export function CompanyTable({ companies, onRowClick }: CompanyTableProps) {
  return (
    <DataTable
      data={companies}
      columns={COLUMNS}
      keyExtractor={(c) => c.id}
      onRowClick={onRowClick}
    />
  );
}
