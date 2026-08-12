"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { OctagonAlert, CalendarClock, Inbox } from 'lucide-react';
import { KitchenOrder } from '@/types/kitchen';
import type { Order, OrderState } from '@/types/order';
import { ORDER_STATE_BADGE_CLASSES } from '@/lib/orderUi';
import { ORDER_STATE_LABELS } from '@/types/order';

import { KitchenSidebar } from './KitchenSidebar';
import { KitchenHeader } from './KitchenHeader';
import { KitchenSummary } from './KitchenSummary';
import { KanbanColumn } from './KanbanColumn';
import { OrderCard } from './OrderCard';
import {
  useOrders,
  useUpcomingOrders,
  useUpdateOrderState,
  useUpdatePaymentStatus,
} from '@/hooks/useOrders';
import { useBranches, useToggleAcceptingOrders } from '@/hooks/useBranches';

type KitchenTab = 'queue' | 'upcoming';

function formatPickupDateTime(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function PreOrderRow({ order }: { order: Order }) {
  const products = order.order_products ?? [];
  const itemsSummary = products.length
    ? products
        .map((p) => `${p.quantity} x ${p.product_name}`)
        .join(', ')
    : 'Sin productos';

  return (
    <article
      data-testid="kitchen-preorder-row"
      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2">
        <div>
          <p className="text-sm font-bold text-slate-600">#{order.order_number}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <CalendarClock className="h-3.5 w-3.5" />
            <span data-testid="preorder-pickup-time">
              {order.scheduled_pickup_at
                ? formatPickupDateTime(order.scheduled_pickup_at)
                : '—'}
            </span>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${ORDER_STATE_BADGE_CLASSES[order.state]}`}>
          {ORDER_STATE_LABELS[order.state]}
        </div>
      </div>

      <div>
        <p
          className="text-base font-bold text-slate-900"
          data-testid="preorder-client-name"
        >
          {order.client_name ?? "Cliente"}
        </p>
        <p className="text-sm text-slate-600 mt-1" data-testid="preorder-products">
          {itemsSummary}
        </p>
      </div>
    </article>
  );
}

interface StoredUser {
  groups?: string[];
  branch_id?: number | null;
}

function readStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('userData');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function KitchenView() {
  const router = useRouter();
  const updateState = useUpdateOrderState();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const toggleAccepting = useToggleAcceptingOrders();

  const [{ isAuthorized, branchId }] = useState(() => {
    const user = readStoredUser();
    const groups: string[] = user?.groups ?? [];
    const authorized =
      groups.includes('empleado') || groups.includes('gerente');
    return { isAuthorized: authorized, branchId: user?.branch_id ?? null };
  });

  const { data: branches, isLoading: branchesLoading } = useBranches();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<KitchenTab>('queue');

  const {
    data: upcomingOrders = [],
    isLoading: upcomingLoading,
    isError: upcomingError,
  } = useUpcomingOrders(15_000, { enabled: activeTab === "upcoming" });

  const currentBranch = useMemo(
    () => branches?.find((b) => b.id === branchId) ?? null,
    [branches, branchId],
  );

  const kitchenActive = currentBranch?.accepting_orders ?? false;

  const { data: pendingOrders = [], isError: pendingError } = useOrders(
    'pending',
    5000,
  );
  const { data: preparingOrders = [], isError: preparingError } = useOrders(
    'preparing',
    10000,
  );
  const { data: readyOrders = [], isError: readyError } = useOrders(
    'ready',
    10000,
  );
  const { data: pickedUpOrders = [], isError: pickedUpError } = useOrders(
    'picked_up',
    30000,
  );

  const allOrders: KitchenOrder[] = [
    ...(pendingOrders as unknown as KitchenOrder[]),
    ...(preparingOrders as unknown as KitchenOrder[]),
    ...(readyOrders as unknown as KitchenOrder[]),
    ...(pickedUpOrders as unknown as KitchenOrder[]),
  ];
  const hasError = pendingError || preparingError || readyError || pickedUpError;

  useEffect(() => {
    if (!isAuthorized) {
      router.push('/');
    }
  }, [isAuthorized, router]);

  const moveOrder = (orderId: number, nextState: OrderState) => {
    updateState.mutate(
      { orderId, state: nextState },
      {
        onSuccess: () => setConfirmingId(null),
      },
    );
  };

  const handleConfirmPayment = (orderId: number) => {
    updatePaymentStatus.mutate(
      { orderId, status: 'paid' },
      {
        onSuccess: () => {
          setConfirmingId(null);
          toast.success('Pago confirmado', {
            description: 'El pedido quedó marcado como pagado.',
          });
        },
        onError: () => {
          toast.error('No se pudo confirmar el pago', {
            description: 'Intenta nuevamente en unos segundos.',
          });
        },
      },
    );
  };

  const isPaymentPending = (order: KitchenOrder) =>
    order.payment_status === 'pending' && order.payment_method === 1;

  const handleToggleActive = () => {
    if (!branchId) {
      toast.error('No se puede cambiar el estado', {
        description: 'No se encontró la sucursal asociada a tu usuario.',
      });
      return;
    }
    toggleAccepting.mutate(branchId, {
      onSuccess: (branch) => {
        toast.success(
          branch.accepting_orders
            ? 'Recepción de pedidos reanudada'
            : 'Recepción de pedidos suspendida',
          {
            description: branch.accepting_orders
              ? 'Los clientes pueden registrar nuevos pedidos.'
              : 'No se registrarán nuevos pedidos hasta que reanudes la recepción.',
          },
        );
      },
      onError: () => {
        toast.error('No se pudo cambiar el estado de la sucursal', {
          description: 'Intenta nuevamente en unos segundos.',
        });
      },
    });
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
          isPending={toggleAccepting.isPending}
          onToggleActive={handleToggleActive}
          branchName={currentBranch?.name}
        />

        {!branchesLoading && !kitchenActive && (
          <div
            data-testid="kitchen-suspended-banner"
            className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 shrink-0"
            role="status"
          >
            <OctagonAlert className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
            <div className="text-xs text-red-800">
              <p className="font-bold">Recepción de pedidos suspendida</p>
              <p className="text-red-700">
                Esta sucursal no aceptará nuevos pedidos hasta que se reanude la
                recepción.
              </p>
            </div>
          </div>
        )}

        {hasError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs font-bold text-red-800 shrink-0">
            No se pudieron cargar los pedidos. Reintentando automáticamente...
          </div>
        )}

        <KitchenSummary orders={allOrders} />

        <div className="flex items-center gap-2 shrink-0" role="tablist" aria-label="Pestañas de cocina">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'queue'}
            data-testid="kitchen-tab-queue"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide border transition-all ${
              activeTab === 'queue'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            COLA
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'upcoming'}
            data-testid="kitchen-tab-upcoming"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide border transition-all flex items-center gap-1.5 ${
              activeTab === 'upcoming'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <CalendarClock size={14} />
            PEDIDOS ANTICIPADOS
          </button>
        </div>

        {activeTab === 'queue' && (
          <section className="flex-1 grid grid-cols-3 gap-4 min-h-0">
            {/* EN ESPERA */}
            <KanbanColumn
              title="EN ESPERA"
              badgeColor="bg-amber-100 text-amber-900 border-amber-300"
              dotColor="bg-amber-500"
              count={pendingOrders.length}
            >
              <AnimatePresence>
                {(pendingOrders as unknown as KitchenOrder[]).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    confirmingId={confirmingId}
                    setConfirmingId={setConfirmingId}
                    onAction={() => moveOrder(order.id, 'preparing')}
                    actionLabel="INICIAR PREPARACIÓN"
                    actionColor="bg-amber-500 hover:bg-amber-600"
                    secondaryActionLabel="RECHAZAR"
                    secondaryActionColor="bg-red-500 hover:bg-red-600"
                    onSecondaryAction={() => moveOrder(order.id, 'rejected')}
                    paymentPending={isPaymentPending(order)}
                    onConfirmPayment={() => handleConfirmPayment(order.id)}
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
                {(preparingOrders as unknown as KitchenOrder[]).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    confirmingId={confirmingId}
                    setConfirmingId={setConfirmingId}
                    onAction={() => moveOrder(order.id, 'ready')}
                    actionLabel="MARCAR COMO LISTO"
                    actionColor="bg-blue-600 hover:bg-blue-700"
                    paymentPending={isPaymentPending(order)}
                    onConfirmPayment={() => handleConfirmPayment(order.id)}
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
                {(readyOrders as unknown as KitchenOrder[]).map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isPulse={true}
                    confirmingId={confirmingId}
                    setConfirmingId={setConfirmingId}
                    onAction={() => moveOrder(order.id, 'picked_up')}
                    actionLabel="ENTREGADO / RECOGIDO"
                    actionColor="bg-emerald-600 hover:bg-emerald-700"
                    paymentPending={isPaymentPending(order)}
                    onConfirmPayment={() => handleConfirmPayment(order.id)}
                  />
                ))}
              </AnimatePresence>
            </KanbanColumn>
          </section>
        )}

        {activeTab === 'upcoming' && (
          <section
            className="flex-1 min-h-0 overflow-y-auto bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
            data-testid="kitchen-upcoming-panel"
          >
            {upcomingError && (
              <div
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-800"
                role="alert"
              >
                <OctagonAlert className="h-4 w-4 mt-0.5 text-red-600 shrink-0" />
                <p className="font-semibold">
                  No se pudieron cargar los pedidos anticipados. Reintentando automáticamente...
                </p>
              </div>
            )}
            {upcomingLoading && upcomingOrders.length === 0 ? (
              <div className="space-y-3" data-testid="kitchen-upcoming-loading">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2"
                  >
                    <div className="h-4 w-1/3 bg-slate-200 rounded" />
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            ) : upcomingOrders.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-center text-slate-500"
                data-testid="kitchen-upcoming-empty"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                  <Inbox className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-base font-bold text-slate-700">
                  Sin pedidos anticipados pendientes
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Cuando un cliente agende una recogida aparecerá aquí hasta que la
                  cola de cocina lo reciba.
                </p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="kitchen-upcoming-list">
                {upcomingOrders.map((order) => (
                  <PreOrderRow key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
