export type PaymentMethod = "cash" | "card";

export type OrderState = "pending" | "preparing" | "ready" | "picked_up" | "rejected";

export type PaymentStatus = "pending" | "paid";

export interface OrderProduct {
  id: number;
  item_id: number;
  quantity: number;
  price: string;
  excluded_modifiers: string[];
  product_name: string;
}

export interface Order {
  id: number;
  order_number: number;
  date: string;
  branch_id: number;
  client_id: number;
  created_at: string;
  prepared_at: string | null;
  picked_up_at: string | null;
  scheduled_pickup_at: string | null;
  total: string;
  state: OrderState;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  comment: string | null;
  order_products: OrderProduct[];
}

export interface OrderListItem {
  id: number;
  order_number: number;
  date: string;
  branch_id: number;
  client_id: number;
  total: string;
  state: OrderState;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface OrderProductInput {
  item_id: number;
  quantity: number;
  excluded_modifiers?: string[];
}

export interface OrderCreatePayload {
  branch_id: number;
  payment_method: PaymentMethod;
  comment?: string;
  order_products: OrderProductInput[];
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
};

export const ORDER_STATE_LABELS: Record<OrderState, string> = {
  pending: "En espera",
  preparing: "En preparación",
  ready: "Listo para entregar",
  picked_up: "Entregado",
  rejected: "Rechazado",
};
