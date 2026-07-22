"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, 
  LayoutDashboard, 
  BookOpen, 
  History, 
  LogOut, 
  OctagonAlert, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  ShoppingBag,
  Coffee,
  Utensils,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- TIPOS DE DATOS DEL KDS ---
interface OrderItem {
  id: string;
  name: string;
  type: 'beverage' | 'food';
  quantity: number;
  modifiers?: { text: string; severity: 'danger' | 'warning' | 'info' }[];
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  serviceType: 'takeaway' | 'dine_in' | 'preorder';
  createdAt: Date;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  items: OrderItem[];
  notes?: string;
}

// --- DATOS DE PRUEBA (MOCK) ---
const INITIAL_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: '#101',
    customerName: 'Luis Alberto',
    serviceType: 'takeaway',
    createdAt: new Date(Date.now() - 12 * 60 * 1000), // Hace 12 mins (Naranja)
    status: 'pending',
    items: [
      {
        id: 'i1',
        name: 'Capuchino Vainilla',
        type: 'beverage',
        quantity: 1,
        modifiers: [
          { text: 'SIN AZÚCAR', severity: 'danger' },
          { text: 'LECHE DE ALMENDRA', severity: 'info' }
        ]
      },
      { id: 'i2', name: 'Panini de Pavo', type: 'food', quantity: 1 }
    ],
    notes: 'Alergia severa a las nueces'
  },
  {
    id: '2',
    orderNumber: '#102',
    customerName: 'Pedro',
    serviceType: 'dine_in',
    createdAt: new Date(Date.now() - 3 * 60 * 1000), // Hace 3 mins (Verde)
    status: 'pending',
    items: [
      { 
        id: 'i3', 
        name: 'Americano Frío', 
        type: 'beverage', 
        quantity: 2, 
        modifiers: [{ text: 'EXTRA CALIENTE', severity: 'warning' }] 
      }
    ]
  },
  {
    id: '3',
    orderNumber: '#104',
    customerName: 'Ana Sofia',
    serviceType: 'preorder',
    createdAt: new Date(Date.now() - 7 * 60 * 1000), // Hace 7 mins (Amarillo)
    status: 'preparing',
    items: [
      { id: 'i4', name: 'Bagel de Lomo', type: 'food', quantity: 1 },
      { id: 'i5', name: 'Frappé Mocha', type: 'beverage', quantity: 1 }
    ]
  },
  {
    id: '4',
    orderNumber: '#108',
    customerName: 'Carlos R.',
    serviceType: 'takeaway',
    createdAt: new Date(Date.now() - 18 * 60 * 1000), // Hace 18 mins (Rojo)
    status: 'ready',
    items: [
      { id: 'i6', name: 'Espresso Doble', type: 'beverage', quantity: 1 }
    ]
  }
];

export function KitchenView() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [kitchenActive, setKitchenActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Toggle Pantalla Completa (P19)
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

  // Mover estado de pedido (P4, P18)
const moveOrder = (
  orderId: string, 
  nextStatus: 'pending' | 'preparing' | 'ready' | 'delivered' | 'not_picked_up'
) => {
  if (nextStatus === 'not_picked_up') {
    // Aquí puedes disparar la petición a Supabase/API para marcar como No Recogido
  }
  
  // Removemos el pedido del tablero activo
  setOrders(prev => prev.filter(o => o.id !== orderId));
  setConfirmingId(null);
};

  return (
    <div className="flex h-screen bg-[#F4F5F7] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden">
      
      {/* BARRA LATERAL (COMPACTA) */}
      <aside className="w-56 bg-[#5C3D2E] text-white flex flex-col justify-between p-4 shrink-0 shadow-lg">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-white/10 rounded-xl">
              <UtensilsCrossed size={22} className="text-amber-300" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">Cooffy KDS</h1>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-amber-500/20 text-amber-200 font-semibold rounded-xl text-xs border border-amber-500/30">
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:bg-white/10 text-xs rounded-xl">
              <BookOpen size={16} /> Menú
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:bg-white/10 text-xs rounded-xl">
              <History size={16} /> Historial
            </button>
          </nav>
        </div>

        <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 text-xs rounded-xl">
          <LogOut size={16} className="mr-2" /> Cerrar sesión
        </Button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
        
        {/* 1. HEADER COMPACTO CON INDICADOR DE CONEXIÓN & PANTALLA COMPLETA */}
        <header className="flex items-center justify-between bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-extrabold text-[#5C3D2E]">Cocina Central</h2>
            
            {/* Indicador de Conexión (P15) */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
              isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
              <span>{isConnected ? 'En Línea (Realtime)' : 'Sin Conexión'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setKitchenActive(!kitchenActive)}
              size="sm"
              className={`font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 ${
                kitchenActive ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-700 text-white'
              }`}
            >
              <OctagonAlert size={14} />
              {kitchenActive ? 'Pausar Pedidos' : 'Reanudar'}
            </Button>

            {/* Pantalla Completa (P19) */}
            <Button 
              onClick={toggleFullscreen} 
              variant="outline" 
              size="sm" 
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          </div>
        </header>

        {/* 2. RESUMEN COMPACTO */}
        <section className="grid grid-cols-4 gap-3 shrink-0">
          <div className="bg-white px-4 py-2 rounded-xl border border-amber-200 bg-amber-50/20 flex justify-between items-center shadow-sm">
            <span className="text-xs font-bold text-amber-900">En espera</span>
            <span className="text-2xl font-black text-amber-600">{orders.filter(o => o.status === 'pending').length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/20 flex justify-between items-center shadow-sm">
            <span className="text-xs font-bold text-blue-900">En preparación</span>
            <span className="text-2xl font-black text-blue-600">{orders.filter(o => o.status === 'preparing').length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50/20 flex justify-between items-center shadow-sm">
            <span className="text-xs font-bold text-emerald-900">Listos</span>
            <span className="text-2xl font-black text-emerald-600">{orders.filter(o => o.status === 'ready').length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center shadow-sm">
            <span className="text-xs font-bold text-slate-700">Completados hoy</span>
            <span className="text-2xl font-black text-slate-800">14</span>
          </div>
        </section>

        {/* 3. TABLERO KANBAN DE 3 COLUMNAS (ALTA DEMANDA P20) */}
        <section className="flex-1 grid grid-cols-3 gap-4 min-h-0">
          
          {/* COLUMNA 1: EN ESPERA */}
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

          {/* COLUMNA 2: PREPARANDO */}
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

          {/* COLUMNA 3: LISTOS */}
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
                  isPulse={true} // P12: Pulsación para listos
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

// --- SUBCOMPONENTE COLUMNA KANBAN ---
function KanbanColumn({ title, badgeColor, dotColor, count, children }: { title: string; badgeColor: string; dotColor: string; count: number; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col min-h-0 shadow-sm">
      <div className="flex justify-between items-center pb-2.5 mb-2 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dotColor}`} />
          <h3 className="font-extrabold text-slate-800 text-sm tracking-wide">{title}</h3>
        </div>
        <span className={`px-2.5 py-0.5 text-xs font-black rounded-full border ${badgeColor}`}>{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
        {children}
      </div>
    </div>
  );
}

// --- SUBCOMPONENTE TARJETA DE PEDIDO RESTRUCTURADA ---
function OrderCard({ 
  order, 
  actionLabel, 
  actionColor, 
  onAction,
  isPulse = false,
  confirmingId,
  setConfirmingId
}: { 
  order: Order; 
  actionLabel: string; 
  actionColor: string; 
  onAction: () => void;
  isPulse?: boolean;
  confirmingId: string | null;
  setConfirmingId: (id: string | null) => void;
}) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  // Calcular tiempo transcurrido en minutos (P2)
  useEffect(() => {
    const updateTime = () => {
      const diffMs = Date.now() - new Date(order.createdAt).getTime();
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  // Colores de tiempo según antigüedad (P2)
  const getTimeBadgeColor = (mins: number) => {
    if (mins <= 5) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (mins <= 10) return 'bg-amber-100 text-amber-900 border-amber-300';
    if (mins <= 15) return 'bg-orange-100 text-orange-900 border-orange-300';
    return 'bg-red-100 text-red-900 border-red-300 animate-pulse';
  };

  // Etiqueta del tipo de pedido (P8)
  const getServiceTypeBadge = (type: Order['serviceType']) => {
    switch(type) {
      case 'takeaway': return { label: '🥤 Para llevar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'dine_in': return { label: '🍽 Consumir aquí', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'preorder': return { label: '📦 Pedido anticipado', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const service = getServiceTypeBadge(order.serviceType);
  const totalProducts = order.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl border p-4 space-y-3 bg-white shadow-sm flex flex-col justify-between ${
        isPulse ? 'ring-2 ring-emerald-400 ring-offset-2 animate-pulse' : 'border-slate-200'
      }`}
    >
      <div className="space-y-2.5">
        
        {/* ENCABEZADO DE TARJETA (P7, P9) */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900">{order.orderNumber}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${service.color}`}>
                {service.label}
              </span>
            </div>
            {/* Nombre del cliente (P7) */}
            <p className="text-sm font-bold text-slate-600 mt-0.5">{order.customerName}</p>
          </div>

          {/* CRONÓMETRO TIEMPO TRANSCURRIDO (P2, P9) */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-extrabold text-xs border ${getTimeBadgeColor(elapsedMinutes)}`}>
            <Clock size={13} />
            <span>{elapsedMinutes} min</span>
          </div>
        </div>

        {/* CONTADOR DE PRODUCTOS (P10) */}
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
          {totalProducts} {totalProducts === 1 ? 'PRODUCTO' : 'PRODUCTOS'}
        </div>

        {/* LISTA DE PRODUCTOS CON MODIFICADORES GRANDES (P1, P9, P11, P17) */}
        <div className="space-y-2.5">
          {order.items.map((item) => (
            <div key={item.id} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  {item.type === 'beverage' ? <Coffee size={16} className="text-amber-700" /> : <Utensils size={16} className="text-amber-800" />}
                  {item.quantity}x {item.name}
                </span>
              </div>

              {/* MODIFICADORES COMO BADGES GRANDES (P1) */}
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.modifiers.map((mod, idx) => (
                    <span 
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide uppercase border shadow-2xs ${
                        mod.severity === 'danger' ? 'bg-red-500 text-white border-red-600' :
                        mod.severity === 'warning' ? 'bg-amber-400 text-slate-900 border-amber-500' :
                        'bg-blue-500 text-white border-blue-600'
                      }`}
                    >
                      {mod.severity === 'danger' && '🔴 '}
                      {mod.severity === 'warning' && '🟠 '}
                      {mod.severity === 'info' && '🔵 '}
                      {mod.text}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ALERTA O NOTA DE ALERGIA (P1) */}
        {order.notes && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-bold">
            <AlertTriangle size={15} className="shrink-0 text-red-600" />
            <span>{order.notes}</span>
          </div>
        )}

      </div>

      {/* BOTONES TÁCTILES GRANDES CON CONFIRMACIÓN (P3, P14) */}
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