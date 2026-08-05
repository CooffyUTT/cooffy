import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getOrders,
  getOrder,
  getOrdersByState,
  updateOrderState,
} from "@/lib/ordersApi";
import type { OrderCreatePayload, OrderState } from "@/types/order";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id),
    enabled: id > 0,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrderCreatePayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useKitchenOrders(state?: OrderState, branchId?: number) {
  return useQuery({
    queryKey: ["orders", "kitchen", state, branchId],
    queryFn: () => getOrdersByState(state!, branchId),
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
