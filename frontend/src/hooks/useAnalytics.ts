import { useQuery } from "@tanstack/react-query";
import {
  getDailySummary,
  getOperationTimes,
  getOrdersByHour,
  getSales,
  getTopProducts,
} from "@/services/analyticsService";
import type { AnalyticsPeriod } from "@/types/analytics";

const STALE_TIME = 5 * 60 * 1000;

export function useDailySummary(period: AnalyticsPeriod, enabled = true) {
  return useQuery({
    queryKey: ["analytics", "daily-summary", period],
    queryFn: () => getDailySummary(period),
    enabled,
    staleTime: STALE_TIME,
  });
}

export function useTopProducts(period: AnalyticsPeriod, enabled = true) {
  return useQuery({
    queryKey: ["analytics", "top-products", period],
    queryFn: () => getTopProducts(period),
    enabled,
    staleTime: STALE_TIME,
  });
}

export function useOrdersByHour(period: AnalyticsPeriod, enabled = true) {
  return useQuery({
    queryKey: ["analytics", "orders-by-hour", period],
    queryFn: () => getOrdersByHour(period),
    enabled,
    staleTime: STALE_TIME,
  });
}

export function useSales(period: AnalyticsPeriod, enabled = true) {
  return useQuery({
    queryKey: ["analytics", "sales", period],
    queryFn: () => getSales(period),
    enabled,
    staleTime: STALE_TIME,
  });
}

export function useOperationTimes(period: AnalyticsPeriod, enabled = true) {
  return useQuery({
    queryKey: ["analytics", "operation-times", period],
    queryFn: () => getOperationTimes(period),
    enabled,
    staleTime: STALE_TIME,
  });
}
