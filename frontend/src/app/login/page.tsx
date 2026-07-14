"use client"; // <-- Fundamental en Next.js para componentes con interactividad

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LayoutGrid, HelpCircle, Globe, Coffee } from 'lucide-react';

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [credentials, setCredentials] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const togglePasswordVisibility = (): void => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Datos de prueba:', { credentials, password });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f9f9ff] [background-image:radial-gradient(#d1c5b1_0.5px,transparent_0.5px)] [background-size:24px_24px] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Container Principal */}
      <main className="w-full max-w-[480px] z-10">
        <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(30,58,90,0.05)] overflow-hidden border border-gray-200/50 transition-all duration-300 hover:shadow-[0px_10px_30px_rgba(30,58,90,0.12)]">
          
          <div className="p-8 md:p-12 flex flex-col items-center">
            {/* Sección del Logo */}
            <div className="mb-8 flex flex-col items-center gap-1">
              <div className="w-24 h-24 mb-2 overflow-hidden rounded-full border-4 border-gray-100 shadow-sm">
                <img 
                  alt="Cooffy Logo" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqOXo4q_XbbyDD9H9uHyDY9m_HrsWCbkCwVEgfgDpF38hkRTECmG-EpiGxhQTyb71lUdCCFrbpIoyAPIPYHUD0SwEfp7u6pEjCec4ip0H4_7XK2lR2HD4o-U7Cs_eKX8SazgH58t-dH-O_x_yuq986XLNfELXGAcZ5kttNGeDasqpdmrst-9MXet4h7LpiN7VfErbk203W_BRfB1gQWQcIE-XKCvje-1jQ5tF8hYsNQBp4rT-hantxD0QbUhJSh2RoHtudqL3MrIM"
                />
              </div>
              <h1 className="text-3xl font-bold text-[#785a00] tracking-tight">Cooffy</h1>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Institution Portal</p>
            </div>

            {/* Encabezado */}
            <div className="w-full text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
              <p className="text-sm text-gray-500">Please enter your institutional details to access the dashboard.</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              {/* Campo Usuario/Email */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-600 ml-1" htmlFor="credentials">
                  Email or Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#785a00] transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#785a00]/20 focus:border-[#785a00] transition-all text-sm outline-none text-gray-800" 
                    id="credentials" 
                    name="credentials" 
                    placeholder="e.g. j.doe@university.edu" 
                    required 
                    type="text"
                    value={credentials}
                    onChange={(e) => setCredentials(e.target.value)}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-semibold text-gray-600" htmlFor="password">
                    Password
                  </label>
                  <a className="text-xs font-semibold text-[#785a00] hover:underline transition-all" href="#forgot-password">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#785a00] transition-colors">
                    <Lock size={20}/>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#785a00]/20 focus:border-[#785a00] transition-all text-sm outline-none text-gray-800" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#785a00] transition-colors" 
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                   {/* Toggle de visibilidad con lógica condicional de React */}
                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Botón de Submit */}
              <button className="w-full bg-[#c59d3f] text-white font-semibold text-sm py-4 rounded-lg shadow-sm hover:shadow-md hover:bg-[#c59d3f]/90 active:scale-[0.98] transition-all duration-200 cursor-pointer" type="submit">
                Sign In
              </button>

              {/* Separador */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400 uppercase">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Botón SSO */}
              <button 
                className="w-full flex items-center justify-center gap-2 border border-[#456082] text-[#456082] font-semibold text-sm py-4 rounded-lg bg-transparent hover:bg-[#456082]/5 active:scale-[0.98] transition-all duration-200 cursor-pointer" 
                type="button"
              >
                <LayoutGrid size={20} className="fill-current" />
                Login with Microsoft/School Account
              </button>
            </form>
          </div>

          {/* Footer de la Tarjeta */}
          <footer className="bg-gray-50 px-8 py-4 border-t border-gray-200/50 text-center">
            <p className="text-xs text-gray-500">
              Authorized use only. By logging in, you agree to the <br className="hidden md:block"/>
              <a className="text-[#785a00] hover:underline" href="#terms">Institutional Terms of Service</a>.
            </p>
          </footer>
        </div>

        {/* Links de Utilidad */}
        <div className="mt-8 flex justify-center gap-6">
          <a className="text-xs text-gray-500 hover:text-[#785a00] transition-colors flex items-center gap-1" href="#help">
           <HelpCircle size={16} /> Help Center
          </a>
          <a className="text-xs text-gray-500 hover:text-[#785a00] transition-colors flex items-center gap-1" href="#language">
            <Globe size={16} /> English (US)
          </a>
        </div>
      </main>

      {/* Marca de agua decorativa en el fondo */}
      <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-10 hidden md:block">
        <Coffee size={240} className="text-primary" />
      </div>
    </div>
  );
}