import { useQuery } from "@tanstack/react-query";
import { getOrder, getOrders } from "@/services/orderService";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getOrder(id),
    enabled: id > 0,
    refetchInterval: 5000,
  });
}
