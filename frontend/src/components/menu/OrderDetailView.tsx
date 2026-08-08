"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { OrderReceipt } from "./OrderReceipt";
import Header from "./Header";

interface OrderDetailViewProps {
  orderId: number;
}

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const { data: order, isLoading, error } = useOrder(orderId);

  if (isLoading) {
    return (
      <>
        <Header showSearch={false} />
        <main className="w-full pt-20 md:pt-28 pb-24 px-4 max-w-128 mx-auto flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-on-surface-variant" />
        </main>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header showSearch={false} />
        <main className="w-full pt-20 md:pt-28 pb-24 px-4 max-w-128 mx-auto text-center">
          <p className="text-on-surface-variant">No se pudo encontrar este pedido.</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showSearch={false} />
      <OrderReceipt order={order} />
    </>
  );
}
