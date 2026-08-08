import { api } from "@/lib/api";

export interface KitchenOrderProduct {
  id: number;
  item_id: number;
  name: string;
  category_name: string | null;
  quantity: number;
  price: string;
}

export interface KitchenOrder {
  id: number;
  order_number: number;
  client_name: string;
  state: string;
  payment_status: string;
  comment: string | null;
  created_at: string;
  order_products: KitchenOrderProduct[];
}

export interface KitchenOrdersResponse {
  accepting_orders: boolean;
  results: KitchenOrder[];
}

export async function getKitchenOrders(branchId: number): Promise<KitchenOrdersResponse> {
  const { data } = await api.get<KitchenOrdersResponse>("/api/orders/kitchen/", {
    params: { branch_id: branchId },
  });
  return data;
}

export async function advanceOrderState(orderId: number): Promise<KitchenOrder> {
  const { data } = await api.post<KitchenOrder>(`/api/orders/${orderId}/advance/`);
  return data;
}

export async function toggleAccepting(branchId: number): Promise<{ accepting_orders: boolean }> {
  const { data } = await api.post<{ accepting_orders: boolean }>(
    "/api/orders/toggle-accepting/",
    { branch_id: branchId }
  );
  return data;
}
