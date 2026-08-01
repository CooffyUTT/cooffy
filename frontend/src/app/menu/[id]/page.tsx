import React from "react";
import type { Metadata } from "next";
import { ProductDetailView } from "@/components/menu/ProductDetailView";

export const metadata: Metadata = {
  title: "Detalle del producto",
  description: "Información detallada del producto.",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailView productId={Number(id)} />;
}
