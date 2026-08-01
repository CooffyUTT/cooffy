"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, ProductFormValues } from "@/types/product";
import {
  createProduct,
  deleteProduct,
  listManageProducts,
  toggleProductActive,
  updateProduct,
} from "@/lib/productsApi";
import { ProductTable } from "./ProductTable";
import { ProductFormDialog } from "./ProductFormDialog";

export function MenuManagerView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    try {
      const data = await listManageProducts(searchTerm);
      setProducts(data.results);
    } catch {
      toast.error("No se pudo cargar el menú", {
        description: "Intenta nuevamente en unos segundos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchProducts(search);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, values);
        setProducts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        toast.success("Producto actualizado");
      } else {
        const created = await createProduct(values);
        setProducts((prev) => [created, ...prev]);
        toast.success("Producto registrado");
      }
      setIsDialogOpen(false);
    } catch (error) {
      const message =
        (error as { response?: { data?: Record<string, string[]> } })
          ?.response?.data
          ? Object.values(
              (error as { response: { data: Record<string, string[]> } })
                .response.data
            )
              .flat()
              .join(" ")
          : "Revisa los datos e intenta de nuevo.";
      toast.error("No se pudo guardar el producto", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const updated = await toggleProductActive(product.id);
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success(
        updated.active ? "Producto habilitado" : "Producto deshabilitado"
      );
    } catch {
      toast.error("No se pudo actualizar el estado del producto");
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar el producto "${product.name}"?`)) return;

    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      toast.success("Producto eliminado");
    } catch {
      toast.error("No se pudo eliminar el producto");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#5C3D2E]">Menú</h1>
          <p className="text-xs text-stone-500 mt-1">
            Administra el catálogo de productos disponible para tus clientes.
          </p>
        </div>

        <Button
          onClick={handleAddProduct}
          className="bg-[#FF8C00] hover:bg-[#e07b00] text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
        >
          <Plus size={18} />
          Agregar producto
        </Button>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex gap-2"
        style={{ width: "100%", maxWidth: "384px" }}
      >
        <Input
          className="min-w-0"
          style={{ flex: "1 1 auto", width: "100%" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
        />
        <Button type="submit" variant="outline" className="shrink-0">
          Buscar
        </Button>
      </form>

      <ProductTable
        products={products}
        isLoading={isLoading}
        onEdit={handleEditProduct}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
