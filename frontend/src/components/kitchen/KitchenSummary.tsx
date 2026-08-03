"use client";

import React from 'react';
import { KitchenOrder } from '@/types/kitchen';

interface KitchenSummaryProps {
  orders: KitchenOrder[];
}

export function KitchenSummary({ orders }: KitchenSummaryProps) {
  return (
    <section className="grid grid-cols-4 gap-3 shrink-0">
      <div className="bg-white px-4 py-2 rounded-xl border border-amber-200 bg-amber-50/20 flex justify-between items-center shadow-xs">
        <span className="text-xs font-bold text-amber-900">En espera</span>
        <span className="text-2xl font-black text-amber-600">{orders.filter(o => o.state === 'pending').length}</span>
      </div>
      <div className="bg-white px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/20 flex justify-between items-center shadow-xs">
        <span className="text-xs font-bold text-blue-900">En preparación</span>
        <span className="text-2xl font-black text-blue-600">{orders.filter(o => o.state === 'preparing').length}</span>
      </div>
      <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50/20 flex justify-between items-center shadow-xs">
        <span className="text-xs font-bold text-emerald-900">Listos</span>
        <span className="text-2xl font-black text-emerald-600">{orders.filter(o => o.state === 'ready').length}</span>
      </div>
      <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center shadow-xs">
        <span className="text-xs font-bold text-slate-700">Completados hoy</span>
        <span className="text-2xl font-black text-slate-800">{orders.filter(o => o.state === 'picked_up').length}</span>
      </div>
    </section>
  );
}
