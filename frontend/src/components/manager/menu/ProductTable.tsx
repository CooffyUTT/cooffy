"use client";

import React from "react";
import { Pencil, Trash2, Power, PowerOff, ImageOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/formatters";

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  branchId?: number | null;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  onAssignStock: (product: Product, stock?: number) => void;
  onRemoveStock: (product: Product) => void;
  onToggleStock: (product: Product, markAsOutOfStock: boolean) => void;
}

export function ProductTable({
  products,
  isLoading,
  branchId = null,
  onEdit,
  onDelete,
  onToggleActive,
  onAssignStock,
  onRemoveStock,
  onToggleStock,
}: ProductTableProps) {
  if (isLoading) {
    return (
      <p className="text-sm text-on-surface-variant text-center py-10">
        Cargando productos...
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant text-center py-10">
        Todavía no hay productos registrados en el menú.
      </p>
    );
  }

  const isStockAssigned = (product: Product) =>
    branchId !== null && product.branchStocks?.[branchId] !== undefined;

  const isOutOfStock = (product: Product) =>
    branchId !== null && product.branchStocks?.[branchId] === 0;

  return (
    <div className="rounded-xl border border-outline-variant/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Límite por pedido</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>En sucursal</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="h-4 w-4 text-on-surface-variant/60" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-on-surface truncate">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-xs text-on-surface-variant truncate max-w-[220px]">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatCurrency(Number(product.price))}</TableCell>
              <TableCell>{product.max_per_order ?? "Sin límite"}</TableCell>
              <TableCell>
                <Badge variant={product.active ? "default" : "secondary"}>
                  {product.active ? "Habilitado" : "Deshabilitado"}
                </Badge>
              </TableCell>
              <TableCell>
                {branchId === null ? (
                  <span className="text-xs text-on-surface-variant/70">
                    — 
                  </span>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-xs text-on-surface">
                      <Switch
                        checked={isStockAssigned(product)}
                        onCheckedChange={(checked) =>
                          checked
                            ? onAssignStock(product)
                            : onRemoveStock(product)
                        }
                        aria-label={`Asignar ${product.name} a la sucursal`}
                      />
                      Asignado
                    </label>
                    {isStockAssigned(product) && (
                      <label className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <Switch
                          size="sm"
                          checked={isOutOfStock(product)}
                          onCheckedChange={(checked) =>
                            onToggleStock(product, checked)
                          }
                          aria-label={`Marcar ${product.name} como agotado`}
                        />
                        {isOutOfStock(product) ? "Agotado" : "Disponible"}
                      </label>
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Editar ${product.name}`}
                    onClick={() => onEdit(product)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                      product.active
                        ? `Deshabilitar ${product.name}`
                        : `Habilitar ${product.name}`
                    }
                    onClick={() => onToggleActive(product)}
                  >
                    {product.active ? (
                      <PowerOff className="h-3.5 w-3.5" />
                    ) : (
                      <Power className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Eliminar ${product.name}`}
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-error" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
