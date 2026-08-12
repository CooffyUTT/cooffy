"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  MapPin,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCreateOrder } from "@/hooks/useOrders";
import { useBranches } from "@/hooks/useBranches";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PaymentMethod } from "@/types/order";
import { PAYMENT_METHOD_LABELS } from "@/types/order";

const PAYMENT_HINTS: Record<PaymentMethod, string> = {
  1: "Paga al recoger tu pedido en caja.",
  2: "Pago electrónico (simulado).",
};

interface OrderProductError {
  name?: string;
  reason?: string;
}

function extractOrderErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: unknown };
    message?: string;
  };
  const data = err?.response?.data;

  if (data && typeof data === "object") {
    const dataObj = data as Record<string, unknown>;

    if (Array.isArray(dataObj.order_products) && dataObj.order_products.length > 0) {
      const list = (dataObj.order_products as OrderProductError[])
        .map((p) => p?.name)
        .filter((name): name is string => Boolean(name))
        .join(", ");
      const reason = (dataObj.order_products[0] as OrderProductError)?.reason === "out_of_stock"
        ? "ya no tienen stock"
        : "no se ofrecen en la sucursal seleccionada";
      return list
        ? `Los siguientes productos ${reason}: ${list}. Vuelve al menú para ajustar tu pedido.`
        : `Algunos productos ${reason}. Vuelve al menú para ajustar tu pedido.`;
    }

    if (typeof dataObj.detail === "string" && dataObj.detail) {
      return dataObj.detail;
    }

    for (const value of Object.values(dataObj)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        return value[0];
      }
      if (typeof value === "string" && value) {
        return value;
      }
    }
  }

  if (err?.message) return err.message;
  return "Ocurrió un error inesperado";
}

export function CheckoutView() {
  const router = useRouter();
  const {
    cart,
    branchId,
    subtotal,
    tax,
    total,
    totalItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  const createOrder = useCreateOrder();
  const { data: branches } = useBranches();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(1);
  const [comment, setComment] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const branch = useMemo(
    () => branches?.find((b) => b.id === branchId),
    [branches, branchId],
  );

  const handleConfirm = async () => {
    if (!paymentMethod || !branchId) return;

    setShowConfirm(false);

    const payload = {
      branch_id: branchId,
      payment_method: paymentMethod,
      comment: comment || undefined,
      order_products: cart.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      const order = await createOrder.mutateAsync(payload);
      clearCart();
      toast.success(`Pedido #${order.order_number} registrado`);
      router.push(`/orders/${order.id}`);
    } catch (error) {
      const message = extractOrderErrorMessage(error);
      toast.error("No se pudo registrar el pedido", { description: message });
    }
  };

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
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant/30">
        <div className="max-w-[600px] mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="h-5 w-5 text-on-surface" />
          </button>
          <h1 className="text-lg font-bold text-on-surface">Confirmar pedido</h1>
        </div>
      </header>

      <main className="max-w-[600px] mx-auto px-4 py-6 space-y-6">
        {branch && (
          <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-on-surface-variant mb-0.5">Recoger en</p>
                <p className="text-sm font-semibold text-on-surface">{branch.name}</p>
                {branch.location && (
                  <p className="text-xs text-on-surface-variant mt-0.5">{branch.location}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">Tiempo est.</p>
                <p className="text-sm font-bold text-primary">12-18 min</p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">
            Tu pedido · {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
          </h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-outline-variant/10"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-on-surface-variant/40" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    ${item.price.toFixed(2)} c/u
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      item.quantity === 1
                        ? removeFromCart(item.id)
                        : updateQuantity(item.id, -1)
                    }
                    className="w-7 h-7 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-highest transition-colors"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="h-3 w-3 text-error" />
                    ) : (
                      <Minus className="h-3 w-3 text-on-surface-variant" />
                    )}
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-on-surface">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-highest transition-colors"
                  >
                    <Plus className="h-3 w-3 text-on-surface-variant" />
                  </button>
                </div>

                <span className="text-sm font-semibold text-on-surface w-16 text-right">
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
              <span>IVA incluido (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="bg-primary/5 rounded-xl p-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-on-surface">Total</span>
                <span className="text-xl font-extrabold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">
            Método de pago
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod(1)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 1
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <Banknote className="h-5 w-5 text-on-surface-variant" />
              <span className="text-sm font-medium text-on-surface">Efectivo</span>
            </button>
            <button
              onClick={() => setPaymentMethod(2)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 2
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant/20 hover:border-outline-variant/50"
              }`}
            >
              <CreditCard className="h-5 w-5 text-on-surface-variant" />
              <span className="text-sm font-medium text-on-surface">Tarjeta</span>
            </button>
          </div>
          {paymentMethod && (
            <div className="mt-3 flex items-start gap-2 bg-primary/5 rounded-lg p-3">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-on-surface">
                  Pago con {PAYMENT_METHOD_LABELS[paymentMethod]}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {PAYMENT_HINTS[paymentMethod]}
                </p>
              </div>
            </div>
          )}
        </section>

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

        {createOrder.isError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error al crear el pedido</p>
              <p className="text-xs text-red-600 mt-1">
                {extractOrderErrorMessage(createOrder.error)}
              </p>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant/30 p-4 z-40">
        <div className="max-w-[600px] mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-on-surface-variant">Total</span>
            <span className="text-xl font-extrabold text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={!paymentMethod || createOrder.isPending}
            onClick={() => setShowConfirm(true)}
          >
            Confirmar pedido
          </Button>
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>¿Confirmar pedido?</DialogTitle>
            <DialogDescription>
              Revisa los detalles antes de enviar tu pedido.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Total</span>
              <span className="text-lg font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">Método</span>
              <span className="text-on-surface font-medium">
                {paymentMethod ? PAYMENT_METHOD_LABELS[paymentMethod] : "-"}
              </span>
            </div>
            {branch && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Sucursal</span>
                <span className="text-on-surface font-medium">{branch.name}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={createOrder.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
