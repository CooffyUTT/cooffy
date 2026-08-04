"use client";

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
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
import { formatHour, formatInteger } from "@/utils/analyticsFormatters";
import type { HourlyCount } from "@/types/analytics";

const chartConfig: ChartConfig = {
  count: {
    label: "Pedidos",
    color: "var(--color-chart-2)",
  },
};

interface OrdersByHourChartProps {
  hours: HourlyCount[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function OrdersByHourChart({
  hours,
  isLoading,
  isError,
}: OrdersByHourChartProps) {
  const data = (hours ?? []).map((entry) => ({
    hour: entry.hour,
    label: formatHour(entry.hour),
    count: entry.count,
  }));

  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <Card data-testid="orders-by-hour-card">
      <CardHeader>
        <CardTitle>Pedidos por hora</CardTitle>
        <CardDescription>
          {total > 0
            ? `${formatInteger(total)} pedidos en el periodo`
            : "Distribución de pedidos en 24 horas"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-muted-foreground text-sm">
            No se pudo cargar la distribución por hora.
          </p>
        ) : isLoading ? (
          <div
            className="bg-muted/40 h-72 w-full animate-pulse rounded-md"
            aria-label="Cargando gráfica"
          />
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart
              data={data}
              margin={{ left: 4, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickFormatter={(value) => formatHour(Number(value))}
                tickLine={false}
                axisLine={false}
                interval={1}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--color-muted)" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(label, payload) => {
                      const hour = payload?.[0]?.payload?.hour;
                      if (hour === undefined) return String(label);
                      return formatHour(hour);
                    }}
                    formatter={(value) => formatInteger(value as number)}
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="var(--color-chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
