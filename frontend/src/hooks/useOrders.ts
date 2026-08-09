import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getOrders,
  getOrder,
  getOrdersByState,
  updateOrderState,
} from "@/lib/ordersApi";
import type { OrderCreatePayload, OrderState } from "@/types/order";

// Obtenemos la fecha de hoy en formato YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split("T")[0];

export function useOrders(state?: string, refetchInterval?: number) {
  const date = getTodayDate();
  return useQuery({
    queryKey: ["orders", date, state ?? "all"],
    queryFn: async () => {
      const data = await getOrders({ date, state });
      return data ?? []; // ✅ Si la API retorna undefined/null, retorna un arreglo vacío []
    },
    refetchInterval,
    select: (data) => (Array.isArray(data) ? [...data].sort((a, b) => a.id - b.id) : []),
  });
}

export function useOrder(id: number, refetchInterval?: number) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const data = await getOrder(id);
      if (!data) throw new Error("Pedido no encontrado");
      return data;
    },
    enabled: id > 0,
    refetchInterval,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrderCreatePayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("useCreateOrder failed", error);
    },
  });
}

export function useKitchenOrders(state?: OrderState, branchId?: number) {
  return useQuery({
    queryKey: ["orders", "kitchen", state, branchId],
    queryFn: async () => {
      if (!state) return [];
      const data = await getOrdersByState(state, branchId);
      return data ?? [];
    },
    enabled: !!state,
    refetchInterval: 10000,
  });
}

export function useUpdateOrderState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, state }: { orderId: number; state: OrderState }) =>
      updateOrderState(orderId, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "kitchen"] });
    },
  });
}