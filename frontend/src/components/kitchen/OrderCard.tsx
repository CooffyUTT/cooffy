"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, ImageIcon, AlertTriangle, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KitchenOrder } from '@/types/kitchen';
import { getTimeBadgeColor } from '@/utils/kitchenHelpers';

interface OrderCardProps {
  order: KitchenOrder;
  actionLabel: string;
  actionColor: string;
  onAction: () => void;
  secondaryActionLabel?: string;
  secondaryActionColor?: string;
  onSecondaryAction?: () => void;
  isPulse?: boolean;
  confirmingId: number | null;
  setConfirmingId: (id: number | null) => void;
  paymentPending?: boolean;
  onConfirmPayment?: () => void;
}

export function OrderCard({
  order,
  actionLabel,
  actionColor,
  onAction,
  secondaryActionLabel,
  secondaryActionColor,
  onSecondaryAction,
  isPulse = false,
  confirmingId,
  setConfirmingId,
  paymentPending = false,
  onConfirmPayment
}: OrderCardProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [confirmingReject, setConfirmingReject] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const diffMs = Date.now() - new Date(order.created_at).getTime();
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const totalProducts = (order.order_products || []).reduce(
    (acc, item) => acc + item.quantity, 
    0
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border p-4 space-y-3 bg-white shadow-xs flex flex-col justify-between ${
        isPulse ? 'ring-2 ring-emerald-400 ring-offset-2 animate-pulse' : 'border-slate-200'
      }`}
    >
      <div className="space-y-2.5">
        {/* Encabezado: Número de Orden y Tiempo Transcurrido */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">#{order.order_number}</span>
            </div>
            <p className="text-sm font-bold text-slate-600 mt-0.5">
              {order.client_name ?? 'Cliente'}
            </p>
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-extrabold text-xs border ${getTimeBadgeColor(elapsedMinutes)}`}>
            <Clock size={13} />
            <span>{elapsedMinutes} min</span>
          </div>
        </div>

        {/* Contador de Productos */}
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
          {totalProducts} {totalProducts === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
        </div>

        {/* Lista de Productos de la Orden */}
        <div className="space-y-2.5">
          {(order.order_products || []).map((item) => (
            <div key={item.id} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.item_image ? (
                      <Image
                        src={item.item_image}
                        alt={item.item_name ?? 'Producto'}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={16} className="text-slate-400" />
                    )}
                  </div>
                  {item.quantity}x {item.item_name ?? 'Producto'}
                </span>
              </div>

              {/* Modificadores o Modificaciones Excluidas */}
              {item.excluded_modifiers && item.excluded_modifiers.length > 0 && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold mt-1">
                  <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                  <span>Sin: {item.excluded_modifiers.join(', ')}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Comentario global de la orden */}
        {order.comment && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold">
            <AlertTriangle size={15} className="shrink-0 text-red-600" />
            <span>{order.comment}</span>
          </div>
        )}
      </div>

      {/* Precio Total */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-400">Total:</span>
        <span className="text-xl font-black text-slate-900">
          ${Number(order.total || 0).toFixed(2)}
        </span>
      </div>

      {/* Pago pendiente en efectivo */}
      {paymentPending && (
        <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-bold">
          <Banknote size={15} className="shrink-0 text-amber-600" />
          <span>Pago pendiente: confirma el efectivo en caja.</span>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="pt-2">
        {confirmingReject ? (
          <div className="space-y-2 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-bold text-red-800 text-center">
              ¿Estás seguro que deseas rechazar este pedido?
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setConfirmingReject(false);
                  onSecondaryAction?.();
                }}
                className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl"
              >
                SÍ, RECHAZAR
              </Button>
              <Button
                onClick={() => setConfirmingReject(false)}
                variant="outline"
                className="h-11 px-4 border-slate-300 text-slate-700 font-bold text-xs rounded-xl"
              >
                CANCELAR
              </Button>
            </div>
          </div>
        ) : confirmingId === order.id ? (
          <div className="flex gap-2">
            <Button
              onClick={onAction}
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl"
            >
              ✔ CONFIRMAR
            </Button>
            <Button
              onClick={() => setConfirmingId(null)}
              variant="outline"
              className="h-12 px-4 border-slate-300 text-slate-700 font-bold text-xs rounded-xl"
            >
              CANCELAR
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {paymentPending && onConfirmPayment && (
              <Button
                onClick={onConfirmPayment}
                className="w-full h-10 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl"
              >
                <Banknote className="h-4 w-4" /> CONFIRMAR PAGO
              </Button>
            )}
            <Button
              onClick={() => setConfirmingId(order.id)}
              className={`w-full h-12 text-white font-extrabold text-sm rounded-xl shadow-xs transition-all ${actionColor}`}
            >
              {actionLabel}
            </Button>
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                onClick={() => setConfirmingReject(true)}
                variant="outline"
                className={`w-full h-10 font-bold text-xs rounded-xl text-white ${secondaryActionColor}`}
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}