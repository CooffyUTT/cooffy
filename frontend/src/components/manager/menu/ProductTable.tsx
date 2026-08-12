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
import { Product } from "@/types/product";
import { formatCurrency } from "@/utils/formatters";

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
}

export function ProductTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  onToggleActive,
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

  return (
    <div className="rounded-xl border border-outline-variant/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Límite por pedido</TableHead>
            <TableHead>Estado</TableHead>
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
