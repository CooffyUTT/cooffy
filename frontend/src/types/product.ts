/**
 * @fileproduct.ts
 * @description Tipos usados por el panel de administración del menú
 * del backend (apps/products/serializers.py).
 */

export interface Product {
  id: number;
  name: string;
  price: string;
  active: boolean;
  max_per_order: number | null;
  image: string | null;
  description: string | null;
  modifiers: string[] | null;
  created_at: string;
  updated_at: string;
}

/** Valores del formulario de creación/edición de producto. */
export interface ProductFormValues {
  name: string;
  price: string;
  description: string;
  max_per_order: string;
  image: File | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductList {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: Category | null;
  branchId?: number;
  availableInBranches?: number[];
}

export interface ProductDetail extends ProductList {
  description: string;
  modifiers: string[] | null;
}
