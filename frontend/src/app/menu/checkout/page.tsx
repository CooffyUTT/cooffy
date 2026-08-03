import React from "react";
import type { Metadata } from "next";
import { CheckoutView } from "@/components/menu/CheckoutView";

export const metadata: Metadata = {
  title: "Confirmar pedido | Cooffy",
  description: "Revisa y confirma tu pedido.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
