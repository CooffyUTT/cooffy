"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product, ProductFormValues } from "@/types/product";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  isSubmitting?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
}

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  price: "",
  description: "",
  max_per_order: "",
  image: null,
};

function getInitialValues(product: Product | null): ProductFormValues {
  if (!product) return EMPTY_VALUES;

  return {
    name: product.name,
    price: product.price,
    description: product.description ?? "",
    max_per_order:
      product.max_per_order !== null ? String(product.max_per_order) : "",
    image: null,
  };
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  isSubmitting,
  onSubmit,
}: ProductFormDialogProps) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    getInitialValues(product),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      nextErrors.name = "El nombre del producto es obligatorio.";
    }

    const priceNumber = Number(values.price);
    if (!values.price || Number.isNaN(priceNumber) || priceNumber <= 0) {
      nextErrors.price = "El precio debe ser un número mayor a 0.";
    }

    if (values.max_per_order) {
      const limitNumber = Number(values.max_per_order);
      if (Number.isNaN(limitNumber) || limitNumber <= 0) {
        nextErrors.max_per_order = "El límite por pedido debe ser mayor a 0.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {product ? "Editar producto" : "Registrar producto"}
            </DialogTitle>
            <DialogDescription>
              {product
                ? "Modifica la información visible en el menú de la sucursal."
                : "Agrega un nuevo producto al catálogo del menú."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="product-name">Nombre</Label>
            <Input
              id="product-name"
              value={values.name}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ej. Chilaquiles verdes"
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-description">Descripción</Label>
            <Input
              id="product-description"
              value={values.description}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Descripción breve del platillo"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Precio (MXN)</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={values.price}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="45.00"
              />
              {errors.price && (
                <p className="text-xs font-medium text-destructive">
                  {errors.price}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="product-max-per-order">
                Límite por pedido
              </Label>
              <Input
                id="product-max-per-order"
                type="number"
                min="1"
                value={values.max_per_order}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    max_per_order: e.target.value,
                  }))
                }
                placeholder="Sin límite"
              />
              {errors.max_per_order && (
                <p className="text-xs font-medium text-destructive">
                  {errors.max_per_order}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="product-image">Fotografía</Label>
            <Input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  image: e.target.files?.[0] ?? null,
                }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : product
                ? "Guardar cambios"
                : "Registrar producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
