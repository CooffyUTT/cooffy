export interface OrderItemModifier {
  text: string;
  severity: 'danger' | 'info' | 'warning';
}

export interface OrderItem {
  id: string;
  name: string;
  type: 'beverage' | 'food';
  quantity: number;
  price: number;
  unitPrice?: number;
  modifiers?: OrderItemModifier[];
}

export interface KitchenOrderProduct {
  id: number;
  item_id: number;
  item_name: string | null;
  item_image: string | null;
  quantity: number;
  unitPrice: number;
  modifiers?: OrderItemModifier[];
  excluded_modifiers?: string[] | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  serviceType: 'takeaway' | 'dine_in' | 'preorder';
  createdAt: Date;
  status: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'rejected';
  total: number;
  paymentMethod: 'cash' | 'card';
  items: OrderItem[];
  notes?: string;
}

export interface KitchenOrder {
  id: number;
  order_number: number;
  date: string;
  branch_id: number;
  client_id: number;
  client_name: string | null;
  total: string;
  state: string;
  payment_status: string;
  created_at: string;
  comment: string | null;
  order_products: KitchenOrderProduct[];
}
