import React from 'react';
import type { Metadata } from 'next';
import { LoginView } from '@/components/login/LoginView'; // <-- Importamos la nueva vista cliente

// Cuando se utilice un use client en una pagina se tiene que dividir en dos componentes para poder darle los meta datos al navegador, de lo contrario va a dar error
export const metadata: Metadata = {
  title: "Login",
  description: "Accede al portal institucional de Cooffy.",
};

export default function LoginPage() {
  return <LoginView />;
}