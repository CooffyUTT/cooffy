import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKitchenOrders,
  advanceOrderState,
  toggleAccepting,
  KitchenOrder,
} from "@/services/kitchenService";
import { Order } from "@/types/kitchen";

function mapToDisplayOrder(order: KitchenOrder): Order {
  return {
    id: String(order.id),
    orderNumber: `#${order.order_number}`,
    customerName: order.client_name,
    createdAt: new Date(order.created_at),
    status: order.state as Order["status"],
    items: order.order_products.map((product) => ({
      id: String(product.id),
      name: product.name,
      quantity: product.quantity,
      category: product.category_name,
    })),
    notes: order.comment ?? undefined,
  };
}

export function useKitchenOrders(branchId: number) {
  const query = useQuery({
    queryKey: ["kitchen-orders", branchId],
    queryFn: () => getKitchenOrders(branchId),
    refetchInterval: 5000,
  });

  return {
    ...query,
    orders: query.data?.results.map(mapToDisplayOrder) ?? [],
    acceptingOrders: query.data?.accepting_orders ?? true,
  };
}

export function useAdvanceOrder(branchId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: advanceOrderState,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders", branchId] });
    },
  });
}

export function useToggleAccepting(branchId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleAccepting(branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders", branchId] });
    },
  });
}
