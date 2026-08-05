"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { KitchenOrder } from '@/types/kitchen';
import type { OrderState } from '@/types/order';

import { KitchenSidebar } from './KitchenSidebar';
import { KitchenHeader } from './KitchenHeader';
import { KitchenSummary } from './KitchenSummary';
import { KanbanColumn } from './KanbanColumn';
import { OrderCard } from './OrderCard';
import { useOrders, useUpdateOrderState } from '@/hooks/useOrders';


export function KitchenView() {
  const router = useRouter();
  const updateState = useUpdateOrderState();

  const [isAuthorized] = useState(() => {
    if (typeof window === "undefined") return false;
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) return false;
    try {
      const userData = JSON.parse(userDataStr);
      const groups: string[] = userData.groups || [];
      return groups.includes("empleado") || groups.includes("gerente");
    } catch {
      return false;
    }
  });

  const [kitchenActive, setKitchenActive] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const { data: pendingOrders = [], isError: pendingError } = useOrders('pending', 5000);
  const { data: preparingOrders = [], isError: preparingError } = useOrders('preparing', 10000);
  const { data: readyOrders = [], isError: readyError } = useOrders('ready', 10000);
  const { data: pickedUpOrders = [], isError: pickedUpError } = useOrders('picked_up', 30000);

  const allOrders: KitchenOrder[] = [
    ...(pendingOrders as unknown as KitchenOrder[]),
    ...(preparingOrders as unknown as KitchenOrder[]),
    ...(readyOrders as unknown as KitchenOrder[]),
    ...(pickedUpOrders as unknown as KitchenOrder[]),
  ];
  const hasError = pendingError || preparingError || readyError || pickedUpError;

  useEffect(() => {
    if (!isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, router]);

  const moveOrder = (orderId: number, nextState: OrderState) => {
    updateState.mutate(
      { orderId, state: nextState },
      {
        onSuccess: () => setConfirmingId(null),
      }
    );
  };

  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F4F5F7] font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-600">
            Verificando permisos de Cocina...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F4F5F7] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
      <KitchenSidebar />

      <main className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        <KitchenHeader
          kitchenActive={kitchenActive}
          onToggleActive={() => setKitchenActive(!kitchenActive)}
        />

        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs font-bold text-red-800 shrink-0">
            No se pudieron cargar los pedidos. Reintentando automáticamente...
          </div>
        )}

        <KitchenSummary orders={allOrders} />

        <section className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {/* EN ESPERA */}
          <KanbanColumn
            title="EN ESPERA"
            badgeColor="bg-amber-100 text-amber-900 border-amber-300"
            dotColor="bg-amber-500"
            count={pendingOrders.length}
          >
            <AnimatePresence>
              {(pendingOrders as unknown as KitchenOrder[]).map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  confirmingId={confirmingId}
                  setConfirmingId={setConfirmingId}
                  onAction={() => moveOrder(order.id, "preparing")}
                  actionLabel="INICIAR PREPARACIÓN"
                  actionColor="bg-amber-500 hover:bg-amber-600"
                />
              ))}
            </AnimatePresence>
          </KanbanColumn>

          {/* EN PREPARACIÓN */}
          <KanbanColumn
            title="EN PREPARACIÓN"
            badgeColor="bg-blue-100 text-blue-900 border-blue-300"
            dotColor="bg-blue-500"
            count={preparingOrders.length}
          >
            <AnimatePresence>
              {(preparingOrders as unknown as KitchenOrder[]).map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  confirmingId={confirmingId}
                  setConfirmingId={setConfirmingId}
                  onAction={() => moveOrder(order.id, "ready")}
                  actionLabel="MARCAR COMO LISTO"
                  actionColor="bg-blue-600 hover:bg-blue-700"
                />
              ))}
            </AnimatePresence>
          </KanbanColumn>

          {/* LISTOS PARA ENTREGA */}
          <KanbanColumn
            title="LISTOS PARA ENTREGA"
            badgeColor="bg-emerald-100 text-emerald-900 border-emerald-300"
            dotColor="bg-emerald-500"
            count={readyOrders.length}
          >
            <AnimatePresence>
              {(readyOrders as unknown as KitchenOrder[]).map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isPulse={true}
                  confirmingId={confirmingId}
                  setConfirmingId={setConfirmingId}
                  onAction={() => moveOrder(order.id, "picked_up")}
                  actionLabel="ENTREGADO / RECOGIDO"
                  actionColor="bg-emerald-600 hover:bg-emerald-700"
                  secondaryActionLabel="NO RECOGIDO"
                  secondaryActionColor="bg-red-500 hover:bg-red-600"
                  onSecondaryAction={() => moveOrder(order.id, "rejected")}
                />
              ))}
            </AnimatePresence>
          </KanbanColumn>
        </section>
      </main>
    </div>
  );
}