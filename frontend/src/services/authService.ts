import { api } from "@/lib/api";

export interface LogoutResponse {
  message: string;
}

export async function logout(refreshToken: string): Promise<LogoutResponse> {
  const { data } = await api.post<LogoutResponse>("/api/auth/logout/", {
    refresh: refreshToken,
  });
  return data;
}
