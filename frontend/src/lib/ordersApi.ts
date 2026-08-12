import { api } from "@/lib/api";
import type { Order, OrderCreatePayload, OrderState } from "@/types/order";

export interface GetOrdersParams {
  date?: string;
  state?: OrderState | string;
  branch_id?: number;
}

export async function createOrder(payload: OrderCreatePayload): Promise<Order> {
  const response = await api.post<Order>("/api/orders/", payload);
  return response.data;
}

export async function getOrders(params?: GetOrdersParams): Promise<Order[]> {
  const response = await api.get<Order[] | { results: Order[] }>("/api/orders/", { params });
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.results ?? [];
}

export async function getOrder(id: number): Promise<Order> {
  const response = await api.get<Order>(`/api/orders/${id}/`);
  return response.data;
}

export async function getOrdersByState(
  state: OrderState,
  branchId?: number,
): Promise<Order[]> {
  const params: Record<string, string | number> = { state };
  if (branchId) {
    params.branch_id = branchId;
  }
  
  const response = await api.get<Order[] | { results: Order[] }>("/api/orders/", { params });
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data?.results ?? [];
}

export async function updateOrderState(
  orderId: number,
  newState: OrderState,
): Promise<Order> {
  const response = await api.patch<Order>(`/api/orders/${orderId}/`, {
    state: newState,
  });
  return response.data;
}

export async function updateOrderPaymentStatus(
  orderId: number,
  newStatus: string,
): Promise<Order> {
  const response = await api.patch<Order>(`/api/orders/${orderId}/`, {
    payment_status: newStatus,
  });
  return response.data;
}