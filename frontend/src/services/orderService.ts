import { api } from "@/lib/api";
import type { KitchenOrder } from "@/types/kitchen";

export interface GetOrdersParams {
  date?: string;
  state?: string;
}

export async function getOrders(params?: GetOrdersParams): Promise<KitchenOrder[]> {
  const { data } = await api.get<KitchenOrder[]>("/api/orders/", { params });
  return data;
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}
