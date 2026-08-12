import { api } from "@/lib/api";
import { SchoolBranchApi, SchoolCompanyApi } from "@/types/school";

interface Paginated<T> {
  results: T[];
}

export async function getSchoolBranches(): Promise<SchoolBranchApi[]> {
  const response = await api.get<SchoolBranchApi[]>('/api/branches/');
  return response.data;
}

export async function getSchoolCompanies(): Promise<SchoolCompanyApi[]> {
  const response = await api.get<Paginated<SchoolCompanyApi>>('/api/branches/companies/');
  return response.data.results;
}

export async function getAvailableSchoolCompanies(): Promise<SchoolCompanyApi[]> {
  const response = await api.get<SchoolCompanyApi[]>(
    '/api/branches/companies/available/',
  );
  return response.data;
}

export async function linkSchoolCompany(companyId: number): Promise<SchoolCompanyApi> {
  const response = await api.post<SchoolCompanyApi>(
    '/api/branches/companies/link/',
    { company: companyId },
  );
  return response.data;
}

export async function createSchoolBranch(input: {
  name: string;
  company: number;
  location?: string;
}): Promise<SchoolBranchApi> {
  const response = await api.post<SchoolBranchApi>('/api/branches/', input);
  return response.data;
}

export async function updateSchoolBranch(
  branchId: number,
  input: { name: string; location?: string },
): Promise<SchoolBranchApi> {
  const response = await api.patch<SchoolBranchApi>(`/api/branches/${branchId}/`, input);
  return response.data;
}

export async function deactivateSchoolBranch(branchId: number): Promise<SchoolBranchApi> {
  const response = await api.delete<SchoolBranchApi>(
    `/api/branches/${branchId}/deactivate/`,
  );
  return response.data;
}
