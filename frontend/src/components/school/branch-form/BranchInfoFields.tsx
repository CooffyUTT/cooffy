"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BranchInfoFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
}

export function BranchInfoFields({
  name,
  onNameChange,
  location,
  onLocationChange,
}: BranchInfoFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="branch-name">Nombre de la sucursal</Label>
        <Input
          id="branch-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Ej: Cafetería Central"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch-location">Ubicación</Label>
        <Input
          id="branch-location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Ej: Edificio A, Planta Baja"
        />
      </div>
    </>
  );
}
