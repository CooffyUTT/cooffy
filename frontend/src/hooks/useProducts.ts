import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";

export function useProducts(search?: string, ordering?: string, category?: number) {
  return useQuery({
    queryKey: ["products", search, ordering, category],
    queryFn: () => getProducts({ search, ordering, category }),
  });
}
