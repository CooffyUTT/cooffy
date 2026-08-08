import React from "react";
import type { Metadata } from "next";
import { OrdersListView } from "@/components/menu/OrdersListView";

export const metadata: Metadata = {
  title: "Mis pedidos",
  description: "Consulta tus pedidos anteriores y su estado.",
};

export default function OrdersPage() {
  return <OrdersListView />;
}
