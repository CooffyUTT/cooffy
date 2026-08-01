"use client";

import React, { useState, useRef } from "react";
import { Users, Clock, Trash2, Pencil, ChevronRight, X, Check } from "lucide-react";
import { Branch, BranchUpdateData } from "@/types/manager";
import { formatCurrency } from "@/utils/formatters";
import { BaseCard, CardMedia, CardFooter } from "../layout/BaseCard";

interface BranchCardProps {
  branch: Branch;
  onDelete: (id: string, name: string) => void;
  onSave: (id: string, data: BranchUpdateData) => Promise<boolean>;
  onManage?: (id: string) => void;
}

export function BranchCard({ branch, onDelete, onSave, onManage }: BranchCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(branch.name);
  const [location, setLocation] = useState(branch.address);
  const [schedule, setSchedule] = useState(branch.schedule);
  const [active, setActive] = useState(branch.status === "open");
  const [newImage, setNewImage] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setName(branch.name);
    setLocation(branch.address);
    setSchedule(branch.schedule);
    setActive(branch.status === "open");
    setNewImage(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNewImage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await onSave(branch.id, {
        name,
        location,
        schedule,
        active,
        imageFile: newImage,
      });
      if (saved) {
        setIsEditing(false);
        setNewImage(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImage(e.target.files?.[0] ?? null);
  };

  const displayImage = newImage ? URL.createObjectURL(newImage) : branch.imageUrl;

  const inputClass =
    "w-1/2 text-sm font-medium text-on-surface bg-surface-container-low border border-outline-variant/40 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40";

  const statusBadge = isEditing ? (
    <button
      type="button"
      onClick={() => setActive((prev) => !prev)}
      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs cursor-pointer transition-colors ${
        active ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
      }`}
    >
      {active ? "Abierto" : "Cerrado"}
    </button>
  ) : (
    <span
      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${
        branch.status === "open" ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
      }`}
    >
      {branch.status === "open" ? "Abierto" : "Cerrado"}
    </span>
  );

  return (
    <BaseCard animate>
      <div className="relative">
        <CardMedia
          src={displayImage}
          alt={branch.name}
          badge={statusBadge}
          fallbackText="Sin foto disponible"
          imageClassName={isEditing ? "blur-[8px]" : ""}
        />

        {isEditing && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 z-[5] flex items-center justify-center text-xs font-semibold text-white bg-black/40 hover:bg-black/50 transition-colors cursor-pointer"
          >
            <span className="bg-black/60 px-3 py-1.5 rounded-lg">Cambiar foto</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-1">
            {isEditing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                aria-label="Nombre de la sucursal"
              />
            ) : (
              <h4 className="font-semibold text-on-surface leading-snug">{branch.name}</h4>
            )}
            <span className="font-bold text-primary whitespace-nowrap text-sm">
              {formatCurrency(branch.dailySales)}
            </span>
          </div>

          {isEditing ? (
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${inputClass} mb-3`}
              aria-label="Ubicación de la sucursal"
            />
          ) : (
            <p className="text-xs text-on-surface-variant line-clamp-1 mb-3">
              {branch.address}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-variant/80 pt-1 border-t border-outline-variant/10 mb-4">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>{branch.employeesCount} emp.</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {isEditing ? (
                <input
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  className="text-xs bg-surface-container-low border border-outline-variant/40 rounded-md px-1.5 py-0.5 w-28 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label="Horario de la sucursal"
                />
              ) : (
                <span>{branch.schedule}</span>
              )}
            </div>
          </div>
        </div>

        <CardFooter className="pt-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onDelete(branch.id, branch.name)}
                className="text-xs font-semibold text-red-600 hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>

              <div className="flex items-center gap-2">
                <button
                  aria-label={`Modificar ${branch.name}`}
                  onClick={handleStartEdit}
                  className="p-1.5 rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:border-primary transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => onManage?.(branch.id)}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  Gestionar <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </CardFooter>
      </div>
    </BaseCard>
  );
}
