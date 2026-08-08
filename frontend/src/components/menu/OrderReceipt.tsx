"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderResponse } from "@/services/orderService";
import { OrderProgress } from "./OrderProgress";

interface OrderReceiptProps {
  order: OrderResponse;
}

export function OrderReceipt({ order }: OrderReceiptProps) {
  const router = useRouter();
  const isCash = order.payment_status === "pending";

  return (
    <main className="w-full pt-20 md:pt-28 pb-24 px-4 max-w-128 md:max-w-144 mx-auto text-center">
      <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-on-surface mb-2">¡Pedido confirmado!</h1>
      <p className="text-on-surface-variant mb-6">
        Presenta este comprobante al recoger tu pedido.
        {isCash && " Un cajero confirmará tu pago antes de la entrega."}
      </p>

      <div className="border border-outline-variant/30 rounded-xl p-6 bg-surface text-left space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between gap-3">
            <span className="text-on-surface-variant">Número de pedido</span>
            <span className="font-bold text-on-surface shrink-0 whitespace-nowrap">#{order.order_number}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-on-surface-variant">Total</span>
            <span className="font-bold text-on-surface shrink-0 whitespace-nowrap">${Number(order.total).toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-on-surface-variant">Estado del pago</span>
            <span className="font-bold text-on-surface shrink-0 whitespace-nowrap text-right">
              {isCash ? "Pendiente de pago" : order.payment_status}
            </span>
          </div>
        </div>

        <div className="pt-1">
          <span className="text-on-surface-variant text-sm">Estado del pedido</span>
          <div className="mt-3">
            <OrderProgress state={order.state} />
          </div>
        </div>

        {order.order_products.length > 0 && (
          <div className="border-t border-dashed border-outline-variant/30 pt-3 space-y-1.5">
            {order.order_products.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-on-surface min-w-0 truncate">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-on-surface-variant shrink-0 whitespace-nowrap">
                  ${Number(item.price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => router.push("/menu")}
        className="w-full h-auto bg-primary text-white py-4 rounded-xl font-bold mt-8"
      >
        Volver al menú
      </Button>
    </main>
  );
}
