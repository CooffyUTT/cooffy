"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import type { PaymentMethod, Order } from "@/types/order";
import { PAYMENT_METHOD_LABELS } from "@/types/order";

export function CheckoutView() {
  const router = useRouter();
  const { cart, branchId, subtotal, tax, total, clearCart } = useCart();
  const createOrder = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [comment, setComment] = useState("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const handleSubmit = async () => {
    if (!paymentMethod || !branchId) return;

    const payload = {
      branch_id: branchId,
      payment_method: paymentMethod,
      comment: comment || undefined,
      order_products: cart.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
      })),
    };

    const order = await createOrder.mutateAsync(payload);
    setCreatedOrder(order);
    clearCart();
  };

  if (createdOrder) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant/30">
          <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <h1 className="text-lg font-bold text-on-surface">Pedido confirmado</h1>
          </div>
        </header>

        <main className="max-w-[600px] mx-auto px-4 py-8">
          <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-on-surface mb-1">
                Tu pedido ha sido registrado
              </h2>
              <p className="text-sm text-on-surface-variant">
                Pedido #{createdOrder.order_number}
              </p>
            </div>

            <div className="border-t border-outline-variant/20 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Fecha</span>
                <span className="text-on-surface font-medium">{createdOrder.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Método de pago</span>
                <span className="text-on-surface font-medium">
                  {PAYMENT_METHOD_LABELS[createdOrder.payment_method]}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Estado</span>
                <span className="text-on-surface font-medium">En espera</span>
              </div>
              {createdOrder.comment && (
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Comentario</span>
                  <span className="text-on-surface font-medium text-right max-w-[60%]">
                    {createdOrder.comment}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-outline-variant/20 mt-4 pt-4">
              <h3 className="text-sm font-semibold text-on-surface mb-3">Productos</h3>
              <div className="space-y-2">
                {createdOrder.order_products.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">
                      {item.quantity}x Producto #{item.item_id}
                    </span>
                    <span className="text-on-surface font-medium">
                      ${Number(item.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-outline-variant/20 mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold text-on-surface">
                <span>Total</span>
                <span>${Number(createdOrder.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push("/menu")}
            >
              Volver al menú
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <ShoppingBag className="h-16 w-16 text-on-surface-variant/30 mb-4" />
        <h2 className="text-xl font-bold text-on-surface mb-2">Carrito vacío</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Agrega productos antes de continuar al pago.
        </p>
        <Button onClick={() => router.push("/menu")}>Ver menú</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant/30">
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="h-5 w-5 text-on-surface" />
          </button>
          <h1 className="text-lg font-bold text-on-surface">Confirmar pedido</h1>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-4 py-6 space-y-6">
        {/* Resumen del carrito */}
        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">Tu pedido</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-on-surface">{item.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {item.quantity} x ${item.price.toFixed(2)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-on-surface">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-outline-variant/20 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Impuesto (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-on-surface pt-2 border-t border-dashed border-outline-variant/20">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Método de pago */}
        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">
            Método de pago
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("cash")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "cash"
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <Banknote className="h-5 w-5 text-on-surface-variant" />
              <span className="text-sm font-medium text-on-surface">Efectivo</span>
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === "card"
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <CreditCard className="h-5 w-5 text-on-surface-variant" />
              <span className="text-sm font-medium text-on-surface">Tarjeta</span>
            </button>
          </div>
        </section>

        {/* Comentario */}
        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comentario (opcional)
          </h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ej: Sin cebolla, extra salsa..."
            className="w-full text-sm bg-surface border border-outline-variant rounded-lg px-3 py-2 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            rows={3}
          />
        </section>

        {/* Error */}
        {createOrder.isError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error al crear el pedido</p>
              <p className="text-xs text-red-600 mt-1">
                {createOrder.error instanceof Error
                  ? createOrder.error.message
                  : "Ocurrió un error inesperado"}
              </p>
            </div>
          </div>
        )}

        {/* Botón confirmar */}
        <Button
          className="w-full"
          size="lg"
          disabled={!paymentMethod || createOrder.isPending}
          onClick={handleSubmit}
        >
          {createOrder.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Confirmar pedido"
          )}
        </Button>
      </main>
    </div>
  );
}
