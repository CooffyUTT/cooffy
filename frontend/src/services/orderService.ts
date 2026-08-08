import { api } from "@/lib/api";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateOrderProductPayload {
  item_id: number;
  quantity: number;
  price: string;
}

export interface CreateOrderPayload {
  branch_id: number;
  client_id: number;
  payment_method: number;
  comment?: string;
  order_products: CreateOrderProductPayload[];
}

export interface OrderProductResponse {
  id: number;
  item_id: number;
  name: string;
  category_name: string | null;
  quantity: number;
  price: string;
}

export interface OrderResponse {
  id: number;
  order_number: number;
  date: string;
  branch_id: number;
  client_id: number;
  total: string;
  state: string;
  payment_method: number;
  payment_status: string;
  created_at: string;
  updated_at: string;
  order_products: OrderProductResponse[];
}

export interface OrderSummary {
  id: number;
  order_number: number;
  date: string;
  branch_id: number;
  client_id: number;
  total: string;
  state: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  const { data } = await api.post<OrderResponse>("/api/orders/", payload);
  return data;
}

export async function getOrder(id: number): Promise<OrderResponse> {
  const { data } = await api.get<OrderResponse>(`/api/orders/${id}/`);
  return data;
}

export async function getOrders(): Promise<OrderSummary[]> {
  const { data } = await api.get<PaginatedResponse<OrderSummary>>("/api/orders/");
  return data.results;
}
