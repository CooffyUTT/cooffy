import { Order } from '@/types/kitchen';

export const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '101',
    customerName: 'Luis Alberto',
    serviceType: 'takeaway',
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    status: 'pending',
    total: 95.00,
    paymentMethod: 'cash',
    items: [
      {
        id: 'i1',
        name: 'Capuchino Vainilla',
        type: 'beverage',
        quantity: 1,
        unitPrice: 65.00,
        modifiers: [
          { text: 'SIN AZUCAR', severity: 'danger' },
          { text: 'LECHE DE ALMENDRA', severity: 'info' }
        ]
      },
      { id: 'i2', name: 'Panini de Pavo', type: 'food', quantity: 1, unitPrice: 30.00 }
    ],
    notes: 'Alergia severa a las nueces'
  },
  {
    id: '2',
    orderNumber: '102',
    customerName: 'Pedro',
    serviceType: 'dine_in',
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    status: 'pending',
    total: 70.00,
    paymentMethod: 'card',
    items: [
      { 
        id: 'i3', 
        name: 'Americano Frio', 
        type: 'beverage', 
        quantity: 2, 
        unitPrice: 35.00,
        modifiers: [{ text: 'EXTRA CALIENTE', severity: 'warning' }] 
      }
    ]
  },
  {
    id: '3',
    orderNumber: '104',
    customerName: 'Ana Sofia',
    serviceType: 'preorder',
    createdAt: new Date(Date.now() - 7 * 60 * 1000),
    status: 'preparing',
    total: 110.00,
    paymentMethod: 'cash',
    items: [
      { id: 'i4', name: 'Bagel de Lomo', type: 'food', quantity: 1, unitPrice: 75.00 },
      { id: 'i5', name: 'Frappe Mocha', type: 'beverage', quantity: 1, unitPrice: 35.00 }
    ]
  },
  {
    id: '4',
    orderNumber: '108',
    customerName: 'Carlos R.',
    serviceType: 'takeaway',
    createdAt: new Date(Date.now() - 18 * 60 * 1000),
    status: 'ready',
    total: 45.00,
    paymentMethod: 'card',
    items: [
      { id: 'i6', name: 'Espresso Doble', type: 'beverage', quantity: 1, unitPrice: 45.00 }
    ]
  }
];
