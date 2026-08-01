import type { Metadata } from 'next';
import { SchoolView } from '@/components/school/SchoolView';

export const metadata: Metadata = {
  title: "Panel de Administrador Escolar | Cooffy",
  description: "Panel para gestionar las sucursales de la escuela asignada.",
};

export default function SchoolPage() {
  return <SchoolView />;
}
