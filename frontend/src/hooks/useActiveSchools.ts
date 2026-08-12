import { useQuery } from "@tanstack/react-query";
import { getActiveSchools } from "@/services/schoolService";

export function useActiveSchools() {
  return useQuery({
    queryKey: ["schools", "active"],
    queryFn: getActiveSchools,
    staleTime: 10 * 60 * 1000,
  });
}
