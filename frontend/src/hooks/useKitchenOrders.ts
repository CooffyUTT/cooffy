import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getKitchenOrders, updateOrderState } from "@/lib/kitchenApi";
import type { OrderState } from "@/types/order";

export function useKitchenOrders(state?: OrderState) {
  return useQuery({
    queryKey: ["kitchen-orders", state],
    queryFn: () => getKitchenOrders(state),
    refetchInterval: 10000,
  });
}

export function useUpdateOrderState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, state }: { orderId: number; state: OrderState }) =>
      updateOrderState(orderId, state),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    },
  });
}
