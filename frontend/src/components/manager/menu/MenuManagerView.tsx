"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, ProductFormValues } from "@/types/product";
import { api } from "@/lib/api";
import {
  assignProductStock,
  createProduct,
  deleteProduct,
  listManageProducts,
  removeProductStock,
  toggleProductActive,
  updateProduct,
} from "@/lib/productsApi";
import { ProductTable } from "./ProductTable";
import { ProductFormDialog } from "./ProductFormDialog";

interface ManagerBranch {
  id: number;
  name: string;
}

export function MenuManagerView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [branches, setBranches] = useState<ManagerBranch[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProducts = useCallback(async (searchTerm?: string) => {
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

  const fetchProducts = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    await loadProducts(searchTerm);
  }, [loadProducts]);

  useEffect(() => {
    // The effect starts the initial remote data load; state updates happen after the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let cancelled = false;

    api
      .get<ManagerBranch[]>("/api/branches/")
      .then(({ data }) => {
        if (!cancelled) setBranches(data);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("No se pudieron cargar las sucursales", {
            description: "No se pueden gestionar stocks por sucursal.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBranches(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

  const handleAssignStock = async (product: Product, stock?: number) => {
    if (selectedBranchId === null) return;
    try {
      const updated = await assignProductStock(product.id, selectedBranchId, stock);
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      toast.success(
        stock === 0
          ? "Producto marcado como agotado en la sucursal"
          : "Producto asignado a la sucursal"
      );
    } catch {
      toast.error("No se pudo actualizar el stock del producto");
    }
  };

  const handleRemoveStock = async (product: Product) => {
    if (selectedBranchId === null) return;
    try {
      await removeProductStock(product.id, selectedBranchId);
      const branchStocks = { ...(product.branchStocks ?? {}) };
      delete branchStocks[selectedBranchId];
      const updated: Product = { ...product, branchStocks };
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      toast.success("Producto desasignado de la sucursal");
    } catch {
      toast.error("No se pudo desasignar el producto");
    }
  };

  const handleToggleStock = async (product: Product, markAsOutOfStock: boolean) => {
    await handleAssignStock(product, markAsOutOfStock ? 0 : 1);
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

      <div className="flex flex-col sm:flex-row gap-3">
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

        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-stone-500" />
          <select
            value={selectedBranchId ?? ""}
            onChange={(e) =>
              setSelectedBranchId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={isLoadingBranches}
            data-testid="branch-select"
            className="text-sm bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 min-w-[220px]"
          >
            <option value="">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          {selectedBranchId !== null && (
            <p className="text-xs text-stone-500 max-w-[220px] hidden sm:block">
              Marca qué productos pertenecen a esta sucursal y si están agotados.
            </p>
          )}
        </div>
      </div>

      <ProductTable
        products={products}
        isLoading={isLoading}
        branchId={selectedBranchId}
        onEdit={handleEditProduct}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onAssignStock={handleAssignStock}
        onRemoveStock={handleRemoveStock}
        onToggleStock={handleToggleStock}
      />

      <ProductFormDialog
        key={`${isDialogOpen ? "open" : "closed"}-${editingProduct?.id ?? "new"}`}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={editingProduct}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
