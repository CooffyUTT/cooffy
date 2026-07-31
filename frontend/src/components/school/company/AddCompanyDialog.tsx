"use client";

import React from "react";
import { Building2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchoolCompany } from "@/types/school";
import { useAddCompany } from "./useAddCompany";

interface AddCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companies: SchoolCompany[];
  onLinkCompany: (companyId: number) => void;
}

export function AddCompanyDialog({
  open,
  onOpenChange,
  companies,
  onLinkCompany,
}: AddCompanyDialogProps) {
  const form = useAddCompany({
    companies,
    onLinkCompany,
    onSuccess: () => onOpenChange(false),
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const availableCompanies = companies.filter((c) => !c.inSchool);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>Agregar compañía</DialogTitle>
          <DialogDescription>
            Vincula una compañía existente a tu escuela.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-select">Compañía</Label>
            <Select
              value={form.companyId != null ? String(form.companyId) : ""}
              onValueChange={(v) => form.setCompanyId(v ? Number(v) : null)}
            >
              <SelectTrigger id="company-select" className="w-full">
                <SelectValue placeholder="Selecciona una compañía">
                  {form.selectedCompany?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableCompanies.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.selectedCompany && (
            <div className="flex gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-on-surface">
              <Building2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <p>
                Se vinculará{" "}
                <span className="font-semibold">{form.selectedCompany.name}</span>{" "}
                (gerente:{" "}
                <span className="font-semibold">
                  {form.selectedCompany.ownerName}
                </span>
                ) a tu escuela.
              </p>
            </div>
          )}

          <DialogFooter className="-mx-4 -mb-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={!form.canSubmit}>
              <Building2 className="h-4 w-4" />
              Vincular compañía
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
