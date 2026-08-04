"use client";

import {
  Banknote,
  ClipboardList,
  Star,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCurrency,
  formatInteger,
  formatMinutes,
} from "@/utils/analyticsFormatters";
import type { DailySummary } from "@/types/analytics";

interface SummaryKpiCardsProps {
  summary: DailySummary | undefined;
  isLoading: boolean;
  isError: boolean;
}

interface Kpi {
  key: string;
  title: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function SummaryKpiCards({
  summary,
  isLoading,
  isError,
}: SummaryKpiCardsProps) {
  const kpis: Kpi[] = [
    {
      key: "sales",
      title: "Ventas del periodo",
      value: summary ? formatCurrency(summary.sales_total) : "—",
      hint: summary
        ? `${formatInteger(summary.orders_count)} pedidos`
        : "Sin pedidos en el periodo",
      icon: Banknote,
    },
    {
      key: "top-product",
      title: "Producto más vendido",
      value: summary?.top_product?.name ?? "—",
      hint: summary?.top_product
        ? `${formatInteger(summary.top_product.quantity_sold)} unidades`
        : "Sin ventas registradas",
      icon: Star,
    },
    {
      key: "orders",
      title: "Cantidad de pedidos",
      value: summary ? formatInteger(summary.orders_count) : "—",
      hint: "Total de órdenes en el periodo",
      icon: ClipboardList,
    },
    {
      key: "avg-time",
      title: "Tiempo de operación",
      value: formatMinutes(summary?.avg_operation_minutes ?? null),
      hint: "Promedio created → picked_up",
      icon: Timer,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.key} data-testid={`kpi-${kpi.key}`}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <CardDescription>{kpi.title}</CardDescription>
                <CardTitle className="text-2xl font-semibold">
                  {kpi.value}
                </CardTitle>
              </div>
              <kpi.icon className="text-muted-foreground size-5 shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">
              {isError
                ? "No se pudo cargar el indicador"
                : isLoading
                  ? "Cargando…"
                  : kpi.hint}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
