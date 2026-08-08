import React from "react";
import type { Metadata } from "next";
import { OrderDetailView } from "@/components/menu/OrderDetailView";

export const metadata: Metadata = {
  title: "Comprobante de pedido",
  description: "Detalle y estado de tu pedido.",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailView orderId={Number(id)} />;
}
