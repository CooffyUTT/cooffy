"use client";



import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 👈 Importamos useRouter para la redirección
import { AnimatePresence } from 'framer-motion';
import { Order } from '@/types/kitchen';
import { INITIAL_ORDERS } from '@/data/mockOrders';

import { KitchenSidebar } from './KitchenSidebar';
import { KitchenHeader } from './KitchenHeader';
import { KitchenSummary } from './KitchenSummary';
import { KanbanColumn } from './KanbanColumn';
import { OrderCard } from './OrderCard';

export function KitchenView() {
  const router = useRouter();

  // 👈 Estado para controlar si el usuario está autorizado para ver la vista
  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (typeof window === "undefined") return false; // Soporte para SSR en Next.js

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

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [kitchenActive, setKitchenActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // 👈 useEffect para verificar sesión y rol en LocalStorage
  useEffect(() => {
    if (!isAuthorized) {
      router.push("/");
    }
  }, [isAuthorized, router]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const moveOrder = (
    orderId: string, 
    nextStatus: 'pending' | 'preparing' | 'ready' | 'delivered' | 'not_picked_up'
  ) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setConfirmingId(null);
  };

  // 👈 PANTALLA DE CARGA: Oculta el contenido mientras verifica la autorización
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

  // 👈 Renderizado normal de la vista cuando el usuario está autorizado
  return (
    <div className="flex h-screen bg-[#F4F5F7] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
      <KitchenSidebar />

      <main className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        <KitchenHeader 
          isConnected={isConnected}
          kitchenActive={kitchenActive}
          isFullscreen={isFullscreen}
          onToggleActive={() => setKitchenActive(!kitchenActive)}
          onToggleFullscreen={toggleFullscreen}
        />

        <KitchenSummary orders={orders} />

        <section className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          {/* EN ESPERA */}
          <KanbanColumn 
            title="EN ESPERA" 
            badgeColor="bg-amber-100 text-amber-900 border-amber-300" 
            dotColor="bg-amber-500"
            count={orders.filter(o => o.status === 'pending').length}
          >
            <AnimatePresence>
              {orders.filter(o => o.status === 'pending').map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  confirmingId={confirmingId}
                  setConfirmingId={setConfirmingId}
                  onAction={() => moveOrder(order.id, 'preparing')}
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
            count={orders.filter(o => o.status === 'preparing').length}
          >
            <AnimatePresence>
              {orders.filter(o => o.status === 'preparing').map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  confirmingId={confirmingId}
                  setConfirmingId={setConfirmingId}
                  onAction={() => moveOrder(order.id, 'ready')}
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
            count={orders.filter(o => o.status === 'ready').length}
          >
            <AnimatePresence>
              {orders.filter(o => o.status === 'ready').map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  isPulse={true}
                  confirmingId={confirmingId}
                  setConfirmingId={setConfirmingId}
                  onAction={() => moveOrder(order.id, 'delivered')}
                  actionLabel="ENTREGADO / RECOGIDO"
                  actionColor="bg-emerald-600 hover:bg-emerald-700"
                />
              ))}
            </AnimatePresence>
          </KanbanColumn>
        </section>
      </main>
    </div>
  );
}