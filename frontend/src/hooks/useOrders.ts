import { useQuery } from "@tanstack/react-query";
import { getOrders, getTodayDate } from "@/services/orderService";

export function useOrders(state?: string, refetchInterval?: number) {
  const date = getTodayDate();
  return useQuery({
    queryKey: ["orders", date, state ?? "all"],
    queryFn: () => getOrders({ date, state }),
    refetchInterval,
    select: (data) => [...data].sort((a, b) => a.id - b.id),
  });
}
