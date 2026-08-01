"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SchoolBranch, SchoolCompanyWithMeta } from "@/types/school";
import { CompanyDetails } from "./CompanyDetails";

interface CompanyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: SchoolCompanyWithMeta;
  branches: SchoolBranch[];
}

export function CompanyDetailsDialog({
  open,
  onOpenChange,
  company,
  branches,
}: CompanyDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>Detalles de la compañía</DialogTitle>
          <DialogDescription>
            Información de {company.name} y sus sucursales.
          </DialogDescription>
        </DialogHeader>

        <CompanyDetails
          company={company}
          branches={branches}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
