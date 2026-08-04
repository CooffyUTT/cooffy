"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
  formatMinutes,
  formatShortDate,
} from "@/utils/analyticsFormatters";
import type { OperationTimePoint } from "@/types/analytics";

const chartConfig: ChartConfig = {
  avg_minutes: {
    label: "Promedio",
    color: "var(--color-chart-4)",
  },
  min_minutes: {
    label: "Mínimo",
    color: "var(--color-chart-2)",
  },
  max_minutes: {
    label: "Máximo",
    color: "var(--color-chart-5)",
  },
};

interface OperationTimesChartProps {
  data: OperationTimePoint[];
  overallAvg: number | null;
  isLoading: boolean;
  isError: boolean;
}

export function OperationTimesChart({
  data,
  overallAvg,
  isLoading,
  isError,
}: OperationTimesChartProps) {
  const series = data
    .filter(
      (d) => d.avg_minutes !== null || d.min_minutes !== null || d.max_minutes !== null,
    )
    .map((d) => ({
      date: d.date,
      avg_minutes: d.avg_minutes ?? 0,
      min_minutes: d.min_minutes ?? 0,
      max_minutes: d.max_minutes ?? 0,
    }));

  return (
    <Card data-testid="operation-times-card">
      <CardHeader>
        <CardTitle>Tiempos de operación</CardTitle>
        <CardDescription>
          {overallAvg !== null
            ? `Promedio general: ${formatMinutes(overallAvg)}`
            : "Tiempo entre la creación y la recolección del pedido"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-muted-foreground text-sm">
            No se pudieron cargar los tiempos de operación.
          </p>
        ) : isLoading ? (
          <div
            className="bg-muted/40 h-72 w-full animate-pulse rounded-md"
            aria-label="Cargando gráfica"
          />
        ) : series.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aún no hay pedidos completados en el periodo.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart
              data={series}
              margin={{ left: 4, right: 8, top: 8, bottom: 8 }}
            >
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
                tickFormatter={(value) => `${value} m`}
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--color-muted)" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => formatShortDate(String(label))}
                    formatter={(value) => formatMinutes(value as number)}
                  />
                }
              />
              <Bar
                dataKey="min_minutes"
                fill="var(--color-chart-2)"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="avg_minutes"
                fill="var(--color-chart-4)"
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="max_minutes"
                fill="var(--color-chart-5)"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
