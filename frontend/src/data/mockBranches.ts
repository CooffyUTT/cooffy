import { Branch } from '@/types/manager';
import { SchoolBranch } from '@/types/school';

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: '1',
    name: 'Cafetería Refugio',
    address: 'Parque Industrial, 22390 Tijuana, B.C.',
    employeesCount: 15,
    schedule: '09:00 - 19:00',
    dailySales: 9999,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '2',
    name: 'Cafetería Otay',
    address: 'Quintas Campestre, 22253 Tijuana, B.C.',
    employeesCount: 8,
    schedule: '09:00 - 16:00',
    dailySales: 999,
    status: 'open',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600'
  }
];

export const INITIAL_SCHOOL_BRANCHES: SchoolBranch[] = [
  { id: '1', name: 'Cafetería Refugio', manager: 'Juan Pérez',  location: 'Edificio A, Planta Baja' },
  { id: '2', name: 'Cafetería Otay',    manager: 'María López', location: 'Edificio B, Segundo Piso' },
  { id: '3', name: 'Cafetería Central', manager: 'Juan Pérez',  location: 'Edificio C, Lobby' },
];