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
import {
  bucketOperationTimes,
  getOperationTimeBucket,
} from "@/utils/analyticsBuckets";
import type { AnalyticsPeriod, OperationTimePoint } from "@/types/analytics";

const chartConfig: ChartConfig = {
  avg_minutes: {
    label: "Promedio",
    color: "var(--color-chart-4)",
  },
};

interface OperationTimesChartProps {
  data: OperationTimePoint[];
  overallAvg: number | null;
  period: AnalyticsPeriod;
  isLoading: boolean;
  isError: boolean;
}

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatBucketLabel(value: string, bucket: ReturnType<typeof getOperationTimeBucket>) {
  if (bucket === "month") {
    const [year, month] = value.split("-");
    const monthIndex = Number(month) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${MONTHS_ES[monthIndex]} ${year}`;
    }
  }
  return formatShortDate(value);
}

export function OperationTimesChart({
  data,
  overallAvg,
  period,
  isLoading,
  isError,
}: OperationTimesChartProps) {
  const bucket = getOperationTimeBucket(period);
  const series = bucketOperationTimes(data, bucket).map((point) => ({
    date: point.date,
    avg_minutes: point.avg_minutes ?? 0,
    min_minutes: point.min_minutes,
    max_minutes: point.max_minutes,
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
            className="bg-muted/40 h-80 w-full animate-pulse rounded-md"
            aria-label="Cargando gráfica"
          />
        ) : series.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aún no hay pedidos completados en el periodo.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-80 w-full">
            <BarChart
              data={series}
              margin={{ left: 4, right: 8, top: 8, bottom: 8 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => formatBucketLabel(String(value), bucket)}
                tickLine={false}
                axisLine={false}
                minTickGap={bucket === "month" ? 0 : 16}
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
                    labelFormatter={(label) =>
                      formatBucketLabel(String(label), bucket)
                    }
                    formatter={(value, _name, item) => {
                      const payload = (item as { payload?: typeof series[number] })
                        .payload;
                      return (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground font-mono font-medium tabular-nums">
                            {formatMinutes(value as number)}
                          </span>
                          {payload && (
                            <span className="text-muted-foreground text-xs">
                              {payload.min_minutes !== null &&
                                `Min ${formatMinutes(payload.min_minutes)}`}
                              {payload.min_minutes !== null &&
                                payload.max_minutes !== null &&
                                " · "}
                              {payload.max_minutes !== null &&
                                `Max ${formatMinutes(payload.max_minutes)}`}
                            </span>
                          )}
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey="avg_minutes"
                fill="var(--color-chart-4)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
