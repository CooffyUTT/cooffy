"use client"; // <-- Las animaciones se quedan en este componente de cliente

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { LoginForm } from '@/components/login/LoginForm';
import { HelpCircle, Globe, Coffee } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1], 
      staggerChildren: 0.1,    
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

export function LoginView() {
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
            
            {/* Logo */}
            <motion.div variants={itemVariants} className="mb-lg flex flex-col items-center gap-base w-full">
              <div className="relative w-full max-w-[220px] h-auto mb-xs flex justify-center">
                <Image 
                  src="/images/logo.png"
                  alt="Cooffy Logo" 
                  width={220}
                  height={74}
                  priority
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 220px"
                />
              </div>
            </motion.div>

            {/* Encabezado */}
            <motion.div variants={itemVariants} className="w-full text-center mb-lg">
              <h2 className="text-2xl font-bold text-on-surface mb-xs">Bienvenido de nuevo</h2>
              <p className="text-sm text-on-surface-variant">Por favor ingrese su correo institucional para entrar</p>
            </motion.div>

            {/* Formulario */}
            <motion.div variants={itemVariants} className="w-full">
              <LoginForm />
            </motion.div>
            
          </div>

          <footer className="bg-surface-container-low px-lg py-md border-t border-outline-variant/30 text-center">
            <p className="text-xs text-on-surface-variant">
              Solo uso autorizado. Inicie sesión si acepta los<br className="hidden md:block"/>
              <a className="text-primary hover:underline" href="#terms">terminos y condiciones de la institución</a>.
            </p>
          </footer>
        </div>

        <motion.div variants={itemVariants} className="mt-lg flex justify-center gap-md">
          <a className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="#help">
            <HelpCircle size={16} /> Centro de ayuda
          </a>
          <a className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-xs" href="#language">
            <Globe size={16} /> Español (MX)
          </a>
        </motion.div>
      </motion.main>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="fixed bottom-0 right-0 p-lg pointer-events-none hidden md:block"
      >
        <Coffee size={240} className="text-primary" />
      </motion.div>
    </div>
  );
}