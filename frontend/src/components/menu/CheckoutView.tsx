"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { createOrder } from "@/services/orderService";
import { DEFAULT_BRANCH_ID } from "@/lib/constants";

const PAYMENT_METHODS = [
  { id: 1, name: "Efectivo", description: "Paga al recoger tu pedido en caja.", icon: Banknote },
  { id: 2, name: "Tarjeta", description: "Pago electrónico.", icon: CreditCard },
] as const;

export function CheckoutView() {
  const router = useRouter();
  const { cart, subtotal, tax, total, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<number>(PAYMENT_METHODS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (cart.length === 0 || isSubmitting) return;

    const rawUser = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
    const user = rawUser ? JSON.parse(rawUser) : null;

    if (!user?.id) {
      toast.error("Sesión requerida", {
        description: "Inicia sesión de nuevo para poder confirmar tu pedido.",
      });
      router.push("/");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createOrder({
        branch_id: DEFAULT_BRANCH_ID,
        client_id: user.id,
        payment_method: paymentMethod,
        order_products: cart.map((item) => ({
          item_id: item.id,
          quantity: item.quantity,
          price: (item.price * item.quantity).toFixed(2),
        })),
      });

      clearCart();
      toast.success("¡Pedido registrado!", {
        description: `Tu número de pedido es #${created.order_number}.`,
      });
      router.push(`/orders/${created.id}`);
    } catch (error) {
      console.error("Error al confirmar el pedido", error);
      toast.error("No se pudo registrar el pedido", {
        description: "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0 && !isSubmitting) {
    return (
      <main className="w-full pt-20 md:pt-28 pb-24 px-4 max-w-128 mx-auto text-center">
        <p className="text-on-surface-variant mb-4">Tu carrito está vacío.</p>
        <Button onClick={() => router.push("/menu")} className="bg-primary text-white rounded-xl font-bold">
          Ir al menú
        </Button>
      </main>
    );
  }

  return (
    <main className="w-full pt-20 md:pt-28 pb-24 px-4 md:px-6 max-w-128 md:max-w-2xl mx-auto">
      <button
        onClick={() => router.push("/menu")}
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary mb-6 whitespace-nowrap"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" /> Volver al menú
      </button>

      <h1 className="text-2xl font-bold text-on-surface mb-6">Confirmar pedido</h1>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-on-surface-variant mb-3">Resumen</h2>
        <div className="space-y-2 border border-outline-variant/20 rounded-xl p-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="text-on-surface min-w-0 truncate">{item.quantity}x {item.name}</span>
              <span className="text-on-surface-variant shrink-0 whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-dashed border-outline-variant/30 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-on-surface-variant">
              <span>Impuesto (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-on-surface">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-on-surface-variant mb-3">Método de pago</h2>
        <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-3 border rounded-xl p-4 text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/30 hover:border-outline-variant"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isSelected ? "text-primary" : "text-on-surface-variant"}`} />
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface text-sm">{method.name}</p>
                  <p className="text-xs text-on-surface-variant">{method.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Button
        onClick={handleConfirm}
        disabled={isSubmitting}
        className="w-full h-auto bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
      </Button>
    </main>
  );
}
