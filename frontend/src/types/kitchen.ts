export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  createdAt: Date;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  items: OrderItem[];
  notes?: string;
}
