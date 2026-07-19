"use client";

//Archivo del diseño del apartado del formulaio del Login de la pagina

import React from 'react';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Eye, EyeOff, LayoutGrid, AlertCircle, CheckCircle2} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";

export function LoginForm() {
  const {
    formData,
    errors,
    passwordVisible,
    isLoading,
    isFieldValid,
    togglePasswordVisibility,
    handleInputChange,
    handleCredentialsLogin,
    handleSSOLogin,
  } = useLoginForm();

  return (
    <form onSubmit={handleCredentialsLogin} className="w-full space-y-md">
      
      {/* Campo: Email / Usuario */}
      <div className="space-y-1">
        <label htmlFor="credentials" className="block text-xs font-semibold text-on-surface-variant ml-1">
          Correo Institucional
        </label>
        <div className="relative group">
          {/* Icono dinámico: se ilumina si es válido, se pone rojo si hay error */}
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
            errors.credentials ? "text-destructive" : isFieldValid('credentials') ? "text-primary" : "text-on-surface-variant/60"
          }`}>
            <User size={18} />
          </div>
          
          <input 
            className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface-container-lowest text-sm outline-none transition-all text-on-surface ${
              errors.credentials 
                ? "border-destructive focus:ring-2 focus:ring-destructive/25" 
                : "border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary"
            }`} 
            id="credentials" 
            name="credentials" 
            placeholder="ejemplo@universidad.edu" 
            type="text"
            value={formData.credentials}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          {/* Icono indicador de estado a la derecha */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {errors.credentials && <AlertCircle size={16} className="text-destructive animate-in fade-in zoom-in-75" />}
            {isFieldValid('credentials') && <CheckCircle2 size={16} className="text-primary animate-in fade-in zoom-in-75" />}
          </div>
        </div>
        {/* Mensaje sutil de error */}
        {errors.credentials && (
          <p className="text-[11px] font-medium text-destructive ml-1 animate-in slide-in-from-top-1 duration-200">
            {errors.credentials}
          </p>
        )}
      </div>

      {/* Campo: Contraseña */}
      <div className="space-y-1">
        <div className="flex justify-between items-center px-1">
          <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant">
            Contraseña
          </label>
          <a className="text-xs font-semibold text-primary hover:underline" href="#forgot-password">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div className="relative group">
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
            errors.password ? "text-destructive" : isFieldValid('password') ? "text-primary" : "text-on-surface-variant/60"
          }`}>
            <Lock size={18} />
          </div>
          
          <input 
            className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface-container-lowest text-sm outline-none transition-all text-on-surface ${
              errors.password 
                ? "border-destructive focus:ring-2 focus:ring-destructive/25" 
                : "border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary"
            }`} 
            id="password" 
            name="password" 
            placeholder="••••••••" 
            type={passwordVisible ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
          />

          {/* Botón de visibilidad / Icono de alerta */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-xs">
            {errors.password && <AlertCircle size={16} className="text-destructive" />}
            <button 
              className="text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer" 
              type="button"
              onClick={togglePasswordVisibility}
              tabIndex={-1} // Evita que interrumpa el flujo del Tabulador
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {errors.password && (
          <p className="text-[11px] font-medium text-destructive ml-1 animate-in slide-in-from-top-1 duration-200">
            {errors.password}
          </p>
        )}
      </div>

      {/* Login Button */}
      <Button 
        className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90 py-4 h-auto font-semibold text-sm rounded-lg active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed" 
        type="submit"
        disabled={isLoading} // Bloquea el botón visualmente y a nivel HTML
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-on-primary-container" />
            Iniciando sesión...
          </span>
        ) : (
          "Iniciar sesión"
        )}
      </Button>

      {/* ENLACE SUTIL PARA CREAR CUENTA (Puro texto) */}
      <div className="text-center mt-xs">
        <span className="text-xs text-on-surface-variant font-medium">
          ¿No tienes una cuenta?{" "}
        </span>
        <a 
          href="#register" 
          className={`text-xs font-semibold text-primary hover:underline transition-all ${
            isLoading ? "pointer-events-none opacity-50" : ""
          }`}
        >
          Crear una cuenta
        </a>
      </div>

      {/* Divider */}
      <div className="relative flex items-center py-xs">
        <div className="flex-grow border-t border-outline-variant"></div>
        <span className="flex-shrink mx-4 text-xs font-semibold text-on-surface-variant uppercase bg-[#f9f9ff] z-10">
          o
        </span>
        <div className="flex-grow border-t border-outline-variant"></div>
      </div>

      {/* SSO Button */}
      <Button 
        variant="outline"
        onClick={handleSSOLogin}
        disabled={isLoading} // Deshabilita Google si ya se mandó el form normal
        className="w-full flex items-center justify-center gap-xs border border-secondary text-secondary hover:bg-secondary/5 py-4 h-auto font-semibold text-sm rounded-lg active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
        type="button"
      >
        <FcGoogle size={20} className="fill-current" />
        Iniciar sesión con google
      </Button>
    </form>
  );
}