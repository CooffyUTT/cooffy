"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export default function CartSheet() {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    tax,
    total,
    branchId,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/menu/checkout");
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="bg-surface border-outline-variant/30 flex flex-col justify-between p-6">
        <div>
          <SheetHeader className="mb-6 border-b border-outline-variant/20 pb-4">
            <SheetTitle className="font-headline-md text-2xl font-bold text-on-surface flex items-center gap-2">
              <ShoppingBag className="text-primary h-6 w-6" /> Tu carrito
            </SheetTitle>
            {branchId && (
              <p className="text-xs text-on-surface-variant">
                Sucursal #{branchId}
              </p>
            )}
          </SheetHeader>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-35" />
              <p className="font-medium text-lg">Tu carrito está vacío</p>
              <p className="text-sm">¡Elige algo delicioso para comenzar!</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[55vh] pr-1 hide-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 items-center border-b border-outline-variant/10 pb-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className="text-sm font-bold text-on-surface">{item.name}</h5>
                      <span className="text-sm font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end items-center mt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-outline rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.id, -1)}>
                            <Minus className="h-3 w-3 text-on-surface-variant" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}>
                            <Plus className="h-3 w-3 text-on-surface-variant" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-on-surface-variant hover:text-error">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-outline-variant/30 pt-4 mt-auto">
            <div className="space-y-2 mb-6">
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
            <SheetFooter>
              <Button
                className="w-full bg-primary text-white py-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-on-primary-fixed-variant"
                onClick={handleCheckout}
              >
                Continuar al pago <ArrowRight className="h-4 w-4" />
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
