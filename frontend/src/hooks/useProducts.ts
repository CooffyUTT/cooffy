import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";

export function useProducts(
  search?: string,
  ordering?: string,
  category?: number,
  page: number = 1
) {
  return useQuery({
    queryKey: ["products", search, ordering, category, page],
    queryFn: () => getProducts({ search, ordering, category, page }),
  });
}
