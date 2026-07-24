export interface OrderItemModifier {
  text: string;
  severity: 'danger' | 'warning' | 'info';
}

export interface OrderItem {
  id: string;
  name: string;
  type: 'beverage' | 'food';
  quantity: number;
  modifiers?: OrderItemModifier[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  serviceType: 'takeaway' | 'dine_in' | 'preorder';
  createdAt: Date;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  items: OrderItem[];
  notes?: string;
}