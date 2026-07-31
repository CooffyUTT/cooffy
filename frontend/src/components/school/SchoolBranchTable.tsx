"use client";

import React from "react";
import { DataTable, Column } from "@/components/layout/DataTable";
import { SchoolBranch } from "@/types/school";

interface SchoolBranchTableProps {
  branches: SchoolBranch[];
  onView: (branch: SchoolBranch) => void;
}

const COLUMNS: Column<SchoolBranch>[] = [
  {
    header: "Nombre",
    render: (b) => b.name,
    cellClassName: "font-semibold text-on-surface",
  },
  {
    header: "Compañía",
    render: (b) => b.company,
  },
  {
    header: "Ubicación",
    render: (b) => b.location,
  },
];

export function SchoolBranchTable({ branches, onView }: SchoolBranchTableProps) {
  return (
    <DataTable
      data={branches}
      columns={COLUMNS}
      keyExtractor={(b) => b.id}
      onRowClick={onView}
    />
  );
}
