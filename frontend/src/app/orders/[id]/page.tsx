import React from "react";
import type { Metadata } from "next";
import { OrderDetailView } from "@/components/menu/OrderDetailView";

export const metadata: Metadata = {
  title: "Detalle del pedido",
  description: "Consulta el estado y los detalles de tu pedido en Cooffy.",
};

export default function OrderDetailPage() {
  return <OrderDetailView />;
}
