"use client";

import { useState } from "react";
import { ChartBar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDailySummary,
  useOperationTimes,
  useOrdersByHour,
  useSales,
  useTopProducts,
} from "@/hooks/useAnalytics";
import { PeriodSelector } from "./PeriodSelector";
import { SummaryKpiCards } from "./SummaryKpiCards";
import { TopProductsChart } from "./TopProductsChart";
import { OrdersByHourChart } from "./OrdersByHourChart";
import { SalesChart } from "./SalesChart";
import { OperationTimesChart } from "./OperationTimesChart";
import { PERIOD_LABELS } from "@/utils/analyticsFormatters";
import type { AnalyticsPeriod } from "@/types/analytics";

export function DashboardView() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("daily");

  const summary = useDailySummary(period);
  const topProducts = useTopProducts(period);
  const ordersByHour = useOrdersByHour(period);
  const sales = useSales(period);
  const operationTimes = useOperationTimes(period);

  const handleRefresh = () => {
    summary.refetch();
    topProducts.refetch();
    ordersByHour.refetch();
    sales.refetch();
    operationTimes.refetch();
  };

  const anyLoading =
    summary.isLoading ||
    topProducts.isLoading ||
    ordersByHour.isLoading ||
    sales.isLoading ||
    operationTimes.isLoading;

  return (
    <section className="space-y-6" data-testid="dashboard-view">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ChartBar className="text-primary size-5" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Indicadores de {PERIOD_LABELS[period].toLowerCase()} para tus
            sucursales.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <PeriodSelector value={period} onChange={setPeriod} />
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={anyLoading}
            aria-label="Actualizar dashboard"
          >
            <RefreshCw
              className={anyLoading ? "size-4 animate-spin" : "size-4"}
            />
          </Button>
        </div>
      </header>

      <SummaryKpiCards
        summary={summary.data}
        isLoading={summary.isLoading}
        isError={summary.isError}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopProductsChart
          products={topProducts.data?.products ?? []}
          isLoading={topProducts.isLoading}
          isError={topProducts.isError}
        />
        <OrdersByHourChart
          hours={ordersByHour.data?.hours}
          isLoading={ordersByHour.isLoading}
          isError={ordersByHour.isError}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <SalesChart
          data={sales.data?.data ?? []}
          isLoading={sales.isLoading}
          isError={sales.isError}
        />
        <OperationTimesChart
          data={operationTimes.data?.data ?? []}
          overallAvg={operationTimes.data?.avg_minutes ?? null}
          isLoading={operationTimes.isLoading}
          isError={operationTimes.isError}
        />
      </div>
    </section>
  );
}
