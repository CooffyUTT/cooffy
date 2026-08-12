/**
 * @file branchesApi.ts
 * @description Cliente HTTP para operaciones sobre sucursales (RF-07).
 */

import { api } from "./api";

export interface BranchSimple {
  id: number;
  name: string;
  accepting_orders: boolean;
}

export async function toggleAcceptingOrders(
  branchId: number,
): Promise<BranchSimple> {
  const { data } = await api.post<BranchSimple>(
    `/api/branches/${branchId}/toggle-accepting/`,
  );
  return data;
}
