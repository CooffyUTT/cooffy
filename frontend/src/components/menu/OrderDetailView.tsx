"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Receipt,
  MapPin,
  Banknote,
  CreditCard,
  CalendarDays,
  Clock,
  Package,
  Check,
  Hourglass,
  ChefHat,
  Truck,
  XCircle,
  Loader2,
} from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { useBranches } from "@/hooks/useBranches";
import { Badge } from "@/components/ui/badge";
import {
  ORDER_PROGRESS_STATES,
  ORDER_STATE_BADGE_CLASSES,
  ORDER_STATE_DOT_CLASSES,
} from "@/lib/orderUi";
import {
  ORDER_STATE_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderState,
} from "@/types/order";

const POLLING_INTERVAL_MS = 15_000;

const PROGRESS_ICONS: Record<
  OrderState,
  React.ComponentType<{ className?: string }>
> = {
  pending: Hourglass,
  preparing: ChefHat,
  ready: Package,
  picked_up: Truck,
  rejected: XCircle,
};

const PROGRESS_LABELS: Record<OrderState, string> = {
  pending: "En espera",
  preparing: "En preparación",
  ready: "Listo",
  picked_up: "Entregado",
  rejected: "Rechazado",
};

const PAYMENT_STATUS_LABELS = {
  pending: "Pendiente",
  paid: "Pagado",
} as const;

function formatCurrency(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function ProgressStepper({ state }: { state: OrderState }) {
  if (state === "rejected") {
    return (
      <div
        className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3"
        data-testid="progress-rejected"
      >
        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
        <p className="text-sm font-semibold text-red-700">
          Pedido rechazado por la cafetería.
        </p>
      </div>
    );
  }

  const currentIndex = ORDER_PROGRESS_STATES.indexOf(state);

  return (
    <ol
      className="flex items-center justify-between gap-1"
      data-testid="progress-stepper"
      aria-label="Progreso del pedido"
    >
      {ORDER_PROGRESS_STATES.map((step, index) => {
        const Icon = PROGRESS_ICONS[step];
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const dotClass = isDone
          ? "bg-emerald-500 text-white"
          : isCurrent
            ? `${ORDER_STATE_DOT_CLASSES[step]} text-white`
            : "bg-surface-container-highest text-on-surface-variant";
        return (
          <li
            key={step}
            className="flex-1 flex flex-col items-center text-center min-w-0"
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="flex items-center w-full">
              <div
                className={`flex-1 h-0.5 ${
                  isDone || isCurrent ? "bg-primary" : "bg-outline-variant/30"
                } ${index === 0 ? "invisible" : ""}`}
              />
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${dotClass}`}
                data-testid={`progress-step-${step}`}
                data-state={isCurrent ? "current" : isDone ? "done" : "pending"}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </span>
              <div
                className={`flex-1 h-0.5 ${
                  index < currentIndex ? "bg-primary" : "bg-outline-variant/30"
                } ${index === ORDER_PROGRESS_STATES.length - 1 ? "invisible" : ""}`}
              />
            </div>
            <span
              className={`mt-2 text-[11px] font-semibold leading-tight ${
                isCurrent
                  ? "text-on-surface"
                  : isDone
                    ? "text-on-surface-variant"
                    : "text-on-surface-variant/60"
              }`}
            >
              {PROGRESS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetailView() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = Number(params?.id);

  const { data: order, isLoading, isError, error } = useOrder(
    Number.isNaN(orderId) ? 0 : orderId,
    POLLING_INTERVAL_MS,
  );
  const { data: branches } = useBranches();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant/30">
          <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center gap-3">
            <button
              onClick={() => router.push("/menu/orders")}
              className="p-1 -ml-1 text-on-surface hover:text-primary transition-colors"
              aria-label="Volver a mis pedidos"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-on-surface">Detalle del pedido</h1>
          </div>
        </header>
        <main className="max-w-[600px] mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-on-surface-variant">Cargando pedido…</p>
        </main>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-background pb-12">
        <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant/30">
          <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center gap-3">
            <button
              onClick={() => router.push("/menu/orders")}
              className="p-1 -ml-1 text-on-surface hover:text-primary transition-colors"
              aria-label="Volver a mis pedidos"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-bold text-on-surface">Detalle del pedido</h1>
          </div>
        </header>
        <main className="max-w-[600px] mx-auto px-4 py-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-error mb-3" />
          <p className="text-on-surface font-medium">No se encontró el pedido</p>
          <p className="text-sm text-on-surface-variant mt-1 max-w-xs">
            {error instanceof Error ? error.message : "Pedido no encontrado"}
          </p>
          <button
            onClick={() => router.push("/menu/orders")}
            className="mt-6 text-sm font-semibold text-primary hover:underline"
          >
            Volver a mis pedidos
          </button>
        </main>
      </div>
    );
  }

  const branchName =
    branches?.find((b) => b.id === order.branch_id)?.name ??
    `Sucursal #${order.branch_id}`;

  const orderSubtotal = order.order_products.reduce(
    (sum, item) => sum + Number(item.price),
    0,
  );

  const showEstimatedTime =
    typeof order.estimated_completion_minutes === "number" &&
    order.estimated_completion_minutes > 0 &&
    (order.state === "pending" || order.state === "preparing");

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant/30">
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.push("/menu/orders")}
            className="p-1 -ml-1 text-on-surface hover:text-primary transition-colors"
            aria-label="Volver a mis pedidos"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-on-surface flex-1 truncate">
            Pedido <span data-testid="order-number">#{order.order_number}</span>
          </h1>
          <Badge
            variant="outline"
            data-testid="order-state-badge"
            className={`${ORDER_STATE_BADGE_CLASSES[order.state]} border font-semibold capitalize`}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${ORDER_STATE_DOT_CLASSES[order.state]}`}
            />
            {ORDER_STATE_LABELS[order.state]}
          </Badge>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-4 py-6 space-y-5">
        {showEstimatedTime && (
          <section
            className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4"
            data-testid="estimated-time"
          >
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">
                Tiempo estimado
              </p>
              <p className="text-lg font-bold text-primary">
                {order.estimated_completion_minutes} min
              </p>
            </div>
          </section>
        )}

        <section
          className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5"
          data-testid="progress-section"
        >
          <h2 className="text-sm font-semibold text-on-surface mb-4">
            Seguimiento
          </h2>
          <ProgressStepper state={order.state} />
        </section>

        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">
            Productos ({order.order_products.length})
          </h2>
          <ul className="space-y-3" data-testid="order-products">
            {order.order_products.map((item) => {
              const unitPrice =
                item.quantity > 0 ? Number(item.price) / item.quantity : 0;
              return (
                <li
                  key={item.id}
                  className="flex justify-between items-center bg-surface rounded-xl p-3 border border-outline-variant/10"
                >
                  <div>
                    <p className="text-sm font-medium text-on-surface">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {item.quantity} x {formatCurrency(unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-on-surface">
                    {formatCurrency(item.price)}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-outline-variant/20 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span data-testid="summary-subtotal">
                {formatCurrency(orderSubtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>IVA incluido</span>
              <span data-testid="summary-iva">
                {formatCurrency(order.iva)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-dashed border-outline-variant/20">
              <span className="text-base font-bold text-on-surface">Total</span>
              <span
                className="text-xl font-extrabold text-primary"
                data-testid="summary-total"
              >
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">
            Información
          </h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
              <div className="flex-1">
                <dt className="text-xs text-on-surface-variant">Sucursal</dt>
                <dd className="text-on-surface font-medium">{branchName}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              {order.payment_method === "cash" ? (
                <Banknote className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
              ) : (
                <CreditCard className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <dt className="text-xs text-on-surface-variant">
                  Método de pago
                </dt>
                <dd className="text-on-surface font-medium">
                  {PAYMENT_METHOD_LABELS[order.payment_method]}
                </dd>
              </div>
              <div className="text-right">
                <dt className="text-xs text-on-surface-variant">Estado del pago</dt>
                <dd
                  className={`font-semibold ${
                    order.payment_status === "paid"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                  data-testid="payment-status"
                >
                  {PAYMENT_STATUS_LABELS[order.payment_status]}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
              <div className="flex-1">
                <dt className="text-xs text-on-surface-variant">
                  Fecha del pedido
                </dt>
                <dd className="text-on-surface font-medium">
                  {formatDateTime(order.created_at)}
                </dd>
              </div>
            </div>
            {order.comment && (
              <div className="flex items-start gap-2">
                <Receipt className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
                <div className="flex-1">
                  <dt className="text-xs text-on-surface-variant">Comentario</dt>
                  <dd className="text-on-surface font-medium">{order.comment}</dd>
                </div>
              </div>
            )}
          </dl>
        </section>
      </main>
    </div>
  );
}
