"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Banknote, CreditCard } from "lucide-react";
import type { Order } from "@/types/kitchen";

interface HandoffDialogProps {
  order: Order | null;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}

export function HandoffDialog({ order, onConfirm, onCancel, isPending }: HandoffDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-slate-900">
            Entregar pedido #{order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Verifica los datos antes de marcar como entregado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 py-1 overflow-y-auto min-h-0 flex-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Cliente</span>
            <span className="font-bold text-slate-900">{order.customerName}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Productos</span>
            <span className="font-bold text-slate-900">
              {order.items.reduce((acc, item) => acc + item.quantity, 0)} articulos
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Pago</span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              {order.paymentMethod === "cash" ? (
                <Banknote size={14} className="text-green-600" />
              ) : (
                <CreditCard size={14} className="text-blue-600" />
              )}
              {order.paymentMethod === "cash" ? "Efectivo" : "Tarjeta"}
            </span>
          </div>

          <div className="border-t border-slate-100 pt-2 flex justify-between">
            <span className="text-sm font-bold text-slate-500">Total</span>
            <span className="text-lg font-black text-emerald-600">
              ${order.total.toFixed(2)}
            </span>
          </div>

          {order.items.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-2.5 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
            <p className="text-xs font-bold text-emerald-800">
              Confirma que el cliente ha recogido su pedido
            </p>
          </div>
        </div>

        {/* Cambia la línea del DialogFooter por esto: */}
        <DialogFooter className="flex flex-col sm:flex-col gap-2 shrink-0 pt-2">
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11"
          >
            <CheckCircle2 size={16} className="mr-1.5" />
            {isPending ? "Procesando..." : "Confirmar entrega"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="w-full border-slate-300 h-11"
          >
            <X size={16} className="mr-1.5" />
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
