"use client";

import React from 'react';

export function BranchHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[#5C3D2E]">Sucursales</h1>
        <p className="text-xs text-stone-500 mt-1">Administra y supervisa los planteles asignados a tu cuenta.</p>
      </div>
    </div>
  );
}
