import React from 'react';
import type { Metadata } from 'next';
import { LoginView } from '@/components/login/LoginView';

export const metadata: Metadata = {
  title: "Login",
  description: "Accede al portal institucional de Cooffy.",
};

export default function HomePage() {
  return <LoginView />;
}