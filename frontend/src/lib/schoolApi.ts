import { api } from "@/lib/api";

export interface ApiBranch {
  id: number;
  name: string;
  company: number;
  company_name: string;
  school_id: number;
  school_name: string | null;
  location: string | null;
  schedule: string | null;
  image: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiCompany {
  id: number;
  name: string;
  owner: number;
  owner_name: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Paginated<T> {
  results: T[];
}

export async function getSchoolBranches(): Promise<ApiBranch[]> {
  const response = await api.get<ApiBranch[]>('/api/branches/');
  return response.data;
}

export async function getSchoolCompanies(): Promise<ApiCompany[]> {
  const response = await api.get<Paginated<ApiCompany>>('/api/branches/companies/');
  return response.data.results;
}

export async function createSchoolBranch(input: {
  name: string;
  company: number;
  location?: string;
}): Promise<ApiBranch> {
  const response = await api.post<ApiBranch>('/api/branches/', input);
  return response.data;
}

export async function updateSchoolBranch(
  branchId: number,
  input: { name: string; location?: string },
): Promise<ApiBranch> {
  const response = await api.patch<ApiBranch>(`/api/branches/${branchId}/`, input);
  return response.data;
}

export async function deactivateSchoolBranch(branchId: number): Promise<ApiBranch> {
  const response = await api.delete<ApiBranch>(
    `/api/branches/${branchId}/deactivate/`,
  );
  return response.data;
}
