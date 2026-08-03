import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Branch {
  id: number;
  name: string;
  location: string | null;
  schedule: string | null;
  company_name: string;
}

interface PaginatedBranches {
  count: number;
  next: string | null;
  previous: string | null;
  results: Branch[];
}

export function useBranches() {
  return useQuery({
    queryKey: ["branches-public"],
    queryFn: async () => {
      const response = await api.get<PaginatedBranches>("/api/branches/public/");
      return response.data.results;
    },
    staleTime: 5 * 60 * 1000,
  });
}
