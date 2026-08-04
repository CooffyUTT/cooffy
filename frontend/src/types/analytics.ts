export type AnalyticsPeriod =
  | "daily"
  | "weekly"
  | "monthly"
  | "four_monthly"
  | "semesterly";

export interface TopProduct {
  item_id: number;
  name: string;
  quantity_sold: number;
}

export interface HourlyCount {
  hour: number;
  count: number;
}

export interface SalesDataPoint {
  date: string;
  total: string;
  order_count: number;
}

export interface OperationTimePoint {
  date: string;
  avg_minutes: number | null;
  min_minutes: number | null;
  max_minutes: number | null;
}

export interface DailySummary {
  sales_total: string;
  orders_count: number;
  top_product: TopProduct | null;
  avg_operation_minutes: number | null;
  period: AnalyticsPeriod;
  date: string;
}

export interface TopProductsResponse {
  period: AnalyticsPeriod;
  products: TopProduct[];
}

export interface OrdersByHourResponse {
  period: AnalyticsPeriod;
  date: string;
  hours: HourlyCount[];
}

export interface SalesResponse {
  period: AnalyticsPeriod;
  data: SalesDataPoint[];
}

export interface OperationTimesResponse {
  period: AnalyticsPeriod;
  avg_minutes: number | null;
  data: OperationTimePoint[];
}
