import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toggleAcceptingOrders } from "@/lib/branchesApi";

export interface Branch {
  id: number;
  name: string;
  location: string | null;
  schedule: string | null;
  company_name: string;
  accepting_orders: boolean;
  min_anticipation_minutes: number;
  max_anticipation_hours: number;
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

export function useToggleAcceptingOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchId: number) => toggleAcceptingOrders(branchId),
    onSuccess: (branch) => {
      queryClient.setQueryData<Branch[]>(["branches-public"], (prev) =>
        prev?.map((b) => (b.id === branch.id ? { ...b, ...branch } : b)) ?? prev,
      );
      queryClient.invalidateQueries({ queryKey: ["branches-public"] });
      queryClient.invalidateQueries({ queryKey: ["branch", branch.id] });
    },
  });
}
