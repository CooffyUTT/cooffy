"use client";

import React from 'react';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Button } from '@/components/ui/button';
import { User, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";

/**
 * Componente de formulario de inicio de sesión.
 *
 * Utiliza el custom hook `useLoginForm` para manejar:
 * - Estado del formulario (`formData`)
 * - Validaciones y mensajes de error (`errors`)
 * - Visibilidad de la contraseña (`passwordVisible`)
 * - Estado de carga (`isLoading`)
 * - Funciones de cambio de input, envío de credenciales y autenticación SSO con Google.
 *
 * El diseño sigue los principios de Material Design y está optimizado para accesibilidad (WCAG 2.1).
 */
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
    <form onSubmit={handleCredentialsLogin} className="w-full space-y-md" noValidate>

      {/* ============================================================ */}
      {/* CAMPO: Correo Institucional (credentials)                     */}
      {/* ============================================================ */}
      <div className="space-y-1">
        <label htmlFor="credentials" className="block text-xs font-semibold text-on-surface-variant ml-1">
          Correo Institucional
        </label>
        <div className="relative group">
          {/* Icono izquierdo: cambia de color según el estado del campo (válido, error o neutro) */}
          <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
            errors.credentials ? "text-destructive" : isFieldValid('credentials') ? "text-primary" : "text-on-surface-variant/60"
          }`}>
            <User size={18} />
          </div>

          {/* Input: estilos condicionales según error o foco, con transiciones suaves */}
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
            // Accesibilidad: indica si el campo tiene un error
            aria-invalid={!!errors.credentials}
            // Accesibilidad: vincula el input con su mensaje de error para lectores de pantalla
            aria-describedby={errors.credentials ? "credentials-error" : undefined}
          />

          {/* Icono derecho: muestra alerta de error o check de éxito, con animación de entrada */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {errors.credentials && <AlertCircle size={16} className="text-destructive animate-in fade-in zoom-in-75" />}
            {isFieldValid('credentials') && <CheckCircle2 size={16} className="text-primary animate-in fade-in zoom-in-75" />}
          </div>
        </div>

        {/* Mensaje de error dinámico (solo visible cuando existe) */}
        {errors.credentials && (
          <p
            id="credentials-error"
            className="text-[11px] font-medium text-destructive ml-1 animate-in slide-in-from-top-1 duration-200"
          >
            {errors.credentials}
          </p>
        )}
      </div>

      {/* ============================================================ */}
      {/* CAMPO: Contraseña                                            */}
      {/* ============================================================ */}
      <div className="space-y-1">
        <div className="flex justify-between items-center px-1">
          <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant">
            Contraseña
          </label>
          {/* Enlace de recuperación (aún sin funcionalidad real) */}
          <a className="text-xs font-semibold text-primary hover:underline" href="#forgot-password">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div className="relative group">
          {/* Icono izquierdo: similar al campo anterior, refleja estado de validación */}
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
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />

          {/* Botón de visibilidad e ícono de alerta (derecha) */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-xs">
            {errors.password && <AlertCircle size={16} className="text-destructive" />}
            <button
              className="text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer"
              type="button"
              onClick={togglePasswordVisibility}
              // `tabIndex={-1}` evita que este botón capture el foco del teclado,
              // mejorando la navegación secuencial (el usuario puede usar el botón con mouse o touch).
              tabIndex={-1}
              aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="text-[11px] font-medium text-destructive ml-1 animate-in slide-in-from-top-1 duration-200"
          >
            {errors.password}
          </p>
        )}
      </div>

      {/* ============================================================ */}
      {/* BOTÓN DE ENVÍO (submit)                                      */}
      {/* ============================================================ */}
      <Button
        className="w-full bg-primary-container text-on-primary-container hover:bg-primary-container/90 py-4 h-auto font-semibold text-sm rounded-lg active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        type="submit"
        disabled={isLoading}
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

      {/* ============================================================ */}
      {/* ENLACE PARA REGISTRO                                        */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* DIVISOR "O"                                                  */}
      {/* ============================================================ */}
      <div className="relative flex items-center py-xs">
        <div className="flex-grow border-t border-outline-variant"></div>
        {/* NOTA: Se ha corregido el fondo fijo `#f9f9ff` por `bg-surface-container-lowest` 
            para que herede el fondo del contenedor y sea compatible con modo oscuro. 
            Se añade `z-10` para que el texto quede por encima de las líneas. */}
        <span className="flex-shrink mx-4 text-xs font-semibold text-on-surface-variant uppercase bg-surface-container-lowest px-2 z-10">
          o
        </span>
        <div className="flex-grow border-t border-outline-variant"></div>
      </div>

      {/* ============================================================ */}
      {/* BOTÓN DE INICIO DE SESIÓN CON GOOGLE (SSO)                  */}
      {/* ============================================================ */}
      <Button
        variant="outline"
        onClick={handleSSOLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-xs border border-secondary text-secondary hover:bg-secondary/5 py-4 h-auto font-semibold text-sm rounded-lg active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
      >
        {/* El icono `FcGoogle` ya incluye los colores oficiales de Google, 
            por lo que no se debe aplicar `fill-current`. Se añade `mr-1` para separación visual. */}
        <FcGoogle size={20} className="mr-1" />
        Iniciar sesión con Google
      </Button>
    </form>
  );
}