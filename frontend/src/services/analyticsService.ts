import { api } from "@/lib/api";
import type {
  AnalyticsPeriod,
  DailySummary,
  OperationTimesResponse,
  OrdersByHourResponse,
  SalesResponse,
  TopProductsResponse,
} from "@/types/analytics";

function buildUrl(path: string, period: AnalyticsPeriod) {
  return `/api/analytics/${path}?period=${period}`;
}

export function getDailySummary(period: AnalyticsPeriod) {
  return api
    .get<DailySummary>(buildUrl("daily-summary/", period))
    .then((res) => res.data);
}

export function getTopProducts(period: AnalyticsPeriod) {
  return api
    .get<TopProductsResponse>(buildUrl("top-products/", period))
    .then((res) => res.data);
}

export function getOrdersByHour(period: AnalyticsPeriod) {
  return api
    .get<OrdersByHourResponse>(buildUrl("orders-by-hour/", period))
    .then((res) => res.data);
}

export function getSales(period: AnalyticsPeriod) {
  return api
    .get<SalesResponse>(buildUrl("sales/", period))
    .then((res) => res.data);
}

export function getOperationTimes(period: AnalyticsPeriod) {
  return api
    .get<OperationTimesResponse>(buildUrl("operation-times/", period))
    .then((res) => res.data);
}
