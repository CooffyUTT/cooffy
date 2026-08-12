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
  page?: number;
  branch?: number;
}

export interface PaginatedProducts {
  count: number;
  next: string | null;
  results: ProductList[];
}

type RawProduct = Omit<ProductList, "branchId" | "availableInBranches"> & {
  branch_id?: number | null;
  available_in_branches?: number[];
};

function normalizeProduct(
  raw: RawProduct
): Omit<ProductList, "branchId" | "availableInBranches"> & {
  branchId?: number;
  availableInBranches?: number[];
} {
  const availableInBranches = raw.available_in_branches ?? [];
  const branchId = raw.branch_id ?? availableInBranches[0] ?? undefined;
  const rest = { ...raw };
  delete (rest as { branch_id?: number }).branch_id;
  delete (rest as { available_in_branches?: number[] }).available_in_branches;
  return { ...rest, branchId, availableInBranches };
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<PaginatedResponse<Category>>("/api/menu/categories/");
  return data.results;
}

export async function getProducts(
  params?: GetProductsParams
): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedResponse<RawProduct>>(
    "/api/menu/products/",
    { params }
  );
  return {
    count: data.count,
    next: data.next,
    results: data.results.map((p) => ({
      ...normalizeProduct(p),
      price: Number(p.price),
    })),
  };
}

export async function getProduct(id: number): Promise<ProductDetail> {
  const { data } = await api.get<RawProduct>(`/api/menu/products/${id}/`);
  return {
    ...normalizeProduct(data),
    price: Number(data.price),
  } as ProductDetail;
}
