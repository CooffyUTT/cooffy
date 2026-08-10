"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Receipt,
  MapPin,
  CalendarDays,
  Banknote,
  CreditCard,
  Package,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useBranches } from "@/hooks/useBranches";
import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATE_BADGE_CLASSES,
  ORDER_STATE_DOT_CLASSES,
} from "@/lib/orderUi";
import {
  ORDER_STATE_LABELS,
  PAYMENT_METHOD_LABELS,
  type Order,
} from "@/types/order";

const POLLING_INTERVAL_MS = 30_000;

function formatCurrency(value: string | number) {
  return `$${Number(value).toFixed(2)}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function OrderCardItem({
  order,
  branchName,
  onSelect,
}: {
  order: Order;
  branchName: string | null;
  onSelect: () => void;
}) {
  const StateIcon = order.state === "rejected" ? AlertCircle : Package;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full text-left bg-surface-container-low rounded-2xl border border-outline-variant/20 p-4 hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-on-surface">
              Pedido #{order.order_number}
            </p>
            <p className="text-xs text-on-surface-variant flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`${ORDER_STATE_BADGE_CLASSES[order.state]} border font-semibold capitalize`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${ORDER_STATE_DOT_CLASSES[order.state]}`}
          />
          {ORDER_STATE_LABELS[order.state]}
        </Badge>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {branchName ?? `Sucursal #${order.branch_id}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          {order.payment_method === "cash" ? (
            <Banknote className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <CreditCard className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>{PAYMENT_METHOD_LABELS[order.payment_method]}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <StateIcon className="h-3.5 w-3.5" />
          {order.order_products.length}{" "}
          {order.order_products.length === 1 ? "producto" : "productos"}
        </div>
        <span className="text-base font-extrabold text-primary">
          {formatCurrency(order.total)}
        </span>
      </div>
    </button>
  );
}

export function OrdersListView() {
  const router = useRouter();
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useOrders(undefined, POLLING_INTERVAL_MS);
  const { data: branches } = useBranches();

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant/30">
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => router.push("/menu")}
            className="p-1 -ml-1 text-on-surface hover:text-primary transition-colors"
            aria-label="Volver al menú"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold text-on-surface">Mis pedidos</h1>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3" data-testid="orders-loading">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-surface-container-low rounded-2xl border border-outline-variant/20 p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-surface-container-highest rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-surface-container-highest rounded w-1/3" />
                    <div className="h-3 bg-surface-container-highest rounded w-1/4" />
                  </div>
                </div>
                <div className="h-3 bg-surface-container-highest rounded w-2/3" />
                <div className="h-3 bg-surface-container-highest rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            role="alert"
          >
            <AlertCircle className="h-12 w-12 text-error mb-3" />
            <p className="text-on-surface font-medium">
              No pudimos cargar tus pedidos
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              {error instanceof Error
                ? error.message
                : "Ocurrió un error inesperado"}
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-on-surface mb-1">
              Aún no tienes pedidos
            </h2>
            <p className="text-sm text-on-surface-variant max-w-sm">
              Cuando realices un pedido aparecerá aquí para que puedas darle
              seguimiento.
            </p>
            <button
              onClick={() => router.push("/menu")}
              className="mt-6 text-sm font-semibold text-primary hover:underline"
            >
              Ver menú
            </button>
          </div>
        ) : (
          <div
            className="space-y-3"
            data-testid="orders-list"
            aria-label="Lista de pedidos"
          >
            {orders.map((order) => (
              <OrderCardItem
                key={order.id}
                order={order}
                branchName={
                  branches?.find((b) => b.id === order.branch_id)?.name ?? null
                }
                onSelect={() => router.push(`/menu/orders/${order.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
