"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Check, Ban, Store, AlertTriangle, PackageX } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useBranches } from "@/hooks/useBranches";
import { isOutOfStockInBranch } from "@/lib/productAvailability";
import type { ProductList } from "@/types/product";
import { BaseCard, CardMedia, CardFooter } from "../layout/BaseCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductProps {
  product: ProductList;
}

export default function ProductCard({ product }: ProductProps) {
  const { tryAddToCart, canAddToCart, clearCart, setBranchId, addToCart, branchId: cartBranchId, branchName: cartBranchName } = useCart();
  const { data: branches } = useBranches();
  const [added, setAdded] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<{
    productBranchId: number;
    productBranchName: string;
  } | null>(null);

  const isOutOfStock = isOutOfStockInBranch(product, cartBranchId);
  const isAvailable = !isOutOfStock && canAddToCart(product.branchId);
  const productBranch = branches?.find((b) => b.id === product.branchId);
  const productBranchName = productBranch?.name;

  const isCrossBranch =
    !isAvailable &&
    !isOutOfStock &&
    product.branchId !== undefined &&
    product.branchId !== null;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("Producto agotado", {
        description: "Este producto no está disponible en la sucursal seleccionada.",
      });
      return;
    }

    const result = tryAddToCart(product, productBranchName);

    if (result.ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
      return;
    }

    if (result.reason === "unavailable") {
      toast.error("Producto no disponible", {
        description: "Este producto no se puede agregar al carrito.",
      });
      return;
    }

    if (result.reason === "different_branch" && productBranchName) {
      setPendingSwitch({
        productBranchId: result.productBranchId,
        productBranchName,
      });
    }
  };

  const handleConfirmSwitch = () => {
    if (!pendingSwitch) return;
    clearCart();
    setBranchId(pendingSwitch.productBranchId, pendingSwitch.productBranchName);
    addToCart(product);
    setPendingSwitch(null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const buttonLabel = isOutOfStock
    ? "Agotado"
    : isCrossBranch
      ? "Otra sucursal"
      : added
        ? "Agregado"
        : "Agregar";

  const buttonIcon = isOutOfStock ? (
    <Ban className="h-3.5 w-3.5" />
  ) : isCrossBranch ? (
    <Ban className="h-3.5 w-3.5" />
  ) : added ? (
    <Check className="h-3.5 w-3.5" />
  ) : (
    <Plus className="h-3.5 w-3.5" />
  );

  return (
    <Link href={`/menu/${product.id}`} className="block">
      <BaseCard
        className={`cursor-pointer h-full ${isOutOfStock ? "opacity-60 grayscale" : ""}`}
      >
        <CardMedia
          src={product.image ?? undefined}
          alt={product.name}
          fallbackText="Foto próximamente"
          badge={
            isOutOfStock ? (
              <span
                data-testid="out-of-stock-badge"
                className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md"
              >
                <PackageX className="h-3 w-3" />
                Agotado
              </span>
            ) : undefined
          }
        />

        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-semibold text-on-surface text-base">{product.name}</h4>
              <span className="font-bold text-primary whitespace-nowrap">
                ${product.price.toFixed(2)}
              </span>
            </div>
            {isCrossBranch && productBranchName && (
              <p className="text-[11px] text-on-surface-variant/70 flex items-center gap-1 mt-1">
                <Store className="h-3 w-3" />
                {productBranchName}
              </p>
            )}
          </div>

          <CardFooter className="pt-3">
            <span />
            <button
              onClick={handleAdd}
              disabled={isOutOfStock || (!isAvailable && !isCrossBranch)}
              aria-label={
                isOutOfStock
                  ? `${product.name} está agotado`
                  : isAvailable
                    ? `Agregar ${product.name} al carrito`
                    : `${product.name} es de otra sucursal`
              }
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                isOutOfStock
                  ? "border-rose-200 text-rose-700 bg-rose-50 cursor-not-allowed"
                  : isCrossBranch
                    ? "border-amber-500 text-amber-700 bg-amber-50 hover:bg-amber-100"
                    : !isAvailable
                      ? "border-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed"
                      : added
                        ? "border-emerald-600 text-emerald-700 bg-emerald-50"
                        : "border-primary text-primary hover:bg-primary hover:text-white"
              }`}
            >
              {buttonIcon}
              {buttonLabel}
            </button>
          </CardFooter>
        </div>
      </BaseCard>

      <Dialog
        open={pendingSwitch !== null}
        onOpenChange={(open) => !open && setPendingSwitch(null)}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <DialogTitle>Este producto es de otra sucursal</DialogTitle>
            </div>
            <DialogDescription>
              <span className="font-semibold text-on-surface">«{product.name}»</span> se vende en{" "}
              <span className="font-semibold text-on-surface">
                «{pendingSwitch?.productBranchName ?? "otra sucursal"}»
              </span>
              . Tu carrito es para{" "}
              <span className="font-semibold text-on-surface">
                «{cartBranchName ?? "otra sucursal"}»
              </span>
              . Si cambias de sucursal se vaciará el carrito actual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingSwitch(null)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSwitch}>
              Cambiar a «{pendingSwitch?.productBranchName}» y vaciar carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Link>
  );
}
