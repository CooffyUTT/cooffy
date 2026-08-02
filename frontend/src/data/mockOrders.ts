import { Order } from '@/types/kitchen';

export const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '#101',
    customerName: 'Luis Alberto',
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    status: 'pending',
    items: [
      {
        id: 'i1',
        name: 'Capuchino Vainilla',
        quantity: 1,
        excluded_modifiers: ['SIN AZÚCAR', 'LECHE DE ALMENDRA']
      },
      { id: 'i2', name: 'Panini de Pavo', quantity: 1 }
    ],
    notes: 'Alergia severa a las nueces'
  },
  {
    id: '2',
    orderNumber: '#102',
    customerName: 'Pedro',
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    status: 'pending',
    items: [
      { id: 'i3', name: 'Americano Frío', quantity: 2, excluded_modifiers: ['SIN HIELO'] }
    ]
  },
  {
    id: '3',
    orderNumber: '#104',
    customerName: 'Ana Sofia',
    createdAt: new Date(Date.now() - 7 * 60 * 1000),
    status: 'preparing',
    items: [
      { id: 'i4', name: 'Bagel de Lomo', quantity: 1 },
      { id: 'i5', name: 'Frappé Mocha', quantity: 1 }
    ]
  },
  {
    id: '4',
    orderNumber: '#108',
    customerName: 'Carlos R.',
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    status: 'ready',
    items: [
      { id: 'i6', name: 'Espresso Doble', quantity: 1 }
    ]
  }
];
