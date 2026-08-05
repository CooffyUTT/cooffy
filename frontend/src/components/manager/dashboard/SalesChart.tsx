"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatInteger,
  formatShortDate,
} from "@/utils/analyticsFormatters";
import type { SalesDataPoint } from "@/types/analytics";

const chartConfig: ChartConfig = {
  total: {
    label: "Ventas",
    color: "var(--color-chart-3)",
  },
};

interface SalesChartProps {
  data: SalesDataPoint[];
  isLoading: boolean;
  isError: boolean;
}

export function SalesChart({ data, isLoading, isError }: SalesChartProps) {
  const series = data.map((d) => ({
    date: d.date,
    total: Number.parseFloat(d.total),
    order_count: d.order_count,
  }));

  const total = series.reduce((acc, d) => acc + d.total, 0);
  const totalOrders = series.reduce((acc, d) => acc + d.order_count, 0);

  return (
    <Card data-testid="sales-card">
      <CardHeader>
        <CardTitle>Ventas generadas</CardTitle>
        <CardDescription>
          {series.length > 0
            ? `${formatCurrency(total)} · ${formatInteger(totalOrders)} pedidos en ${series.length} días`
            : "Serie temporal de ventas por día"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-muted-foreground text-sm">
            No se pudo cargar la serie de ventas.
          </p>
        ) : isLoading ? (
          <div
            className="bg-muted/40 h-72 w-full animate-pulse rounded-md"
            aria-label="Cargando gráfica"
          />
        ) : series.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sin ventas registradas en el periodo.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <AreaChart
              data={series}
              margin={{ left: 4, right: 8, top: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-chart-3)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-chart-3)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatShortDate(String(value))}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrencyCompact(Number(value))
                }
                tickLine={false}
                axisLine={false}
                width={64}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={{ stroke: "var(--color-border)" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatShortDate(String(label))}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="var(--color-chart-3)"
                fill="url(#salesGradient)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
