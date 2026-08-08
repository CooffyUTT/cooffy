"use client";

import React from "react";

interface HeaderBaseProps {
  /** Logo personalizado opcional, si no se pasa usa el por defecto */
  logo?: React.ReactNode;
  /** Elementos de navegación central */
  navigation?: React.ReactNode;
  /** Acciones a la derecha (Búsqueda, Notificaciones, Perfil, etc.) */
  actions?: React.ReactNode;
  /** Contenido para la versión móvil */
  mobileActions?: React.ReactNode;
}

export function HeaderBase({
  logo,
  navigation,
  actions,
  mobileActions,
}: HeaderBaseProps) {
  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-surface dark:bg-surface-dim shadow-[0px_4px_20px_rgba(30,58,90,0.05)] border-b border-outline-variant/10">
      <div className="hidden md:flex justify-between items-center px-10 h-20 w-full max-w-7xl mx-auto">
        {/* Lado Izquierdo: Logo + Navegación opcional */}
        <div className="flex items-center gap-8">
          {logo || (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary tracking-tight">Cooffy</span>
            </div>
          )}
          {navigation && <nav className="flex items-center gap-6">{navigation}</nav>}
        </div>

        {/* Lado Derecho: Acciones */}
        {actions && <div className="flex items-center gap-6">{actions}</div>}
      </div>

      {/* Versión Mobile */}
      <div className="md:hidden flex justify-between items-center px-4 h-16 w-full">
        {logo || <span className="text-2xl font-bold text-primary tracking-tight">Cooffy</span>}
        {mobileActions && <div className="flex items-center gap-4">{mobileActions}</div>}
      </div>
    </header>
  );
}
