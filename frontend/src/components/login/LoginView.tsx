"use client"; // Indica a Next.js (App Router) que este componente se renderiza en el cliente debido al uso de hooks y animaciones (Framer Motion)

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { LoginForm } from '@/components/login/LoginForm';
import { HelpCircle, Globe, Coffee } from 'lucide-react';

/**
 * ==========================================
 * CONFIGURACIÓN DE ANIMACIONES (FRAMER MOTION)
 * ==========================================
 */

// Variante para el contenedor principal. Maneja la orquestación de los hijos (Stagger effect).
const containerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier para un efecto "ease-out" suave/premium
      staggerChildren: 0.1,    // Retraso secuencial (0.1s) entre la animación de cada hijo con 'itemVariants'
    },
  },
};

// Variante genérica para los elementos hijos que se animarán secuencialmente
const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: "easeOut" 
    }
  },
};

/**
 * ==========================================
 * COMPONENTE PRINCIPAL: LoginView
 * ==========================================
 * Vista base de autenticación. Utiliza tokens de diseño personalizados 
 * en Tailwind (ej. p-4, bg-surface, text-on-surface).
 */
export function LoginView() {
  return (
    // Contenedor principal: Centrado absoluto en pantalla y fondo con patrón de puntos (radial-gradient)
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f9f9ff] [background-image:radial-gradient(#d1c5b1_0.5px,transparent_0.5px)] [background-size:24px_24px] font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 
        Main Wrapper: Controla la animación de entrada inicial de todo el bloque del login.
        Al heredar 'initial' y 'animate', los componentes hijos con 'variants={itemVariants}' se disparan automáticamente de forma escalonada.
      */}
      <motion.main 
        className="w-full max-w-[480px] z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Tarjeta del Login: Maneja estados visuales y transiciones de sombreado en Hover */}
        <div className="bg-surface rounded-xl shadow-[0px_4px_20px_rgba(30,58,90,0.05)] overflow-hidden border border-outline-variant/30 transition-all duration-300 hover:shadow-[0px_10px_30px_rgba(30,58,90,0.12)]">
          
          <div className="p-8 md:p-12 flex flex-col items-center">
            
            {/* Sección: Logo institucional */}
            <motion.div variants={itemVariants} className="mb-8 flex flex-col items-center gap-1 w-full">
              <div className="relative w-full max-w-[220px] h-auto mb-2 flex justify-center">
                <Image 
                  src="/images/logo.png"
                  alt="Cooffy Logo" 
                  width={220}
                  height={74}
                  priority // Carga prioritaria (LCP) al ser el logo de la pantalla de bienvenida
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 220px"
                />
              </div>
            </motion.div>

            {/* Sección: Textos de Encabezado */}
            <motion.div variants={itemVariants} className="w-full text-center mb-8">
              <h2 className="text-2xl font-bold text-on-surface mb-2">Bienvenido de nuevo</h2>
              <p className="text-sm text-on-surface-variant">Por favor ingrese su correo institucional para entrar</p>
            </motion.div>

            {/* Sección: Formulario de lógica e inputs de Login */}
            <motion.div variants={itemVariants} className="w-full">
              <LoginForm />
            </motion.div>
            
          </div>

          {/* Footer de la Tarjeta: Avisos Legales */}
          <footer className="bg-surface-container-low px-8 py-6 border-t border-outline-variant/30 text-center">
            <p className="text-xs text-on-surface-variant">
              Solo uso autorizado. Inicie sesión si acepta los<br className="hidden md:block"/>
              <a className="text-primary hover:underline" href="#terms">terminos y condiciones de la institución</a>.
            </p>
          </footer>
        </div>

        {/* Links de soporte externos (debajo de la tarjeta) */}
        <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-6">
          <a className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2" href="#help">
            <HelpCircle size={16} /> Centro de ayuda
          </a>
          <a className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2" href="#language">
            <Globe size={16} /> Español (MX)
          </a>
        </motion.div>
      </motion.main>

      {/* 
        Elemento Decorativo: Icono de Café gigante en marca de agua.
        Se anima de forma independiente al flujo principal y permanece oculto en móviles (hidden md:block).
      */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="fixed bottom-0 right-0 p-8 pointer-events-none hidden md:block"
      >
        <Coffee size={240} className="text-primary" />
      </motion.div>
    </div>
  );
}