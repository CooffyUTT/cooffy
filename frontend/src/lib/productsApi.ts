/**
 * @fileproductsApi.ts
 * @description Cliente HTTP para el panel de administración del menú
 */

import { api } from "./api";
import type {
  PaginatedResponse,
  Product,
  ProductFormValues,
} from "@/types/product";

const BASE_URL = "/api/menu/manage/products/";

type RawProduct = Product & { branch_stocks?: Record<string, number> };

function normalizeProduct(raw: RawProduct): Product {
  const branchStocks: Record<number, number> = {};
  for (const [key, stock] of Object.entries(raw.branch_stocks ?? {})) {
    const branchId = Number(key);
    if (Number.isInteger(branchId)) branchStocks[branchId] = stock;
  }
  const rest = { ...raw };
  delete rest.branch_stocks;
  return { ...rest, branchStocks };
}

function buildFormData(values: Partial<ProductFormValues>): FormData {
  const formData = new FormData();

  if (values.name !== undefined) formData.append("name", values.name);
  if (values.price !== undefined) formData.append("price", values.price);
  if (values.description !== undefined) {
    formData.append("description", values.description ?? "");
  }
  if (values.max_per_order !== undefined) {
    formData.append("max_per_order", values.max_per_order ?? "");
  }
  if (values.image) formData.append("image", values.image);

  return formData;
}

export async function listManageProducts(
  search?: string
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>(BASE_URL, {
    params: search ? { search } : undefined,
  });
  return { ...data, results: data.results.map(normalizeProduct) };
}

export async function createProduct(
  values: ProductFormValues
): Promise<Product> {
  const { data } = await api.post<Product>(BASE_URL, buildFormData(values), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeProduct(data);
}

export async function updateProduct(
  id: number,
  values: Partial<ProductFormValues>
): Promise<Product> {
  const { data } = await api.patch<Product>(
    `${BASE_URL}${id}/`,
    buildFormData(values),
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return normalizeProduct(data);
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`${BASE_URL}${id}/`);
}

export async function toggleProductActive(id: number): Promise<Product> {
  const { data } = await api.patch<Product>(
    `${BASE_URL}${id}/toggle-active/`
  );
  return normalizeProduct(data);
}

export async function assignProductStock(
  id: number,
  branchId: number,
  stock?: number
): Promise<Product> {
  const { data } = await api.post<Product>(`${BASE_URL}${id}/stocks/`, {
    branch_id: branchId,
    ...(stock !== undefined ? { stock } : {}),
  });
  return normalizeProduct(data);
}

export async function removeProductStock(
  id: number,
  branchId: number
): Promise<void> {
  await api.delete(`${BASE_URL}${id}/stocks/`, {
    params: { branch_id: branchId },
  });
}
