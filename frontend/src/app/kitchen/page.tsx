import React from 'react';
import type { Metadata } from 'next';
import { KitchenView } from '@/components/kitchen/KitchenView';

export const metadata: Metadata = {
  title: "Panel de Cocina",
  description: "Módulo de operación e indicación de estado de pedidos para el personal de cocina.",
};

export default function KitchenPage() {
  return <KitchenView />;
}