import { api } from "@/lib/api";
import type { Category, ProductList, ProductDetail } from "@/types/product";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface GetProductsParams {
  search?: string;
  ordering?: string;
  category?: number;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<PaginatedResponse<Category>>("/api/menu/categories/");
  return data.results;
}

export async function getProducts(
  params?: GetProductsParams
): Promise<ProductList[]> {
  const { data } = await api.get<PaginatedResponse<ProductList>>(
    "/api/menu/products/",
    { params }
  );
  return data.results.map((p) => ({ ...p, price: Number(p.price) }));
}

export async function getProduct(id: number): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/api/menu/products/${id}/`);
  return { ...data, price: Number(data.price) };
}
