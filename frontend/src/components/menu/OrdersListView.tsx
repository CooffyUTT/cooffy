"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Receipt } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { ORDER_STATE_LABELS } from "@/lib/constants";
import Header from "./Header";
import { OrderProgressBar } from "./OrderProgressBar";

export function OrdersListView() {
  const router = useRouter();
  const { data: orders, isLoading, error } = useOrders();

  return (
    <>
      <Header showSearch={false} />
      <main className="w-full pt-20 md:pt-28 pb-24 px-4 max-w-128 md:max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-6">Mis pedidos</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-on-surface-variant" />
          </div>
        ) : error ? (
          <p className="text-on-surface-variant text-sm text-center py-12">
            No se pudieron cargar tus pedidos.
          </p>
        ) : !orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
            <Receipt className="h-12 w-12 mb-3 opacity-40" />
            <p>Todavía no tienes pedidos.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => router.push(`/orders/${order.id}`)}
                className="w-full flex flex-col gap-3 border border-outline-variant/30 rounded-xl p-4 text-left hover:border-outline-variant transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-on-surface text-sm">Pedido #{order.order_number}</p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(order.created_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-on-surface text-sm">${Number(order.total).toFixed(2)}</p>
                    <p className="text-xs text-on-surface-variant capitalize">
                      {ORDER_STATE_LABELS[order.state] ?? order.state}
                    </p>
                  </div>
                </div>
                <OrderProgressBar state={order.state} />
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
