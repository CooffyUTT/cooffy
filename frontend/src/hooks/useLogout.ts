"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logout as requestLogout } from "@/services/authService";

const STORAGE_KEYS = [
  "accessToken",
  "refreshToken",
  "userData",
  "cooffy_cart",
  "cooffy_branch_id",
  "cooffy_branch_name",
] as const;

export interface UseLogoutOptions {
  onAfterLogout?: () => void;
}

export function useLogout(options: UseLogoutOptions = {}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const clearAuthState = useCallback(() => {
    if (typeof window === "undefined") return;
    STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  }, []);

  const performLogout = useCallback(async () => {
    if (typeof window === "undefined") return;

    const refresh = window.localStorage.getItem("refreshToken");

    setIsLoading(true);
    try {
      if (refresh) {
        await requestLogout(refresh);
      }
      clearAuthState();
      options.onAfterLogout?.();
      toast.success("Sesión cerrada", {
        description: "Has salido correctamente de Cooffy.",
      });
      router.push("/");
    } catch {
      clearAuthState();
      options.onAfterLogout?.();
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthState, options, router]);

  return { performLogout, isLoading };
}