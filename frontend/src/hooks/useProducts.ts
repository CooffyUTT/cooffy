import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";

export function useProducts(search?: string, ordering?: string) {
  return useQuery({
    queryKey: ["products", search, ordering],
    queryFn: () => getProducts({ search, ordering }),
  });
}
