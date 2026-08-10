import React from "react";
import type { Metadata } from "next";
import { OrdersListView } from "@/components/menu/OrdersListView";

export const metadata: Metadata = {
  title: "Mis pedidos",
  description:
    "Consulta el estado y el seguimiento de tus pedidos de Cooffy en tiempo real.",
};

export default function OrdersPage() {
  return <OrdersListView />;
}
