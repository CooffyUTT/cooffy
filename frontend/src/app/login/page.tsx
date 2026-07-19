import React from 'react';
import type { Metadata } from 'next';
import { LoginView } from '@/components/login/LoginView'; // <-- Importamos la nueva vista cliente

// Next.js procesará esto perfectamente en el servidor sin quejas
export const metadata: Metadata = {
  title: "Login",
  description: "Accede al portal institucional de Cooffy.",
};

export default function LoginPage() {
  return <LoginView />;
}