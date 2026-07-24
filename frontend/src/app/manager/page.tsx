//Página par la vista del gerente

import React from 'react';
import type { Metadata } from 'next';
import { ManagerView } from '@/components/manager/ManagerView';

export const metadata: Metadata = {
  title: "Administración de Sucursales | Cooffy",
  description: "Panel de control del gerente para supervisión de sucursales, empleados y rendimiento.",
};

export default function ManagerPage() {
  return <ManagerView />;
}