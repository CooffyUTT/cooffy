"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { SchoolBranch } from "@/types/school";

interface SchoolBranchTableProps {
  branches: SchoolBranch[];
  onView: (branch: SchoolBranch) => void;
}

export function SchoolBranchTable({ branches, onView }: SchoolBranchTableProps) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-[0px_4px_20px_rgba(30,58,90,0.05)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-container-low hover:bg-surface-container-low">
            <TableHead className="font-bold text-on-surface">Nombre</TableHead>
            <TableHead className="font-bold text-on-surface">Compañía</TableHead>
            <TableHead className="font-bold text-on-surface">Ubicación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow
              key={branch.id}
              onClick={() => onView(branch)}
              className="cursor-pointer"
            >
              <TableCell className="font-semibold text-on-surface">{branch.name}</TableCell>
              <TableCell className="text-on-surface-variant">{branch.company}</TableCell>
              <TableCell className="text-on-surface-variant">{branch.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
