"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { Button } from '@/components/ui/button';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Check } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export function RegisterView() {
  const {
    formData,
    errors,
    isLoading,
    passwordVisible,
    confirmPasswordVisible,
    passwordStrength,
    passwordRequirements,
    isFieldValid,
    isFormValid,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleInputChange,
    handleRegister,
    handleSSORegister,
  } = useRegisterForm();

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-margin-mobile bg-[#f9f9ff] [background-image:radial-gradient(#d1c5b1_0.5px,transparent_0.5px)] [background-size:24px_24px] font-['Plus_Jakarta_Sans',sans-serif]">
      
      <motion.main 
        className="w-full max-w-[480px] z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(30,58,90,0.05)] overflow-hidden border border-outline-variant/30 transition-all duration-300 hover:shadow-[0px_10px_30px_rgba(30,58,90,0.12)]">
          
          <div className="p-lg md:p-xl flex flex-col items-center">
            
            {/* Logo Section */}
            <motion.div variants={itemVariants} className="mb-md flex flex-col items-center gap-xs w-full">
              <div className="relative w-full max-w-[180px] h-auto mb-xs flex justify-center">
                <Image 
                  src="/images/logo.png" 
                  alt="Cooffy Logo" 
                  width={180} 
                  height={60} 
                  priority 
                  className="object-contain" 
                />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div variants={itemVariants} className="w-full text-center mb-lg">
              <h2 className="text-2xl font-bold text-on-surface mb-xs">Crea tu cuenta</h2>
              <p className="text-sm text-on-surface-variant">Crea tu cuenta y realiza pedidos desde cualquier lugar del campus.</p>
            </motion.div>

            {/* --- NUEVO: Registro con Google en la parte superior --- */}
            <motion.div variants={itemVariants} className="w-full space-y-4 mb-md">
            <Button
                variant="outline"
                onClick={handleSSORegister}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-xs border border-secondary text-secondary hover:bg-secondary/5 py-3.5 h-auto font-semibold text-sm rounded-lg active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
            >
                <FcGoogle size={20} className="mr-1" />
                Registrarse con Google
            </Button>

            {/* Separador Visual "O" */}
            <div className="relative flex items-center justify-center w-full">
                <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/60" />
                </div>
                <div className="relative px-3 bg-surface text-[11px] font-medium text-on-surface-variant/70 uppercase tracking-wider">
                O regístrate con correo
                </div>
            </div>
            </motion.div>

            {/* Formulario de Registro */}
            <motion.form variants={itemVariants} onSubmit={handleRegister} className="w-full space-y-4">
              
              {/* Campo: Nombre */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-xs font-semibold text-on-surface-variant ml-1">Nombre</label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${errors.name ? "text-destructive" : isFieldValid('name') ? "text-primary" : "text-on-surface-variant/60"}`}>
                    <User size={18} />
                  </div>
                  <input 
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface-container-lowest text-sm outline-none transition-all text-on-surface ${errors.name ? "border-destructive focus:ring-2 focus:ring-destructive/25" : "border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary"}`}
                    id="name" name="name" placeholder="Ej: Juan" type="text" value={formData.name} onChange={handleInputChange} disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {errors.name && <AlertCircle size={16} className="text-destructive" />}
                    {isFieldValid('name') && <CheckCircle2 size={16} className="text-primary" />}
                  </div>
                </div>
                {errors.name && <p className="text-[11px] font-medium text-destructive ml-1">{errors.name}</p>}
              </div>

              {/* Campo: Apellidos */}
              <div className="space-y-1">
                <label htmlFor="lastname" className="block text-xs font-semibold text-on-surface-variant ml-1">Apellidos</label>
                <div className="relative group">
                  {/* Corregido: Ahora evalúa 'lastname' en lugar de 'name' */}
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${errors.lastname ? "text-destructive" : isFieldValid('lastname') ? "text-primary" : "text-on-surface-variant/60"}`}>
                    <User size={18} />
                  </div>
                  {/* Corregido: name="lastname" y value={formData.lastname} */}
                  <input 
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface-container-lowest text-sm outline-none transition-all text-on-surface ${errors.lastname ? "border-destructive focus:ring-2 focus:ring-destructive/25" : "border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary"}`}
                    id="lastname" name="lastname" placeholder="Ej: Pérez Sánchez" type="text" value={formData.lastname} onChange={handleInputChange} disabled={isLoading}
                  />
                  {/* Corregido: los iconos ahora escuchan los estados de 'lastname' */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {errors.lastname && <AlertCircle size={16} className="text-destructive" />}
                    {isFieldValid('lastname') && <CheckCircle2 size={16} className="text-primary" />}
                  </div>
                </div>
                {errors.lastname && <p className="text-[11px] font-medium text-destructive ml-1">{errors.lastname}</p>}
              </div>

              {/* Campo: Correo Electrónico (Mapeado a 'user' en la DB) */}
              <div className="space-y-1">
                <label htmlFor="user" className="block text-xs font-semibold text-on-surface-variant ml-1">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${errors.user ? "text-destructive" : isFieldValid('user') ? "text-primary" : "text-on-surface-variant/60"}`}>
                    <Mail size={18} />
                  </div>
                  <input 
                    id="user" 
                    name="user" 
                    type="email" 
                    placeholder="tu_correo@universidad.edu" 
                    value={formData.user} 
                    onChange={handleInputChange} 
                    disabled={isLoading}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface-container-lowest text-sm outline-none transition-all text-on-surface ${errors.user ? "border-destructive focus:ring-2 focus:ring-destructive/25" : "border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary"}`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {errors.user && <AlertCircle size={16} className="text-destructive" />}
                    {isFieldValid('user') && <CheckCircle2 size={16} className="text-primary" />}
                  </div>
                </div>
                {errors.user && <p className="text-[11px] font-medium text-destructive ml-1">{errors.user}</p>}
              </div>

              {/* Campo: Contraseña */}
                <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant ml-1">
                    Contraseña
                </label>
                <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                    errors.password ? "text-destructive" : isFieldValid('password') ? "text-primary" : "text-on-surface-variant/60"
                    }`}>
                    <Lock size={18} />
                    </div>
                    <input 
                    id="password" 
                    name="password" 
                    type={passwordVisible ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    disabled={isLoading}
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface-container-lowest text-sm outline-none transition-all text-on-surface ${
                        errors.password ? "border-destructive focus:ring-2 focus:ring-destructive/25" : "border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-xs">
                    {errors.password && <AlertCircle size={16} className="text-destructive" />}
                    <button 
                        className="text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer" 
                        type="button" 
                        onClick={togglePasswordVisibility} 
                        tabIndex={-1}
                    >
                        {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>

                {/* --- Indicador de Fortaleza y Lista de Chequeo Dinámica --- */}
                {formData.password.length > 0 && (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                    
                    {/* Barra de fortaleza */}
                    <div className="flex gap-1.5 h-1.5 w-full">
                        {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            step <= passwordStrength.score 
                                ? passwordStrength.color 
                                : "bg-outline-variant/30"
                            }`}
                        />
                        ))}
                    </div>

                    {/* Lista de Chequeo Interactiva */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px] font-medium">
                        <RequirementItem 
                        isMet={passwordRequirements.hasMinLength} 
                        label="Mínimo 6 caracteres" 
                        />
                        <RequirementItem 
                        isMet={passwordRequirements.hasUpperAndLower} 
                        label="Mayúsculas y minúsculas" 
                        />
                        <RequirementItem 
                        isMet={passwordRequirements.hasNumber} 
                        label="Al menos un número" 
                        />
                        <RequirementItem 
                        isMet={passwordRequirements.hasSpecialChar} 
                        label="Símbolo (@, #, $, etc.)" 
                        />
                    </div>

                    </div>
                )}

                {errors.password && (
                    <p className="text-[11px] font-medium text-destructive ml-1">{errors.password}</p>
                )}
                </div>

                        {/* Campo: Confirmar Contraseña */}
                <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-on-surface-variant ml-1">
                    Confirmar Contraseña
                </label>
                <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${
                    errors.confirmPassword ? "text-destructive" : isFieldValid('confirmPassword') ? "text-primary" : "text-on-surface-variant/60"
                    }`}>
                    <Lock size={18} />
                    </div>
                    <input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type={confirmPasswordVisible ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    disabled={isLoading}
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg bg-surface-container-lowest text-sm outline-none transition-all text-on-surface ${
                        errors.confirmPassword ? "border-destructive focus:ring-2 focus:ring-destructive/25" : "border-outline-variant focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-xs">
                    {errors.confirmPassword && <AlertCircle size={16} className="text-destructive" />}
                    {isFieldValid('confirmPassword') && <CheckCircle2 size={16} className="text-primary" />}
                    <button 
                        className="text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer" 
                        type="button" 
                        onClick={toggleConfirmPasswordVisibility} 
                        tabIndex={-1}
                    >
                        {confirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>
                {errors.confirmPassword && (
                    <p className="text-[11px] font-medium text-destructive ml-1 animate-in slide-in-from-top-1">
                    {errors.confirmPassword}
                    </p>
                )}
                </div>

              {/* Campo: Aceptación de Términos y Condiciones */}
                <div className="flex items-start gap-2.5 pt-2 pb-1">
                <div className="flex items-center h-5">
                    <input
                    id="acceptedTerms"
                    name="acceptedTerms"
                    type="checkbox"
                    checked={formData.acceptedTerms}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 accent-primary cursor-pointer transition-all"
                    />
                </div>
                <label htmlFor="acceptedTerms" className="text-xs text-on-surface-variant leading-tight cursor-pointer select-none">
                    Acepto los{" "}
                    <Link 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline transition-colors"
                    >
                    Términos y Condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link 
                    href="/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline transition-colors"
                    >
                    Política de Privacidad
                    </Link>{" "}
                    de Cooffy.
                </label>
                </div>

                {/* Submit Button */}
                <Button 
                type="submit" 
                disabled={isLoading || !isFormValid}
                className={`w-full py-4 h-auto font-semibold text-sm rounded-lg transition-all duration-200 shadow-sm ${
                    isFormValid && !isLoading
                    ? "bg-primary-container text-on-primary-container hover:bg-primary-container/90 active:scale-[0.98] cursor-pointer"
                    : "bg-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed opacity-70"
                }`}
                >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin text-on-primary-container" />
                    Creando cuenta...
                    </span>
                ) : (
                    "Crear cuenta"
                )}
                </Button>
            </motion.form>

            {/* Enlace sutil al Login */}
            <motion.div variants={itemVariants} className="text-center mt-md">
              <span className="text-xs text-on-surface-variant font-medium">¿Ya tienes cuenta? </span>
              <Link href="/" className="text-xs font-semibold text-primary hover:underline transition-all">
                Inicia sesión
              </Link>
            </motion.div>
            
          </div>
        </div>
      </motion.main>
    </div>
  );
}

// Subcomponente auxiliar interno para renderizar cada reglón de chequeo
function RequirementItem({ isMet, label }: { isMet: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 transition-colors duration-200 ${
      isMet ? "text-primary" : "text-on-surface-variant/50"
    }`}>
      <div className={`flex items-center justify-center w-3.5 h-3.5 rounded-full transition-colors ${
        isMet ? "bg-primary/15 text-primary" : "border border-outline-variant/60"
      }`}>
        {isMet && <Check size={10} strokeWidth={3} />}
      </div>
      <span>{label}</span>
    </div>
  );
}