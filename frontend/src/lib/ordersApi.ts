import { api } from "@/lib/api";
import type { Order, OrderCreatePayload } from "@/types/order";

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function createOrder(payload: OrderCreatePayload): Promise<Order> {
  const response = await api.post<Order>("/api/orders/", payload);
  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await api.get<Paginated<Order>>("/api/orders/");
  return response.data.results;
}

export async function getOrder(id: number): Promise<Order> {
  const response = await api.get<Order>(`/api/orders/${id}/`);
  return response.data;
}

export async function getOrdersByBranch(
  branchId: number,
): Promise<Order[]> {
  const response = await api.get<Paginated<Order>>("/api/orders/", {
    params: { branch_id: branchId },
  });
  return response.data.results;
}
