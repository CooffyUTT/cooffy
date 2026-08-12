import { api } from "@/lib/api";
import type { ActiveSchool } from "@/types/school";

export async function getActiveSchools(): Promise<ActiveSchool[]> {
  const { data } = await api.get<ActiveSchool[]>("/api/schools/active/");
  return data;
}
