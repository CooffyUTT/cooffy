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

export interface Column<T> {
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/20 shadow-[0px_4px_20px_rgba(30,58,90,0.05)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-container-low hover:bg-surface-container-low">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={`font-bold text-on-surface ${col.headerClassName ?? ""}`}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={keyExtractor(item)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              className={onRowClick ? "cursor-pointer" : ""}
            >
              {columns.map((col, i) => (
                <TableCell key={i} className={col.cellClassName ?? ""}>
                  {col.render(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
