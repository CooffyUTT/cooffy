"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-surface dark:bg-surface-dim shadow-[0px_4px_20px_rgba(30,58,90,0.05)] border-b border-outline-variant/10">
      {/* Versión Escritorio (md y superiores) */}
      <div className="hidden md:flex justify-between items-center px-6 lg:px-10 h-20 w-full max-w-7xl mx-auto">
        {/* Lado Izquierdo: Logo + Navegación */}
        <div className="flex items-center gap-8">
          {logo || (
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary tracking-tight">Cooffy</span>
            </div>
          )}
          {navigation && <nav className="flex items-center gap-6">{navigation}</nav>}
        </div>

        {/* Lado Derecho: Acciones de escritorio */}
        {actions && <div className="flex items-center gap-6">{actions}</div>}
      </div>

      {/* Versión Mobile (pantallas inferiores a md) */}
      <div className="md:hidden flex justify-between items-center px-4 h-16 w-full">
        {/* Logo versión móvil */}
        <div className="flex items-center gap-2">
          {logo || <span className="text-2xl font-bold text-primary tracking-tight">Cooffy</span>}
        </div>

        {/* Acciones móviles + Botón de Menú Hamburguesa */}
        <div className="flex items-center gap-3">
          {mobileActions}

          {navigation && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </div>

      {/* Desplegable del menú móvil */}
      {navigation && isMobileMenuOpen && (
        <div className="md:hidden bg-surface dark:bg-surface-dim border-b border-outline-variant/20 px-4 py-4 transition-all">
          <nav className="flex flex-col gap-3">
            {navigation}
          </nav>
        </div>
      )}
    </header>
  );
}