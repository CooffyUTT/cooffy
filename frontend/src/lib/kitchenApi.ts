import { api } from "@/lib/api";
import type { Order, OrderState } from "@/types/order";

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getKitchenOrders(state?: OrderState): Promise<Order[]> {
  const params: Record<string, string> = {};
  if (state) {
    params.state = state;
  }
  const response = await api.get<Paginated<Order>>("/api/orders/", { params });
  return response.data.results;
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
