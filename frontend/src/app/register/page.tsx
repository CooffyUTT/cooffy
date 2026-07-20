import React from 'react';
import type { Metadata } from 'next';
import { RegisterView } from '@/components/register/RegisterView';

export const metadata: Metadata = {
  title: "Crear Cuenta",
  description: "Regístrate en Cooffy para comenzar a realizar tus pedidos favoritos.",
};

export default function RegisterPage() {
  return <RegisterView />;
}