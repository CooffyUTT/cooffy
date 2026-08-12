import type { ProductList } from "@/types/product";

export function isOutOfStockInBranch(
  product: Pick<ProductList, "availableInBranches">,
  branchId: number | null,
): boolean {
  if (branchId === null) return false;
  if (product.availableInBranches === undefined || product.availableInBranches === null) {
    return false;
  }
  return !product.availableInBranches.includes(branchId);
}
