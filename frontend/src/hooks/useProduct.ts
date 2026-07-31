import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/services/productService";

export function useProduct(id: number) {
  const query = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct(id),
    enabled: id > 0,
  });

  // Ahora sí puedes hacer los logs usando el resultado de useQuery
  console.log("Producto:", query.data);
  console.log("Loading:", query.isLoading);
  console.log("Error:", query.error);

  return query;
}