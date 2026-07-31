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
  { id: '1', name: 'Cafetería Refugio', company: 'El Círculo',           location: 'Edificio A, Planta Baja', active: true,  createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { id: '2', name: 'Cafetería Otay',    company: 'El Círculo',           location: 'Edificio B, Segundo Piso', active: true,  createdAt: '2026-02-20T09:30:00Z', updatedAt: '2026-03-10T14:15:00Z' },
  { id: '3', name: 'Cafetería Central', company: 'Cafeterías del Norte', location: 'Edificio C, Lobby',        active: true,  createdAt: '2026-03-05T11:45:00Z', updatedAt: '2026-03-05T11:45:00Z' },
];

export interface MockCompany {
  id: string;
  name: string;
  ownerName: string;
  inSchool: boolean;
}

export const MOCK_COMPANIES: MockCompany[] = [
  { id: 'c1', name: 'El Círculo',           ownerName: 'Juan Pérez',  inSchool: true  },
  { id: 'c2', name: 'Cafeterías del Norte', ownerName: 'Carlos Ruiz', inSchool: true  },
  { id: 'c3', name: 'Cooffy S.A.',          ownerName: 'María López', inSchool: false },
  { id: 'c4', name: 'Bocaditos UTT',        ownerName: 'Ana Torres',  inSchool: false },
];