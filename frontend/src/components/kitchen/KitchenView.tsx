"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useKitchenOrders, useUpdateOrderState } from "@/hooks/useOrders";
import { useBranches } from "@/hooks/useBranches";
import type { Order as ApiOrder, OrderState } from "@/types/order";

import { KitchenSidebar } from "./KitchenSidebar";
import { KitchenHeader } from "./KitchenHeader";
import { KitchenSummary } from "./KitchenSummary";
import { KanbanColumn } from "./KanbanColumn";
import { OrderCard } from "./OrderCard";
import { HandoffDialog } from "./HandoffDialog";

interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  serviceType: "takeaway" | "dine_in" | "preorder";
  createdAt: Date;
  status: "pending" | "preparing" | "ready" | "picked_up" | "rejected";
  total: number;
  paymentMethod: "cash" | "card";
  items: { id: string; name: string; type: "beverage" | "food"; quantity: number; unitPrice: number }[];
  notes?: string;
}

function mapApiOrderToKitchenOrder(order: ApiOrder): KitchenOrder {
  return {
    id: String(order.id),
    orderNumber: String(order.order_number),
    customerName: `Cliente #${order.client_id}`,
    serviceType: "preorder",
    createdAt: new Date(order.created_at),
    status: order.state as KitchenOrder["status"],
    total: Number(order.total),
    paymentMethod: order.payment_method,
    items: (order.order_products ?? []).map((p) => ({
      id: String(p.item_id),
      name: p.product_name,
      type: "food" as const,
      quantity: p.quantity,
      unitPrice: Number(p.price) / p.quantity,
    })),
    notes: order.comment || undefined,
  };
}

function mapKitchenStatusToApiState(
  status: KitchenOrder["status"],
): OrderState {
  const map: Record<KitchenOrder["status"], OrderState> = {
    pending: "pending",
    preparing: "preparing",
    ready: "ready",
    picked_up: "picked_up",
    rejected: "rejected",
  };
  return map[status];
}

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

  const userBranchId = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) return undefined;
    try {
      const userData = JSON.parse(userDataStr);
      return userData.branch_id ?? undefined;
    } catch {
      return undefined;
    }
  }, []);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [handoffOrder, setHandoffOrder] = useState<KitchenOrder | null>(null);

  const { data: pendingOrders } = useKitchenOrders("pending", userBranchId);
  const { data: preparingOrders } = useKitchenOrders("preparing", userBranchId);
  const { data: readyOrders } = useKitchenOrders("ready", userBranchId);
  const { data: branches } = useBranches();

  const branchName = useMemo(() => {
    if (!userBranchId || !branches) return undefined;
    return branches.find((b) => b.id === userBranchId)?.name;
  }, [userBranchId, branches]);

  const mappedPending = (pendingOrders ?? []).map(mapApiOrderToKitchenOrder);
  const mappedPreparing = (preparingOrders ?? []).map(mapApiOrderToKitchenOrder);
  const mappedReady = (readyOrders ?? []).map(mapApiOrderToKitchenOrder);
  const allOrders = [...mappedPending, ...mappedPreparing, ...mappedReady];

  const moveOrder = async (orderId: string, nextStatus: KitchenOrder["status"]) => {
    const apiState = mapKitchenStatusToApiState(nextStatus);
    await updateState.mutateAsync({ orderId: Number(orderId), state: apiState });
    setConfirmingId(null);
  };

  const handleHandoffConfirm = async () => {
    if (!handoffOrder) return;
    await moveOrder(handoffOrder.id, "picked_up");
    setHandoffOrder(null);
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
          isConnected={isConnected}
          isFullscreen={isFullscreen}
          branchName={branchName}
          onToggleFullscreen={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
              setIsFullscreen(true);
            } else {
              document.exitFullscreen?.().catch(() => {});
              setIsFullscreen(false);
            }
          }}
        />

        <KitchenSummary orders={allOrders} />

        <section className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          <KanbanColumn
            title="EN ESPERA"
            badgeColor="bg-amber-100 text-amber-900 border-amber-300"
            dotColor="bg-amber-500"
            count={mappedPending.length}
          >
            <AnimatePresence>
              {mappedPending.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  confirmingId={confirmingId}
                  setConfirmingId={setConfirmingId}
                  onAction={() => moveOrder(order.id, "preparing")}
                  actionLabel="INICIAR PREPARACION"
                  actionColor="bg-amber-500 hover:bg-amber-600"
                />
              ))}
            </AnimatePresence>
          </KanbanColumn>

          <KanbanColumn
            title="EN PREPARACION"
            badgeColor="bg-blue-100 text-blue-900 border-blue-300"
            dotColor="bg-blue-500"
            count={mappedPreparing.length}
          >
            <AnimatePresence>
              {mappedPreparing.map((order) => (
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

          <KanbanColumn
            title="LISTOS PARA ENTREGA"
            badgeColor="bg-emerald-100 text-emerald-900 border-emerald-300"
            dotColor="bg-emerald-500"
            count={mappedReady.length}
          >
            <AnimatePresence>
              {mappedReady.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isPulse={true}
                  confirmingId={confirmingId}
                  setConfirmingId={setConfirmingId}
                  onAction={() => setHandoffOrder(order)}
                  actionLabel="ENTREGAR AL CLIENTE"
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

      <HandoffDialog
        order={handoffOrder}
        onConfirm={handleHandoffConfirm}
        onCancel={() => setHandoffOrder(null)}
        isPending={updateState.isPending}
      />
    </div>
  );
}
