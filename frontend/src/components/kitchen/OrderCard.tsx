"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Utensils, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/types/kitchen';
import { getTimeBadgeColor } from '@/utils/kitchenHelpers';

interface OrderCardProps {
  order: Order;
  actionLabel: string;
  actionColor: string;
  onAction: () => void;
  isPulse?: boolean;
  confirmingId: string | null;
  setConfirmingId: (id: string | null) => void;
}

export function OrderCard({
  order,
  actionLabel,
  actionColor,
  onAction,
  isPulse = false,
  confirmingId,
  setConfirmingId
}: OrderCardProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const diffMs = Date.now() - new Date(order.createdAt).getTime();
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const totalProducts = order.items.reduce((acc, item) => acc + item.quantity, 0);

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
        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
          <div>
            <span className="text-2xl font-black text-slate-900">{order.orderNumber}</span>
            <p className="text-sm font-bold text-slate-600 mt-0.5">{order.customerName}</p>
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-extrabold text-xs border ${getTimeBadgeColor(elapsedMinutes)}`}>
            <Clock size={13} />
            <span>{elapsedMinutes} min</span>
          </div>
        </div>

        <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
          {totalProducts} {totalProducts === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
        </div>

        <div className="space-y-2.5">
          {order.items.map((item) => (
            <div key={item.id} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Utensils size={16} className="text-amber-800" />
                  {item.quantity}x {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {order.notes && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold">
            <AlertTriangle size={15} className="shrink-0 text-red-600" />
            <span>{order.notes}</span>
          </div>
        )}
      </div>

      <div className="pt-2">
        {confirmingId === order.id ? (
          <div className="flex gap-2">
            <Button 
              onClick={onAction}
              className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl"
            >
              <CheckCircle2 size={18} className="mr-1.5" /> ✔ CONFIRMAR
            </Button>
            <Button 
              onClick={() => setConfirmingId(null)}
              variant="outline"
              className="h-14 px-4 border-slate-300 text-slate-700 font-bold text-xs rounded-xl"
            >
              CANCELAR
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => setConfirmingId(order.id)}
            className={`w-full h-14 text-white font-extrabold text-sm rounded-xl shadow-md transition-all ${actionColor}`}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}