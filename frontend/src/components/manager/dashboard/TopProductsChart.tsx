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
import { formatInteger } from "@/utils/analyticsFormatters";
import type { TopProduct } from "@/types/analytics";

const chartConfig: ChartConfig = {
  quantity_sold: {
    label: "Unidades",
    color: "var(--color-chart-1)",
  },
};

interface TopProductsChartProps {
  products: TopProduct[];
  isLoading: boolean;
  isError: boolean;
}

export function TopProductsChart({
  products,
  isLoading,
  isError,
}: TopProductsChartProps) {
  const data = products.slice(0, 8).map((p) => ({
    name: p.name,
    quantity_sold: p.quantity_sold,
  }));

  return (
    <Card data-testid="top-products-card">
      <CardHeader>
        <CardTitle>Top de productos</CardTitle>
        <CardDescription>
          Los productos con mayor cantidad vendida en el periodo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-muted-foreground text-sm">
            No se pudo cargar el ranking de productos.
          </p>
        ) : isLoading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sin ventas registradas en el periodo.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                width={120}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--color-muted)" }}
                content={
                  <ChartTooltipContent
                    nameKey="quantity_sold"
                    formatter={(value) => formatInteger(value as number)}
                  />
                }
              />
              <Bar
                dataKey="quantity_sold"
                fill="var(--color-chart-1)"
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div
      className="bg-muted/40 h-72 w-full animate-pulse rounded-md"
      aria-label="Cargando gráfica"
    />
  );
}
