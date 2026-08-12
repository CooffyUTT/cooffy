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
  return data;
}

export async function createProduct(
  values: ProductFormValues
): Promise<Product> {
  const { data } = await api.post<Product>(BASE_URL, buildFormData(values), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
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
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`${BASE_URL}${id}/`);
}

export async function toggleProductActive(id: number): Promise<Product> {
  const { data } = await api.patch<Product>(
    `${BASE_URL}${id}/toggle-active/`
  );
  return data;
}
