"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import type { Order } from "@/types/order";
import { OrderProgress } from "./OrderProgress";

interface OrderReceiptProps {
  order: Order;
}

export function OrderReceipt({ order }: OrderReceiptProps) {
  const isCash = order.payment_status === "pending";

  return (
    <section
      className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5"
      data-testid="order-receipt"
    >
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle2 className="h-8 w-8 text-primary shrink-0" />
        <div>
          <h2 className="text-base font-bold text-on-surface">
            ¡Pedido confirmado!
          </h2>
          <p className="text-sm text-on-surface-variant">
            Presenta este comprobante al recoger tu pedido.
            {isCash && " Un cajero confirmará tu pago antes de la entrega."}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-on-surface-variant">Número de pedido</span>
          <span className="font-bold text-on-surface shrink-0 whitespace-nowrap">
            #{order.order_number}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-on-surface-variant">Total</span>
          <span className="font-bold text-on-surface shrink-0 whitespace-nowrap">
            ${Number(order.total).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-on-surface-variant">Estado del pago</span>
          <span className="font-bold text-on-surface shrink-0 whitespace-nowrap text-right">
            {isCash ? "Pendiente de pago" : "Pagado"}
          </span>
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-dashed border-outline-variant/30">
        <span className="text-on-surface-variant text-sm">
          Estado del pedido
        </span>
        <div className="mt-3">
          <OrderProgress state={order.state} />
        </div>
      </div>
    </section>
  );
}
