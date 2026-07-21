import React from "react";
import type { Metadata } from "next";
import { MenuView } from "@/components/menu/MenuView";

// Igual que en login/register: al usar "use client" dentro de MenuView,
// separamos la página en dos partes para poder darle metadata al navegador.
export const metadata: Metadata = {
  title: "Menú",
  description: "Explora el menú de Cooffy y arma tu pedido.",
};

export default function MenuPage() {
  return <MenuView />;
}
