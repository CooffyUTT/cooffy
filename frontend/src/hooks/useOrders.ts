import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrder, getOrders, getOrder } from "@/lib/ordersApi";
import type { OrderCreatePayload } from "@/types/order";

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
